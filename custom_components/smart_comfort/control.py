"""Device control: air conditioners, fans, air purifiers, dehumidifiers and heaters of each room.

Pure Python. Each device has a target (cool/off, on/boost/off, boost/normal) derived from the room
reading, with a hysteresis band in which the previous target holds. Commands are sent only when
the target changes and the device isn't already in that state, so a user who changes a device by
hand is not fought: a manual change pauses the device for `manual_override` minutes, after which the
target is applied again.
"""

from __future__ import annotations

from collections import deque
from collections.abc import Iterable, Mapping
from dataclasses import dataclass, field, replace
from datetime import datetime, timedelta
from typing import Any

from .config import (
    ClimateDevice,
    DehumidifierDevice,
    FanDevice,
    HeatingDevice,
    PurifierDevice,
    Room,
    Settings,
    in_window,
    slugify,
)
from .const import (
    COMMAND_RETRY,
    COMMAND_RETRY_MAX,
    HEAT_RATE_DEFAULT,
    HEAT_RATE_MAX,
    HEAT_RATE_MIN,
    KEEP_ON_DELAY,
    KIND_AIR_TO_DRY,
    KIND_CONDENSATION,
    KIND_HUMIDITY,
    KIND_TOO_COLD,
    SHOWER_WINDOW,
)

TARGET_COOL = "cool"
TARGET_OFF = "off"
# Air conditioner turned off because an opening stays open: applies whatever its mode (heating too).
TARGET_OFF_OPEN = "off_open"
TARGET_ON = "on"
TARGET_BOOST = "boost"
TARGET_NORMAL = "normal"
# Purifier boosted while the room's air is polluted (its window boost settings).
TARGET_PURIFY = "purify"
# Quiet night variants: the device's night settings.
TARGET_COOL_NIGHT = "cool_night"
TARGET_ON_NIGHT = "on_night"
TARGET_NIGHT = "night"
# Fan boosted after a shower (its shower speed or preset); dehumidifiers drying (night: their night mode, or off).
TARGET_SHOWER = "shower"
TARGET_DRY = "dry"
TARGET_DRY_NIGHT = "dry_night"
TARGET_OFF_NIGHT = "off_night"
COOLING = frozenset({TARGET_COOL, TARGET_COOL_NIGHT})
BLOWING = frozenset({TARGET_ON, TARGET_ON_NIGHT, TARGET_BOOST})
BOOSTING = frozenset({TARGET_BOOST, TARGET_PURIFY})
DRYING = frozenset({TARGET_DRY, TARGET_DRY_NIGHT, TARGET_SHOWER})
# Heaters: "heat:<mode>:<setpoint>", or "heat:off". Modes: comfort, eco, away, frost, and frost_open (an opening open).
HEAT_PREFIX = "heat:"
HEAT_OFF = "heat:off"
MODE_COMFORT = "comfort"
MODE_ECO = "eco"
MODE_AWAY = "away"
MODE_FROST = "frost"
MODE_FROST_OPEN = "frost_open"
# A setpoint read back this close to the one sent is the same (a °F system rounds to whole degrees: 0.28 °C apart).
SETPOINT_TOLERANCE = 0.3
# How far below max_outdoor it must get outdoors for the heating to resume.
SEASON_HYSTERESIS = 1.0
# The room counts as warm this close to its setpoint (the warm-up rate is measured below it).
WARM_MARGIN = 0.3
# A fault is looked for only while the room is at least this far below its setpoint: a thermostat regulating around
# it (half a degree under, for hours) is no fault.
FAULT_GAP = 1.0
# Minutes over which a warm-up rate is measured; weight of a new measure in the learnt rate.
RATE_SPAN = 20
RATE_WEIGHT = 0.3


def heat_target(mode: str, setpoint: float | None = None) -> str:
    return HEAT_OFF if setpoint is None else f"{HEAT_PREFIX}{mode}:{setpoint:g}"


def heat_mode(target: str | None) -> tuple[str | None, float | None]:
    """(mode, setpoint) of a heater target, (None, None) for another one; ("off", None) when off."""
    if not target or not target.startswith(HEAT_PREFIX):
        return None, None
    if target == HEAT_OFF:
        return "off", None
    _prefix, mode, value = target.split(":", 2)
    try:
        return mode, float(value)
    except ValueError:
        return mode, None


def heating(target: str | None) -> bool:
    """A heater target that heats (any mode but off and the frost protection of an open window)."""
    mode, _setpoint = heat_mode(target)
    return mode is not None and mode not in ("off", MODE_FROST_OPEN)


def heat_mode_of(state: DeviceState) -> str:
    """The hvac mode that turns a heater on: heat, else auto (valves, thermostats on their own schedule), else the
    first one that isn't off; heat when the device doesn't tell."""
    modes = [m for m in state.hvac_modes if m != "off"]
    if not modes or "heat" in modes:
        return "heat"
    return "auto" if "auto" in modes else modes[0]


def tempo_colour(state: str | None) -> str | None:
    """EDF Tempo colour of a sensor's state: blue, white or red (several spellings, 1-3), None when unknown."""
    if not state:
        return None
    slug = slugify(state)
    for colour, words in (
        ("red", ("rouge", "red", "3")),
        ("white", ("blanc", "white", "2")),
        ("blue", ("bleu", "blue", "1")),
    ):
        if any(slug == w or w in slug.split("_") for w in words):
            return colour
    return None


OFFPEAK_STATES = frozenset({"on", "true", "hc", "heures_creuses", "off_peak", "offpeak", "creuse", "creuses"})


@dataclass
class DeviceState:
    """State of a device entity, None fields when unknown."""

    available: bool = True
    on: bool | None = None
    hvac_mode: str | None = None
    preset: str | None = None
    percentage: int | None = None
    option: str | None = None  # Current option of the purifier's mode select.
    fan_mode: str | None = None  # Air conditioner.
    off_since: datetime | None = None
    mode: str | None = None  # Dehumidifier mode.
    target_humidity: float | None = None  # Dehumidifier target.
    setpoint: float | None = None  # Heater setpoint (temperature attribute).
    hvac_modes: tuple[str, ...] = ()  # Modes a climate entity offers.


