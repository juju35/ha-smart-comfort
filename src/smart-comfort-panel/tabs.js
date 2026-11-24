// ── Tabs ──
export const TABS = ["overview", "activity", "rooms", "outdoors", "alerts", "schedule", "settings", "yaml_tab"];
// Activity tab: its filters (a failed command goes with what it was sent to), the icons of its lines, the lines kept.
export const ACTIVITY_GROUPS = {
  devices: new Set(["device", "display", "reset"]),
  lights: new Set(["lighting", "presence_on", "presence_off"]),
  notifications: new Set(["notified", "cleared"]),
  manual: new Set(["manual"]),
};
export const ACTIVITY_ICONS = {
  device: "mdi:fan",
  lighting: "mdi:lightbulb-auto-outline",
  presence_on: "mdi:motion-sensor",
  presence_off: "mdi:motion-sensor-off",
  display: "mdi:led-off",
  notified: "mdi:bell-ring-outline",
  cleared: "mdi:bell-check-outline",
  manual: "mdi:hand-back-right-outline",
  reset: "mdi:clock-check-outline",
  failed: "mdi:alert-circle-outline",
};
export const ACTIVITY_MAX = 300;

/** The filter of an activity line. A failed command counts as what it was sent to: a light's with the lights. */
export const activityGroup = (entry) => {
  if (entry.kind === "failed") {
    if (String(entry.target || "").startsWith("display_")) return "devices";
    return String(entry.action || entry.entity_id || "").startsWith("light.") ? "lights" : "devices";
  }
  return Object.entries(ACTIVITY_GROUPS).find(([, kinds]) => kinds.has(entry.kind))?.[0];
};
// Addresses of the tabs of earlier versions.
export const OLD_TABS = { notifications: "settings", control: "settings" };
