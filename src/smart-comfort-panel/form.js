// ── Form ──
import { TIME } from "./configuration.js";

export const num = (unit, opts = {}) => ({
  number: { mode: "box", step: opts.step ?? 0.1, min: opts.min ?? -50, max: opts.max ?? 5000, unit_of_measurement: unit },
});
// A relative humidity threshold.
export const humidity = { number: { mode: "box", step: 1, min: 0, max: 100, unit_of_measurement: "%" } };
export const minutes = (min = 0) => ({ number: { mode: "box", step: 1, min, max: 1440, unit_of_measurement: "min" } });
export const percent = { number: { mode: "slider", step: 1, min: 0, max: 100, unit_of_measurement: "%" } };
export const text = { text: {} };
export const bool = { boolean: {} };
export const time = { time: {} };
export const entity = (domain, extra = {}) => ({ entity: { domain, ...extra } });
// The kinds of entities each picker lists (domain and device class), so that it offers only those that fit.
const sensor = (device_class) => ({ domain: "sensor", device_class });
const ON_OFF = [{ domain: "schedule" }, { domain: "input_boolean" }];
export const PICK = {
  temperature: [sensor("temperature")],
  outdoor_temperature: [sensor("temperature"), { domain: "weather" }],
  humidity: [sensor("humidity")],
  co2: [sensor("carbon_dioxide")],
  noise: [sensor("sound_pressure")],
  pm25: [sensor("pm25")],
  pm10: [sensor("pm10")],
  // An index: its device class, a level in words (good, poor…), or the sensors of an air quality service (Atmo France's
  // index has no device class).
  air_quality: [
    sensor("aqi"),
    sensor("enum"),
    ...["atmofrance", "waqi", "airvisual", "airly", "airnow", "google_air_quality"].map((integration) => ({ integration, domain: "sensor" })),
  ],
  openings: [{ domain: "binary_sensor", device_class: ["window", "door", "opening", "garage_door"] }],
  presence: [
    { domain: "zone" },
    { domain: "person" },
    { domain: "group" },
    { domain: "device_tracker" },
    { domain: "input_boolean" },
    { domain: "binary_sensor", device_class: ["occupancy", "presence"] },
  ],
  schedule: ON_OFF,
  tempo: [sensor("enum")],
  offpeak: [{ domain: "binary_sensor" }, sensor("enum"), ...ON_OFF],
  tank: [{ domain: "binary_sensor", device_class: "problem" }],
  dehumidifier: [{ domain: "humidifier", device_class: "dehumidifier" }, { domain: "switch" }],
};
export const pick = (kind, extra = {}) => ({ entity: { filter: PICK[kind], ...extra } });
// Every device: its indicator light or display, and a time to go back to its normal state.
export const EQUIPMENT = [
  { name: "display", selector: entity(["light", "switch", "number", "select"]) },
  { name: "reset_at", selector: time },
];
export const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const kelvin = { number: { mode: "box", step: 100, min: 1500, max: 10000, unit_of_measurement: "K" } };
export const level = { number: { mode: "box", step: 1, min: 1, max: 100, unit_of_measurement: "%" } };
export const MOMENTS = ["day", "evening", "night", "morning", "nap"];
export const grid = (schema) => ({ type: "grid", name: "", column_min_width: "110px", schema });
/** Brightness by time of day on one row, then the warmth (its values only when it is on): global, and per light. */
export const lightingLevels = (warm) => [
  grid(MOMENTS.map((m) => ({ name: m, selector: level }))),
  { name: "warmth", selector: bool },
  ...(warm ? [grid(MOMENTS.map((m) => ({ name: `${m}_kelvin`, selector: kelvin })))] : []),
];
export const LEVEL_KEYS = MOMENTS.flatMap((m) => [m, `${m}_kelvin`]);
/** The field names of a schema, through its grids and expandables. */
export const schemaKeys = (schema) => schema.flatMap((f) => (f.schema ? schemaKeys(f.schema) : [f.name]));
/** Instants of a day as minutes, from "HH:MM[:SS]". */
export const minutesOf = (t) => {
  if (typeof t !== "string" || !TIME.test(t)) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export let haFormLoading;
/** ha-form and the entity pickers are lazy-loaded by Home Assistant: load them through a card editor. */
export function loadHaForm() {
  if (customElements.get("ha-form")) return Promise.resolve();
  if (!haFormLoading) {
    haFormLoading = (async () => {
      if (window.loadCardHelpers) {
        const helpers = await window.loadCardHelpers();
        const card = await helpers.createCardElement({ type: "entities", entities: [] });
        if (card?.constructor?.getConfigElement) await card.constructor.getConfigElement();
      }
      await customElements.whenDefined("ha-form");
    })().catch((err) => {
      // Tried again next time rather than failing for good.
      haFormLoading = null;
      throw err;
    });
  }
  return haFormLoading;
}
