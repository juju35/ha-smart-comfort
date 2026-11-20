"""The configuration file `smart_comfort.yaml`, kept in sync both ways with the options.

While the file exists, it holds the options (same shape as `smart_comfort:` in configuration.yaml, which it may also
start with). Changes to it (or to the files it includes) are applied within `FILE_POLL` seconds, or at once with the
reload action, unless `file_watch: false`. What is saved in the panel or the options flow is written back to it, unless
`file_write: false`: only what changed is rewritten (ruamel round trip), so the comments, the layout and the other
settings stay; the previous version of each rewritten file is kept as `<file>.bak`. `!include` and
`!include_dir_merge_list` / `!include_dir_list` are followed: a room is rewritten in the file it comes from, a new room
of an included folder goes to a new file there. A changed `!secret` (or another tag) is replaced by the value.
An empty file is filled with the options in use. An invalid file is left alone (repair `file_invalid`) until fixed.
"""

from __future__ import annotations

import io
import itertools
import logging
import os
import re
import shutil
from dataclasses import dataclass, field
from datetime import timedelta
from pathlib import Path
from typing import Any

import voluptuous as vol
import yaml as pyyaml
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import issue_registry as ir
from homeassistant.util.file import write_utf8_file_atomic
from homeassistant.util.yaml import Secrets, load_yaml

from . import const as k
from .config import slugify
from .schema import OPTIONS
from .websocket import check_rooms

_LOGGER = logging.getLogger(__name__)

FILE_NAME = "smart_comfort.yaml"
FILE_POLL = timedelta(seconds=5)
ISSUE_FILE_INVALID = "file_invalid"
HEADER = (
    "Smart Comfort configuration, kept in sync with the Smart Comfort panel:\n"
    "what is saved there is written here (comments kept), changes made here are applied within seconds."
)
INCLUDE = re.compile(
    r"!(include|include_dir_merge_list|include_dir_list|include_dir_named|include_dir_merge_named)\s+(\S+)"
)
MISSING: Any = object()


@dataclass
class Read:
    """The file as read: `missing`, `empty`, `invalid` (with `error`) or `ok` (with `options`)."""

    status: str
    options: dict[str, Any] | None = None
    error: str | None = None
    included: list[Path] = field(default_factory=list)


def _included(path: Path, seen: set[Path] | None = None) -> list[Path]:
    """The files `path` includes, recursively (folders: their YAML files)."""
    seen = seen if seen is not None else {path}
    try:
        text = path.read_text(encoding="utf-8")
    except OSError:
        return []
    out = []
    for tag, target in INCLUDE.findall(text):
        where = path.parent / target
        found = [where] if tag == "include" else sorted(p for p in where.rglob("*.yaml") if not p.name.startswith("."))
        for file in found:
            if file not in seen:
                seen.add(file)
                out += [file, *_included(file, seen)]
    return out


