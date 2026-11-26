// ── Constants ──
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
  condensation_risk: "mdi:mushroom-outline",
  air_to_dry: "mdi:weather-windy",
  tank_full: "mdi:cup-water",
  heating_fault: "mdi:radiator-off",
  pellets_low: "mdi:sack-percent",
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
  air_to_dry: "g/m³",
  pellets_low: "%",
  noise_high: "dB",
  noisy_outside: "dB",
  bad_air_outside: "/6",
};
// Polluted air: by the reading over its threshold, fine particles or the air quality index.
export const unitOf = (alert) => (alert.kind === "polluted_air" && alert.metric === "aqi" ? "/6" : UNITS[alert.kind] || "°C");
