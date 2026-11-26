"""Status of the alerts and rooms, shared by the sensors and the configuration panel."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any, Final

from homeassistant.util import dt as dt_util

from .config import Room
from .const import KIND_HUMIDITY, KIND_TOO_COLD, SEVERITY_INFO
from .control import DeviceState
from .engine import Episode, RoomReading, is_handled
from .lighting import phase

if TYPE_CHECKING:
    from .manager import SmartComfort


def episode_info(manager: SmartComfort, ep: Episode, now: datetime) -> dict[str, Any]:
    room = manager.settings.room(ep.room)
    settings = room.alerts.get(ep.kind) if room else None
    return {
        "room": ep.room,
        "room_name": room.name if room else ep.room,
        "kind": ep.kind,
        "severity": settings.severity if settings else SEVERITY_INFO,
        "value": ep.value,
        "since": ep.since.isoformat(),
        "notified_at": ep.notified_at.isoformat() if ep.notified_at else None,
        "snoozed": manager.engine.snoozed(ep, now),
        "acknowledged": ep.acknowledged,
        # Suppressed because a running device takes care of it (too hot: AC or fan; polluted air: a purifier).
        "handled": is_handled(ep, manager.handled),
        **{k: v for k, v in ep.details.items() if k != "openings"},
        "openings": ep.details.get("openings", []),
    }


# Comfortable relative humidity of a living space (%): a point off per % outside it, at most HUMIDITY_PENALTY_MAX.
HUMIDITY_RANGE: Final = (40.0, 60.0)
HUMIDITY_PENALTY_MAX: Final = 10
# Points off per °C a heated room is below its setpoint beyond SETPOINT_SLACK, at most SETPOINT_PENALTY_MAX.
SETPOINT_SLACK: Final = 0.5
SETPOINT_PENALTY: Final = 5
SETPOINT_PENALTY_MAX: Final = 15


def comfort_gap(
    manager: Any, room: Room, reading: RoomReading | None = None, states: dict[str, DeviceState] | None = None
) -> int:
    """Points off a room's comfort score short of an alert: below its heating setpoint, humidity out of the range.

    Not counted twice: no setpoint gap while the room has a too cold alert, no humidity one while it has a high
    humidity alert (those take their own points off). `reading` and `states`: the room's, the last evaluation's
    when not given.
    """
    if reading is None or states is None:
        reading, states = manager.current(room)
    alerting = {ep.kind for ep in manager.engine.episodes.values() if ep.active and ep.room == room.id}
    penalty = 0
    setpoints = manager.controller.heater_setpoints(room, states) if room.heating else []
    if setpoints and reading.temperature is not None and KIND_TOO_COLD not in alerting:
        gap = max(setpoints) - reading.temperature - SETPOINT_SLACK
        if gap > 0:
            penalty += min(SETPOINT_PENALTY_MAX, round(gap * SETPOINT_PENALTY))
    if not room.is_annex and reading.humidity is not None and KIND_HUMIDITY not in alerting:
        low, high = HUMIDITY_RANGE
        off = max(low - reading.humidity, reading.humidity - high, 0)
        penalty += min(HUMIDITY_PENALTY_MAX, round(off))
    return penalty


def room_info(manager: SmartComfort, room: Room, now: datetime) -> dict[str, Any]:
    reading, states = manager.current(room)
    controller = manager.controller
    return {
        "room_id": room.id,
        "is_annex": room.is_annex,
        "temperature": reading.temperature,
        "co2": reading.co2,
        "humidity": reading.humidity,
        "noise": reading.noise,
        "pm25": reading.pm25,
        "pm10": reading.pm10,
        "air_quality": reading.aqi,
        "open": reading.open,
        "ignored_openings": manager.ignored_openings(room, now),
        "alerts": [e.kind for e in manager.engine.active() if e.room == room.id],
        # Points off its comfort score short of an alert (below the heating setpoint, humidity out of range).
        "score_penalty": comfort_gap(manager, room, reading, states),
        "dew_point": reading.dew_point,
        "heat_rate": controller.heat_rates.get(room.id),
        "shower": room.id in controller.shower_until,
        "handled": room.id in manager.handled or any(k.startswith(f"{room.id}|") for k in manager.handled),
        "devices": {
            d: {
                "target": controller.targets.get(d),
                "override_until": controller.overrides[d].isoformat()
                if d in controller.overrides and controller.overrides[d] > now
                else None,
            }
            for d in room.devices
        },
        "lighting_phase": phase(manager.settings, dt_util.as_local(now), manager.sun_elevation(), room),
        "lights": {
            light.entity_id: {
                "target": target.label() if (target := manager.lights.targets.get(light.entity_id)) else None,
                "override_until": until.isoformat()
                if (until := manager.lights.overrides.get(light.entity_id)) and until > now
                else None,
            }
            for light in room.lights
        },
    }


def status(manager: SmartComfort, now: datetime) -> dict[str, Any]:
    """Everything the panel shows about the current state."""
    engine = manager.engine
    return {
        "alerts": [episode_info(manager, ep, now) for ep in engine.active()],
        "snoozes": {k: v.isoformat() for k, v in engine.snoozes.items() if v > now},
        "outdoor_temperature": manager.outdoor(),
        "outdoor_noise": manager.outdoor_noise(),
        "outdoor_air": manager.outdoor_air(),
        "night": manager.settings.night(dt_util.as_local(now).time()),
        "rooms": [{"name": r.name, **room_info(manager, r, now)} for r in manager.settings.rooms],
        "outdoors": [
            {
                "name": o.name,
                "temperature": manager.outdoor(o.temperature),
                "air_quality": manager.outdoor_air(o.air_quality),
                "noise": manager.outdoor_noise(o.noise),
                "sensors": [*o.temperature, *o.air_quality, *o.noise],
            }
            for o in manager.settings.outdoors
        ],
        "notifications_enabled": manager.notifications_enabled,
        "control_enabled": manager.control_enabled,
        # Each device family set up in a room (air conditioners, fans, purifiers, dehumidifiers, heating): controlled
        # or left alone.
        "control_families": {
            family: on
            for family, on in manager.families.items()
            if any(getattr(r, family) for r in manager.settings.rooms)
        },
        "lighting_enabled": manager.lighting_enabled,
        "lighting_phase": phase(manager.settings, dt_util.as_local(now), manager.sun_elevation()),
        "last_notification": manager.last_notification,
    }