class ConfigFile:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self.path = Path(hass.config.path(FILE_NAME))
        self.active = False  # The file exists and is the configuration.
        self.invalid: str | None = None  # Changed since last applied, and not valid (never written over then).
        self.synced: dict[str, Any] | None = None  # The options the file holds (last read or written).
        self.included: list[Path] = []
        self.mtime: float | None = None  # Latest modification of the file or of a file it includes.

    # Executor side.

    def _stat(self) -> float | None:
        times = []
        for path in [self.path, *self.included]:
            try:
                times.append(os.stat(path).st_mtime)
            except FileNotFoundError:
                if path == self.path:
                    return None
        return max(times)

    def _read(self) -> Read:
        try:
            text = self.path.read_text(encoding="utf-8")
        except FileNotFoundError:
            return Read("missing")
        included = _included(self.path)
        try:
            raw = load_yaml(self.path, Secrets(Path(self.hass.config.config_dir))) if text.strip() else None
        except FileNotFoundError:
            return Read("missing")
        except HomeAssistantError as err:
            return Read("invalid", error=str(err), included=included)
        if raw is None or raw == {k.DOMAIN: None}:
            return Read("empty", included=included)
        if isinstance(raw, dict) and list(raw) == [k.DOMAIN]:
            raw = raw[k.DOMAIN]
        try:
            options = OPTIONS(raw)
            if problem := check_rooms(options):
                raise vol.Invalid(problem)
        except vol.Invalid as err:
            return Read("invalid", error=str(err), included=included)
        return Read("ok", options=dict(options), included=included)

    def _write(self, old: dict[str, Any] | None, new: dict[str, Any]) -> float | None:
        Writer().write(self.path, old or {}, new)
        self.included = _included(self.path)
        return self._stat()

    # Event loop side.

    async def async_check(self, force: bool = False) -> Read | None:
        """Read the file when it changed (or `force`). Returns what was read, None when unchanged."""
        mtime = await self.hass.async_add_executor_job(self._stat)
        if not force and mtime == self.mtime:
            return None
        self.mtime = mtime
        read = await self.hass.async_add_executor_job(self._read)
        self.included = read.included
        if read.status == "missing":
            self.active, self.invalid, self.synced = False, None, None
            ir.async_delete_issue(self.hass, k.DOMAIN, ISSUE_FILE_INVALID)
            return read
        self.active = True
        if read.status == "invalid":
            self.invalid = read.error or "?"
            _LOGGER.warning("%s is invalid, it is not applied: %s", self.path, read.error)
            ir.async_create_issue(
                self.hass,
                k.DOMAIN,
                ISSUE_FILE_INVALID,
                is_fixable=False,
                severity=ir.IssueSeverity.ERROR,
                translation_key=ISSUE_FILE_INVALID,
                translation_placeholders={"file": FILE_NAME, "error": self.invalid},
            )
            return read
        self.invalid = None
        ir.async_delete_issue(self.hass, k.DOMAIN, ISSUE_FILE_INVALID)
        self.synced = read.options if read.status == "ok" else None
        return read

    async def async_write(self, options: dict[str, Any], create: bool = False) -> bool:
        """Write what changed in the options; not while the file is invalid (being edited) or edited since read."""
        if create and not self.active:
            self.active, self.synced, self.mtime = True, None, None
        if not self.active or self.invalid or options == self.synced:
            return False
        if not create and await self.hass.async_add_executor_job(self._stat) != self.mtime:
            return False  # Edited since it was read: the file is applied at the next check instead.
        try:
            self.mtime = await self.hass.async_add_executor_job(self._write, self.synced, options)
        except (OSError, ImportError, HomeAssistantError, pyyaml.YAMLError, ValueError):
            _LOGGER.exception("Can't write %s", self.path)
            return False
        self.synced = dict(options)
        return True

    def info(self) -> dict[str, Any] | None:
        """For the panel."""
        if not self.active:
            return None
        root = self.path.parent
        return {
            "name": self.path.name,
            "mtime": self.mtime,
            "included": [str(p.relative_to(root)) for p in self.included if p.is_relative_to(root)],
            "invalid": self.invalid,
        }


