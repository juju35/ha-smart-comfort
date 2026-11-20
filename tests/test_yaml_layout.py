"""smart_comfort.yaml rewritten in place: only the lines that change, the rest as written."""

from __future__ import annotations

import yaml

from custom_components.smart_comfort.yaml_file import Writer, guess_indents

FILE = """hide_header: everyone
# Smart Comfort — included by configuration.yaml
notify: [notify.me]
alerts:
  co2_high: { threshold: 1500 }   # stricter
  window_open_cold: { enabled: true, delay: 10 }
control:
  display_off: "20:00"          # displays off…
rooms:
  - name: Living room
    area: living
    lights: [light.living]

  - name: Bedroom
    area: bedroom
    naps:
      - schedule.nap_bedroom   # shared with House Rules
"""


def test_guess_indents():
    assert guess_indents(FILE) == (2, 4, 2)
    assert guess_indents("a:\n    b: 1\n") == (4, 6, 4)
    assert guess_indents("a:\n  b:\n  - x\n") == (2, 2, 0)


def test_only_the_changed_lines(tmp_path):
    path = tmp_path / "smart_comfort.yaml"
    path.write_text(FILE, encoding="utf-8")
    old = yaml.safe_load(FILE)
    new = yaml.safe_load(FILE)
    del new["hide_header"]
    new["rooms"][0]["lights"] = ["light.living", "light.sofa"]
    new["control"]["display_on"] = "10:00"
    Writer().write(path, old, new)
    text = path.read_text(encoding="utf-8")
    # The key goes, its comment stays; the other lines, flow mappings and comments are as written.
    assert text.startswith("# Smart Comfort — included by configuration.yaml\nnotify: [notify.me]\n")
    assert "hide_header" not in text
    assert "  co2_high: { threshold: 1500 }   # stricter\n" in text
    assert '  display_off: "20:00"          # displays off…\n  display_on: "10:00"\n' in text
    assert "    lights: [light.living, light.sofa]\n\n  - name: Bedroom\n" in text
    assert "      - schedule.nap_bedroom   # shared with House Rules\n" in text
    assert yaml.safe_load(text) == new
    # Nothing changed: the file is not touched.
    mtime = path.stat().st_mtime_ns
    Writer().write(path, new, new)
    assert path.stat().st_mtime_ns == mtime
