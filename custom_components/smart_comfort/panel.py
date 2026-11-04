"""Sidebar panel: a web component served from frontend/, registered when the frontend is loaded."""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import CoreState, Event, HomeAssistant

from .const import DOMAIN, PANEL_ICON, PANEL_URL, TITLE

STATIC_URL = f"/{DOMAIN}_static"
FRONTEND_DIR = Path(__file__).parent / "frontend"
MODULE = "smart-comfort-panel.js"
# The cards, loaded on every dashboard: the activity card and the mini card.
CARDS = ("smart-comfort-activity-card.js", "smart-comfort-mini-card.js")
ELEMENT = "smart-comfort-panel"
CARD_URLS = tuple(f"{STATIC_URL}/{card}" for card in CARDS)

_LOGGER = logging.getLogger(__name__)


def _version() -> str:
    manifest = json.loads((Path(__file__).parent / "manifest.json").read_text(encoding="utf-8"))
    return str(manifest.get("version", "0"))


async def async_register_panel(hass: HomeAssistant) -> None:
    """Serve the panel's module (once per run) and add the panel to the sidebar, for administrators."""
    if "frontend" not in hass.config.components:
        return
    from homeassistant.components import frontend

    data = hass.data.setdefault(DOMAIN, {})
    if not data.get("static_registered"):
        from homeassistant.components.http import StaticPathConfig

        await hass.http.async_register_static_paths([StaticPathConfig(STATIC_URL, str(FRONTEND_DIR), False)])
        data["static_registered"] = True
    version = await hass.async_add_executor_job(_version)
    await _async_register_cards(hass, data, [f"{url}?v={version}" for url in CARD_URLS])
    if PANEL_URL in hass.data.get(frontend.DATA_PANELS, {}):
        return
    frontend.async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title=TITLE,
        sidebar_icon=PANEL_ICON,
        frontend_url_path=PANEL_URL,
        require_admin=True,
        config={
            "_panel_custom": {
                "name": ELEMENT,
                "module_url": f"{STATIC_URL}/{MODULE}?v={version}",
                "embed_iframe": False,
                "trust_external": False,
            }
        },
    )


async def _async_register_cards(hass: HomeAssistant, data: dict[str, Any], urls: list[str]) -> None:
    """Load the cards on the dashboards: dashboard resources, else (resources in YAML) extra modules.

    A dashboard only waits for its resources before building its cards; an extra module may come too late, and the
    card then stays "Custom element not found". Once Home Assistant runs: the resources are loaded by then.
    """

    async def register(_: Event | None = None) -> None:
        for url in urls:
            await _async_register_card(hass, data, url)

    if hass.state is CoreState.running:
        await register()
    elif not data.get("card_pending"):
        data["card_pending"] = True

        async def started(event: Event) -> None:
            data.pop("card_pending", None)
            await register(event)

        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, started)


async def _async_register_card(hass: HomeAssistant, data: dict[str, Any], url: str) -> None:
    """One card: a dashboard resource, else an extra module (once per run)."""
    if await _async_register_resource(hass, url):
        return
    added = data.setdefault("card_extra_js", set())
    base = url.split("?")[0]
    if base in added:
        return
    from homeassistant.components import frontend

    if frontend.DATA_EXTRA_MODULE_URL in hass.data:
        frontend.add_extra_js_url(hass, url)
        added.add(base)


def _storage_resources(hass: HomeAssistant) -> Any | None:
    """The dashboard resources when they are edited in the UI (storage mode), else None.

    hass.data["lovelace"] is a dict before 2025.2, then a dataclass whose `mode` became `resource_mode` in 2026.2.
    """
    lovelace = hass.data.get("lovelace")
    if isinstance(lovelace, dict):
        mode, resources = lovelace.get("resource_mode", lovelace.get("mode")), lovelace.get("resources")
    else:
        mode = getattr(lovelace, "resource_mode", getattr(lovelace, "mode", None))
        resources = getattr(lovelace, "resources", None)
    return resources if mode == "storage" else None


async def _async_register_resource(hass: HomeAssistant, url: str) -> bool:
    """Add or update a card in the dashboard resources (one item, current version). False: not possible."""
    if (resources := _storage_resources(hass)) is None:
        return False
    base = url.split("?")[0]
    try:
        await resources.async_get_info()  # Loads the collection from storage.
        existing = [i for i in resources.async_items() if i.get("url", "").split("?")[0] == base]
        if not existing:
            await resources.async_create_item({"res_type": "module", "url": url})
            return True
        if existing[0]["url"] != url:
            await resources.async_update_item(existing[0]["id"], {"res_type": "module", "url": url})
        for duplicate in existing[1:]:
            await resources.async_delete_item(duplicate["id"])
    except Exception:  # noqa: BLE001 - never block the integration on the card
        _LOGGER.exception("Could not add %s to the dashboard resources", base)
        return False
    return True


async def async_remove_card(hass: HomeAssistant) -> None:
    """Drop the cards from the dashboard resources (the integration was removed)."""
    if (resources := _storage_resources(hass)) is None:
        return
    for item in list(resources.async_items()):
        if item.get("url", "").split("?")[0] in CARD_URLS:
            await resources.async_delete_item(item["id"])


def async_remove_panel(hass: HomeAssistant) -> None:
    if "frontend" not in hass.config.components:
        return
    from homeassistant.components import frontend

    if PANEL_URL in hass.data.get(frontend.DATA_PANELS, {}):
        frontend.async_remove_panel(hass, PANEL_URL)
