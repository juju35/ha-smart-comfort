"""WebSocket commands of the configuration panel: read and save the options, follow the status."""

from __future__ import annotations

import hashlib
import json
from collections.abc import Mapping
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.util import dt as dt_util
from voluptuous.humanize import humanize_error

from . import const as k
from .config import slugify
from .discovery import discover_rooms, merge
from .schema import OPTIONS
from .status import status

GENERAL_DEFAULTS = {
    k.CONF_OUTDOOR_AGGREGATE: "min",
    k.CONF_DIGEST_WINDOW: k.DEFAULT_DIGEST_WINDOW,
    k.CONF_REMINDER: k.DEFAULT_REMINDER,
    k.CONF_SNOOZE_DURATION: k.DEFAULT_SNOOZE,
    k.CONF_STARTUP_GRACE: k.DEFAULT_STARTUP_GRACE,
    k.CONF_CLEAR_WHEN_RESOLVED: True,
    k.CONF_CRITICAL_VOLUME: k.DEFAULT_CRITICAL_VOLUME,
    k.CONF_TAG: k.DEFAULT_TAG,
    k.CONF_HIDE_HEADER: "off",
}


def _entry(hass: HomeAssistant) -> ConfigEntry | None:
    entries = hass.config_entries.async_entries(k.DOMAIN, include_ignore=False)
    return entries[0] if entries else None


def _manager(hass: HomeAssistant) -> Any:
    # The update sent at the end of async_setup_entry arrives while the entry is still SETUP_IN_PROGRESS:
    # accept that state too, else the panel shows "not loaded" until the next evaluation.
    entry = _entry(hass)
    if entry is None or entry.state not in (ConfigEntryState.LOADED, ConfigEntryState.SETUP_IN_PROGRESS):
        return None
    return getattr(entry, "runtime_data", None)


