"""Pure: three-way merge of a changed YAML into the options edited in the UI.

`base` is the YAML imported last time, `current` the options in use (that YAML plus the UI changes), `new` the YAML
now. Only what changed between `base` and `new` is applied: a setting the YAML left alone keeps its UI value. Where
the YAML and the UI both changed a setting to different values, the YAML wins and its path is reported.

Lists of rooms, places and devices are matched by item (room `id` or name, `entity_id`, the entity id itself), so a
room added in the UI stays when the YAML adds or changes another one. Other lists are single values.
"""

from __future__ import annotations

from typing import Any

from .config import slugify

MISSING: Any = object()


def merge(base: dict[str, Any], current: dict[str, Any], new: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    """The options with the YAML changes applied, and the paths where they replaced a UI change."""
    conflicts: list[str] = []
    merged = _merge(base, current, new, "", conflicts)
    return ({} if merged is MISSING else merged), conflicts


def _merge(base: Any, cur: Any, new: Any, path: str, conflicts: list[str]) -> Any:
    if new == base:  # Not changed in the YAML: the UI value stays.
        return cur
    if cur in (base, new):  # Not changed in the UI, or changed the same way.
        return new
    if isinstance(cur, dict) and isinstance(new, dict) and (base is MISSING or isinstance(base, dict)):
        return _dicts({} if base is MISSING else base, cur, new, path, conflicts)
    if isinstance(cur, list) and isinstance(new, list) and (base is MISSING or isinstance(base, list)):
        lists = [[] if base is MISSING else base, cur, new]
        if (maps := [_keyed(items) for items in lists]) and all(m is not None for m in maps):
            return _lists(*maps, path, conflicts)
    conflicts.append(path or "*")
    return new


def _dicts(base: dict, cur: dict, new: dict, path: str, conflicts: list[str]) -> dict:
    out = {}
    for key in [*cur, *(k for k in new if k not in cur), *(k for k in base if k not in cur and k not in new)]:
        value = _merge(
            base.get(key, MISSING),
            cur.get(key, MISSING),
            new.get(key, MISSING),
            f"{path}.{key}" if path else str(key),
            conflicts,
        )
        if value is not MISSING:
            out[key] = value
    return out


def _lists(base: dict, cur: dict, new: dict, path: str, conflicts: list[str]) -> list:
    out = []
    for key in [*cur, *(k for k in new if k not in cur), *(k for k in base if k not in cur and k not in new)]:
        item = cur.get(key, new.get(key, base.get(key)))
        label = item.get("name", key) if isinstance(item, dict) else key
        value = _merge(
            base.get(key, MISSING), cur.get(key, MISSING), new.get(key, MISSING), f"{path}[{label}]", conflicts
        )
        if value is not MISSING:
            out.append(value)
    return out


def _key(item: Any) -> str | None:
    if isinstance(item, str):
        return item
    if isinstance(item, dict):
        if item.get("id") or item.get("entity_id"):
            return str(item.get("id") or item.get("entity_id"))
        if isinstance(item.get("name"), str):
            return slugify(item["name"])
    return None


def _keyed(items: list) -> dict[str, Any] | None:
    """The items by key, in order; None when an item has no key or two share one (then the list is one value)."""
    out: dict[str, Any] = {}
    for item in items:
        if (key := _key(item)) is None or key in out:
            return None
        out[key] = item
    return out
