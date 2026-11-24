// ── Register ──
// The panel's methods, written apart by tab (above), are its own: copied onto its prototype as they are
// (non-enumerable, like the methods of its class), before the element is defined.
import { SmartComfortPanel } from "./panel.js";
import { SmartComfortPanelSections } from "./form-sections.js";
import { SmartComfortPanelActivity } from "./activity-tab.js";
import { SmartComfortPanelYaml } from "./yaml.js";
import { SmartComfortPanelOverview } from "./overview-tab.js";
import { SmartComfortPanelRooms } from "./rooms-tab.js";
import { SmartComfortPanelRoomDevices } from "./room-devices.js";
import { SmartComfortPanelOutdoors } from "./outdoors-tab.js";
import { SmartComfortPanelAlerts } from "./alerts-tab.js";
import { SmartComfortPanelSchedule } from "./schedule-tab.js";
import { SmartComfortPanelSettings } from "./settings-tab.js";

for (const part of [
  SmartComfortPanelSections,
  SmartComfortPanelActivity,
  SmartComfortPanelYaml,
  SmartComfortPanelOverview,
  SmartComfortPanelRooms,
  SmartComfortPanelRoomDevices,
  SmartComfortPanelOutdoors,
  SmartComfortPanelAlerts,
  SmartComfortPanelSchedule,
  SmartComfortPanelSettings,
]) {
  for (const key of Object.getOwnPropertyNames(part.prototype)) {
    if (key === "constructor") continue;
    Object.defineProperty(SmartComfortPanel.prototype, key, Object.getOwnPropertyDescriptor(part.prototype, key));
  }
}
if (!customElements.get("smart-comfort-panel")) customElements.define("smart-comfort-panel", SmartComfortPanel);