@callback
def async_register(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, ws_get_config)
    websocket_api.async_register_command(hass, ws_save_config)
    websocket_api.async_register_command(hass, ws_create_file)
    websocket_api.async_register_command(hass, ws_subscribe)
    websocket_api.async_register_command(hass, ws_discover)
    websocket_api.async_register_command(hass, ws_activity)
    websocket_api.async_register_command(hass, ws_header)


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{k.DOMAIN}/config"})
@callback
def ws_get_config(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """The options and the defaults they fall back to."""
    entry = _entry(hass)
    if entry is None:
        connection.send_error(msg["id"], "not_found", "Smart Comfort is not set up")
        return
    connection.send_result(
        msg["id"],
        {
            "entry_id": entry.entry_id,
            "loaded": entry.state is ConfigEntryState.LOADED,
            "yaml": bool(entry.data.get("yaml_hash")),
            "file": _file(hass),
            "revision": revision(entry.options),
            "options": dict(entry.options),
            "defaults": {
                "general": GENERAL_DEFAULTS,
                "alerts": k.DEFAULT_ALERTS,
                "annex_alerts": k.DEFAULT_ANNEX_ALERTS,
                "control": k.DEFAULT_CONTROL,
                "lighting": k.DEFAULT_LIGHTING,
            },
            "kinds": list(k.KINDS),
            "room_types": list(k.ROOM_TYPES),
            "severities": list(k.SEVERITIES),
            "aggregates": list(k.AGGREGATES),
            "hide_header_modes": list(k.HIDE_HEADER_MODES),
        },
    )


def revision(options: Mapping[str, Any]) -> str:
    """Identifies the options: the panel saves only over the ones it loaded."""
    return hashlib.sha256(json.dumps(dict(options), sort_keys=True, default=str).encode()).hexdigest()[:16]


def _file(hass: HomeAssistant) -> dict[str, Any] | None:
    """The configuration file when it is the configuration (yaml_file.py)."""
    if (file := hass.data.get(k.DOMAIN, {}).get("file")) is None:
        return None
    return file.info()


def check_rooms(options: dict[str, Any]) -> str | None:
    seen: set[str] = set()
    for room in options.get(k.CONF_ROOMS) or []:
        key = str(room.get("id") or slugify(room[k.CONF_NAME]))
        if key in seen:
            return f"Two rooms have the same name: {room[k.CONF_NAME]}"
        seen.add(key)
    return None


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{k.DOMAIN}/config/save",
        vol.Required("options"): dict,
        vol.Optional("revision"): str,
        vol.Optional("force", default=False): bool,
    }
)
@callback
def ws_save_config(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Validate and store the options; the integration reloads with them."""
    entry = _entry(hass)
    if entry is None:
        connection.send_error(msg["id"], "not_found", "Smart Comfort is not set up")
        return
    try:
        options = OPTIONS(msg["options"])
    except vol.Invalid as err:
        connection.send_error(msg["id"], "invalid_format", humanize_error(msg["options"], err))
        return
    if (problem := check_rooms(options)) is not None:
        connection.send_error(msg["id"], "invalid_format", problem)
        return
    if msg.get("revision") not in (None, revision(entry.options)) and not msg["force"]:
        # Changed meanwhile (the file, the YAML, another window): the panel shows both and lets choose.
        current = dict(entry.options)
        connection.send_result(
            msg["id"], {"conflict": {"options": current, "revision": revision(current), "file": _file(hass)}}
        )
        return
    hass.config_entries.async_update_entry(entry, options=options)
    connection.send_result(msg["id"], {"options": options, "revision": revision(options)})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{k.DOMAIN}/file/create"})
@websocket_api.async_response
async def ws_create_file(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Write the options in use to smart_comfort.yaml, which then becomes the configuration."""
    entry, file = _entry(hass), hass.data.get(k.DOMAIN, {}).get("file")
    if entry is None or file is None:
        connection.send_error(msg["id"], "not_found", "Smart Comfort is not set up")
        return
    if file.active:
        connection.send_error(msg["id"], "exists", f"{file.path.name} already exists")
        return
    if not await file.async_write(dict(entry.options), create=True):
        connection.send_error(msg["id"], "write_failed", f"Can't write {file.path.name}: see the logs")
        return
    await file.async_check(force=True)
    connection.send_result(msg["id"], {"file": file.info()})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{k.DOMAIN}/subscribe"})
@callback
def ws_subscribe(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Status now and after every evaluation, across reloads of the integration."""

    @callback
    def send() -> None:
        manager = _manager(hass)
        payload = status(manager, dt_util.utcnow()) if manager is not None else None
        entry = _entry(hass)
        rev = revision(entry.options) if entry is not None else None
        connection.send_message(websocket_api.event_message(msg["id"], {"status": payload, "revision": rev}))

    connection.subscriptions[msg["id"]] = async_dispatcher_connect(hass, k.SIGNAL_UPDATE, send)
    connection.send_result(msg["id"])
    send()


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{k.DOMAIN}/discover", vol.Required("options"): dict})
@callback
def ws_discover(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """The options being edited, with the rooms found in the areas merged in (not saved).

    Runs on the event loop on purpose: it reads the area, device and entity registries and the states, which are
    not safe to read from an executor thread (a pass over the registries, asked by an admin from the panel).
    """
    options, report = merge(msg["options"], discover_rooms(hass))
    connection.send_result(msg["id"], {"options": options, "report": report.as_dict()})


@websocket_api.websocket_command(
    {vol.Required("type"): f"{k.DOMAIN}/activity", vol.Optional("limit", default=50): vol.All(int, vol.Range(1, 500))}
)
@callback
def ws_activity(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """The latest activity entries (most recent first), then every new one as it comes. Any user (the card)."""

    @callback
    def added(entries: list[dict[str, Any]]) -> None:
        if entries:
            connection.send_message(websocket_api.event_message(msg["id"], {"added": entries}))

    connection.subscriptions[msg["id"]] = async_dispatcher_connect(hass, k.SIGNAL_ACTIVITY, added)
    connection.send_result(msg["id"])
    manager = _manager(hass)
    entries = manager.activity.as_list(msg["limit"]) if manager is not None else []
    connection.send_message(websocket_api.event_message(msg["id"], {"entries": entries}))


@websocket_api.websocket_command({vol.Required("type"): f"{k.DOMAIN}/header"})
@callback
def ws_header(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Who the dashboards' top bar is hidden for: asked by every user's browser, admin or not."""
    entry = _entry(hass)
    mode = entry.options.get(k.CONF_HIDE_HEADER, "off") if entry is not None else "off"
    connection.send_result(msg["id"], {k.CONF_HIDE_HEADER: mode})
