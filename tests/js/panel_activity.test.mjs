// Activity tab of the panel, drawn by the panel itself (no card inside), in Node with stubs.
// Run by tests/test_frontend.py (pytest), or directly: node --test tests/js/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../../custom_components/smart_comfort/frontend/smart-comfort-panel.js", import.meta.url), "utf8");
const context = {
  HTMLElement: class {
    attachShadow() {
      this.shadowRoot = { innerHTML: "", querySelector: () => null, querySelectorAll: () => [] };
      return this.shadowRoot;
    }
  },
  customElements: { get: () => undefined, define() {}, whenDefined: () => new Promise(() => {}) },
  window: {},
  console,
  setTimeout: () => 0,
  clearTimeout() {},
};
vm.createContext(context);
const { SmartComfortPanel, activityGroup } = vm.runInContext(`${source}\n;({ SmartComfortPanel, activityGroup })`, context);

const panel = (language = "en") => {
  const p = Object.create(SmartComfortPanel.prototype);
  p._hass = { language, states: { "fan.purifier": { attributes: { friendly_name: "Purifier" } } } };
  return p;
};

test("activity filters: each kind in its group, a failed command with what it was sent to", () => {
  assert.equal(activityGroup({ kind: "device" }), "devices");
  assert.equal(activityGroup({ kind: "presence_off" }), "lights");
  assert.equal(activityGroup({ kind: "cleared" }), "notifications");
  assert.equal(activityGroup({ kind: "manual" }), "manual");
  assert.equal(activityGroup({ kind: "failed", action: "light.turn_on" }), "lights");
  assert.equal(activityGroup({ kind: "failed", entity_id: "fan.purifier" }), "devices");
  assert.equal(activityGroup({ kind: "failed", target: "display_off", entity_id: "light.led" }), "devices");
});

test("activity lines: what happened in a few words, the device's setting, the brightness, the notification", () => {
  const p = panel();
  const device = p._activityText({ kind: "device", target: "boost", entity_id: "fan.purifier", data: { preset_mode: "Favorite" } });
  assert.equal(device.text, "Window boost · Favorite");
  assert.equal(device.icon, "mdi:fan");
  assert.equal(p._activityText({ kind: "device", target: "cool", entity_id: "climate.ac" }).icon, "mdi:air-conditioner");
  assert.equal(p._activityText({ kind: "lighting", data: { brightness_pct: 40 } }).text, "Brightness of the moment · 40 %");
  assert.equal(p._activityText({ kind: "display", target: "display_on" }).icon, "mdi:led-on");
  assert.deepEqual(
    JSON.parse(JSON.stringify(p._activityText({ kind: "notified", title: "Too hot", message: "28 °C" }))),
    { icon: "mdi:bell-ring-outline", text: "Too hot", detail: "28 °C" }
  );
  assert.equal(p._activityText({ kind: "failed", target: "presence" }).text, "Could not be sent · On: someone came in");
  assert.equal(p._activityText({ kind: "failed", target: "light.desk" }).text, "Could not be sent · Brightness of the moment · light.desk");
  assert.equal(panel("fr")._activityText({ kind: "reset" }).text, "Retour à la normale (heure fixe)");
});

test("activity: the panel no longer embeds the activity card", () => {
  const panelCode = source.slice(source.indexOf("class SmartComfortPanel"));
  assert.ok(!panelCode.includes('createElement("smart-comfort-activity-card")'));
});
