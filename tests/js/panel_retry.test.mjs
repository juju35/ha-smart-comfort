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
