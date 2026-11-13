// Strings of the panel, the activity card and the mini card: the language picked from Home Assistant's, and the same keys in every language.
// Run by tests/test_frontend.py (pytest), or directly: node --test tests/js/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const FRONTEND = new URL("../../custom_components/smart_comfort/frontend/", import.meta.url);
const FILES = {
  panel: new URL("smart-comfort-panel.js", FRONTEND),
  card: new URL("smart-comfort-activity-card.js", FRONTEND),
  mini: new URL("smart-comfort-mini-card.js", FRONTEND),
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
await import(FILES.mini);
const ELEMENTS = {
  panel: customElements.get("smart-comfort-panel"),
  card: customElements.get("smart-comfort-activity-card"),
  mini: customElements.get("smart-comfort-mini-card"),
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

const LANGUAGES = ["en", "fr", "de", "es", "sr", "sr-Latn", "it", "nl", "pt", "pl", "ro", "da", "sv", "bg", "ru", "uk", "hu", "sk", "cs", "sl", "lv", "el"];
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
  "ro-RO": "ro",
  "da-DK": "da",
  "sv-SE": "sv",
  bg: "bg",
  ru: "ru",
  uk: "uk",
  "hu-HU": "hu",
  sk: "sk",
  "cs-CZ": "cs",
  sl: "sl",
  lv: "lv",
  "el-GR": "el",
  ja: "en",
};
const SAMPLE = { panel: "rooms", card: "today", mini: "all_good" };
// Plural forms that only some languages have (Intl.PluralRules categories), besides one and other.
const PLURAL_ONLY = /_(zero|two|few|many)$/;

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
      assert.deepEqual(shape(table).filter((k) => !PLURAL_ONLY.test(k)).sort(), english, language);
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
    const allowed = /Home Assistant|Smart Comfort|Atmo France|smart_comfort:|configuration\.yaml|YAML|CO₂|PM2\.5|PM10|µg\/m³|\{\w+\}/g;
    for (const [key, text] of Object.entries(all.sr)) {
      assert.doesNotMatch(text.replace(allowed, ""), /[A-Za-z]/, `sr.${key}`);
    }
    for (const [key, text] of Object.entries(all["sr-Latn"])) {
      assert.doesNotMatch(text, /[Ѐ-ӿ]/, `sr-Latn.${key}`);
    }
  });
}

test("mini card: the plural form of each language (one, few, many, other)", () => {
  const count = (language, n) => {
    const card = new ELEMENTS.mini();
    card._hass = { language };
    return card._count(n);
  };
  assert.equal(count("en", 1), "1 alert");
  assert.equal(count("en", 3), "3 alerts");
  assert.equal(count("fr", 1), "1 alerte");
  assert.equal(count("fr", 2), "2 alertes");
  assert.equal(count("pl", 1), "1 alert");
  assert.equal(count("pl", 3), "3 alerty");
  assert.equal(count("pl", 5), "5 alertów");
  assert.equal(count("sr", 21), "21 упозорење");
  assert.equal(count("sr", 3), "3 упозорења");
  assert.equal(count("sr-Latn", 5), "5 upozorenja");
  assert.equal(count("ru", 21), "21 оповещение");
  assert.equal(count("ru", 3), "3 оповещения");
  assert.equal(count("ru", 11), "11 оповещений");
  assert.equal(count("uk", 5), "5 попереджень");
  assert.equal(count("cs", 3), "3 upozornění");
  assert.equal(count("sk", 3), "3 upozornenia");
  assert.equal(count("sk", 5), "5 upozornení");
  assert.equal(count("sl", 2), "2 opozorili");
  assert.equal(count("sl", 5), "5 opozoril");
  assert.equal(count("ro", 3), "3 alerte");
  assert.equal(count("ro", 20), "20 de alerte");
  assert.equal(count("lv", 10), "10 brīdinājumu");
  assert.equal(count("lv", 21), "21 brīdinājums");
  assert.equal(count("el", 2), "2 προειδοποιήσεις");
  // Each extra form is one the language really has.
  const all = strings("mini");
  for (const [language, table] of Object.entries(all)) {
    const categories = new Intl.PluralRules(language).resolvedOptions().pluralCategories;
    for (const key of Object.keys(table).filter((k) => PLURAL_ONLY.test(k))) {
      assert.ok(categories.includes(key.split("_").pop()), `${language}.${key}`);
    }
  }
});

test("mini card editor labels: same language resolution", () => {
  const all = strings("mini");
  const label = ELEMENTS.mini.getConfigForm().computeLabel;
  for (const [language, expected] of Object.entries(CASES)) {
    haLanguage = language;
    assert.equal(label({ name: "rooms" }), all[expected].f_rooms, language);
    assert.equal(label({ name: "zoom" }), all[expected].f_zoom, language);
  }
  haLanguage = undefined;
});

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

test("number and date formats: pt is European Portuguese (pt-PT), pt-BR stays Brazilian", () => {
  const format = (hass) => {
    const panel = new ELEMENTS.panel();
    panel._hass = hass;
    return panel._format(12345.5);
  };
  const ptPT = (12345.5).toLocaleString("pt-PT", { maximumFractionDigits: 1, minimumFractionDigits: 0 });
  const ptBR = (12345.5).toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 0 });
  assert.notEqual(ptPT, ptBR);
  assert.equal(format({ language: "pt" }), ptPT);
  assert.equal(format({ language: "pt", locale: { language: "pt" } }), ptPT);
  assert.equal(format({ language: "pt-BR" }), ptBR);
  assert.equal(format({ language: "pt", locale: { language: "pt-BR" } }), ptBR);
  // A locale of another language than the texts' is not used: the texts' language is.
  assert.equal(format({ language: "fr", locale: { language: "de" } }), (12345.5).toLocaleString("fr"));
  assert.equal(format({ language: "sr-Latn" }), (12345.5).toLocaleString("sr-Latn"));
  const card = new ELEMENTS.card();
  card._hass = { language: "pt" };
  const day = "2026-01-15T10:00:00";
  const options = { weekday: "long", day: "numeric", month: "long" };
  assert.equal(card._day(day), new Date(day).toLocaleDateString("pt-PT", options));
  card._hass = { language: "pt-BR" };
  assert.equal(card._day(day), new Date(day).toLocaleDateString("pt-BR", options));
});