# How far below min_outdoor it must get outdoors for Smart Comfort's cooling to stop.
OUTDOOR_HYSTERESIS = 1.0


@dataclass
class RoomContext:
    temperature: float | None
    any_open: bool | None
    # Since when every opening is closed / at least one is open (None when unknown or not the case).
    closed_since: datetime | None
    open_since: datetime | None
    has_openings: bool
    # The room's polluted air alert is on: its purifiers are boosted.
    polluted: bool = False
    # Outdoor temperature (None when unknown).
    outdoor: float | None = None
    # Room humidity (%), and a condensation risk under way: the dehumidifiers dry.
    humidity: float | None = None
    damp: bool = False
    # Since when airing would dry the room (air_to_dry): dehumidifiers that prefer airing wait for it a while.
    airing_since: datetime | None = None
    # Tank sensors that are on (full).
    full_tanks: frozenset[str] = frozenset()
    # Nobody home (the presence option), a stove of the home heating.
    away: bool = False
    stove_heating: bool = False
    # States of the heaters' schedules, Tempo and off-peak entities; when each schedule turns on next.
    states: Mapping[str, str | None] = field(default_factory=dict)
    next_on: Mapping[str, datetime] = field(default_factory=dict)
    # The room's air conditioner is cooling (by Smart Comfort): its heaters stay off; its heaters heat: no cooling.
    cooling: bool = False
    heating: bool = False
    # Local date and time (off-peak hours).
    local: datetime | None = None


@dataclass
class Command:
    """One action call: domain.service with data, on entity_id."""

    entity_id: str
    domain: str
    service: str
    data: dict[str, Any] = field(default_factory=dict)
    target: str | None = None
    # Controlled device the command is for (entity_id is the mode select for a purifier's option).
    device: str | None = None
    # State before the boost that this command restores: kept for a retry when the command fails.
    restores: dict[str, Any] | None = None


def _fan_commands(entity_id: str, percentage: int | None, preset: str | None) -> list[Command]:
    cmds = [Command(entity_id, "fan", "turn_on")]
    if preset:
        cmds.append(Command(entity_id, "fan", "set_preset_mode", {"preset_mode": preset}))
    if percentage is not None:
        cmds.append(Command(entity_id, "fan", "set_percentage", {"percentage": percentage}))
    return cmds


