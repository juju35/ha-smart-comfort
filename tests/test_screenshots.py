"""The screenshot script only rewrites a screenshot whose pixels changed (not its bytes)."""

from __future__ import annotations

import importlib.util
import io
from pathlib import Path

from PIL import Image

SCRIPT = Path(__file__).resolve().parent.parent / "scripts" / "screenshots.py"


def _script():
    spec = importlib.util.spec_from_file_location("smart_comfort_screenshots", SCRIPT)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)  # without Playwright: it is only imported to render
    return module


def _png(color: tuple[int, int, int], compress_level: int = 6) -> bytes:
    out = io.BytesIO()
    Image.new("RGB", (4, 3), color).save(out, "PNG", compress_level=compress_level)
    return out.getvalue()


def test_same_pixels_other_bytes_is_not_rewritten(tmp_path: Path) -> None:
    path = tmp_path / "shot.png"
    old = _png((10, 20, 30), compress_level=9)
    path.write_bytes(old)
    new = _png((10, 20, 30), compress_level=1)
    assert new != old
    assert _script().save_if_changed(path, new) is False
    assert path.read_bytes() == old


def test_other_pixels_or_new_file_is_written(tmp_path: Path) -> None:
    save = _script().save_if_changed
    path = tmp_path / "shot.png"
    path.write_bytes(_png((10, 20, 30)))
    new = _png((10, 20, 31))
    assert save(path, new) is True
    assert path.read_bytes() == new
    fresh = tmp_path / "fresh.png"
    assert save(fresh, new) is True
    assert fresh.read_bytes() == new
    # An unreadable old file is replaced, not an error.
    broken = tmp_path / "broken.png"
    broken.write_bytes(b"not a png")
    assert save(broken, new) is True
