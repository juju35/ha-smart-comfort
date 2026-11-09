"""Sensors: active alerts, comfort of each room, last notification."""

from __future__ import annotations

from datetime import datetime
from typing import Any, ClassVar, Final

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorStateClass
from homeassistant.const import PERCENTAGE
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.util import dt as dt_util

from . import SmartComfortConfigEntry
from .config import Room
from .const import KINDS, SEVERITY_CRITICAL, SEVERITY_INFO, SEVERITY_WARNING
from .entity import SmartComfortEntity
from .status import episode_info, room_info

STATE_OK = "ok"


async def async_setup_entry(
    hass: HomeAssistant,
    entry: SmartComfortConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    m = entry.runtime_data
    entities: list[SensorEntity] = [
        ActiveAlertsSensor(m, entry.entry_id, "alerts"),
        LastNotificationSensor(m, entry.entry_id, "last_notification"),
    ]
    rooms = [RoomSensor(m, entry.entry_id, room) for room in m.settings.rooms]
    scores = [ComfortScoreSensor(m, entry.entry_id, room) for room in m.settings.rooms]
    # Sensors of removed rooms are removed from the registry instead of staying orphaned.
    current = {sensor.unique_id for sensor in [*rooms, *scores]}
    prefixes = (f"{entry.entry_id}_room_", f"{entry.entry_id}_comfort_")
    registry = er.async_get(hass)
    for reg in er.async_entries_for_config_entry(registry, entry.entry_id):
        if reg.domain == "sensor" and reg.unique_id.startswith(prefixes) and reg.unique_id not in current:
            registry.async_remove(reg.entity_id)
    async_add_entities([*entities, *rooms, *scores])


class ActiveAlertsSensor(SmartComfortEntity, SensorEntity):
    """Number of active problems (notified or not), listed in the attributes."""

    _attr_state_class = SensorStateClass.MEASUREMENT
    _unrecorded_attributes = frozenset(
        {"alerts", "snoozes", "outdoor_temperature", "outdoor_noise", "outdoor_air_quality"}
    )

    @property
    def native_value(self) -> int:
        return len(self.manager.engine.active())

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        now = dt_util.utcnow()
        engine = self.manager.engine
        return {
            "alerts": [episode_info(self.manager, ep, now) for ep in engine.active()],
            "snoozes": {k: v.isoformat() for k, v in engine.snoozes.items() if v > now},
            "outdoor_temperature": self.manager.outdoor(),
            "outdoor_noise": self.manager.outdoor_noise(),
            "outdoor_air_quality": self.manager.outdoor_air(),
        }


class RoomSensor(SmartComfortEntity, SensorEntity):
    """Worst active problem of a room, or ok."""

    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options: ClassVar[list[str]] = [STATE_OK, *KINDS]
    _unrecorded_attributes = frozenset(
        {
            "temperature",
            "co2",
            "humidity",
            "noise",
            "pm25",
            "pm10",
            "air_quality",
            "open",
            "ignored_openings",
            "alerts",
            "handled",
            "devices",
        }
    )

    def __init__(self, manager: Any, entry_id: str, room: Room) -> None:
        super().__init__(manager, entry_id, "room", f"room_{room.id}")
        self.room = room
        self._attr_translation_placeholders = {"room": room.name}

    def _episodes(self) -> list[Any]:
        return [e for e in self.manager.engine.active() if e.room == self.room.id]

    @property
    def native_value(self) -> str:
        episodes = self._episodes()
        return episodes[0].kind if episodes else STATE_OK

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        # The room's name as set in Smart Comfort, for the mini card (the entity name is translated around it).
        return {"room_name": self.room.name, **room_info(self.manager, self.room, dt_util.utcnow())}


# Points a problem under way takes off a room's comfort score, by its severity.
SCORE_PENALTY: Final = {SEVERITY_INFO: 10, SEVERITY_WARNING: 25, SEVERITY_CRITICAL: 50}


def comfort_score(manager: Any, room: Room) -> int:
    """100 when nothing is wrong in the room, less for each problem under way (by its severity), never below 0."""
    penalty = 0
    for episode in manager.engine.active():
        if episode.room != room.id:
            continue
        settings = room.alerts.get(episode.kind)
        penalty += SCORE_PENALTY.get(settings.severity if settings else SEVERITY_INFO, SCORE_PENALTY[SEVERITY_INFO])
    return max(0, 100 - penalty)


class ComfortScoreSensor(SmartComfortEntity, SensorEntity):
    """How comfortable a room is right now, 0 to 100: its long-term statistics give the day's or the week's."""

    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_native_unit_of_measurement = PERCENTAGE

    def __init__(self, manager: Any, entry_id: str, room: Room) -> None:
        super().__init__(manager, entry_id, "comfort", f"comfort_{room.id}")
        self.room = room
        self._attr_translation_placeholders = {"room": room.name}

    @property
    def native_value(self) -> int:
        return comfort_score(self.manager, self.room)


class LastNotificationSensor(SmartComfortEntity, SensorEntity):
    """Time of the last notification, with its text."""

    _attr_device_class = SensorDeviceClass.TIMESTAMP

    @property
    def native_value(self) -> datetime | None:
        last = self.manager.last_notification
        return dt_util.parse_datetime(last["at"]) if last else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        last = self.manager.last_notification or {}
        return {k: last.get(k) for k in ("title", "message", "severity", "alerts")}
