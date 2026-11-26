"""The entity pickers of the options flow list only the entities that fit."""

import re
from pathlib import Path

from homeassistant.helpers.selector import EntitySelector, EntitySelectorConfig

from custom_components.smart_comfort import config_flow
from custom_components.smart_comfort import const as k


def _filters(filters):
    return EntitySelector(EntitySelectorConfig(filter=filters, multiple=True)).serialize()["selector"]["entity"][
        "filter"
    ]


def test_air_quality_picker_takes_index_sensors_and_air_services():
    filters = _filters(config_flow.AIR_INDEX)
    assert filters[0] == {"domain": ["sensor"], "device_class": ["aqi", "enum"]}
    assert {"integration": "atmofrance", "domain": ["sensor"]} in filters


def test_openings_and_outdoor_temperature_pickers():
    assert _filters(config_flow.OPENINGS) == [
        {"domain": ["binary_sensor"], "device_class": ["window", "door", "opening", "garage_door"]}
    ]
    assert _filters(config_flow.OUTDOOR_TEMPERATURE) == [
        {"domain": ["sensor"], "device_class": ["temperature"]},
        {"domain": ["weather"]},
    ]


def test_presence_picker_keeps_only_occupancy_binary_sensors():
    filters = _filters(config_flow.PRESENCE)
    assert {"domain": ["binary_sensor"], "device_class": ["occupancy", "presence"]} in filters
    assert {"domain": ["person"]} in filters


def test_panel_pickers_match_the_options_flow():
    """The panel's pickers (form.js) offer the same kinds as the options flow's."""
    form = (Path(__file__).parent.parent / "src" / "smart-comfort-panel" / "form.js").read_text(encoding="utf-8")
    platforms = re.search(r"\.\.\.\[([^\]]+)\]\.map\(\(integration\)", form).group(1)
    assert tuple(re.findall(r'"([a-z_]+)"', platforms)) == k.AIR_PLATFORMS
    openings = re.search(r"openings: \[\{ domain: \"binary_sensor\", device_class: \[([^\]]+)\]", form).group(1)
    assert re.findall(r'"([a-z_]+)"', openings) == config_flow.OPENINGS[0]["device_class"]
    presence = re.search(r"presence: \[(.*?)\n  \],", form, re.DOTALL).group(1)
    assert re.findall(r'domain: "([a-z_]+)"', presence) == [f["domain"] for f in config_flow.PRESENCE]
