/**
 * Smart Comfort — configuration panel.
 *
 * A plain web component (no build step) that Home Assistant loads in the sidebar. It reads and saves
 * the integration options over the WebSocket API (smart_comfort/config, smart_comfort/config/save),
 * follows the status (smart_comfort/subscribe) and renders the forms with Home Assistant's ha-form,
 * whose labels come from the integration's own translations (options flow strings).
 */
import { STRINGS } from "./i18n/strings.js";

export const DOMAIN = "smart_comfort";

// Points a problem under way takes off the comfort score, by its severity: mirrors SCORE_PENALTY in sensor.py so the
// overview ring and the per-room comfort sensors agree.
export const SCORE_PENALTY = { info: 10, warning: 25, critical: 50 };

export const KIND_ICONS = {
  too_hot: "mdi:thermometer-high",
  close_windows: "mdi:window-closed-variant",
  ventilate: "mdi:window-open-variant",
  too_cold: "mdi:thermometer-low",
  window_open_cold: "mdi:snowflake-alert",
  co2_high: "mdi:molecule-co2",
  polluted_air: "mdi:blur",
  humidity_high: "mdi:water-percent-alert",
  noise_high: "mdi:volume-high",
  noisy_outside: "mdi:volume-off",
  bad_air_outside: "mdi:weather-hazy",
};

// Icon of a room by its name when its area has none (several languages, accents removed).
export const ROOM_ICONS = [
  [["salle de bain", "bath", "bad", "bano", "douche", "shower"], "mdi:shower"],
  [["toilet", "wc"], "mdi:toilet"],
  [["salle a manger", "dining", "essz", "comedor"], "mdi:table-chair"],
  [["chambre", "bedroom", "schlafzimmer", "kinderzimmer", "dormitorio", "habitacion", "nursery"], "mdi:bed"],
  [["salon", "sejour", "living", "wohnzimmer", "lounge"], "mdi:sofa"],
  [["cuisine", "kitchen", "kuche", "cocina"], "mdi:silverware-fork-knife"],
  [["bureau", "office", "buro", "arbeitszimmer", "despacho", "study"], "mdi:desk"],
  [["entree", "entrance", "entry", "eingang", "entrada"], "mdi:door"],
  [["couloir", "hallway", "corridor", "flur", "pasillo", "hall"], "mdi:door-open"],
  [["garage"], "mdi:garage"],
  [["buanderie", "cellier", "laundry", "waschkuche", "lavadero"], "mdi:washing-machine"],
  [["terrasse", "terrace", "balcon", "balcony", "balkon", "patio"], "mdi:table-furniture"],
  [["jardin", "garden", "garten", "yard"], "mdi:flower"],
];

export const UNITS = {
  co2_high: "ppm",
  polluted_air: "µg/m³",
  humidity_high: "%",
  noise_high: "dB",
  noisy_outside: "dB",
  bad_air_outside: "/6",
};
// Polluted air: by the reading over its threshold, fine particles or the air quality index.
export const unitOf = (alert) => (alert.kind === "polluted_air" && alert.metric === "aqi" ? "/6" : UNITS[alert.kind] || "°C");


// Strings of a Home Assistant language: the full tag when translated (sr-Latn), else its base (fr-FR: fr), else English.
export const stringsFor = (language) => STRINGS[language] || STRINGS[String(language || "").split("-")[0]] || STRINGS.en;

// Language whose STRINGS are shown: the full tag when translated (sr-Latn), else its base, else English.
export const resolvedLanguage = (language) => {
  const base = String(language || "").split("-")[0];
  return STRINGS[language] ? language : STRINGS[base] ? base : "en";
};

// Locale of numbers and dates: Home Assistant's full one when it is the language of the texts (pt-BR keeps its
// formats), else the language of the texts; pt alone is European Portuguese for Home Assistant, pt-PT for Intl.
export const intlLocale = (hass) => {
  const full = hass?.locale?.language || hass?.language || "";
  const resolved = resolvedLanguage(hass?.language);
  const locale = full.split("-")[0] === resolved.split("-")[0] ? full : resolved;
  return locale === "pt" ? "pt-PT" : locale;
};

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
