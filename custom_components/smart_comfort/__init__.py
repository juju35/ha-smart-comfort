"""Smart Comfort: fewer, smarter comfort alerts, and control of air conditioners, fans and purifiers."""

from __future__ import annotations

import copy
import hashlib
import json
import logging
from typing import Any

import voluptuous as vol
from homeassistant.config_entries import SOURCE_IMPORT, ConfigEntry, ConfigEntryState
from homeassistant.const import Platform
from homeassistant.core import CoreState, HomeAssistant, ServiceCall, SupportsResponse, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.reload import async_integration_yaml_config
from homeassistant.helpers.start import async_at_started
from homeassistant.helpers.storage import Store
from homeassistant.helpers.typing import ConfigType

from . import websocket
from .config import Settings, build_settings, slugify
from .const import (
    CONF_FILE_WATCH,
    CONF_FILE_WRITE,
    DOMAIN,
    HOUSE_RULES_URL,
    ISSUE_PRESENCE_MOVED,
    KINDS,
    MAX_MINUTES,
    SERVICE_ACKNOWLEDGE,
    SERVICE_GET_CONFIG,
    SERVICE_NOTIFY_NOW,
    SERVICE_RELOAD,
    SERVICE_SNOOZE,
    SERVICE_UNSNOOZE,
    SIGNAL_UPDATE,
    STORAGE_KEY,
    STORAGE_VERSION,
)
from .manager import SmartComfort
from .merge import merge
from .panel import async_register_panel, async_remove_card, async_remove_panel
from .schema import CONFIG_SCHEMA as _CONFIG_SCHEMA
from .schema import OPTIONS
from .yaml_file import FILE_POLL, ConfigFile

_LOGGER = logging.getLogger(__name__)
ISSUE_YAML_CONFLICTS = "yaml_conflicts"

PLATFORMS = [Platform.BUTTON, Platform.CALENDAR, Platform.SENSOR, Platform.SWITCH]
CONFIG_SCHEMA = _CONFIG_SCHEMA

type SmartComfortConfigEntry = ConfigEntry[SmartComfort]

ROOMS = vol.All(cv.ensure_list, [cv.string])
KIND_LIST = vol.All(cv.ensure_list, [vol.In(KINDS)])


def yaml_hash(options: dict[str, Any]) -> str:
    return hashlib.sha256(json.dumps(options, sort_keys=True, default=str).encode()).hexdigest()


@callback
def async_import_yaml(hass: HomeAssistant, options: dict[str, Any]) -> list[str] | None:
    """Create the entry from the YAML, or apply to its options what changed in the YAML since the last import.

    The YAML imported last is kept in `entry.data["yaml"]`: a changed YAML is merged into the options (merge.py), so
    the UI changes to what the YAML left alone stay. Unchanged YAML (same hash) leaves the options alone. An entry
    from before 1.27.0 has only the hash: its options are replaced once, as they were then.
    The import flow only creates: a single-entry integration can't run a flow once its entry exists.
    Returns the paths where the YAML replaced a UI change, None when nothing was applied.
    """
    digest = yaml_hash(options)
    if not (entries := hass.config_entries.async_entries(DOMAIN, include_ignore=False)):
        hass.async_create_task(
            hass.config_entries.flow.async_init(
                DOMAIN,
                context={"source": SOURCE_IMPORT},
                data={"options": options, "yaml_hash": digest, "yaml": copy.deepcopy(options)},
            )
        )
        return []
    entry = entries[0]
    base = entry.data.get("yaml")
    if entry.data.get("yaml_hash") == digest:
        if base is None:  # The hash proves this is the YAML imported last: keep it for the next merge.
            hass.config_entries.async_update_entry(entry, data={**entry.data, "yaml": copy.deepcopy(options)})
        return None
    merged, conflicts = (copy.deepcopy(options), []) if base is None else merge(base, dict(entry.options), options)
    if base is not None:
        try:
            merged = OPTIONS(merged)
            if problem := websocket.check_rooms(merged):
                raise vol.Invalid(problem)
        except vol.Invalid as err:
            _LOGGER.warning("The YAML merged into the UI changes is invalid (%s): the YAML replaces them", err)
            merged, conflicts = copy.deepcopy(options), ["*"]
    hass.config_entries.async_update_entry(
        entry, data={**entry.data, "yaml_hash": digest, "yaml": copy.deepcopy(options)}, options=merged
    )
    if conflicts:
        _LOGGER.warning("The YAML replaced settings also changed in the UI: %s", ", ".join(conflicts))
        ir.async_create_issue(
            hass,
            DOMAIN,
            ISSUE_YAML_CONFLICTS,
            is_fixable=False,
            severity=ir.IssueSeverity.WARNING,
            translation_key=ISSUE_YAML_CONFLICTS,
            translation_placeholders={"paths": "\n".join(f"- `{path}`" for path in conflicts)},
        )
    else:
        ir.async_delete_issue(hass, DOMAIN, ISSUE_YAML_CONFLICTS)
    return conflicts


