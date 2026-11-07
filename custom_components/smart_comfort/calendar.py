"""Calendar of the comfort alerts: one event per episode, from when it became an alert to when it ended."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from homeassistant.components.calendar import CalendarEntity, CalendarEvent
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.translation import async_get_translations
from homeassistant.util import dt as dt_util

from . import SmartComfortConfigEntry
from .const import DOMAIN
from .entity import SmartComfortEntity
from .message import ICONS, problem_text


async def async_setup_entry(
    hass: HomeAssistant,
    entry: SmartComfortConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    async_add_entities([AlertsCalendar(entry.runtime_data, entry.entry_id)])


class AlertsCalendar(SmartComfortEntity, CalendarEntity):
    """The finished alerts (kept 90 days) and the ones going on, as calendar events."""

    def __init__(self, manager: Any, entry_id: str) -> None:
        super().__init__(manager, entry_id, "alerts_calendar")
        self._kinds: dict[str, str] = {}

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        # Kind names ("Too hot") from the selector translations, in Home Assistant's language.
        prefix = f"component.{DOMAIN}.selector.kind.options."
        try:
            raw = await async_get_translations(self.hass, self.hass.config.language, "selector", [DOMAIN])
        except Exception:  # noqa: BLE001 - the kind keys stand in for the names
            raw = {}
        self._kinds = {k.removeprefix(prefix): v for k, v in raw.items() if k.startswith(prefix)}

    def _event(self, record: dict[str, Any]) -> CalendarEvent | None:
        start = dt_util.parse_datetime(record.get("start") or "")
        end = dt_util.parse_datetime(record.get("end") or "")
        if start is None or end is None:
            return None
        if end <= start:
            # A calendar event must end after it starts.
            end = start + timedelta(minutes=1)
        kind = str(record.get("kind"))
        rooms = {room.id: room.name for room in self.manager.settings.rooms}
        room = rooms.get(record.get("room"), str(record.get("room")))
        label = self._kinds.get(kind, kind)
        names = {}
        for o in (record.get("details") or {}).get("openings", []) or []:
            state = self.hass.states.get(o)
            names[o] = state.name if state else o
        worst = record.get("peak", record.get("value"))
        description = problem_text(self.manager.texts, kind, worst, record.get("details") or {}, names)
        return CalendarEvent(
            start=start,
            end=end,
            summary=f"{ICONS.get(kind, '')} {room}: {label}".strip(),
            description=description,
            location=room,
            uid=f"{record.get('room')}|{kind}|{record.get('start')}",
        )

    def _events(self, now: datetime) -> list[CalendarEvent]:
        records = list(self.manager.engine.history)
        # The alerts going on: from when they started, up to now.
        # Their end is a minute ahead, so that the calendar is on while they last (it is off at an event's end).
        ahead = now + timedelta(minutes=1)
        records += [ep.finished(ahead) for ep in self.manager.engine.active()]
        events = [e for r in records if (e := self._event(r)) is not None]
        return sorted(events, key=lambda e: e.start)

    @property
    def event(self) -> CalendarEvent | None:
        """The alert going on (the most recent one), else none."""
        now = dt_util.utcnow()
        ongoing = [e for e in self._events(now) if e.end >= now]
        return ongoing[-1] if ongoing else None

    async def async_get_events(
        self, hass: HomeAssistant, start_date: datetime, end_date: datetime
    ) -> list[CalendarEvent]:
        now = dt_util.utcnow()
        return [e for e in self._events(now) if e.end > start_date and e.start < end_date]