class Writer:
    """Applies the changes between two option sets to the YAML files, keeping what is unchanged as it is."""

    def __init__(self) -> None:
        from ruamel.yaml import YAML  # noqa: PLC0415 (imported in the executor: slow first import)

        self.yaml = YAML()
        self.yaml.preserve_quotes = True
        self.yaml.indent(mapping=2, sequence=4, offset=2)
        self.yaml.width = 4096
        self.docs: dict[Path, Any] = {}
        self.texts: dict[Path, str] = {}
        # Each file as read, to tell the lines that changed from those ruamel only redraws.
        self.pristine: dict[Path, Any] = {}
        self.indents: dict[Path, tuple[int, int, int]] = {}  # Each file's own (mapping, sequence, dash offset).

    def load(self, path: Path) -> Any:
        if path not in self.docs:
            try:
                text = path.read_text(encoding="utf-8")
            except FileNotFoundError:
                text = ""
            self.texts[path] = text
            self.docs[path] = self.yaml.load(text) if text.strip() else None
            if text.strip():
                self.pristine[path] = self.yaml.load(text)
                self.indents[path] = guess_indents(text)
        return self.docs[path]

    def write(self, path: Path, old: dict[str, Any], new: dict[str, Any]) -> None:
        from ruamel.yaml.comments import CommentedMap  # noqa: PLC0415

        doc = self.load(path)
        if not isinstance(doc, CommentedMap):
            doc = CommentedMap()
            doc.yaml_set_start_comment(HEADER)
        if list(doc) == [k.DOMAIN] and isinstance(doc[k.DOMAIN], CommentedMap):
            doc[k.DOMAIN] = self.apply(doc[k.DOMAIN], old, new, path)
        else:
            doc = self.apply(doc, old, new, path)
        self.docs[path] = doc
        self.save()

    def dump(self, path: Path, doc: Any) -> str:
        stream = io.StringIO()
        if doc is not None:
            mapping, sequence, offset = self.indents.get(path, (2, 4, 2))
            self.yaml.indent(mapping=mapping, sequence=sequence, offset=offset)
            self.yaml.dump(doc, stream)
        return stream.getvalue()

    def save(self) -> None:
        for path, doc in self.docs.items():
            text = self.dump(path, doc)
            if path in self.pristine and doc is not None:
                text = keep_unchanged(self.texts[path], self.dump(path, self.pristine[path]), text)
            if text == self.texts[path]:
                continue
            if path.exists():
                shutil.copy2(path, path.with_name(path.name + ".bak"))
            path.parent.mkdir(parents=True, exist_ok=True)
            write_utf8_file_atomic(str(path), text)

    # The changes.

    def apply(self, node: Any, old: Any, new: Any, here: Path) -> Any:
        from ruamel.yaml.comments import CommentedMap, CommentedSeq, TaggedScalar  # noqa: PLC0415

        if old == new and node is not None:
            return node
        if isinstance(node, TaggedScalar):
            tag, target = node.tag.value, here.parent / str(node.value)
            if tag == "!include":
                self.docs[target] = self.apply(self.load(target), old, new, target)
                return node
            if tag in ("!include_dir_merge_list", "!include_dir_list") and isinstance(new, list):
                self._dir_list(target, tag == "!include_dir_merge_list", old if isinstance(old, list) else [], new)
                return node
            return plain(new)  # A changed !secret, !env_var…: the value now.
        if isinstance(node, CommentedMap) and isinstance(new, dict):
            old = old if isinstance(old, dict) else {}
            for key in [key for key in node if key not in new]:
                _keep_comments(node, key)
                del node[key]
            for key, value in new.items():
                node[key] = self.apply(node[key], old.get(key, MISSING), value, here) if key in node else plain(value)
            return node
        if isinstance(node, CommentedSeq) and isinstance(new, list):
            keys = [_key(item) for item in node]
            news = {_key(item): item for item in new}
            if None not in keys and None not in news and len(set(keys)) == len(keys) and len(news) == len(new):
                olds = {_key(item): item for item in (old if isinstance(old, list) else [])}
                nodes = dict(zip(keys, node, strict=True))
                items = [
                    self.apply(nodes[key], olds.get(key, MISSING), value, here) if key in nodes else plain(value)
                    for key, value in news.items()
                ]
                # What follows the last item (a blank line, a comment) stays after the last item.
                last = node.ca.items.pop(len(node) - 1, None) if node else None
                del node[:]
                node.extend(items)
                if last is not None and node:
                    node.ca.items[len(node) - 1] = last
                return node
        return plain(new)

    def _dir_list(self, folder: Path, merge: bool, old: list, new: list) -> None:
        """Items spread over the YAML files of a folder (a list per file, or an item per file)."""
        news = {_key(item): item for item in new}
        olds = {_key(item): item for item in old}
        seen = set()
        for path in sorted(p for p in folder.rglob("*.yaml") if not p.name.startswith(".")):
            doc = self.load(path)
            items = doc if merge and isinstance(doc, list) else [doc]
            kept = []
            for item in items:
                key = _key(item)
                if key in news:
                    seen.add(key)
                    kept.append(self.apply(item, olds.get(key, MISSING), news[key], path))
            if merge and isinstance(doc, list) and kept:
                del doc[:]
                doc.extend(kept)
            elif merge:
                self.docs[path] = None  # Every item removed: an empty file.
            else:
                self.docs[path] = kept[0] if kept else None
        for key, item in news.items():
            if key in seen:
                continue
            path, n = folder / f"{slugify(str(key))}.yaml", 2
            while path.exists() or path in self.docs:
                path, n = folder / f"{slugify(str(key))}_{n}.yaml", n + 1
            self.texts[path] = ""
            self.docs[path] = plain([item] if merge else item)


