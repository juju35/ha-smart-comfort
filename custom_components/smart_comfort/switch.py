"""Switches: notifications, device control (and per device family) and adaptive lighting, restored after a restart."""

from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from . import SmartComfortConfigEntry
from .const import FAMILIES
from .entity import SmartComfortEntity
from .manager import SmartComfort


async def async_setup_entry(
    hass: HomeAssistant,
    entry: SmartComfortConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    m = entry.runtime_data
    async_add_entities(
        [
            NotificationsSwitch(m, entry.entry_id, "notifications"),
            ControlSwitch(m, entry.entry_id, "control"),
            *(FamilySwitch(m, entry.entry_id, f"control_{family}", family) for family in FAMILIES),
            LightingSwitch(m, entry.entry_id, "lighting"),
        ]
    )


class _RestoredSwitch(SmartComfortEntity, SwitchEntity, RestoreEntity):
    def _set(self, enabled: bool) -> None:
        raise NotImplementedError

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        if (last := await self.async_get_last_state()) is not None and last.state in ("on", "off"):
            self._set(last.state == "on")

    async def async_turn_on(self, **kwargs: Any) -> None:
        self._set(True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        self._set(False)


class NotificationsSwitch(_RestoredSwitch):
    """Send notifications (the alerts are still tracked when off)."""

    @property
    def is_on(self) -> bool:
        return self.manager.notifications_enabled

    def _set(self, enabled: bool) -> None:
        self.manager.set_notifications(enabled)


class ControlSwitch(_RestoredSwitch):
    """Control the air conditioners, fans and purifiers."""

    @property
    def is_on(self) -> bool:
        return self.manager.control_enabled

    def _set(self, enabled: bool) -> None:
        self.manager.set_control(enabled)


class FamilySwitch(_RestoredSwitch):
    """Control one device family (air conditioners, fans or purifiers), under the device control switch."""

    def __init__(self, manager: SmartComfort, entry_id: str, key: str, family: str) -> None:
        super().__init__(manager, entry_id, key)
        self._family = family

    @property
    def is_on(self) -> bool:
        return self.manager.families.get(self._family, True)

    def _set(self, enabled: bool) -> None:
        self.manager.set_family(self._family, enabled)


class LightingSwitch(_RestoredSwitch):
    """Adapt the brightness of the lights."""

    @property
    def is_on(self) -> bool:
        return self.manager.lighting_enabled

    def _set(self, enabled: bool) -> None:
        self.manager.set_lighting(enabled)
