// The overview comfort score (_comfort) leaves annex rooms out, so a cold cellar never pulls the home down.
// Run by tests/test_frontend.py (pytest), or directly: node --test tests/js/
import assert from "node:assert/strict";
import { test } from "node:test";

globalThis.window = globalThis;
globalThis.HTMLElement = class {
  attachShadow() {
    this.shadowRoot = {};
    return this.shadowRoot;
  }
};
const registry = new Map();
globalThis.customElements = { get: (name) => registry.get(name), define: (name, cls) => registry.set(name, cls) };
globalThis.document = { createElement: () => ({}), querySelector: () => null };

await import("../../custom_components/smart_comfort/frontend/smart-comfort-panel.js");
const Panel = customElements.get("smart-comfort-panel");

const status = {
  rooms: [
    { room_id: "salon", is_annex: false, alerts: ["too_hot"] },
    { room_id: "chambre", is_annex: false, alerts: [] },
    { room_id: "cave", is_annex: true, alerts: ["too_cold"] },
  ],
  alerts: [
    { room: "salon", kind: "too_hot", severity: "warning" },
    { room: "cave", kind: "too_cold", severity: "warning" },
  ],
};

test("comfort score ignores annex rooms and their alerts", () => {
  const c = new Panel()._comfort(status);
  // Only the living-space alert (one warning, −25) counts; the annex is out.
  assert.equal(c.score, 75);
  assert.equal(c.points, 1);
  assert.deepEqual(c.byKind, { too_hot: 1 });
  // OK rooms counts living spaces only (chambre); the annex is not in the universe.
  assert.equal(c.okRooms, 1);
  assert.equal(c.tone, "warn");
});

test("a home with only an annex alert reads as all good", () => {
  const c = new Panel()._comfort({
    rooms: [{ room_id: "cave", is_annex: true, alerts: ["too_cold"] }],
    alerts: [{ room: "cave", kind: "too_cold", severity: "warning" }],
  });
  assert.equal(c.score, 100);
  assert.equal(c.points, 0);
  assert.equal(c.tone, "good");
});