def guess_indents(text: str) -> tuple[int, int, int]:
    """A file's (mapping indent, sequence indent, dash offset), so that what is rewritten looks like the rest.

    ruamel's guess gives the sequence indent (the column of an item's keys) and the dash offset, not the mapping
    indent: that one is read from the first key whose value is a mapping on the next lines."""
    from ruamel.yaml.util import load_yaml_guess_indent  # noqa: PLC0415

    _, sequence, offset = load_yaml_guess_indent(text)
    mapping = 2
    lines = [line for line in text.splitlines() if line.strip() and not line.lstrip().startswith("#")]
    for line, after in itertools.pairwise(lines):
        head, rest = len(line) - len(line.lstrip()), line.strip()
        deeper = len(after) - len(after.lstrip()) - head
        if not rest.startswith("-") and rest.endswith(":") and not after.lstrip().startswith("-") and deeper > 0:
            mapping = deeper
            break
    if offset is None:  # No block sequence yet: dashes under their key's indent.
        return mapping, mapping + 2, mapping
    return mapping, sequence or mapping + offset, offset


def keep_unchanged(original: str, before: str, after: str) -> str:
    """The original text with only the lines that differ between `before` (the file as ruamel redraws it) and `after`
    (the new content, drawn the same way) replaced: comments, spacing and flow mappings stay as written elsewhere.
    When ruamel's drawing doesn't line up with the file (a line count that differs), the new drawing is used."""
    from difflib import SequenceMatcher  # noqa: PLC0415

    lines = original.splitlines(keepends=True)
    base, new = before.splitlines(keepends=True), after.splitlines(keepends=True)
    if len(lines) != len(base):
        return after
    out: list[str] = []
    for op, i1, i2, j1, j2 in SequenceMatcher(None, base, new, autojunk=False).get_opcodes():
        out.extend(lines[i1:i2] if op == "equal" else new[j1:j2])
    text = "".join(out)
    return text if text.endswith("\n") or not text else text + "\n"


def _keep_comments(node: Any, key: Any) -> None:
    """A key about to be removed: the full-line comments written after it go to the key before (or to the top of the
    map), instead of going with it. Its own end-of-line comment goes."""
    from ruamel.yaml.tokens import CommentToken  # noqa: PLC0415

    slot = node.ca.items.get(key)
    token = slot[2] if slot and len(slot) > 2 else None
    if not isinstance(token, CommentToken) or "\n" not in token.value:
        return
    kept = token.value.split("\n", 1)[1]
    if not kept.strip():
        return
    keys = list(node)
    at = keys.index(key)
    if at == 0:
        node.yaml_set_start_comment(
            "\n".join(line.strip().removeprefix("#").removeprefix(" ") for line in kept.splitlines() if line.strip()),
            indent=token.column,
        )
        return
    before = node.ca.items.setdefault(keys[at - 1], [None, None, None, None])
    while len(before) < 4:
        before.append(None)
    if isinstance(before[2], CommentToken):
        before[2].value += kept
    else:
        before[2] = CommentToken("\n" + kept, token.start_mark, None)


def _key(item: Any) -> str | None:
    if isinstance(item, str):
        return str(item)
    if isinstance(item, dict):
        if item.get("id") or item.get("entity_id"):
            return str(item.get("id") or item.get("entity_id"))
        if isinstance(item.get("name"), str):
            return slugify(str(item["name"]))
    return None


def plain(value: Any) -> Any:
    """A value for ruamel: maps and lists in block style, strings quoted when YAML 1.1 (Home Assistant) would not
    read them back as the same string ("22:00:00" would be a number)."""
    from ruamel.yaml.comments import CommentedMap, CommentedSeq  # noqa: PLC0415
    from ruamel.yaml.scalarstring import DoubleQuotedScalarString  # noqa: PLC0415

    if isinstance(value, dict):
        out = CommentedMap()
        for key, item in value.items():
            out[key] = plain(item)
        return out
    if isinstance(value, list):
        return CommentedSeq([plain(item) for item in value])
    if isinstance(value, str):
        try:
            same = pyyaml.safe_load(value) == value
        except pyyaml.YAMLError:
            same = False
        return value if same and value and value.strip() == value else DoubleQuotedScalarString(value)
    return value