class Controller:
    """Targets and manual overrides of every controlled device."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.targets: dict[str, str] = {}
        self.overrides: dict[str, datetime] = {}
        self.keep_on_sent: dict[str, datetime] = {}
        # State of a purifier before its window boost, restored when the boost ends.
        self.before_boost: dict[str, dict[str, Any]] = {}
        # Failed commands: (target, not retried before) and number of failures in a row, by device.
        self.retry: dict[str, tuple[str, datetime]] = {}
        self.failures: dict[str, int] = {}
        # Local date and time of the last check of the reset times.
        self.last_local: datetime | None = None
        # Humidity samples of each room (shower detection) and the end of its shower boost.
        self.humidity_log: dict[str, deque[tuple[datetime, float]]] = {}
        self.shower_until: dict[str, datetime] = {}
        # Learnt warm-up rate of each room (°C/h); its measure under way; since when it heats without warming.
        self.heat_rates: dict[str, float] = {}
        self.rate_mark: dict[str, tuple[datetime, float]] = {}
        self.heat_start: dict[str, tuple[datetime, float]] = {}
        # Rooms whose heating doesn't warm them: {room id: setpoint}.
        self.faults: dict[str, float] = {}

    def update_settings(self, settings: Settings) -> None:
        self.settings = settings
        devices = {d for r in settings.rooms for d in r.devices}
        self.targets = {k: v for k, v in self.targets.items() if k in devices}
        self.overrides = {k: v for k, v in self.overrides.items() if k in devices}
        self.keep_on_sent = {k: v for k, v in self.keep_on_sent.items() if k in devices}
        self.before_boost = {k: v for k, v in self.before_boost.items() if k in devices}
        self.retry = {k: v for k, v in self.retry.items() if k in devices}
        self.failures = {k: v for k, v in self.failures.items() if k in devices}
        rooms = {r.id for r in settings.rooms}
        for per_room in (
            self.humidity_log,
            self.shower_until,
            self.heat_rates,
            self.rate_mark,
            self.heat_start,
            self.faults,
        ):
            for key in [k for k in per_room if k not in rooms]:
                del per_room[key]

    def as_dict(self) -> dict[str, Any]:
        return {
            "targets": self.targets,
            "overrides": {k: v.isoformat() for k, v in self.overrides.items()},
            "before_boost": self.before_boost,
            "heat_rates": self.heat_rates,
        }

    def restore(self, data: dict[str, Any]) -> None:
        self.targets = {str(k): str(v) for k, v in (data.get("targets") or {}).items()}
        for k, v in (data.get("overrides") or {}).items():
            try:
                self.overrides[str(k)] = datetime.fromisoformat(v)
            except (TypeError, ValueError):
                continue
        saved = data.get("before_boost") or {}
        self.before_boost = {str(k): dict(v) for k, v in saved.items() if isinstance(v, dict)}
        for k, v in (data.get("heat_rates") or {}).items():
            if isinstance(v, (int, float)):
                self.heat_rates[str(k)] = min(HEAT_RATE_MAX, max(HEAT_RATE_MIN, float(v)))
        self.update_settings(self.settings)

    def command_failed(self, cmd: Command, now: datetime) -> None:
        """A command could not be sent: forget the target so that it is tried again, after a delay.

        The delay doubles at each failure in a row, so that a lasting error (unsupported preset…) is
        not sent and logged again at every evaluation.
        """
        if cmd.target == "keep_on" or cmd.target is None:
            return
        device = cmd.device or cmd.entity_id
        if self.targets.get(device) == cmd.target:
            # First failed command of the device in this evaluation (it may have sent several).
            self.targets.pop(device, None)
            failures = self.failures[device] = self.failures.get(device, 0) + 1
            delay = min(COMMAND_RETRY * 2 ** (failures - 1), COMMAND_RETRY_MAX)
            self.retry[device] = (cmd.target, now + timedelta(minutes=delay))
        if cmd.restores is not None:
            self.before_boost.setdefault(device, cmd.restores)

    def command_skipped(self, cmd: Command) -> None:
        """A command not sent (device unavailable or paused): the target is forgotten, applied again later.

        No retry delay: once the device is back, the next evaluation sends it.
        """
        if cmd.target == "keep_on" or cmd.target is None:
            return
        device = cmd.device or cmd.entity_id
        if self.targets.get(device) == cmd.target:
            self.targets.pop(device, None)
        if cmd.restores is not None:
            self.before_boost.setdefault(device, cmd.restores)

    def command_succeeded(self, device: str) -> None:
        """Every command of the device was sent: failures in a row start over."""
        self.failures.pop(device, None)
        self.retry.pop(device, None)

    def reset_due(self, local: datetime, families: Mapping[str, bool] | None = None) -> list[str]:
        """Devices whose reset time has come since the last check: pause and target forgotten.

        The target is then applied again at once (the purifier back to its closed preset or mode…), even
        after a change by hand. `local`: the local date and time. The device families left alone
        (`families`) are skipped: nothing would be applied to them.
        """
        last, self.last_local = self.last_local, local
        if last is None or local <= last:
            return []
        reset = []
        for room in self.settings.rooms:
            for device in room.controlled(families):
                if device.reset_at is None:
                    continue
                at = local.replace(
                    hour=device.reset_at.hour,
                    minute=device.reset_at.minute,
                    second=device.reset_at.second,
                    microsecond=0,
                )
                if at > local:
                    at -= timedelta(days=1)
                if last < at <= local:
                    self.overrides.pop(device.entity_id, None)
                    self.targets.pop(device.entity_id, None)
                    self.retry.pop(device.entity_id, None)
                    reset.append(device.entity_id)
        return reset

    def rest(self, now: datetime, room: Room, family: str, states: dict[str, DeviceState]) -> list[Command]:
        """A family about to be left alone: its devices driven by Smart Comfort back to their rest state.

        The air conditioner cooling turned off, the fan on or boosted turned off (its off_preset first), the
        purifier boosted, purifying or quiet back to normal (closed preset or mode, or its state before) — what
        the end of the alert would do. Only the devices with a target of Smart Comfort's other than rest; those
        changed by hand (paused) and those already at rest are left as they are.
        """
        calm = RoomContext(temperature=None, any_open=False, closed_since=None, open_since=None, has_openings=False)
        cmds: list[Command] = []
        on = dict.fromkeys(("climate", "fans", "purifiers", "dehumidifiers", "heating"), False) | {family: True}
        for dev in room.controlled(on):
            current = self.targets.get(dev.entity_id)
            retry = self.retry.get(dev.entity_id)
            driven = current or (retry[0] if retry else None)
            if isinstance(dev, DehumidifierDevice):
                if driven not in DRYING:
                    continue
                decision = self._dehumidifier_decision(dev, TARGET_OFF)
            elif isinstance(dev, HeatingDevice):
                # Back to comfort, its plain setpoint: never left at eco, frost or off by a family turned off.
                mode, setpoint = heat_mode(driven)
                if mode in (None, "off") or (mode == MODE_COMFORT and setpoint == dev.comfort):
                    continue  # Off (warm outdoors, the AC cooling) stays off: never turned on by a family turned off.
                decision = self._heater_decision(dev, MODE_COMFORT, dev.comfort)
            elif isinstance(dev, ClimateDevice):
                if driven not in COOLING:
                    continue
                decision = self._climate(dev, replace(calm, temperature=dev.off_below), now)
            elif isinstance(dev, FanDevice):
                if driven not in (TARGET_ON, TARGET_ON_NIGHT, TARGET_BOOST, TARGET_SHOWER):
                    continue
                # Off: below off_below with a temperature control, else as the end of its boost (on only
                # with a temperature control, so a fan without one was boosted, read so by _fan).
                temperature = dev.off_below if dev.on_above is not None and dev.off_below is not None else None
                decision = self._fan(dev, replace(calm, temperature=temperature), False)
            else:
                if driven is None or driven == TARGET_NORMAL:
                    continue
                decision = self._purifier(dev, calm, False)
            cmds += self._device(now, dev.entity_id, states, decision)
        return cmds

    def forget(self, entity_ids: Iterable[str]) -> None:
        """Devices left alone from now on: their targets are dropped, applied again from scratch once controlled."""
        for entity_id in entity_ids:
            self.targets.pop(entity_id, None)
            self.retry.pop(entity_id, None)

    def manual_change(self, entity_id: str, now: datetime) -> None:
        """A device was changed by someone else than Smart Comfort."""
        if self.settings.manual_override > 0:
            self.overrides[entity_id] = now + timedelta(minutes=self.settings.manual_override)

    def overridden(self, entity_id: str, now: datetime) -> bool:
        until = self.overrides.get(entity_id)
        if until is None:
            return False
        if until > now:
            return True
        # Override over: forget the target so that it is applied again.
        del self.overrides[entity_id]
        self.targets.pop(entity_id, None)
        return False

    def handled(self, room: Room, states: dict[str, DeviceState]) -> bool:
        """An air conditioner cools or a fan blows in the room, on Smart Comfort's command."""
        for entity_id in room.devices:
            target, state = self.targets.get(entity_id), states.get(entity_id)
            if state is None or not state.available:
                continue
            if target in COOLING and state.hvac_mode == "cool":
                return True
            if target in BLOWING and state.on and any(f.entity_id == entity_id for f in room.fans):
                return True
        return False

    def handled_keys(self, room: Room, states: dict[str, DeviceState]) -> set[str]:
        """Problems of the room a device of its works on, on Smart Comfort's command: "room|kind" keys.

        Damp (high humidity, condensation risk): a dehumidifier drying. Too cold: a heater heating.
        """
        keys: set[str] = set()
        for dev in room.dehumidifiers:
            state = states.get(dev.entity_id)
            if state is not None and state.available and state.on and self.targets.get(dev.entity_id) in DRYING:
                keys |= {f"{room.id}|{kind}" for kind in (KIND_HUMIDITY, KIND_CONDENSATION, KIND_AIR_TO_DRY)}
        for dev in room.heating:
            state = states.get(dev.entity_id)
            if (
                state is not None
                and state.available
                and state.hvac_mode not in (None, "off")
                and heating(self.targets.get(dev.entity_id))
            ):
                keys.add(f"{room.id}|{KIND_TOO_COLD}")
        return keys

    def heater_setpoints(self, room: Room, states: dict[str, DeviceState]) -> list[float]:
        """Setpoints of the heaters of the room heating on Smart Comfort's command: the one each device reports
        (a pilot wire preset aims at its own temperature), else the target's — none for a preset that reports none."""
        out = []
        for dev in room.heating:
            target = self.targets.get(dev.entity_id)
            state = states.get(dev.entity_id)
            if not heating(target) or state is None or not state.available or state.hvac_mode in (None, "off"):
                continue
            mode, setpoint = heat_mode(target)
            if state.setpoint is not None:
                out.append(state.setpoint)
            elif setpoint is not None and not dev.preset(MODE_FROST if mode == MODE_FROST_OPEN else str(mode)):
                out.append(setpoint)
        return out

    def heats(self, room: Room) -> bool:
        """A heater of the room has a heating target of Smart Comfort's."""
        return any(heating(self.targets.get(h.entity_id)) for h in room.heating)

    def showering(self, room: Room, now: datetime, humidity: float | None) -> bool:
        """The room's humidity rose like after a shower (shower_rise within SHOWER_WINDOW): boosted for shower_boost."""
        rise = self.settings.shower_rise
        if rise is None or not (room.dehumidifiers or any(f.shower for f in room.fans)):
            return False
        log = self.humidity_log.setdefault(room.id, deque())
        if humidity is not None and (not log or log[-1][0] != now):
            log.append((now, humidity))
        while log and now - log[0][0] > timedelta(minutes=SHOWER_WINDOW):
            log.popleft()
        if humidity is not None and log and humidity - min(v for _t, v in log) >= rise:
            self.shower_until[room.id] = now + timedelta(minutes=self.settings.shower_boost)
        until = self.shower_until.get(room.id)
        if until is not None and now >= until:
            del self.shower_until[room.id]
            return False
        return until is not None

    def lead(self, room: Room, gap: float, cap: int) -> timedelta:
        """How long the room takes to warm up by `gap` °C, from its learnt rate, at most `cap` minutes."""
        rate = self.heat_rates.get(room.id, HEAT_RATE_DEFAULT)
        return timedelta(minutes=min(cap, max(0.0, gap / rate * 60)))

    def track_heating(self, room: Room, ctx: RoomContext, states: dict[str, DeviceState], now: datetime) -> None:
        """Learn the room's warm-up rate while it heats towards its setpoint, and tell a heating that doesn't warm it.

        Measured only while a heater heats on Smart Comfort's command, the openings closed and the room more than
        WARM_MARGIN below the setpoint. No rise of WARM_MARGIN within fault_after minutes: a fault (`faults`).
        """
        temp = ctx.temperature
        setpoints = self.heater_setpoints(room, states)
        aired = ctx.has_openings and ctx.any_open is not False
        if not setpoints or temp is None or aired or temp >= max(setpoints) - WARM_MARGIN:
            self.rate_mark.pop(room.id, None)
            self.heat_start.pop(room.id, None)
            if temp is not None or not setpoints:
                self.faults.pop(room.id, None)
            return
        mark = self.rate_mark.setdefault(room.id, (now, temp))
        if now - mark[0] >= timedelta(minutes=RATE_SPAN):
            rise = temp - mark[1]
            if rise > 0:
                measured = rise / ((now - mark[0]).total_seconds() / 3600)
                learnt = self.heat_rates.get(room.id)
                rate = measured if learnt is None else learnt + RATE_WEIGHT * (measured - learnt)
                self.heat_rates[room.id] = round(min(HEAT_RATE_MAX, max(HEAT_RATE_MIN, rate)), 2)
            self.rate_mark[room.id] = (now, temp)
        if temp >= max(setpoints) - FAULT_GAP:
            self.heat_start.pop(room.id, None)  # Close to its setpoint: regulating, not failing.
            self.faults.pop(room.id, None)
            return
        start = self.heat_start.setdefault(room.id, (now, temp))
        if temp >= start[1] + WARM_MARGIN:
            self.heat_start[room.id] = start = (now, temp)  # Warming: the wait starts again.
        fault_after = min(h.fault_after for h in room.heating)
        if now - start[0] >= timedelta(minutes=fault_after):
            self.faults[room.id] = max(setpoints)
        else:
            self.faults.pop(room.id, None)

    def purifying(self, room: Room, states: dict[str, DeviceState]) -> bool:
        """A purifier of the room is boosted on Smart Comfort's command (polluted air or window open)."""
        for purifier in room.purifiers:
            state = states.get(purifier.entity_id)
            if state is not None and state.available and state.on and self.targets.get(purifier.entity_id) in BOOSTING:
                return True
        return False

    # Decisions.

    def evaluate(
        self,
        now: datetime,
        local: Any,
        room: Room,
        ctx: RoomContext,
        states: dict[str, DeviceState],
        families: Mapping[str, bool] | None = None,
    ) -> list[Command]:
        """Commands for the devices of a room. `local` is the local time of day.

        `families`: the device families controlled (climate, fans, purifiers); the others are left alone.
        """
        if not self.settings.control_enabled:
            return []
        on = families or {}
        boost_hours = in_window(local, self.settings.control_start, self.settings.control_end)
        night = self.settings.night(local)
        cmds: list[Command] = []
        shower = self.showering(room, now, ctx.humidity)
        ctx.heating = on.get("heating", True) and self.heats(room)
        if room.climate and on.get("climate", True):
            cmds += self._device(now, room.climate.entity_id, states, self._climate(room.climate, ctx, now, night))
        ctx.cooling = (
            bool(room.climate) and on.get("climate", True) and self.targets.get(room.climate.entity_id) in COOLING
        )
        for fan in room.fans if on.get("fans", True) else ():
            # No window boost at night for a device that has night settings: it would be loud.
            boost = boost_hours and not (night and fan.quiet)
            cmds += self._device(
                now, fan.entity_id, states, self._fan(fan, ctx, boost, night, shower and not (night and fan.quiet))
            )
        for purifier in room.purifiers if on.get("purifiers", True) else ():
            state = states.get(purifier.entity_id)
            boost = boost_hours and not (night and purifier.quiet)
            cmds += self._keep_on(now, purifier, state)
            cmds += self._device(now, purifier.entity_id, states, self._purifier(purifier, ctx, boost, night))
        for dehumidifier in room.dehumidifiers if on.get("dehumidifiers", True) else ():
            cmds += self._device(
                now, dehumidifier.entity_id, states, self._dehumidifier(dehumidifier, ctx, now, night, shower)
            )
        if on.get("heating", True):
            for heater in room.heating:
                cmds += self._device(now, heater.entity_id, states, self._heater(heater, room, ctx, now))
            self.track_heating(room, ctx, states, now)
        return cmds

    def _device(self, now: datetime, entity_id: str, states: dict[str, DeviceState], decision: Any) -> list[Command]:
        state = states.get(entity_id)
        if decision is None or state is None or not state.available or self.overridden(entity_id, now):
            return []
        target, commands_for, satisfied = decision
        if target is None or self.targets.get(entity_id) == target:
            return []
        retry = self.retry.get(entity_id)
        if retry is not None and retry[0] != target:
            del self.retry[entity_id]  # Another target goes now, and holding the failed one is over.
            retry = None
        if satisfied(state):
            self.targets[entity_id] = target
            if retry is not None:
                # The failed command was applied after all (slow cloud device timing out…): done.
                self.command_succeeded(entity_id)
            return []
        if retry is not None and now < retry[1]:
            return []  # Failed a moment ago: tried again once the delay is over.
        self.targets[entity_id] = target
        cmds = commands_for(state)
        for c in cmds:
            c.target, c.device = target, entity_id
        return cmds

    # Air conditioner: cool / off.

    def _climate(self, dev: ClimateDevice, ctx: RoomContext, now: datetime, night: bool = False) -> Any:
        temp, current = ctx.temperature, self.targets.get(dev.entity_id)
        target = current
        open_for = now - ctx.open_since if ctx.open_since else None
        closed_for = now - ctx.closed_since if ctx.closed_since else None
        if ctx.has_openings and ctx.any_open is None:
            return None
        if ctx.any_open and open_for is not None and open_for >= timedelta(minutes=dev.off_on_open):
            target = TARGET_OFF_OPEN
        elif temp is None:
            return None
        elif temp >= dev.cool_above and (
            not ctx.has_openings or (closed_for is not None and closed_for >= timedelta(minutes=dev.closed_for))
        ):
            target = TARGET_COOL
        elif temp <= dev.off_below:
            target = TARGET_OFF
        elif ctx.any_open:
            return None  # Opening just opened: wait for off_on_open.
        if target in COOLING and (ctx.heating or self._cool_outdoors(dev, ctx, current in COOLING)):
            # Cool enough outdoors (autumn, winter…), or the room's heaters heat: no cooling. Smart Comfort's own
            # cooling stops, a device cooled by hand is left alone.
            if current not in COOLING:
                return None
            target = TARGET_OFF
        if target in COOLING:
            # Cooling, with the night fan mode in the night hours.
            target = TARGET_COOL_NIGHT if night and dev.night_fan_mode else TARGET_COOL
        fan_mode = dev.night_fan_mode if target == TARGET_COOL_NIGHT else dev.fan_mode

        def commands(state: DeviceState) -> list[Command]:
            if target in (TARGET_OFF, TARGET_OFF_OPEN):
                return [Command(dev.entity_id, "climate", "turn_off")]
            if state.hvac_mode == "cool":
                # Already cooling (day <-> night): only the fan mode changes.
                return [Command(dev.entity_id, "climate", "set_fan_mode", {"fan_mode": fan_mode})] if fan_mode else []
            cmds = [
                # Two actions: some integrations (generic_thermostat…) ignore hvac_mode in set_temperature.
                Command(dev.entity_id, "climate", "set_hvac_mode", {"hvac_mode": "cool"}),
                Command(dev.entity_id, "climate", "set_temperature", {"temperature": dev.setpoint}),
            ]
            if fan_mode:
                cmds.append(Command(dev.entity_id, "climate", "set_fan_mode", {"fan_mode": fan_mode}))
            return cmds

        def satisfied(state: DeviceState) -> bool:
            if target == TARGET_OFF_OPEN:
                return state.hvac_mode == "off"  # Any mode, heating included, while an opening stays open.
            if state.hvac_mode not in (None, "off", "cool"):
                return True  # Heating, drying…: left alone by the temperature control.
            if target not in COOLING:
                return state.hvac_mode != "cool"
            return state.hvac_mode == "cool" and (not fan_mode or state.fan_mode is None or state.fan_mode == fan_mode)

        return target, commands, satisfied

    @staticmethod
    def _cool_outdoors(dev: ClimateDevice, ctx: RoomContext, cooling: bool) -> bool:
        """Cooler than min_outdoor outdoors: no cooling (1 °C lower to stop, not to toggle around it)."""
        if dev.min_outdoor is None or ctx.outdoor is None:
            return False
        return ctx.outdoor < dev.min_outdoor - (OUTDOOR_HYSTERESIS if cooling else 0)

    # Fan: boost (opening open, in the hours) / on (warm) / off.

    def _fan(
        self, dev: FanDevice, ctx: RoomContext, boost_hours: bool, night: bool = False, shower: bool = False
    ) -> Any:
        current = self.targets.get(dev.entity_id)
        retry = self.retry.get(dev.entity_id)
        # Boosted by Smart Comfort, even when a boost command failed (target forgotten, held for a retry):
        # the fan was turned on all the same (slow cloud device timing out…) and must go off on closing.
        boosts = (TARGET_BOOST, TARGET_SHOWER)
        boosted = current in boosts or (retry is not None and retry[0] in boosts)
        temp = ctx.temperature
        boost = bool(ctx.any_open) and boost_hours and (dev.open_percentage is not None or dev.open_preset)
        if ctx.has_openings and ctx.any_open is None:
            return None
        temperature_control = dev.on_above is not None and dev.off_below is not None
        if boost:
            target = TARGET_BOOST
        elif shower and dev.shower:
            target = TARGET_SHOWER
        elif not temperature_control:
            target = TARGET_OFF if boosted else None
        elif temp is None:
            return None
        elif temp >= dev.on_above:
            target = TARGET_ON
        elif temp <= dev.off_below or boosted:
            target = TARGET_OFF
        else:
            target = current
        if target in (TARGET_ON, TARGET_ON_NIGHT):
            target = TARGET_ON_NIGHT if night and dev.quiet else TARGET_ON
        night_pct = dev.night_percentage if dev.night_percentage is not None else dev.percentage
        night_preset = dev.night_preset or dev.preset

        def wanted() -> tuple[int | None, str | None]:
            if target == TARGET_BOOST:
                return dev.open_percentage, dev.open_preset
            if target == TARGET_SHOWER:
                return dev.shower_percentage, dev.shower_preset
            if target == TARGET_ON_NIGHT:
                return night_pct, night_preset
            return dev.percentage, dev.preset

        def commands(state: DeviceState) -> list[Command]:
            if target in (TARGET_BOOST, TARGET_SHOWER, TARGET_ON, TARGET_ON_NIGHT):
                return _fan_commands(dev.entity_id, *wanted())
            cmds = []
            if dev.off_preset:
                cmds.append(Command(dev.entity_id, "fan", "set_preset_mode", {"preset_mode": dev.off_preset}))
            return [*cmds, Command(dev.entity_id, "fan", "turn_off")]

        def satisfied(state: DeviceState) -> bool:
            if target == TARGET_OFF:
                return state.on is False
            pct, preset = wanted()
            return (
                bool(state.on) and (pct is None or state.percentage == pct) and (not preset or state.preset == preset)
            )

        return target, commands, satisfied

    # Air purifier: boost (opening open, in the hours) / purify (polluted air) / night / normal.

    def _purifier(self, dev: PurifierDevice, ctx: RoomContext, boost_hours: bool, night: bool = False) -> Any:
        if ctx.has_openings and ctx.any_open is None and not ctx.polluted:
            return None
        if ctx.any_open and boost_hours:
            target = TARGET_BOOST
        elif ctx.polluted and not (night and dev.quiet):
            # Polluted air: at any hour, but quiet at night for a purifier that has night settings.
            target = TARGET_PURIFY
        elif night and dev.quiet:
            target = TARGET_NIGHT
        else:
            target = TARGET_NORMAL
        # Without a "windows closed" preset or mode, normal is the state the purifier had before the boost.
        restore = None if dev.closed_preset or (dev.mode_select and dev.closed_mode) else self.before_boost
        saved = (restore or {}).get(dev.entity_id) if target == TARGET_NORMAL else None
        if saved is not None and dev.keep_on:
            saved = {**saved, "on": True}  # Kept on: never turned off by the restore.

        def restored(state: DeviceState) -> bool:
            if saved is None:
                return True
            if saved.get("on") is False:
                return state.on is False
            if dev.mode_select and saved.get("option") and state.option != saved["option"]:
                return False
            if saved.get("preset"):
                return bool(state.on) and state.preset == saved["preset"]
            return bool(state.on) and (saved.get("percentage") is None or state.percentage == saved["percentage"])

        def commands(state: DeviceState) -> list[Command]:
            cmds = []
            if target == TARGET_NIGHT:
                # Like the boost, the state before the night is restored when it ends (no closed preset/mode).
                if restore is not None and dev.entity_id not in restore:
                    restore[dev.entity_id] = self._snapshot(dev, state)
                if not state.on:
                    return cmds  # Off stays off at night (keep_on turns it back on, quietly next time).
                if dev.mode_select and dev.night_mode:
                    cmds.append(Command(dev.mode_select, "select", "select_option", {"option": dev.night_mode}))
                if dev.night_preset:
                    cmds.append(Command(dev.entity_id, "fan", "set_preset_mode", {"preset_mode": dev.night_preset}))
                if dev.night_percentage is not None:
                    cmds.append(Command(dev.entity_id, "fan", "set_percentage", {"percentage": dev.night_percentage}))
            elif target in BOOSTING:
                if restore is not None and dev.entity_id not in restore:
                    restore[dev.entity_id] = self._snapshot(dev, state)
                if not state.on:
                    cmds.append(Command(dev.entity_id, "fan", "turn_on"))
                if dev.mode_select and dev.open_mode:
                    cmds.append(Command(dev.mode_select, "select", "select_option", {"option": dev.open_mode}))
                if dev.open_preset:
                    cmds.append(Command(dev.entity_id, "fan", "set_preset_mode", {"preset_mode": dev.open_preset}))
                if dev.open_percentage is not None:
                    cmds.append(Command(dev.entity_id, "fan", "set_percentage", {"percentage": dev.open_percentage}))
            else:
                if dev.mode_select and dev.closed_mode:
                    cmds.append(Command(dev.mode_select, "select", "select_option", {"option": dev.closed_mode}))
                if dev.closed_preset:
                    cmds.append(Command(dev.entity_id, "fan", "set_preset_mode", {"preset_mode": dev.closed_preset}))
                if saved is not None:
                    # Forgotten now, put back by command_failed() if the restore can't be sent.
                    self.before_boost.pop(dev.entity_id, None)
                    if dev.mode_select and saved.get("option") and saved.get("on") is not False:
                        cmds.append(
                            Command(
                                dev.mode_select,
                                "select",
                                "select_option",
                                {"option": saved["option"]},
                                restores=saved,
                            )
                        )
                    if saved.get("on") is False:
                        cmds.append(Command(dev.entity_id, "fan", "turn_off", restores=saved))
                    elif saved.get("preset"):
                        cmds.append(
                            Command(
                                dev.entity_id,
                                "fan",
                                "set_preset_mode",
                                {"preset_mode": saved["preset"]},
                                restores=saved,
                            )
                        )
                    elif saved.get("percentage") is not None:
                        cmds.append(
                            Command(
                                dev.entity_id,
                                "fan",
                                "set_percentage",
                                {"percentage": saved["percentage"]},
                                restores=saved,
                            )
                        )
            return cmds

        def satisfied(state: DeviceState) -> bool:
            if target == TARGET_NIGHT:
                return state.on is False or (
                    (not (dev.mode_select and dev.night_mode) or state.option == dev.night_mode)
                    and (not dev.night_preset or state.preset == dev.night_preset)
                    and (dev.night_percentage is None or state.percentage == dev.night_percentage)
                )
            if target in BOOSTING:
                return (
                    bool(state.on)
                    and (not (dev.mode_select and dev.open_mode) or state.option == dev.open_mode)
                    and (not dev.open_preset or state.preset == dev.open_preset)
                    and (dev.open_percentage is None or state.percentage == dev.open_percentage)
                )
            if saved is not None and restored(state):
                self.before_boost.pop(dev.entity_id, None)
            return (
                (not (dev.mode_select and dev.closed_mode) or state.option == dev.closed_mode)
                and (not dev.closed_preset or state.preset == dev.closed_preset)
                and restored(state)
            )

        return target, commands, satisfied

    # Dehumidifier: dry (humid or condensation risk) / boost (after a shower) / off (dry enough, opening open, night).

    def _dehumidifier(self, dev: DehumidifierDevice, ctx: RoomContext, now: datetime, night: bool, shower: bool) -> Any:
        current = self.targets.get(dev.entity_id)
        hum = ctx.humidity
        if ctx.has_openings and ctx.any_open is None:
            return None
        open_for = now - ctx.open_since if ctx.open_since else None
        if dev.tank and dev.tank in ctx.full_tanks:
            # Its tank full: it can't run (it stopped by itself), the alert says so. Its target is forgotten, so that
            # it is turned on again once the tank is emptied.
            self.targets.pop(dev.entity_id, None)
            return None
        if ctx.any_open:
            if open_for is None or open_for < timedelta(minutes=dev.off_on_open):
                return None  # Opening just opened: wait for off_on_open.
            target: str | None = TARGET_OFF_OPEN
        elif shower and not (night and dev.quiet):
            target = TARGET_SHOWER
        elif hum is None and not ctx.damp:
            return None
        elif ctx.damp or (hum is not None and hum >= dev.on_above):
            target = TARGET_DRY
        elif hum is not None and hum <= dev.off_below:
            target = TARGET_OFF
        elif current in (TARGET_SHOWER, TARGET_OFF_OPEN):
            # Shower boost or airing over, still between the thresholds: drying again after a boost, else off.
            target = TARGET_DRY if current == TARGET_SHOWER else TARGET_OFF
        else:
            target = current  # In the hysteresis band: the previous target holds.
        if target in (TARGET_DRY, TARGET_DRY_NIGHT, TARGET_OFF_NIGHT) and night and dev.quiet:
            target = TARGET_OFF_NIGHT if dev.night_off else TARGET_DRY_NIGHT
        elif target in (TARGET_DRY_NIGHT, TARGET_OFF_NIGHT):
            target = TARGET_DRY
        if (
            target in (TARGET_DRY, TARGET_DRY_NIGHT)
            and current not in DRYING
            and dev.prefer_airing
            and ctx.airing_since is not None
            and now - ctx.airing_since < timedelta(minutes=dev.airing_wait)
        ):
            return None  # Airing would dry the room: the windows get a chance first.
        if target is None:
            return None
        return self._dehumidifier_decision(dev, target)

    @staticmethod
    def _dehumidifier_decision(dev: DehumidifierDevice, target: str) -> Any:
        domain = dev.entity_id.split(".", 1)[0]
        mode = {
            TARGET_DRY: dev.mode,
            TARGET_DRY_NIGHT: dev.night_mode or dev.mode,
            TARGET_SHOWER: dev.boost_mode or dev.mode,
        }
        wanted_mode = mode.get(target) if domain == "humidifier" else None
        wanted_humidity = dev.target_humidity if domain == "humidifier" and target in DRYING else None

        def commands(state: DeviceState) -> list[Command]:
            if target not in DRYING:
                return [Command(dev.entity_id, domain, "turn_off")]
            cmds = [] if state.on else [Command(dev.entity_id, domain, "turn_on")]
            if wanted_mode and state.mode != wanted_mode:
                cmds.append(Command(dev.entity_id, domain, "set_mode", {"mode": wanted_mode}))
            if wanted_humidity is not None and state.target_humidity != wanted_humidity:
                cmds.append(Command(dev.entity_id, domain, "set_humidity", {"humidity": wanted_humidity}))
            return cmds

        def satisfied(state: DeviceState) -> bool:
            if target not in DRYING:
                return state.on is False
            return (
                bool(state.on)
                and (not wanted_mode or state.mode == wanted_mode)
                and (wanted_humidity is None or state.target_humidity == wanted_humidity)
            )

        return target, commands, satisfied

    # Heater: comfort / eco (schedule) / away / frost (annex, opening open) / off (warm outdoors, the AC cooling).

    def _heater(self, dev: HeatingDevice, room: Room, ctx: RoomContext, now: datetime) -> Any:
        current = self.targets.get(dev.entity_id)
        temp = ctx.temperature
        if ctx.has_openings and ctx.any_open is None:
            return None
        open_for = now - ctx.open_since if ctx.open_since else None
        if ctx.any_open:
            if open_for is None or open_for < timedelta(minutes=dev.off_on_open):
                return None  # Opening just opened: wait for off_on_open.
            return self._heater_decision(dev, MODE_FROST_OPEN, dev.frost)
        if self._warm_outdoors(dev, ctx, current) or ctx.cooling:
            return self._heater_decision(dev, "off", None)
        schedule = ctx.states.get(dev.schedule) if dev.schedule else None
        if dev.schedule is None:
            mode = MODE_FROST if room.is_annex else MODE_COMFORT
        else:
            mode = MODE_ECO if schedule == "off" else MODE_COMFORT
        if (
            mode == MODE_ECO
            and dev.preheat
            and temp is not None
            and (next_on := ctx.next_on.get(dev.schedule or "")) is not None
            and next_on - now <= self.lead(room, dev.comfort - temp, dev.preheat_max)
        ):
            mode = MODE_COMFORT  # Warming up for the next comfort slot.
        colour = tempo_colour(ctx.states.get(dev.tempo)) if dev.tempo else None
        if (
            mode == MODE_COMFORT
            and dev.backup
            and (ctx.stove_heating or colour == "red")
            and (temp is None or temp >= dev.comfort - dev.backup_margin)
        ):
            mode = MODE_ECO  # A backup heater: the stove heats.
        if mode == MODE_COMFORT and colour == "red" and dev.tempo_red > 0 and dev.comfort_preset and dev.eco_preset:
            mode = MODE_ECO  # Presets can't be lowered by a few degrees: a red day is spent at eco.
        setpoint = self._setpoint(dev, mode, ctx)
        if ctx.away and mode != MODE_FROST and dev.away < setpoint:
            # Nobody home: the away setpoint, only when it is lower (never warmer than eco, nor than frost protection).
            mode, setpoint = MODE_AWAY, dev.away
        return self._heater_decision(dev, mode, setpoint)

    @staticmethod
    def _warm_outdoors(dev: HeatingDevice, ctx: RoomContext, current: str | None) -> bool:
        """At least max_outdoor outdoors: the heating season is over (back on 1 °C below)."""
        if dev.max_outdoor is None or ctx.outdoor is None:
            return current == HEAT_OFF and ctx.outdoor is None and dev.max_outdoor is not None
        off = current == HEAT_OFF
        return ctx.outdoor >= dev.max_outdoor - (SEASON_HYSTERESIS if off else 0)

    @staticmethod
    def _setpoint(dev: HeatingDevice, mode: str, ctx: RoomContext) -> float:
        """The mode's setpoint, lowered on red (and white) Tempo days, raised in the off-peak hours before a red day."""
        setpoint = dev.setpoint(mode)
        if mode not in (MODE_COMFORT, MODE_ECO):
            return setpoint
        today = tempo_colour(ctx.states.get(dev.tempo)) if dev.tempo else None
        tomorrow = tempo_colour(ctx.states.get(dev.tempo_tomorrow)) if dev.tempo_tomorrow else None
        if today == "red":
            setpoint -= dev.tempo_red
        elif today == "white":
            setpoint -= dev.tempo_white
        elif tomorrow == "red" and Controller._offpeak(dev, ctx):
            setpoint += dev.tempo_preheat
        return round(max(dev.frost, setpoint) * 2) / 2

    @staticmethod
    def _offpeak(dev: HeatingDevice, ctx: RoomContext) -> bool:
        if dev.offpeak:
            state = ctx.states.get(dev.offpeak)
            return state is not None and slugify(state) in OFFPEAK_STATES
        if ctx.local is None or dev.offpeak_start is None or dev.offpeak_end is None:
            return False
        return in_window(ctx.local.time(), dev.offpeak_start, dev.offpeak_end)

    @staticmethod
    def _heater_decision(dev: HeatingDevice, mode: str, setpoint: float | None) -> Any:
        target = heat_target(mode, setpoint)
        preset = dev.preset(MODE_FROST if mode == MODE_FROST_OPEN else mode) if setpoint is not None else None

        def commands(state: DeviceState) -> list[Command]:
            if setpoint is None:
                return [Command(dev.entity_id, "climate", "turn_off")]
            cmds = []
            if state.hvac_mode in (None, "off"):
                cmds.append(Command(dev.entity_id, "climate", "set_hvac_mode", {"hvac_mode": heat_mode_of(state)}))
            if preset:
                cmds.append(Command(dev.entity_id, "climate", "set_preset_mode", {"preset_mode": preset}))
            else:
                cmds.append(Command(dev.entity_id, "climate", "set_temperature", {"temperature": setpoint}))
            return cmds

        def satisfied(state: DeviceState) -> bool:
            if setpoint is None:
                return state.hvac_mode == "off"
            if state.hvac_mode in (None, "off"):
                return False
            if preset:
                return state.preset == preset
            return state.setpoint is not None and abs(state.setpoint - setpoint) < SETPOINT_TOLERANCE

        return target, commands, satisfied

    @staticmethod
    def _snapshot(dev: PurifierDevice, state: DeviceState) -> dict[str, Any]:
        """State of a purifier to put back after its boost or the night."""
        snapshot = {"on": state.on, "preset": state.preset, "percentage": state.percentage}
        if dev.mode_select and state.option:
            snapshot["option"] = state.option
        return snapshot

    def _keep_on(self, now: datetime, dev: PurifierDevice, state: DeviceState | None) -> list[Command]:
        """Turn a purifier back on when it has been off for a few seconds (power cut, glitch…)."""
        if not dev.keep_on or state is None or not state.available or state.on is not False:
            return []
        if self.overridden(dev.entity_id, now):
            return []  # Turned off by hand: left alone for the manual override.
        if state.off_since is None or now - state.off_since < timedelta(seconds=KEEP_ON_DELAY):
            return []
        last = self.keep_on_sent.get(dev.entity_id)
        if last is not None and now - last < timedelta(minutes=1):
            return []
        self.keep_on_sent[dev.entity_id] = now
        return [Command(dev.entity_id, "fan", "turn_on", target="keep_on")]
