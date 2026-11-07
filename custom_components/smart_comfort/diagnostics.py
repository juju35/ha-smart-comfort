"""Diagnostics: the options and the current state, with the notifiers and the notification link redacted."""

from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from . import SmartComfortConfigEntry
from .const import CONF_NOTIFY, CONF_URL
from .status import status

# Notifier names carry the names of the phones; the link may hold a host or credentials.
TO_REDACT = {CONF_NOTIFY, CONF_URL}


async def async_get_config_entry_diagnostics(hass: HomeAssistant, entry: SmartComfortConfigEntry) -> dict[str, Any]:
    return async_redact_data(
        {
            "entry": {"data": dict(entry.data), "options": dict(entry.options)},
            "status": status(entry.runtime_data, dt_util.utcnow()),
        },
        TO_REDACT,
    )
