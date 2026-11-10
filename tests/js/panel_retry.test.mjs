// Panel start and failed loads, in Node: the panel file is evaluated with stubs, no browser needed.
// Run by tests/test_frontend.py (pytest), or directly: node --test tests/js/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../../custom_components/smart_comfort/frontend/smart-comfort-panel.js", import.meta.url), "utf8");
const timers = [];
const context = {
  HTMLElement: class {
    attachShadow() {
      this.shadowRoot = { innerHTML: "", querySelector: () => null, querySelectorAll: () => [] };
      return this.shadowRoot;
    }
  },
  // ha-form never defined: Home Assistant has not loaded it yet
  customElements: { get: () => undefined, define() {}, whenDefined: () => new Promise(() => {}) },
  window: {},
  console: { ...console, error() {} },
  // Timers recorded, not run: the tests call them themselves
  setTimeout: (fn, ms) => timers.push({ fn, ms }),
  clearTimeout() {},
};
vm.createContext(context);
const { SmartComfortPanel } = vm.runInContext(`${source}\n;({ SmartComfortPanel })`, context);

const panel = (callWS) => {
  const p = Object.create(SmartComfortPanel.prototype);
  p._renders = 0;
  p._render = () => p._renders++;
  p._subscribe = () => {};
  p._hass = { language: "en", callWS };
  p.isConnected = true;
  return p;
};

test("the panel draws at once and loads its settings without waiting for ha-form", async () => {
  const p = panel(async (msg) => (msg.type === "smart_comfort/config" ? { options: {} } : { resources: {} }));
  const started = p._init();
  assert.equal(p._renders, 1, "drawn before any answer");
  await started;
  assert.deepEqual(p._config, { options: {} });
  assert.equal(p._failed, false);
});

test("the settings are requested without waiting for the translations, which redraw the panel when they arrive", async () => {
  const sent = [];
  let translated;
  const pending = new Promise((r) => (translated = r));
  const p = panel(async (msg) => {
    sent.push(msg.type === "frontend/get_translations" ? msg.category : msg.type);
    return msg.type === "smart_comfort/config" ? { options: {} } : pending;
  });
  p._labels = {};
  p._selector = {};
  const started = p._init();
  assert.deepEqual(sent, ["options", "selector", "smart_comfort/config"], "config sent before any translation answer");
  await new Promise((r) => setImmediate(r));
  assert.deepEqual(p._config, { options: {} }, "settings loaded while the translations are pending");
  assert.equal(p._label("general", "notify"), "notify", "field name until the translations are in");
  assert.equal(p._kindName("too_hot"), "too_hot");
  const renders = p._renders;
  translated({ resources: { "component.smart_comfort.options.step.general.data.notify": "Notifiers" } });
  await started;
  assert.equal(p._label("general", "notify"), "Notifiers");
  assert.ok(p._renders > renders, "drawn again with the labels");
});

test("labels tolerate missing translations", () => {
  const p = Object.create(SmartComfortPanel.prototype);
  assert.equal(p._label("general", "notify", "s"), "notify");
  assert.equal(p._helper("general", "notify"), undefined);
  assert.equal(p._sectionTitle("general", "s"), "s");
  assert.equal(p._kindName("too_hot"), "too_hot");
  assert.equal(JSON.stringify(p._options("severity", ["info"])), JSON.stringify([{ value: "info", label: "info" }]));
});

test("a failed load is tried again after 2 s, 5 s, 15 s then every 30 s; not set up is not", async () => {
  timers.length = 0;
  let error = { code: "unknown_command", message: "Unknown command." };
  const p = panel(async () => {
    if (error) throw error;
    return { options: {} };
  });
  for (let i = 0; i < 5; i++) await p._load();
  assert.deepEqual(timers.map((t) => t.ms), [2000, 5000, 15000, 30000, 30000]);
  assert.equal(p._error, "Unknown command.");
  error = null;
  await timers.at(-1).fn();
  await new Promise((r) => setImmediate(r));
  assert.equal(p._failed, false);
  assert.equal(p._error, null);
  timers.length = 0;
  error = { code: "not_found", message: "Not found" };
  await p._load();
  assert.equal(timers.length, 0);
});

test("the connection back loads again, unless settings are being edited", async () => {
  const p = panel(async () => ({ options: { a: 1 } }));
  await p._load();
  const listeners = new Map();
  p._hass.connection = { addEventListener: (t, f) => listeners.set(t, f), removeEventListener: (t, f) => listeners.get(t) === f && listeners.delete(t) };
  p._watchConnection(true);
  let reloads = 0;
  p._reload = () => reloads++;
  listeners.get("ready")();
  assert.equal(reloads, 1);
  p._draft = { a: 2 };
  listeners.get("ready")();
  assert.equal(reloads, 1, "unsaved edits kept");
  p._watchConnection(false);
  assert.equal(listeners.size, 0);
});

test("Retry string in every language", () => {
  const strings = vm.runInContext("STRINGS", context);
  for (const [lang, t] of Object.entries(strings)) assert.ok(t.retry, lang);
  assert.equal(strings.fr.retry, "Réessayer");
});

test("hass, route and narrow set before the element was defined go through the setters once it is", () => {
  // In the release the element is defined once the page's language file is in: Home Assistant has already set
  // these on the element, as plain properties that hide the setters.
  const p = Object.create(SmartComfortPanel.prototype);
  let started = 0;
  p._init = () => started++;
  p._watchConnection = () => {};
  p._subscribe = () => {};
  p._forms = [];
  p._tab = "overview";
  p._config = null;
  const hass = { language: "fr" };
  for (const [name, value] of Object.entries({ narrow: true, route: { path: "/alerts" }, hass })) {
    Object.defineProperty(p, name, { value, writable: true, enumerable: true, configurable: true });
  }
  p.connectedCallback();
  assert.equal(started, 1, "the panel starts");
  assert.equal(p._hass, hass);
  assert.equal(p._narrow, true);
  assert.equal(p._tab, "alerts", "the tab of the address");
  for (const name of ["narrow", "route", "hass"]) assert.ok(!Object.hasOwn(p, name), name);
  const next = { language: "fr" };
  p.hass = next;
  assert.equal(p._hass, next, "later updates reach the setter");
  assert.equal(started, 1);
});
