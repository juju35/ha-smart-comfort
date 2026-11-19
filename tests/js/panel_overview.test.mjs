// The overview's room filter, in Node: the panel file is evaluated with a tiny DOM, no browser needed.
// Run by tests/test_frontend.py (pytest), or directly: node --test tests/js/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../../custom_components/smart_comfort/frontend/smart-comfort-panel.js", import.meta.url), "utf8");

// Just enough of the DOM for the overview: elements with classes, children, text and listeners.
class El {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.dataset = {};
    this.attrs = {};
    this.listeners = {};
    this.className = "";
    this._text = "";
    this.classList = { add: (c) => (this.className = `${this.className} ${c}`.trim()) };
  }
  append(...nodes) {
    for (const n of nodes) this.children.push(typeof n === "string" ? new Text(n) : n);
  }
  setAttribute(k, v) {
    this.attrs[k] = String(v);
  }
  addEventListener(type, fn) {
    this.listeners[type] = fn;
  }
  set textContent(v) {
    this._text = String(v);
  }
  get textContent() {
    return this._text + this.children.map((c) => c.textContent).join("");
  }
  all(pred) {
    return [this, ...this.children.flatMap((c) => (c instanceof El ? c.all(pred) : []))].filter(pred);
  }
}
class Text {
  constructor(t) {
    this.textContent = t;
  }
}

const context = {
  HTMLElement: class {},
  customElements: { get: () => undefined, define() {}, whenDefined: () => new Promise(() => {}) },
  window: {},
  console,
  document: { createElement: (tag) => new El(tag), createTextNode: (t) => new Text(t) },
  setTimeout() {},
  clearTimeout() {},
};
vm.createContext(context);
const { SmartComfortPanel } = vm.runInContext(`${source}\n;({ SmartComfortPanel })`, context);

const alert = (room, room_name, kind, handled = false) => ({ room, room_name, kind, value: 27, since: "2026-10-24T11:38:00+00:00", handled });
const room = (room_id, name, alerts) => ({ room_id, name, alerts, devices: {}, lights: {} });
const STATUS = {
  alerts: [alert("living", "Living", "too_hot", true), alert("living", "Living", "polluted_air"), alert("office", "Office", "too_cold")],
  snoozes: {},
  outdoor_temperature: 22.4,
  night: false,
  rooms: [room("living", "Living", ["too_hot", "polluted_air"]), room("office", "Office", ["too_cold"]), ...["a", "b", "c", "d", "e", "f"].map((id) => room(id, `Room ${id}`, []))],
  outdoors: [],
};

const overview = (selected = "") => {
  const p = Object.create(SmartComfortPanel.prototype);
  p._hass = { language: "en", states: {}, entities: {} };
  p._config = { options: { rooms: [{ name: "Living" }] } };
  p._status = STATUS;
  p._room = selected;
  p._renderTab = () => {};
  const content = new El("div");
  p._renderOverview(content);
  return { p, content };
};

test("room filter: the rooms with alerts as chips, busiest first; the fine ones grouped behind + N OK", () => {
  const { content } = overview();
  const chips = content.all((e) => e.className.startsWith("fchip") && e.tagName === "BUTTON");
  const top = chips.filter((c) => !c.dataset.room || ["living", "office"].includes(c.dataset.room));
  assert.deepEqual(
    top.map((c) => c.dataset.room),
    ["", "living", "office"],
    "All, then the rooms with alerts, the busiest first"
  );
  const more = content.all((e) => e.tagName === "SUMMARY")[0];
  assert.equal(more.textContent, "+ 6 OK", "the six fine rooms behind one chip");
  const pop = content.all((e) => e.className === "pop")[0];
  assert.equal(pop.children.length, 6);
  const tiles = content.all((e) => e.className.startsWith("otile"));
  assert.match(tiles[0].textContent, /1 handled/, "the alerts tile counts the handled ones");
});

test("room filter: a room chosen keeps only its alerts and its room", () => {
  const { content } = overview("office");
  const rows = content.all((e) => e.className === "alert-title");
  assert.equal(rows.length, 1, "only the office's alert");
  assert.match(rows[0].textContent, /^Office · /);
  const rooms = content.all((e) => e.className.includes("has-alert") || e.className.includes("is-ok"));
  assert.equal(rooms.length, 1, "only the office's card");
  // A room that no longer exists: back to all rooms
  const gone = overview("cellar");
  assert.equal(gone.p._room, "");
});
