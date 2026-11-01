// Strings of the configuration panel: the language picked from Home Assistant's, and the same keys in every language.
// Run by tests/test_frontend.py (pytest), or directly: node --test tests/js/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const PANEL = new URL("../../custom_components/smart_comfort/frontend/smart-comfort-panel.js", import.meta.url);

globalThis.window = globalThis;
globalThis.HTMLElement = class {
  attachShadow() {
    this.shadowRoot = {};
    return this.shadowRoot;
  }
};
const registry = new Map();
globalThis.customElements = {
  get: (name) => registry.get(name),
  define: (name, cls) => registry.set(name, cls),
};
globalThis.document = { createElement: () => ({}), querySelector: () => null };

await import(PANEL);
const Panel = customElements.get("smart-comfort-panel");

/** The STRINGS table of the panel, read from its source (it is not exported). */
function strings() {
  const source = readFileSync(PANEL, "utf8");
  const start = source.indexOf("const STRINGS = {");
  const end = source.indexOf("\n};\n", start);
  assert.ok(start >= 0 && end > start, "STRINGS not found");
  return new Function(`return ${source.slice(start + "const STRINGS = ".length, end + 3)}`)();
}

function textIn(language, key) {
  const panel = new Panel();
  panel._hass = { language };
  return panel._t(key);
}

test("language: full tag if translated, else its base, else English", () => {
  const all = strings();
  const cases = { "fr-FR": "fr", "de-CH": "de", "sr-Latn": "sr-Latn", sr: "sr", "pt-BR": "en", fr: "fr" };
  for (const [language, expected] of Object.entries(cases)) {
    assert.equal(textIn(language, "rooms"), all[expected].rooms, language);
  }
  assert.notEqual(all.sr.rooms, all["sr-Latn"].rooms);
  assert.equal(textIn(undefined, "rooms"), all.en.rooms);
});

/** Key paths of a value; an array counts as its length and its items. */
function shape(value, path = "") {
  if (Array.isArray(value)) return [`${path}[${value.length}]`, ...value.flatMap((v, i) => shape(v, `${path}[${i}]`))];
  if (value && typeof value === "object") return Object.keys(value).flatMap((k) => shape(value[k], `${path}.${k}`));
  return [path];
}

test("every language has exactly the keys of English, nothing empty", () => {
  const all = strings();
  const english = shape(all.en).sort();
  for (const [language, table] of Object.entries(all)) {
    assert.deepEqual(shape(table).sort(), english, language);
    for (const [key, text] of Object.entries(table)) {
      if (typeof text === "string") assert.ok(text.trim(), `${language}.${key}`);
    }
  }
  assert.ok("sr" in all && "sr-Latn" in all);
});

test("each Serbian script stays in its alphabet (apart from names, code and units)", () => {
  const all = strings();
  const allowed = /Home Assistant|Smart Comfort|Atmo France|smart_comfort:|configuration\.yaml|YAML|CO₂|\{\w+\}/g;
  for (const [key, text] of Object.entries(all.sr)) {
    assert.doesNotMatch(text.replace(allowed, ""), /[A-Za-z]/, `sr.${key}`);
  }
  for (const [key, text] of Object.entries(all["sr-Latn"])) {
    assert.doesNotMatch(text, /[Ѐ-ӿ]/, `sr-Latn.${key}`);
  }
});
