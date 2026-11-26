"""Home Assistant side: reads states, runs the engine and the controller, sends notifications and commands."""

from __future__ import annotations

import asyncio
import logging
from collections import deque
from collections.abc import Callable
from datetime import datetime, timedelta
from typing import Any

from homeassistant.const import ATTR_UNIT_OF_MEASUREMENT, STATE_UNAVAILABLE, STATE_UNKNOWN, UnitOfTemperature
from homeassistant.core import CALLBACK_TYPE, Context, CoreState, Event, HomeAssistant, State, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_call_later, async_track_state_change_event, async_track_time_interval
from homeassistant.helpers.json import json_bytes
from homeassistant.helpers.storage import Store
from homeassistant.helpers.translation import async_get_translations
from homeassistant.util import dt as dt_util
from homeassistant.util.async_ import create_eager_task
from homeassistant.util.unit_conversion import TemperatureConverter

from .activity import CLEARED, MANUAL, NOTIFIED, RESET, Activity
from .config import Room, Settings, in_window, slugify
from .const import (
    ACTION_ACK,
    ACTION_SNOOZE,
    DEBOUNCE,
    DOMAIN,
    EVALUATE_INTERVAL,
    EVENT_CONTROL,
    EVENT_NOTIFIED,
    FAILURE_PAUSE,
    FAMILIES,
    KIND_AIR_TO_DRY,
    KIND_CONDENSATION,
    KIND_POLLUTED,
    NOTIFY_TIMEOUT,
    OPENING_UNAVAILABLE,
    SERVICE_TIMEOUT,
    SEVERITY_CRITICAL,
    SEVERITY_INFO,
    SEVERITY_WARNING,
    SIGNAL_ACTIVITY,
    SIGNAL_UPDATE,
    STORAGE_KEY,
    STORAGE_VERSION,
)
from .control import Command, Controller, DeviceState, RoomContext
from .displays import DisplayController, DisplayState
from .engine import Clear, Digest, Engine, Gates, RoomReading
from .lighting import LightController, LightState
from .message import format_text, render
from .moisture import absolute_humidity, dew_point, surface_temperature

_LOGGER = logging.getLogger(__name__)

BAD_STATES = (STATE_UNAVAILABLE, STATE_UNKNOWN, None, "")
# A device change right after a command of ours is its answer, not a manual change (polled integrations).
COMMAND_GRACE = timedelta(seconds=90)
INTERRUPTION = {SEVERITY_INFO: "passive", SEVERITY_WARNING: "time-sensitive", SEVERITY_CRITICAL: "critical"}


def _float(state: State | None) -> float | None:
    if state is None or state.state in BAD_STATES:
        return None
    try:
        return float(state.state)
    except ValueError:
        return None


def _temperature(state: State | None) -> float | None:
    """Temperature in °C of a sensor or a weather entity (its temperature attribute), converted from its unit."""
    if state is None or state.state in BAD_STATES:
        return None
    if state.domain == "weather":
        raw, unit = state.attributes.get("temperature"), state.attributes.get("temperature_unit")
    else:
        raw, unit = state.state, state.attributes.get(ATTR_UNIT_OF_MEASUREMENT)
    try:
        value = float(raw)
    except (TypeError, ValueError):
        return None
    if unit in TemperatureConverter.VALID_UNITS and unit != UnitOfTemperature.CELSIUS:
        value = round(TemperatureConverter.convert(value, unit, UnitOfTemperature.CELSIUS), 2)
    return value


# Air quality states and their level, 1 (good) to 6 (extremely poor), in slug form (several languages).
AIR_LEVELS = {
    "excellent": 1,
    "very_good": 1,
    "good": 1,
    "bon": 1,
    "tres_bon": 1,
    "fair": 2,
    "moderate": 2,
    "medium": 2,
    "moyen": 2,
    "degraded": 3,
    "degrade": 3,
    "unhealthy_for_sensitive_groups": 3,
    "poor": 4,
    "bad": 4,
    "unhealthy": 4,
    "mauvais": 4,
    "very_poor": 5,
    "very_bad": 5,
    "very_unhealthy": 5,
    "tres_mauvais": 5,
    "extremely_poor": 6,
    "hazardous": 6,
    "extremement_mauvais": 6,
}
# US AQI upper bounds of the levels 1 to 5 (above: 6).
AQI_LEVELS = (50, 100, 150, 200, 300)


def air_level(state: State | None) -> float | None:
    """Air quality level from 1 (good) to 6 (extremely poor).

    A European index (Atmo, EAQI: 1 to 6) as is, a US AQI (device class aqi, or above 6) by its bands,
    or a text state (good, poor, mauvais…). 0 or below: no data (Atmo).
    """
    if state is None or state.state in BAD_STATES:
        return None
    try:
        value = float(state.state)
    except ValueError:
        level = AIR_LEVELS.get(slugify(state.state))
        return None if level is None else float(level)
    if value <= 0:
        return None
    if state.attributes.get("device_class") == "aqi" or value > 6:
        return float(next((i + 1 for i, top in enumerate(AQI_LEVELS) if value <= top), 6))
    return value


# Integrations whose air quality index is HomeKit's: 1 excellent, 2 good, 3 fair, 4 inferior, 5 poor.
HOMEKIT_PLATFORMS = ("homekit_controller",)


