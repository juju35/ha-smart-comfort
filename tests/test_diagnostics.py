"""Diagnostics: options and current state, notifiers and link redacted."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from custom_components.smart_comfort.const import DOMAIN
from custom_components.smart_comfort.diagnostics import async_get_config_entry_diagnostics

REDACTED = "**REDACTED**"
OPTIONS = {
    "notify": ["notify.mobile_app_julien_phone"],
    "url": "https://user:secret@ha.example.org/lovelace/comfort",
    "outdoor_temperature": ["sensor.out"],
    "digest_window": 0,
    "startup_grace": 0,
    "alerts": {"too_hot": {"delay": 0}},
    "rooms": [{"name": "Séjour", "temperature": "sensor.t_sejour"}],
}


async def test_diagnostics(hass: HomeAssistant) -> None:
    async_mock_service(hass, "notify", "mobile_app_julien_phone")
    hass.states.async_set("sensor.out", "24")
    hass.states.async_set("sensor.t_sejour", "28")
    entry = MockConfigEntry(domain=DOMAIN, title="Smart Comfort", data={"yaml_hash": "abc"}, options=OPTIONS)
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    await entry.runtime_data.async_evaluate()
    await hass.async_block_till_done()

    diag = await async_get_config_entry_diagnostics(hass, entry)

    options = diag["entry"]["options"]
    assert options["notify"] == REDACTED
    assert options["url"] == REDACTED
    assert options["rooms"] == OPTIONS["rooms"]
    assert diag["entry"]["data"] == {"yaml_hash": "abc"}
    assert "secret" not in str(diag)
    assert "julien_phone" not in str(diag)

    status = diag["status"]
    assert status["outdoor_temperature"] == 24.0
    assert status["rooms"][0]["name"] == "Séjour"
    assert status["rooms"][0]["temperature"] == 28.0
    assert [a["kind"] for a in status["alerts"]] == ["too_hot"]
    assert status["notifications_enabled"] is True
