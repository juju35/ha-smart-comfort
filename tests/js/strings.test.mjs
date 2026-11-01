// Strings of the panel and the activity card: the language picked from Home Assistant's, and the same keys in every language.
// Run by tests/test_frontend.py (pytest), or directly: node --test tests/js/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const FRONTEND = new URL("../../custom_components/smart_comfort/frontend/", import.meta.url);
const FILES = {
  panel: new URL("smart-comfort-panel.js", FRONTEND),
  card: new URL("smart-comfort-activity-card.js", FRONTEND),
};

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
let haLanguage;
globalThis.document = {
  createElement: () => ({}),
  querySelector: (selector) => (selector === "home-assistant" ? { hass: { language: haLanguage } } : null),
};

await import(FILES.panel);
await import(FILES.card);
const ELEMENTS = {
  panel: customElements.get("smart-comfort-panel"),
  card: customElements.get("smart-comfort-activity-card"),
};

/** The STRINGS table of a frontend file, read from its source (it is not exported). */
function strings(file) {
  const source = readFileSync(FILES[file], "utf8");
  const start = source.indexOf("const STRINGS = {");
  const end = source.indexOf("\n};\n", start);
  assert.ok(start >= 0 && end > start, "STRINGS not found");
  return new Function(`return ${source.slice(start + "const STRINGS = ".length, end + 3)}`)();
}

function textIn(file, language, key) {
  const element = new ELEMENTS[file]();
  element._hass = { language };
  return element._t(key);
}

const LANGUAGES = ["en", "fr", "de", "es", "sr", "sr-Latn", "it", "nl", "pt", "pl"];
// pt-BR falls back to European Portuguese, on purpose; an untranslated language to English.
const CASES = {
  "fr-FR": "fr",
  "de-CH": "de",
  "sr-Latn": "sr-Latn",
  sr: "sr",
  fr: "fr",
  "it-IT": "it",
  "nl-BE": "nl",
  pt: "pt",
  "pt-BR": "pt",
  "pl-PL": "pl",
  ja: "en",
};
const SAMPLE = { panel: "rooms", card: "today" };

/** Key paths of a value; an array counts as its length and its items. */
function shape(value, path = "") {
  if (Array.isArray(value)) return [`${path}[${value.length}]`, ...value.flatMap((v, i) => shape(v, `${path}[${i}]`))];
  if (value && typeof value === "object") return Object.keys(value).flatMap((k) => shape(value[k], `${path}.${k}`));
  return [path];
}

for (const file of Object.keys(FILES)) {
  test(`${file} language: full tag if translated, else its base, else English`, () => {
    const all = strings(file);
    const key = SAMPLE[file];
    for (const [language, expected] of Object.entries(CASES)) {
      assert.equal(textIn(file, language, key), all[expected][key], language);
    }
    assert.notEqual(all.sr[key], all["sr-Latn"][key]);
    assert.equal(textIn(file, undefined, key), all.en[key]);
  });

  test(`${file}: every language has exactly the keys of English, nothing empty`, () => {
    const all = strings(file);
    const english = shape(all.en).sort();
    for (const [language, table] of Object.entries(all)) {
      assert.deepEqual(shape(table).sort(), english, language);
      for (const [key, text] of Object.entries(table)) {
        if (typeof text === "string") assert.ok(text.trim(), `${language}.${key}`);
      }
    }
    assert.deepEqual(Object.keys(all).sort(), [...LANGUAGES].sort());
  });

  test(`${file}: every language has the placeholders of English`, () => {
    const all = strings(file);
    const placeholders = (text) => [...String(text).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const [language, table] of Object.entries(all)) {
      for (const [key, text] of Object.entries(all.en)) {
        assert.deepEqual(placeholders(table[key]), placeholders(text), `${language}.${key}`);
      }
    }
  });

  test(`${file}: each Serbian script stays in its alphabet (apart from names, code and units)`, () => {
    const all = strings(file);
    const allowed = /Home Assistant|Smart Comfort|Atmo France|smart_comfort:|configuration\.yaml|YAML|CO₂|\{\w+\}/g;
    for (const [key, text] of Object.entries(all.sr)) {
      assert.doesNotMatch(text.replace(allowed, ""), /[A-Za-z]/, `sr.${key}`);
    }
    for (const [key, text] of Object.entries(all["sr-Latn"])) {
      assert.doesNotMatch(text, /[Ѐ-ӿ]/, `sr-Latn.${key}`);
    }
  });
}

test("card editor labels: same language resolution", () => {
  const all = strings("card");
  const label = ELEMENTS.card.getConfigForm().computeLabel;
  for (const [language, expected] of Object.entries(CASES)) {
    haLanguage = language;
    assert.equal(label({ name: "room" }), all[expected].f_room, language);
  }
  haLanguage = undefined;
  assert.equal(label({ name: "room" }), all.en.f_room);
});
