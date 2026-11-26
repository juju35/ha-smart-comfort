// ── Configuration ──
export const clone = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));
/** YAML of the options (what goes under `smart_comfort:`), keys in their order. */
export const YAML_PLAIN = /^[A-Za-z_][\w.\-/ ]*$/;
export const YAML_WORDS = new Set(["true", "false", "yes", "no", "on", "off", "null", "y", "n", "~"]);
export function yamlScalar(v) {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean" || typeof v === "number") return String(v);
  const text = String(v);
  return YAML_PLAIN.test(text) && !YAML_WORDS.has(text.toLowerCase()) && !text.endsWith(" ") ? text : JSON.stringify(text);
}
/** The paths (key lists) where `a` and `b` differ; lists are compared whole. */
export function changedPaths(a, b, path = []) {
  const plain = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  if (plain(a) && plain(b)) {
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap((key) => changedPaths(a[key], b[key], [...path, key]));
  }
  return JSON.stringify(a) === JSON.stringify(b) ? [] : [path];
}

export function pathValue(value, path) {
  return path.reduce((v, key) => (v === null || v === undefined ? undefined : v[key]), value);
}

export function toYaml(value, indent = "") {
  const lines = [];
  const block = (v) => v !== null && typeof v === "object" && Object.keys(v).length > 0;
  if (Array.isArray(value)) {
    for (const item of value) {
      if (!block(item)) {
        lines.push(`${indent}- ${Array.isArray(item) ? "[]" : item !== null && typeof item === "object" ? "{}" : yamlScalar(item)}`);
        continue;
      }
      const inner = toYaml(item, `${indent}  `).split("\n");
      lines.push(`${indent}- ${inner[0].trimStart()}`, ...inner.slice(1));
    }
  } else {
    for (const [key, v] of Object.entries(value)) {
      if (block(v)) lines.push(`${indent}${yamlScalar(key)}:`, toYaml(v, `${indent}  `));
      else lines.push(`${indent}${yamlScalar(key)}: ${Array.isArray(v) ? "[]" : v !== null && typeof v === "object" ? "{}" : yamlScalar(v)}`);
    }
  }
  return lines.join("\n");
}
export const isEmpty = (v) => v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
export const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);
// Sensors of a room, in the order of its form.
export const SENSOR_KEYS = ["temperature", "co2", "humidity", "noise", "pm25", "pm10", "air_quality", "surface_temperature"];

/** Drop empty values, recursively; empty objects go too. */
export function prune(value) {
  if (Array.isArray(value)) return value.map(prune);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, v] of Object.entries(value)) {
      const p = prune(v);
      if (isEmpty(p) || (p && typeof p === "object" && !Array.isArray(p) && Object.keys(p).length === 0)) continue;
      out[key] = p;
    }
    return out;
  }
  return value;
}

/** Indexes of a set once the item at `index` was removed from its list. */
export function shifted(indexes, index) {
  return new Set([...indexes].filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)));
}

export const TIME = /^\d{1,2}:\d{2}(:\d{2})?$/;
/** Same value for the options: "09:00" and "09:00:00" are the same time. */
export function same(a, b) {
  if (typeof a === "string" && typeof b === "string" && TIME.test(a) && TIME.test(b)) {
    const norm = (t) => t.split(":").map((x) => x.padStart(2, "0")).concat(["00"]).slice(0, 3).join(":");
    return norm(a) === norm(b);
  }
  return JSON.stringify(a) === JSON.stringify(b);
}

/** The keys of value that differ from defaults (defaults are what a missing key means). */
export function diff(value, defaults) {
  const out = {};
  for (const [key, v] of Object.entries(value || {})) {
    const d = defaults ? defaults[key] : undefined;
    if (v && typeof v === "object" && !Array.isArray(v) && d && typeof d === "object") {
      const sub = diff(v, d);
      if (Object.keys(sub).length) out[key] = sub;
    } else if (!isEmpty(v) && !same(v, d)) {
      out[key] = v;
    }
  }
  return out;
}

/** Defaults with the values set on top, nested one level for the device sections. */
export function merged(defaults, values) {
  const out = { ...clone(defaults) };
  for (const [key, v] of Object.entries(values || {})) {
    if (v && typeof v === "object" && !Array.isArray(v) && out[key] && typeof out[key] === "object") {
      out[key] = { ...out[key], ...v };
    } else {
      out[key] = v;
    }
  }
  return out;
}