async def _async_sync_file(hass: HomeAssistant, file: ConfigFile, force: bool = False) -> bool:
    """Apply the configuration file when it changed. Returns whether the options were changed (or created)."""
    if (read := await file.async_check(force)) is None or read.status in ("missing", "invalid"):
        return False
    entries = hass.config_entries.async_entries(DOMAIN, include_ignore=False)
    if read.status == "empty":  # Just created: it gets the options in use.
        if entries:
            await file.async_write(dict(entries[0].options))
        return False
    if not entries:
        # Not awaited: during async_setup, the entry can only be set up once it returns.
        hass.async_create_task(
            hass.config_entries.flow.async_init(
                DOMAIN, context={"source": SOURCE_IMPORT}, data={"options": read.options, "yaml_hash": None}
            )
        )
        return True
    if read.options == dict(entries[0].options):
        return False
    hass.config_entries.async_update_entry(entries[0], options=read.options)
    return True


def _manager(hass: HomeAssistant) -> SmartComfort:
    for entry in hass.config_entries.async_entries(DOMAIN):
        if entry.state is ConfigEntryState.LOADED:
            return entry.runtime_data
    raise ServiceValidationError(translation_domain=DOMAIN, translation_key="not_loaded")


def _rooms(manager: SmartComfort, raw: list[str] | None) -> list[str] | None:
    """Room ids from ids or names."""
    if not raw:
        return None
    by_key = {}
    for room in manager.settings.rooms:
        by_key[room.id] = room.id
        by_key[slugify(room.name)] = room.id
    out = []
    for value in raw:
        if (room_id := by_key.get(slugify(value))) is None:
            raise ServiceValidationError(
                translation_domain=DOMAIN, translation_key="unknown_room", translation_placeholders={"room": value}
            )
        out.append(room_id)
    return out


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Import the YAML configuration and register the actions."""
    file = hass.data.setdefault(DOMAIN, {})["file"] = ConfigFile(hass)
    await _async_sync_file(hass, file, force=True)
    if (options := config.get(DOMAIN)) is not None:
        if file.active:
            _LOGGER.warning("smart_comfort: in configuration.yaml is left out: %s is the configuration", file.path)
        else:
            async_import_yaml(hass, options)

    async def poll(_now: Any) -> None:
        entries = hass.config_entries.async_entries(DOMAIN, include_ignore=False)
        if not entries or entries[0].options.get(CONF_FILE_WATCH, True):
            await _async_sync_file(hass, file)

    async_track_time_interval(hass, poll, FILE_POLL, cancel_on_shutdown=True)
    websocket.async_register(hass)

    async def snooze(call: ServiceCall) -> None:
        m = _manager(hass)
        await m.async_snooze(call.data.get("duration"), _rooms(m, call.data.get("rooms")), call.data.get("kinds"))

    async def unsnooze(call: ServiceCall) -> None:
        m = _manager(hass)
        await m.async_unsnooze(_rooms(m, call.data.get("rooms")))

    async def acknowledge(call: ServiceCall) -> None:
        m = _manager(hass)
        await m.async_acknowledge(_rooms(m, call.data.get("rooms")), call.data.get("kinds"))

    async def notify_now(call: ServiceCall) -> dict[str, Any]:
        sent = await _manager(hass).async_notify_now()
        return {"sent": sent}

    hass.services.async_register(
        DOMAIN,
        SERVICE_SNOOZE,
        snooze,
        vol.Schema(
            {
                vol.Optional("duration"): vol.All(vol.Coerce(int), vol.Range(min=1, max=MAX_MINUTES * 7)),
                vol.Optional("rooms"): ROOMS,
                vol.Optional("kinds"): KIND_LIST,
            }
        ),
    )
    hass.services.async_register(DOMAIN, SERVICE_UNSNOOZE, unsnooze, vol.Schema({vol.Optional("rooms"): ROOMS}))
    hass.services.async_register(
        DOMAIN,
        SERVICE_ACKNOWLEDGE,
        acknowledge,
        vol.Schema({vol.Optional("rooms"): ROOMS, vol.Optional("kinds"): KIND_LIST}),
    )
    hass.services.async_register(
        DOMAIN, SERVICE_NOTIFY_NOW, notify_now, vol.Schema({}), supports_response=SupportsResponse.OPTIONAL
    )

    async def get_config(call: ServiceCall) -> dict[str, Any]:
        """The options in use, to copy into the YAML (`smart_comfort:`) or to check what is set."""
        for entry in hass.config_entries.async_entries(DOMAIN):
            return {"options": dict(entry.options)}
        raise ServiceValidationError(translation_domain=DOMAIN, translation_key="not_loaded")

    hass.services.async_register(
        DOMAIN, SERVICE_GET_CONFIG, get_config, vol.Schema({}), supports_response=SupportsResponse.ONLY
    )

    async def reload(call: ServiceCall) -> dict[str, Any]:
        """Read `smart_comfort:` again and apply what changed, without a restart (also listed in Developer tools)."""
        if file.active:
            applied = await _async_sync_file(hass, file, force=True)
            if file.invalid:
                raise ServiceValidationError(translation_domain=DOMAIN, translation_key="invalid_yaml")
            return {"applied": applied, "conflicts": []}
        if (conf := await async_integration_yaml_config(hass, DOMAIN)) is None:
            raise ServiceValidationError(translation_domain=DOMAIN, translation_key="invalid_yaml")
        if (options := conf.get(DOMAIN)) is None:
            return {"applied": False, "conflicts": []}
        conflicts = async_import_yaml(hass, options)
        return {"applied": conflicts is not None, "conflicts": conflicts or []}

    hass.services.async_register(
        DOMAIN, SERVICE_RELOAD, reload, vol.Schema({}), supports_response=SupportsResponse.OPTIONAL
    )
    return True


def _presence_moved_issue(hass: HomeAssistant, settings: Settings) -> None:
    """Lights on presence moved to House Rules (2.0): a repair lists the rooms that still have some."""
    rooms = [room.name for room in settings.rooms if room.presence_moved]
    if not rooms:
        ir.async_delete_issue(hass, DOMAIN, ISSUE_PRESENCE_MOVED)
        return
    _LOGGER.warning("Lights on presence are no longer applied (moved to House Rules): %s", ", ".join(rooms))
    ir.async_create_issue(
        hass,
        DOMAIN,
        ISSUE_PRESENCE_MOVED,
        is_fixable=False,
        severity=ir.IssueSeverity.WARNING,
        learn_more_url=HOUSE_RULES_URL,
        translation_key=ISSUE_PRESENCE_MOVED,
        translation_placeholders={"rooms": "\n".join(f"- {name}" for name in rooms), "url": HOUSE_RULES_URL},
    )


async def async_setup_entry(hass: HomeAssistant, entry: SmartComfortConfigEntry) -> bool:
    settings = build_settings(dict(entry.options))
    _presence_moved_issue(hass, settings)
    manager = SmartComfort(hass, settings)
    await manager.async_start(starting=hass.state is not CoreState.running)
    entry.runtime_data = manager
    entry.async_on_unload(manager.async_stop)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    async def first(_hass: HomeAssistant) -> None:
        await manager.async_evaluate()

    entry.async_on_unload(async_at_started(hass, first))
    entry.async_on_unload(entry.add_update_listener(_async_reload))
    file = hass.data.get(DOMAIN, {}).get("file")
    if file is not None and entry.options.get(CONF_FILE_WRITE, True):
        await file.async_write(dict(entry.options))  # Saved in the panel or the options flow: into the file too.
    await async_register_panel(hass)
    async_dispatcher_send(hass, SIGNAL_UPDATE)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: SmartComfortConfigEntry) -> bool:
    # Waits for an evaluation in progress, so that the next instance starts from its final state.
    await entry.runtime_data.async_stop()
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    async_dispatcher_send(hass, SIGNAL_UPDATE)
    return unloaded


async def async_remove_entry(hass: HomeAssistant, entry: SmartComfortConfigEntry) -> None:
    """Forget the episodes, snoozes and targets: a new entry starts afresh. The panel goes too."""
    async_remove_panel(hass)
    await async_remove_card(hass)
    ir.async_delete_issue(hass, DOMAIN, ISSUE_YAML_CONFLICTS)
    ir.async_delete_issue(hass, DOMAIN, ISSUE_PRESENCE_MOVED)
    hass.data.get(DOMAIN, {}).pop("state", None)
    await Store(hass, STORAGE_VERSION, STORAGE_KEY).async_remove()


async def _async_reload(hass: HomeAssistant, entry: SmartComfortConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)
