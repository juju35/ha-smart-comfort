"""The entity pickers of the options flow list only the entities that fit."""

from homeassistant.helpers.selector import EntitySelector, EntitySelectorConfig

from custom_components.smart_comfort import config_flow


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
