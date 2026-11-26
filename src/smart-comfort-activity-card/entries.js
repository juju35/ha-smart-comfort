// ── Entries ──
export const ICONS = {
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
export const DEVICE_ICONS = { climate: "mdi:air-conditioner", fan: "mdi:fan", humidifier: "mdi:air-humidifier" };
// Targets of the heaters ("heat:<mode>:<setpoint>") and dehumidifiers: their own icon, whatever the entity domain.
export const HEAT_ICON = "mdi:radiator";
export const DRY_TARGETS = new Set(["dry", "dry_night", "off_night", "shower"]);
/** A device target as a text key and its setpoint: "heat:eco:17" -> ["heat_eco", "17"]; "cool" -> ["cool", null]. */
export const targetParts = (target) => {
  const [prefix, mode, setpoint] = String(target || "").split(":");
  return prefix === "heat" && mode ? [`heat_${mode}`, setpoint || null] : [String(target || ""), null];
};
// Filter groups of the Activity tab (a failed command goes with what it was sent to: see groupOf),
// and the kinds of the card option.
export const GROUPS = {
  devices: ["device", "display", "reset"],
  lights: ["lighting", "presence_on", "presence_off"],
  notifications: ["notified", "cleared"],
  manual: ["manual"],
};
export const KIND_OPTIONS = ["device", "lighting", "presence", "display", "notified", "manual", "reset", "failed"];

export function matches(entry, config) {
  if (config.room && entry.room !== config.room) return false;
  const kinds = config.kinds;
  if (!kinds?.length) return true;
  return kinds.some((k) => k === entry.kind || (k === "presence" && entry.kind.startsWith("presence")) || (k === "notified" && entry.kind === "cleared"));
}

/** Filter group of an entry. A failed command is sorted as it would have been (activity.py kind_of):
 * an indicator's is a device's, a light's is a light's, the others a device's. */
export function groupOf(entry) {
  if (entry.kind !== "failed") return Object.keys(GROUPS).find((group) => GROUPS[group].includes(entry.kind));
  if (entry.target === "display_off" || entry.target === "display_on") return "devices";
  const domain = (entry.action || entry.entity_id || "").split(".")[0];
  return domain === "light" ? "lights" : "devices";
}

/** What keeps the keyboard focus across a render: the same line, or the same filter. */
export const entryKey = (entry) => `${entry.at}|${entry.kind}|${entry.entity_id || ""}|${entry.target || ""}`;