def indoor_air_level(state: State | None, homekit: bool = False) -> float | None:
    """Air quality level of a room's index sensor, 1 (good) to 6 (extremely poor), like `air_level`.

    A HomeKit index (1 excellent … 5 poor, 0 unknown) is taken as is, although its device class is aqi.
    """
    if homekit and state is not None and state.state not in BAD_STATES:
        try:
            value = float(state.state)
        except ValueError:
            return air_level(state)
        return value if 1 <= value <= 5 else None
    return air_level(state)


def _worst(values: list[float | None]) -> float | None:
    known = [v for v in values if v is not None]
    return max(known) if known else None


def _number(value: Any) -> float | None:
    try:
        return None if value is None else float(value)
    except (TypeError, ValueError):
        return None


def _iso(value: datetime | None) -> str | None:
    return value.isoformat() if value is not None else None


def present(state: State | None) -> bool:
    """Someone is home according to a zone, person, tracker, group or boolean entity. Unknown: yes."""
    if state is None or state.state in BAD_STATES:
        return True
    if state.domain == "zone":
        try:
            return int(state.state) > 0
        except ValueError:
            return True
    return state.state in ("home", "on", "true")


class SmartComfort:
    """One instance per config entry (there is only one)."""

    def __init__(self, hass: HomeAssistant, settings: Settings) -> None:
        self.hass = hass
        self.settings = settings
        self.engine = Engine(settings)
        self.controller = Controller(settings)
        self.lights = LightController(settings)
        self.displays = DisplayController(settings)
        self.activity = Activity(settings)
        self.store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self.notifications_enabled = True
        self.control_enabled = True
        # Each device family (air conditioners, fans, purifiers), controlled or left alone, under control_enabled.
        self.families: dict[str, bool] = dict.fromkeys(FAMILIES, True)
        self.lighting_enabled = True
        self.started_at: datetime | None = None
        self.last_notification: dict[str, Any] | None = None
        self.handled: set[str] = set()
        self._texts: dict[str, str] = {}
        self._listeners: list[Callable[[], None]] = []
        self._unsubs: list[CALLBACK_TYPE] = []
        self._debounce: CALLBACK_TYPE | None = None
        self._lock = asyncio.Lock()
        # Notifications go out after the evaluation lock, one at a time; while one is on its way,
        # the evaluations don't look for another one (it would be the same until marked sent).
        self._notify_lock = asyncio.Lock()
        self._deliveries = 0
        self._contexts: deque[str] = deque(maxlen=200)
        self._commanded: dict[str, datetime] = {}
        # Device (or entity) whose command failed -> end of its pause: no command to it until then.
        self._paused: dict[str, datetime] = {}
        self._stopped = False
        # Hash of the state last handed to the Store: an evaluation that changed nothing writes nothing.
        self._saved: int | None = None

    # Lifecycle.

    async def async_start(self, starting: bool) -> None:
        # After a reload, the state left by the previous instance (its delayed save may not be written yet).
        data = self.hass.data.get(DOMAIN, {}).pop("state", None) or await self.store.async_load() or {}
        self.engine.restore(data.get("engine") or {})
        self.controller.restore(data.get("control") or {})
        self.lights.restore(data.get("lighting") or {})
        self.displays.restore(data.get("displays") or {})
        self.activity.restore(data.get("activity"))
        if (last := data.get("last_notification")) is not None:
            self.last_notification = last
        # Switches: known before the first evaluation, not only once the switch entities are restored.
        self.notifications_enabled = bool(data.get("notifications_enabled", True))
        self.control_enabled = bool(data.get("control_enabled", True))
        families = data.get("families") or {}
        self.families = {family: bool(families.get(family, True)) for family in FAMILIES}
        self.lighting_enabled = bool(data.get("lighting_enabled", True))
        self._saved = self._hash()
        await self._load_texts()
        # The startup grace period counts from now when Home Assistant is starting, not on a reload.
        self.started_at = dt_util.utcnow() if starting else None
        self._track()
        self._unsubs.append(async_track_time_interval(self.hass, self._interval, timedelta(seconds=EVALUATE_INTERVAL)))
        self._unsubs.append(self.hass.bus.async_listen("mobile_app_notification_action", self._action))

    async def async_stop(self) -> None:
        """Stop, once the evaluation in progress (if any) is over, and hand the state to the next instance."""
        if self._stopped:
            return
        self._stopped = True
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        if self._debounce:
            self._debounce()
            self._debounce = None
        async with self._lock, self._notify_lock:
            data = self._data()
            self.hass.data.setdefault(DOMAIN, {})["state"] = data
            await self.store.async_save(data)

    def _track(self) -> None:
        s = self.settings
        sensors = (
            {e for r in s.rooms for e in r.sensors}
            | set(s.outdoor)
            | set(s.outdoor_noise)
            | set(s.outdoor_air)
            | set(s.outdoor_humidity)
        )
        if s.presence:
            sensors.add(s.presence)
        devices = {e for r in s.rooms for e in r.devices} | {light.entity_id for r in s.rooms for light in r.lights}
        selects = {p.mode_select for r in s.rooms for p in r.purifiers if p.mode_select}
        naps = {e for r in s.rooms for e in r.nap_entities}
        if entities := sorted(sensors | devices | selects | naps):
            self._unsubs.append(async_track_state_change_event(self.hass, entities, self._state_changed))

    @property
    def texts(self) -> dict[str, str]:
        """The notification texts (translations common.*), also used by the calendar."""
        return self._texts

    async def _load_texts(self) -> None:
        prefix = f"component.{DOMAIN}.common."
        try:
            raw = await async_get_translations(self.hass, self.hass.config.language, "common", [DOMAIN])
        except Exception:  # noqa: BLE001 - texts fall back to English
            _LOGGER.warning("Could not load the notification texts")
            raw = {}
        self._texts = {k.removeprefix(prefix): v for k, v in raw.items() if k.startswith(prefix)}

    # Listeners (entities).

    @callback
    def async_add_listener(self, update: Callable[[], None]) -> Callable[[], None]:
        self._listeners.append(update)

        def remove() -> None:
            self._listeners.remove(update)

        return remove

    @callback
    def _update_listeners(self) -> None:
        for update in list(self._listeners):
            update()
        async_dispatcher_send(self.hass, SIGNAL_UPDATE)

    @callback
    def save(self) -> None:
        """Write the state (delayed), only when it changed since the last write."""
        if self._stopped:
            return
        if (saved := self._hash()) == self._saved:
            return
        self._saved = saved
        self.store.async_delay_save(self._data, 5)

    def _hash(self) -> int:
        return hash(json_bytes(self._data()))

    def _data(self) -> dict[str, Any]:
        return {
            "engine": self.engine.as_dict(),
            "control": self.controller.as_dict(),
            "lighting": self.lights.as_dict(),
            "displays": self.displays.as_dict(),
            "activity": self.activity.as_dict(),
            "last_notification": self.last_notification,
            "notifications_enabled": self.notifications_enabled,
            "control_enabled": self.control_enabled,
            "families": self.families,
            "lighting_enabled": self.lighting_enabled,
        }

    # Triggers.

    @callback
    def _state_changed(self, event: Event) -> None:
        entity_id: str = event.data["entity_id"]
        if any(entity_id in r.devices for r in self.settings.rooms):
            self._device_changed(entity_id, event.data.get("old_state"), event.data.get("new_state"))
        if entity_id.startswith("light.") and self._light_changed(
            entity_id, event.data.get("old_state"), event.data.get("new_state")
        ):
            # Just turned on: its brightness at once, not after the debounce.
            self.hass.async_create_task(self.async_evaluate())
            return
        if self._debounce is None and not self._stopped:
            self._debounce = async_call_later(self.hass, DEBOUNCE, self._debounced)

    async def _debounced(self, _now: datetime) -> None:
        self._debounce = None
        await self.async_evaluate()

    async def _interval(self, _now: datetime) -> None:
        await self.async_evaluate()

    @callback
    def _device_changed(self, entity_id: str, old: State | None, new: State | None) -> None:
        """A change that Smart Comfort didn't make pauses the control of the device."""
        if old is None or new is None or old.state in BAD_STATES or new.state in BAD_STATES:
            return
        if new.context.id in self._contexts:
            return
        now = dt_util.utcnow()
        # While Home Assistant starts, entities settle on their first state: not a manual change.
        if not self._settled(now):
            return
        if (sent := self._commanded.get(entity_id)) is not None and now - sent < COMMAND_GRACE:
            return
        keys = ("preset_mode", "percentage", "hvac_mode", "temperature", "fan_mode", "mode", "humidity")
        changed = old.state != new.state or any(old.attributes.get(k) != new.attributes.get(k) for k in keys)
        if changed and entity_id in self.controller.targets:
            _LOGGER.debug("Manual change of %s, control paused", entity_id)
            self.controller.manual_change(entity_id, now)
            self._log(now, MANUAL, entity_id, until=_iso(self.controller.overrides.get(entity_id)))

    @callback
    def _light_changed(self, entity_id: str, old: State | None, new: State | None) -> bool:
        """A light turned off ends its pause; one changed by hand is paused. True when it was just turned on."""
        if new is None or new.state in BAD_STATES:
            return False
        if new.state == "off":
            self.lights.turned_off(entity_id)
            return False
        if old is None or old.state != "on":
            return new.context.id not in self._contexts
        if new.context.id in self._contexts or entity_id not in self.lights.targets:
            return False
        now = dt_util.utcnow()
        # Our transition answers for a while (polled lights report the steps in contexts of their own).
        grace = max(COMMAND_GRACE, timedelta(seconds=self.settings.transition + 30))
        if (sent := self._commanded.get(entity_id)) is not None and now - sent < grace:
            return False
        keys = ("brightness", "color_temp_kelvin")
        if any(old.attributes.get(k) != new.attributes.get(k) for k in keys):
            _LOGGER.debug("Manual change of %s, lighting paused", entity_id)
            self.lights.manual_change(entity_id, now)
            self._log(now, MANUAL, entity_id, until=_iso(self.lights.overrides.get(entity_id)))
        return False

    def light_states(self, room: Room) -> dict[str, LightState]:
        out: dict[str, LightState] = {}
        for entity_id in dict.fromkeys(light.entity_id for light in room.lights):
            state = self.hass.states.get(entity_id)
            if state is None or state.state in BAD_STATES:
                continue
            modes = set(state.attributes.get("supported_color_modes") or [])
            raw = state.attributes.get("brightness")
            warm = "color_temp" in modes
            out[entity_id] = LightState(
                on=state.state == "on",
                brightness=round(raw * 100 / 255) if isinstance(raw, (int, float)) else None,
                kelvin=state.attributes.get("color_temp_kelvin"),
                dimmable=bool(modes - {"onoff"}) if modes else raw is not None,
                min_kelvin=state.attributes.get("min_color_temp_kelvin") if warm else None,
                max_kelvin=state.attributes.get("max_color_temp_kelvin") if warm else None,
            )
        return out

    def sun_elevation(self) -> float | None:
        state = self.hass.states.get("sun.sun")
        value = state.attributes.get("elevation") if state else None
        return float(value) if isinstance(value, (int, float)) else None

    # Readings.

    def outdoor(self, entities: tuple[str, ...] | None = None) -> float | None:
        """Outdoor temperature: the sensors combined as set (min by default), None without one available."""
        sensors = self.settings.outdoor if entities is None else entities
        values = [v for e in sensors if (v := _temperature(self.hass.states.get(e))) is not None]
        if not values:
            return None
        if self.settings.aggregate == "max":
            return max(values)
        if self.settings.aggregate == "mean":
            return round(sum(values) / len(values), 2)
        return min(values)

    def outdoor_noise(self, entities: tuple[str, ...] | None = None) -> float | None:
        """Mean of the outdoor noise sensors (dB), None without one available."""
        sensors = self.settings.outdoor_noise if entities is None else entities
        values = [v for e in sensors if (v := _float(self.hass.states.get(e))) is not None]
        return round(sum(values) / len(values), 1) if values else None

    def outdoor_air(self, entities: tuple[str, ...] | None = None) -> float | None:
        """Worst level of the outdoor air quality sensors, None without one available."""
        sensors = self.settings.outdoor_air if entities is None else entities
        values = [v for e in sensors if (v := air_level(self.hass.states.get(e))) is not None]
        return max(values) if values else None

    def outdoor_humidity(self, entities: tuple[str, ...] | None = None) -> float | None:
        """Mean of the outdoor relative humidity sensors (%), None without one available."""
        sensors = self.settings.outdoor_humidity if entities is None else entities
        values = [v for e in sensors if (v := _float(self.hass.states.get(e))) is not None]
        return round(sum(values) / len(values), 1) if values else None

    def _tank_full(self, room: Room) -> bool | None:
        """A dehumidifier's tank is full (None when every tank sensor is unknown, False without one)."""
        states = [self.hass.states.get(e) for e in room.tanks]
        known = [st.state == "on" for st in states if st is not None and st.state in ("on", "off")]
        if not room.tanks:
            return False
        return any(known) if known else None

    def _full_tanks(self, room: Room) -> frozenset[str]:
        return frozenset(e for e in room.tanks if (st := self.hass.states.get(e)) is not None and st.state == "on")

    def stove_heating(self) -> bool:
        """A pellet stove of the home is heating."""
        for room in self.settings.rooms:
            for heater in room.heating:
                if not heater.stove:
                    continue
                state = self.hass.states.get(heater.entity_id)
                if state is None or state.state in BAD_STATES or state.state == "off":
                    continue
                if state.attributes.get("hvac_action") in (None, "heating"):
                    return True
        return False

    def heating_states(self, room: Room) -> tuple[dict[str, str | None], dict[str, datetime]]:
        """States of the heaters' schedule, Tempo and off-peak entities; when each schedule turns on next."""
        states: dict[str, str | None] = {}
        next_on: dict[str, datetime] = {}
        for heater in room.heating:
            for entity_id in heater.entities:
                state = self.hass.states.get(entity_id)
                states[entity_id] = None if state is None or state.state in BAD_STATES else state.state
            if heater.schedule and states.get(heater.schedule) == "off":
                raw = self.hass.states.get(heater.schedule).attributes.get("next_event")  # type: ignore[union-attr]
                when = raw if isinstance(raw, datetime) else dt_util.parse_datetime(str(raw)) if raw else None
                if when is not None:
                    next_on[heater.schedule] = dt_util.as_utc(when)
        return states, next_on

    def _outdoor_gone(self, settled: bool) -> bool:
        """Every outdoor temperature entity no longer exists (not just unavailable)."""
        outdoor = self.settings.outdoor
        return settled and bool(outdoor) and all(self.hass.states.get(e) is None for e in outdoor)

    def _settled(self, now: datetime) -> bool:
        """Home Assistant runs and the startup grace is over: an entity still missing is gone."""
        if self.hass.state is not CoreState.running:
            return False
        return self.started_at is None or now - self.started_at >= timedelta(minutes=self.settings.startup_grace)

    def ignored_openings(self, room: Room, now: datetime) -> list[str]:
        """Openings unavailable for a while (dead battery…) or gone: left out instead of blocking the room."""
        out = []
        grace = timedelta(minutes=OPENING_UNAVAILABLE)
        for entity_id in room.openings:
            state = self.hass.states.get(entity_id)
            if state is None:
                if self._settled(now):
                    out.append(entity_id)
            elif state.state not in ("on", "off") and now - state.last_changed >= grace:
                out.append(entity_id)
        return out

    def _openings(self, room: Room, now: datetime) -> tuple[list[str] | None, datetime | None, datetime | None]:
        """(open entity ids or None if one is unknown, open since, all closed since)."""
        ignored = set(self.ignored_openings(room, now))
        states = [self.hass.states.get(e) for e in room.openings if e not in ignored]
        if any(s is None or s.state not in ("on", "off") for s in states):
            return None, None, None
        opened = [s for s in states if s.state == "on"]
        if opened:
            return [s.entity_id for s in opened], min(s.last_changed for s in opened), None
        changed = [s.last_changed for s in states] + [
            s.last_changed for e in ignored if (s := self.hass.states.get(e)) is not None
        ]
        return [], None, max(changed, default=None)

    def reading(self, room: Room, now: datetime | None = None) -> tuple[RoomReading, RoomContext]:
        now = now or dt_util.utcnow()
        opened, open_since, closed_since = self._openings(room, now)
        temperature = _temperature(self.hass.states.get(room.temperature)) if room.temperature else None
        settled = self._settled(now)
        sources = (
            ("temperature", room.temperature),
            ("co2", room.co2),
            ("humidity", room.humidity),
            ("noise", room.noise),
        )
        missing = {n for n, entity_id in sources if entity_id and settled and self.hass.states.get(entity_id) is None}
        if settled and room.indoor_air and all(self.hass.states.get(e) is None for e in room.indoor_air):
            missing.add("indoor_air")
        if self._outdoor_gone(settled):
            missing.add("outdoor")
        for name, outdoor_sensors in (
            ("outdoor_noise", self.settings.outdoor_noise),
            ("outdoor_air", self.settings.outdoor_air),
        ):
            if settled and outdoor_sensors and all(self.hass.states.get(e) is None for e in outdoor_sensors):
                missing.add(name)
        reading = RoomReading(
            temperature=temperature,
            co2=_float(self.hass.states.get(room.co2)) if room.co2 else None,
            humidity=_float(self.hass.states.get(room.humidity)) if room.humidity else None,
            noise=_float(self.hass.states.get(room.noise)) if room.noise else None,
            pm25=_worst([_float(self.hass.states.get(e)) for e in room.pm25]),
            pm10=_worst([_float(self.hass.states.get(e)) for e in room.pm10]),
            aqi=_worst([indoor_air_level(self.hass.states.get(e), self._homekit(e)) for e in room.air_quality]),
            outdoor_noise=self.outdoor_noise(),
            outdoor_air=self.outdoor_air(),
            tank_full=self._tank_full(room),
            heating_fault=self.controller.faults.get(room.id),
            pellets=min((v for e in room.pellets if (v := _float(self.hass.states.get(e))) is not None), default=None),
            open=opened,
            has_openings=bool(room.openings),
            missing=frozenset(missing),
        )
        outdoor = self.outdoor()
        surface_sensor = (
            _temperature(self.hass.states.get(room.surface_temperature)) if room.surface_temperature else None
        )
        reading.surface = surface_temperature(temperature, outdoor, surface_sensor)
        reading.dew_point = dew_point(temperature, reading.humidity)
        if reading.surface is not None and reading.dew_point is not None:
            reading.dew_margin = round(reading.surface - reading.dew_point, 1)
        inside = absolute_humidity(temperature, reading.humidity)
        outside = absolute_humidity(outdoor, self.outdoor_humidity())
        if inside is not None and outside is not None:
            reading.drier = round(inside - outside, 1)
        ctx = RoomContext(
            temperature=temperature,
            any_open=None if opened is None else bool(opened),
            closed_since=closed_since,
            open_since=open_since,
            has_openings=bool(room.openings),
            outdoor=outdoor,
            humidity=reading.humidity,
            full_tanks=self._full_tanks(room),
        )
        if room.heating:
            ctx.states, ctx.next_on = self.heating_states(room)
        return reading, ctx

    def _homekit(self, entity_id: str) -> bool:
        """A HomeKit air quality index (1 to 5), told by its integration."""
        entry = er.async_get(self.hass).async_get(entity_id)
        return entry is not None and entry.platform in HOMEKIT_PLATFORMS

    def device_states(self, room: Room) -> dict[str, DeviceState]:
        out: dict[str, DeviceState] = {}
        selects = {p.entity_id: p.mode_select for p in room.purifiers}
        for entity_id in room.devices:
            state = self.hass.states.get(entity_id)
            if state is None or state.state in BAD_STATES:
                out[entity_id] = DeviceState(available=False)
                continue
            is_climate = state.domain == "climate"
            is_humidifier = state.domain == "humidifier"
            on = state.state != "off" if is_climate else state.state == "on"
            option = None
            if (select := selects.get(entity_id)) and (sel := self.hass.states.get(select)) is not None:
                option = sel.state
            out[entity_id] = DeviceState(
                on=on,
                hvac_mode=state.state if is_climate else None,
                preset=state.attributes.get("preset_mode"),
                percentage=state.attributes.get("percentage"),
                option=option,
                fan_mode=state.attributes.get("fan_mode") if is_climate else None,
                off_since=state.last_changed if not on else None,
                mode=state.attributes.get("mode") if is_humidifier else None,
                target_humidity=_number(state.attributes.get("humidity")) if is_humidifier else None,
                setpoint=_number(state.attributes.get("temperature")) if is_climate else None,
            )
        return out

    def display_states(self, room: Room) -> dict[str, DisplayState]:
        out: dict[str, DisplayState] = {}
        for entity_id in room.displays:
            state = self.hass.states.get(entity_id)
            if state is None or state.state in BAD_STATES:
                continue
            out[entity_id] = DisplayState(
                domain=state.domain,
                value=state.state,
                options=tuple(state.attributes.get("options") or ()),
                minimum=_number(state.attributes.get("min")),
                maximum=_number(state.attributes.get("max")),
            )
        return out

    # Evaluation.

    def refresh_naps(self) -> None:
        """The nap entities on now, for `Room.napping`."""
        for room in self.settings.rooms:
            room.naps_on.clear()
            room.naps_on.update(
                e for e in room.nap_entities if (s := self.hass.states.get(e)) is not None and s.state == "on"
            )

    def gates(self, now: datetime) -> Gates:
        s = self.settings
        starting = self.started_at is not None and now - self.started_at < timedelta(minutes=s.startup_grace)
        local = dt_util.as_local(now).time()
        quiet = s.quiet_start is not None and s.quiet_end is not None and in_window(local, s.quiet_start, s.quiet_end)
        away = s.presence is not None and not present(self.hass.states.get(s.presence))
        return Gates(enabled=self.notifications_enabled, starting=starting, hold=quiet or away)

    async def async_evaluate(self) -> None:
        if self._stopped:
            return
        async with self._lock:
            if self._stopped:
                return
            now = dt_util.utcnow()
            local = dt_util.as_local(now).time()
            self.refresh_naps()
            readings: dict[str, RoomReading] = {}
            commands: list[Command] = []
            handled: set[str] = set()
            lighting = self.lighting_enabled and self.settings.lighting_enabled
            elevation = self.sun_elevation()
            if reset := self.controller.reset_due(dt_util.as_local(now), self.families):
                _LOGGER.debug("Back to the normal state: %s", ", ".join(reset))
                for entity_id in reset:
                    self._log(now, RESET, entity_id)
            # The alerts first: the purifiers of a room whose air is polluted are boosted in the same evaluation.
            contexts: dict[str, RoomContext] = {}
            for room in self.settings.rooms:
                readings[room.id], contexts[room.id] = self.reading(room, now)
            self.engine.evaluate(now, readings, self.outdoor())
            away = self.settings.presence is not None and not present(self.hass.states.get(self.settings.presence))
            stove = self.stove_heating()
            if not (self.control_enabled and self.families.get("heating", True)):
                self.controller.faults.clear()  # Its heaters left alone: no longer Smart Comfort's to judge.
            for room in self.settings.rooms:
                if lighting and room.lights:
                    commands += self.lights.evaluate(
                        now, dt_util.as_local(now), elevation, room, self.light_states(room)
                    )
                ctx = contexts[room.id]
                ctx.polluted = self.engine.alerting(room.id, KIND_POLLUTED)
                ctx.damp = self.engine.alerting(room.id, KIND_CONDENSATION)
                airing = self.engine.episodes.get(f"{room.id}|{KIND_AIR_TO_DRY}")
                ctx.airing_since = airing.since if airing is not None else None
                ctx.away, ctx.stove_heating, ctx.local = away, stove, dt_util.as_local(now)
                states = self.device_states(room)
                if self.control_enabled:
                    commands += self.controller.evaluate(now, local, room, ctx, states, self.families)
                    if room.displays:
                        commands += self.displays.evaluate(
                            dt_util.as_local(now), room, self.display_states(room), self.families
                        )
                if self.controller.handled(room, states):
                    handled.add(room.id)
                if ctx.polluted and self.controller.purifying(room, states):
                    handled.add(f"{room.id}|{KIND_POLLUTED}")
                handled |= self.controller.handled_keys(room, states)
                readings[room.id].handled = room.id in handled
            self.handled = handled
            sent = await self._run(commands, now)
            # A device fails when one of its commands failed or was not sent (unavailable, paused).
            ok = {id(c) for c, done in sent if done}
            failed = {c.device for c in commands if id(c) not in ok}
            if sent:
                async_dispatcher_send(self.hass, SIGNAL_ACTIVITY, self.activity.commands(now, sent))
            for device in {c.device for c in commands if c.device} - failed:
                self.controller.command_succeeded(device)
            result = None if self._deliveries else self.engine.step(now, self.gates(now), handled)
            if result is not None:
                self._deliveries += 1
            self.save()
        if result is not None:
            await self._deliver(result, now)
        if not self._stopped:
            self._update_listeners()

    async def _run(self, commands: list[Command], now: datetime) -> list[tuple[Command, bool]]:
        """Run the commands, in their order: the lights first, then the other devices.

        The commands of different devices run at the same time, so a slow device doesn't hold the
        others; those of one device stay in order (turn on, then set its speed). The commands of an
        unavailable device, or of one paused after a failure, are not sent (nor returned).
        """
        self._paused = {k: until for k, until in self._paused.items() if until > now}
        groups: dict[str, list[Command]] = {}
        for cmd in commands:
            if (reason := self._held(cmd)) is not None:
                _LOGGER.debug("%s.%s on %s not sent: %s", cmd.domain, cmd.service, cmd.entity_id, reason)
                self._forget(cmd)
                continue
            groups.setdefault(cmd.device or cmd.entity_id, []).append(cmd)
        done: dict[int, bool] = {}

        async def run(group: list[Command]) -> None:
            for i, cmd in enumerate(group):
                done[id(cmd)] = await self._command(cmd, now)
                if not done[id(cmd)]:
                    # The device is paused: the rest of its commands are not sent either.
                    for rest in group[i + 1 :]:
                        self._forget(rest)
                    return

        lights: list[list[Command]] = []
        others: list[list[Command]] = []
        for group in groups.values():
            (lights if any(c.domain == "light" for c in group) else others).append(group)
        for batch in (lights, others):
            # Eager: a command answered at once doesn't wait for the event loop.
            await asyncio.gather(*(create_eager_task(run(g)) for g in batch))
        return [(cmd, done[id(cmd)]) for cmd in commands if id(cmd) in done]

    def _held(self, cmd: Command) -> str | None:
        """Why the command can't be sent now (None: it can)."""
        for entity_id in dict.fromkeys((cmd.device, cmd.entity_id)):
            if entity_id is None:
                continue
            if entity_id in self._paused:
                return "paused after a failure"
            if (state := self.hass.states.get(entity_id)) is not None and state.state == STATE_UNAVAILABLE:
                return f"{entity_id} unavailable"
        return None

    def _forget(self, cmd: Command, failed_at: datetime | None = None) -> None:
        """A command not applied (`failed_at`: failed, else not sent): what was wanted is sent again later."""
        if failed_at is None:
            self.controller.command_skipped(cmd)
        else:
            self.controller.command_failed(cmd, failed_at)
        if cmd.domain == "light":
            self.lights.targets.pop(cmd.entity_id, None)
        self.displays.wanted.pop(cmd.entity_id, None)

    async def _command(self, cmd: Command, now: datetime) -> bool:
        context = Context()
        self._contexts.append(context.id)
        self._commanded[cmd.entity_id] = now
        if cmd.device:
            # A purifier answers its mode select on its fan entity, in a context of its own.
            self._commanded[cmd.device] = now
        data = {"entity_id": cmd.entity_id, **cmd.data}
        try:
            async with asyncio.timeout(SERVICE_TIMEOUT):
                await self.hass.services.async_call(cmd.domain, cmd.service, data, blocking=True, context=context)
        except TimeoutError:
            # Slow cloud devices often answer late (and apply the command anyway): not worth a warning.
            _LOGGER.debug("%s.%s on %s: no answer within %s s", cmd.domain, cmd.service, cmd.entity_id, SERVICE_TIMEOUT)
            self._failed(cmd, now)
            return False
        except Exception as err:  # noqa: BLE001 - one failing device doesn't stop the others
            _LOGGER.warning(
                "%s.%s on %s failed, no command to it for %s min: %s: %s",
                cmd.domain,
                cmd.service,
                cmd.entity_id,
                FAILURE_PAUSE,
                type(err).__name__,
                err,
            )
            self._failed(cmd, now)
            return False
        self.hass.bus.async_fire(
            EVENT_CONTROL,
            {
                "entity_id": cmd.entity_id,
                "action": f"{cmd.domain}.{cmd.service}",
                "data": cmd.data,
                "target": cmd.target,
            },
            context=context,
        )
        return True

    def _failed(self, cmd: Command, now: datetime) -> None:
        """A failed command: the device is paused (its next commands are not sent), then tried again."""
        until = now + timedelta(minutes=FAILURE_PAUSE)
        self._paused[cmd.device or cmd.entity_id] = until
        self._forget(cmd, now)

    @callback
    def _log(self, now: datetime, kind: str, entity_id: str | None = None, **extra: Any) -> None:
        """One activity entry, sent to the panel and the activity cards."""
        async_dispatcher_send(self.hass, SIGNAL_ACTIVITY, [self.activity.add(now, kind, entity_id, **extra)])

    # Notifications.

    def _payload(self, digest: Digest) -> dict[str, Any]:
        s = self.settings
        push: dict[str, Any] = {"interruption-level": INTERRUPTION.get(digest.severity, "active")}
        if digest.severity == SEVERITY_CRITICAL:
            push["sound"] = {"name": "default", "critical": 1, "volume": s.critical_volume}
        elif digest.severity == SEVERITY_WARNING:
            push["sound"] = "default"
        snooze = s.snooze
        snooze_title = (
            self._text("action_snooze", hours=snooze // 60)
            if snooze % 60 == 0
            else self._text("action_snooze_minutes", minutes=snooze)
        )
        data: dict[str, Any] = {
            "tag": s.tag,
            "group": s.tag,
            "push": push,
            "actions": [
                {"action": ACTION_SNOOZE, "title": snooze_title},
                {"action": ACTION_ACK, "title": self._text("action_ack")},
            ],
        }
        if digest.severity == SEVERITY_CRITICAL:
            data.update({"priority": "high", "ttl": 0})
        if s.url:
            data["url"] = s.url
            data["clickAction"] = s.url
        return data

    def _text(self, key: str, **values: Any) -> str:
        return format_text(self._texts, key, **values)

    async def _notify(self, payload: dict[str, Any], services: list[str] | None = None, quiet: bool = False) -> bool:
        """Send with every notifier; False when all of them failed (True without any notifier).

        `quiet`: failures logged at debug level (a retry, already reported once).
        """
        services = list(self.settings.notify) if services is None else services
        sent = not services
        for service in services:
            domain, name = service.split(".", 1)
            try:
                async with asyncio.timeout(NOTIFY_TIMEOUT):
                    await self.hass.services.async_call(domain, name, payload, blocking=True)
            except Exception as err:  # noqa: BLE001 - one failing notifier doesn't stop the others
                (_LOGGER.debug if quiet else _LOGGER.warning)("Notification with %s failed: %s", service, err)
            else:
                sent = True
        return sent

    async def _deliver(self, result: Digest | Clear, now: datetime) -> bool:
        """Send a digest or clear the notification, out of the evaluation lock (counted in `_deliveries`)."""
        try:
            async with self._notify_lock:
                if isinstance(result, Clear):
                    if self._stopped:
                        self.engine.shown = True  # Still on the phones: the next instance clears it.
                        return False
                    if await self._clear(quiet=self.engine.clear_failures > 0):
                        self.engine.cleared()
                        return True
                    if not self.engine.clear_failed(now):
                        _LOGGER.warning("Could not clear the notification, giving up")
                    self.save()
                    return False
                if self._stopped:
                    return False  # Not marked sent: the next instance sends it.
                sent = await self._send(result, now)
                self.save()
                return sent
        finally:
            self._deliveries -= 1

    async def _send(self, digest: Digest, now: datetime) -> bool:
        """Send the digest; its problems are marked notified only when at least one notifier got it."""
        names = {}
        for item in digest.items:
            for o in item.episode.details.get("openings", []):
                state = self.hass.states.get(o)
                names[o] = state.name if state else o
        title, message, _icon = render(digest, self._texts, now, names)
        if not await self._notify({"title": title, "message": message, "data": self._payload(digest)}):
            _LOGGER.warning("No notifier could send the alerts, trying again at the next evaluation")
            return False
        self.engine.sent(digest, now)
        self.last_notification = {
            "at": now.isoformat(),
            "title": title,
            "message": message,
            "severity": digest.severity,
            "alerts": digest.keys,
        }
        self.hass.bus.async_fire(EVENT_NOTIFIED, {**self.last_notification})
        self._log(now, NOTIFIED, title=title, message=message, severity=digest.severity)
        return True

    async def _clear(self, quiet: bool = False) -> bool:
        """Clear the notification; False when no Companion app notifier could do it (`quiet`: a retry)."""
        # Only the Companion app understands it: other notifiers would show the text "clear_notification".
        mobile = [s for s in self.settings.notify if self._companion(s)]
        payload = {"message": "clear_notification", "data": {"tag": self.settings.tag}}
        if mobile and not await self._notify(payload, mobile, quiet):
            if not quiet:
                _LOGGER.warning("Could not clear the notification, trying again later")
            return False
        self._log(dt_util.utcnow(), CLEARED)
        return True

    def _companion(self, service: str) -> bool:
        """A Companion app notifier, or a notify group (usually of phones, which forwards to them)."""
        name = service.removeprefix("notify.")
        if name.startswith("mobile_app_"):
            return True
        groups = self.hass.data.get("notify_services", {}).get("group", [])  # Legacy notify groups.
        return any(getattr(group, "_service_name", None) == name for group in groups)

    # User actions.

    async def _action(self, event: Event) -> None:
        action = event.data.get("action")
        if action not in (ACTION_SNOOZE, ACTION_ACK):
            return
        if self._stopped:
            return
        keys = self.engine.last_keys
        if action == ACTION_SNOOZE:
            self.engine.snooze(dt_util.utcnow(), self.settings.snooze, keys=keys)
        else:
            self.engine.acknowledge(keys=keys)
        self.save()
        self._update_listeners()

    async def async_snooze(self, minutes: int | None, rooms: list[str] | None, kinds: list[str] | None) -> None:
        self.engine.snooze(dt_util.utcnow(), minutes or self.settings.snooze, rooms=rooms, kinds=kinds)
        self.save()
        self._update_listeners()

    async def async_unsnooze(self, rooms: list[str] | None) -> None:
        self.engine.unsnooze(dt_util.utcnow(), rooms)
        self.save()
        await self.async_evaluate()

    async def async_acknowledge(self, rooms: list[str] | None, kinds: list[str] | None) -> None:
        self.engine.acknowledge(rooms=rooms, kinds=kinds)
        self.save()
        self._update_listeners()

    async def async_notify_now(self) -> bool:
        async with self._lock:
            now = dt_util.utcnow()
            digest = self.engine.summary(now, self.handled)
            if digest is None:
                return False
            self._deliveries += 1
        sent = await self._deliver(digest, now)
        self._update_listeners()
        return sent

    @callback
    def set_notifications(self, enabled: bool) -> None:
        self.notifications_enabled = enabled
        self.save()
        self._update_listeners()

    @callback
    def set_control(self, enabled: bool) -> None:
        self.control_enabled = enabled
        self.save()
        self._update_listeners()

    @callback
    def set_family(self, family: str, enabled: bool) -> None:
        """Control a device family (climate, fans, purifiers) or leave it alone."""
        if self.families.get(family) == enabled:
            return
        self.families[family] = enabled
        self.save()
        self._update_listeners()
        if not self._stopped:
            self.hass.async_create_task(self._family_changed(family, enabled))

    async def _family_changed(self, family: str, enabled: bool) -> None:
        """A family turned off is forgotten, then the rooms evaluated again at once (not at the next interval).

        Forgotten under the evaluation lock: an evaluation running when the switch is turned off may still
        send its commands, and the targets they set are dropped after it, not before.
        """
        if not enabled:
            async with self._lock:
                if not self.families.get(family) and not self._stopped:  # Not turned back on in the meantime.
                    now = dt_util.utcnow()
                    # The devices Smart Comfort was driving back to rest (the AC it started cooling turned off…),
                    # the ones changed by hand left as they are: nothing it started keeps running unattended.
                    commands: list[Command] = []
                    if self.control_enabled:
                        for room in self.settings.rooms:
                            commands += self.controller.rest(now, room, family, self.device_states(room))
                    if sent := await self._run(commands, now):
                        async_dispatcher_send(self.hass, SIGNAL_ACTIVITY, self.activity.commands(now, sent))
                    # Its targets dropped: no longer counted as handling an alert, applied again once back.
                    on = dict.fromkeys(FAMILIES, False) | {family: True}
                    for room in self.settings.rooms:
                        self.controller.forget(d.entity_id for d in room.controlled(on))
                        for display in room.displays_of(on):
                            self.displays.wanted.pop(display, None)
                    self.save()
        await self.async_evaluate()  # The alerts no longer handled come back, the family turned on is applied.

    @callback
    def set_lighting(self, enabled: bool) -> None:
        self.lighting_enabled = enabled
        if not enabled:
            self.lights.targets.clear()  # Applied again from scratch when turned back on.
        self.save()
        self._update_listeners()
