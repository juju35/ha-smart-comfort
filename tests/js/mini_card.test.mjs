// Mini card, in Node with a minimal DOM: what it reads from the entities, its zoom and its switches.
// Run by tests/test_frontend.py (pytest), or directly: node --test tests/js/
import assert from "node:assert/strict";
import { test } from "node:test";

class FakeNode {
  constructor(tag) {
    this.tagName = tag;
    this.localName = tag;
    this.children = [];
    this.className = "";
    this.textContent = "";
    this.attributes = {};
    this.dataset = {};
    this.listeners = {};
    this.style = { props: {}, setProperty: (k, v) => (this.style.props[k] = v) };
    const classes = () => this.className.split(/\s+/).filter(Boolean);
    this.classList = {
      add: (c) => (this.className = [...classes(), c].join(" ")),
      contains: (c) => classes().includes(c),
      toggle: (c, on) => (this.className = [...classes().filter((x) => x !== c), ...(on ? [c] : [])].join(" ")),
    };
  }
  append(...nodes) {
    for (const node of nodes) node.parent = this;
    this.children.push(...nodes);
  }
  replaceChildren(...nodes) {
    for (const child of this.children) child.parent = null;
    this.children = [];
    this.append(...nodes);
  }
  contains(node) {
    for (let n = node; n; n = n.parent) if (n === this) return true;
    return false;
  }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }
  addEventListener(type, listener) {
    (this.listeners[type] ||= []).push(listener);
  }
  fire(type, init = {}) {
    const event = { type, stopPropagation() {}, preventDefault() {}, ...init };
    for (const listener of this.listeners[type] || []) listener(event);
  }
  focus() {}
}

class FakeShadowRoot extends FakeNode {
  set innerHTML(_html) {
    this.children = [];
  }
  get activeElement() {
    return null;
  }
  querySelector() {
    return null;
  }
}

const documentListeners = {};
// A tap: the press and the release (iOS sends no click for a tap on something that is not clickable).
const tap = (ev) => {
  for (const type of ["pointerdown", "pointerup"]) for (const fn of documentListeners[type] || []) fn(ev);
};
globalThis.window = globalThis;
globalThis.HTMLElement = class {
  attachShadow() {
    this.shadowRoot = new FakeShadowRoot("#shadow-root");
    return this.shadowRoot;
  }
  dispatchEvent(event) {
    (this.events ||= []).push(event);
  }
};
const registry = new Map();
globalThis.customElements = {
  get: (name) => registry.get(name),
  define: (name, cls) => registry.set(name, cls),
  whenDefined: async (name) => registry.get(name),
};
/** A custom element when its tag is defined (the activity card), else a plain node. */
function createElement(tag) {
  const Element = registry.get(tag);
  if (!Element) return new FakeNode(tag);
  const el = new Element();
  const style = { props: {}, setProperty: (k, v) => (style.props[k] = v) };
  return Object.assign(el, { tagName: tag, localName: tag, style });
}
globalThis.document = {
  createElement,
  querySelector: () => null,
  addEventListener: (type, fn) => ((documentListeners[type] ||= []).push(fn)),
  removeEventListener: (type, fn) => (documentListeners[type] = (documentListeners[type] || []).filter((f) => f !== fn)),
};

await import("../../custom_components/smart_comfort/frontend/smart-comfort-activity-card.js");
await import("../../custom_components/smart_comfort/frontend/smart-comfort-mini-card.js");
const Mini = customElements.get("smart-comfort-mini-card");

const LABELS = { too_hot: "Too hot", co2_high: "High CO₂", ventilate: "Open the windows (cooler outside)" };

function fakeHass({ alerts = [], switches = { notifications: "on", control: "on", lighting: "off" }, loaded = true } = {}) {
  const calls = [];
  const states = {};
  const entities = {};
  const add = (entity_id, translation_key, state, attributes = {}) => {
    states[entity_id] = { entity_id, state, attributes, last_updated: "2026-10-24T11:45:00Z" };
    entities[entity_id] = { entity_id, platform: "smart_comfort", translation_key };
  };
  if (loaded) {
    add("sensor.smart_comfort_active_alerts", "alerts", String(alerts.length), { alerts, outdoor_temperature: 18.46 });
    add("sensor.smart_comfort_living_room", "room", alerts.some((a) => a.room_name === "Living room") ? "too_hot" : "ok", {
      room_name: "Living room",
      temperature: 27.8,
      co2: 1380,
    });
    add("sensor.smart_comfort_bathroom", "room", "ok", { room_name: "Bathroom", humidity: 61 });
    for (const [key, state] of Object.entries(switches)) add(`switch.smart_comfort_${key}`, key, state);
  }
  // Another integration's entity with the same translation key: never picked.
  entities["sensor.other_alerts"] = { entity_id: "sensor.other_alerts", platform: "other", translation_key: "alerts" };
  return {
    calls,
    hass: {
      language: "en",
      states,
      entities,
      localize: (key) => LABELS[key.split(".").pop()] || "",
      callService: (domain, service, data) => calls.push([domain, service, data]),
      connection: { subscribeMessage: () => new Promise(() => {}) },
    },
  };
}

function walk(node, out = []) {
  out.push(node);
  for (const child of node.children || []) walk(child, out);
  return out;
}
const byClass = (card, cls) => walk(card.shadowRoot).filter((n) => String(n.className || "").split(" ").includes(cls));
const text = (card, cls) => byClass(card, cls).map((n) => n.textContent);

const ALERTS = [
  { room_name: "Bedroom", kind: "co2_high", value: 1250, since: "2026-10-24T10:05:00Z", snoozed: true },
  { room_name: "Living room", kind: "too_hot", value: 27.8, since: "2026-10-24T11:00:00Z" },
  { room_name: "Office", kind: "ventilate", value: 4.1, temperature: 24.2, outdoor: 20.1, since: "2026-10-24T11:30:00Z" },
];

function make(config = {}, options = {}) {
  const fake = fakeHass(options);
  const card = new Mini();
  card.setConfig(config);
  card.hass = fake.hass;
  card.connectedCallback();
  return { card, fake };
}

test("compact: status, outdoor temperature, the alerts to deal with first, then the snoozed ones", () => {
  const { card } = make({ alerts: 2 }, { alerts: ALERTS });
  assert.deepEqual(text(card, "hsub"), ["3 alerts · Outside 18.5 °C"]);
  const pill = byClass(card, "pill")[0];
  assert.equal(pill.textContent, "3");
  assert.ok(pill.classList.contains("warning"));
  assert.deepEqual(text(card, "awhat"), ["Living room — Too hot", "Office — Open the windows (cooler outside)"]);
  assert.deepEqual(text(card, "avalue"), ["27.8 °C", "24.2 °C · outside 20.1 °C"]);
  assert.deepEqual(text(card, "more"), ["+1"]);
  // No since-when nor rooms in the compact view.
  assert.equal(byClass(card, "ameta").length, 0);
  assert.equal(byClass(card, "rooms").length, 0);
  assert.deepEqual(card.getGridOptions(), { columns: 6, min_columns: 6 });
});

test("no alert: OK; only snoozed or handled ones: a quiet pill", () => {
  let { card } = make();
  assert.deepEqual(text(card, "hsub"), ["All good · Outside 18.5 °C"]);
  assert.ok(byClass(card, "pill")[0].classList.contains("ok"));
  assert.equal(byClass(card, "alert").length, 0);
  ({ card } = make({}, { alerts: [ALERTS[0]] }));
  assert.ok(byClass(card, "pill")[0].classList.contains("quiet"));
  assert.ok(byClass(card, "alert")[0].classList.contains("quiet"));
});

test("zoom: the full card (all alerts with their state, rooms, activity); a click outside brings it back", () => {
  const { card } = make({ alerts: 1 }, { alerts: ALERTS });
  byClass(card, "zoom")[0].fire("click");
  assert.ok(card._zoomed);
  assert.equal(byClass(card, "alert").length, 3);
  assert.equal(byClass(card, "more").length, 0);
  assert.match(text(card, "ameta").join("|"), /Snoozed/);
  assert.deepEqual(text(card, "rname"), ["Living room", "Bathroom"]);
  assert.deepEqual(text(card, "rvalue"), ["27.8 °C", "61 %"]);
  const activity = walk(card.shadowRoot).find((n) => n.tagName === "smart-comfort-activity-card");
  assert.ok(activity, "activity card shown");
  assert.equal(activity._config.title, "");
  assert.equal(activity._config.limit, 5);
  assert.deepEqual(card.getGridOptions(), { columns: 12, min_columns: 6 });
  // A click inside the card keeps it open, a click outside closes it.
  const inside = { composedPath: () => [byClass(card, "room")[0], card] };
  tap(inside);
  assert.ok(card._zoomed);
  tap({ composedPath: () => [new FakeNode("div")] });
  assert.ok(!card._zoomed);
  assert.equal(byClass(card, "rooms").length, 0);
  assert.equal(walk(card.shadowRoot).find((n) => n.tagName === "smart-comfort-activity-card"), undefined);
});

test("zoom: a click in a dialog opened from the card (more-info) does not close it", () => {
  const { card } = make({}, { alerts: ALERTS });
  byClass(card, "zoom")[0].fire("click");
  tap({ composedPath: () => [new FakeNode("ha-more-info-dialog")] });
  assert.ok(card._zoomed);
  card.disconnectedCallback();
});

test("zoom: false removes the button; activity: 0 no activity", () => {
  let { card } = make({ zoom: false });
  assert.equal(byClass(card, "zoom").length, 0);
  ({ card } = make({ activity: 0 }));
  byClass(card, "zoom")[0].fire("click");
  assert.equal(walk(card.shadowRoot).find((n) => n.tagName === "smart-comfort-activity-card"), undefined);
});

test("switches: tinted when on, a tap turns them off or on", () => {
  const { card, fake } = make();
  const switches = byClass(card, "switch");
  assert.equal(switches.length, 3);
  assert.deepEqual(
    switches.map((s) => s.attributes["aria-pressed"]),
    ["true", "true", "false"]
  );
  switches[0].fire("click");
  switches[2].fire("click");
  assert.deepEqual(fake.calls, [
    ["switch", "turn_off", { entity_id: "switch.smart_comfort_notifications" }],
    ["switch", "turn_on", { entity_id: "switch.smart_comfort_lighting" }],
  ]);
});

test("rooms option: only those rooms' alerts and tiles, and their activity for one room", () => {
  const { card } = make({ rooms: ["Living room"] }, { alerts: ALERTS });
  assert.deepEqual(text(card, "hsub"), ["1 alert · Outside 18.5 °C"]);
  byClass(card, "zoom")[0].fire("click");
  assert.deepEqual(text(card, "rname"), ["Living room"]);
  const activity = walk(card.shadowRoot).find((n) => n.tagName === "smart-comfort-activity-card");
  assert.equal(activity._config.room, "Living room");
});

test("a tap on an alert opens its room's sensor", () => {
  const { card } = make({}, { alerts: ALERTS });
  byClass(card, "alert")[0].fire("click");
  const event = card.events.at(-1);
  assert.equal(event.type, "hass-more-info");
  assert.equal(event.detail.entityId, "sensor.smart_comfort_living_room");
});

test("rendered again only when its entities change", () => {
  const { card, fake } = make({}, { alerts: ALERTS });
  const header = byClass(card, "header")[0];
  card.hass = { ...fake.hass, states: { ...fake.hass.states, "light.other": { state: "on", attributes: {} } } };
  assert.equal(byClass(card, "header")[0], header);
  const states = { ...fake.hass.states };
  states["switch.smart_comfort_lighting"] = { ...states["switch.smart_comfort_lighting"], state: "on" };
  card.hass = { ...fake.hass, states };
  assert.notEqual(byClass(card, "header")[0], header);
});

test("Smart Comfort not loaded: says so", () => {
  const { card } = make({}, { loaded: false });
  assert.deepEqual(text(card, "empty"), ["Smart Comfort is not loaded."]);
  assert.equal(byClass(card, "switch").length, 0);
});

test("smart-comfort-card: the mini card's full view, standalone, never folded", () => {
  const Full = customElements.get("smart-comfort-card");
  assert.ok(Full.prototype instanceof Mini, "the mini card's rendering");
  const fake = fakeHass({ alerts: ALERTS });
  const card = new Full();
  card.setConfig({});
  card.hass = fake.hass;
  card.connectedCallback();
  // The same content as the mini card switched to its full view.
  const { card: mini } = make({}, { alerts: ALERTS });
  byClass(mini, "zoom")[0].fire("click");
  for (const cls of ["hsub", "awhat", "ameta", "rname", "rvalue", "section-title"]) {
    assert.deepEqual(text(card, cls), text(mini, cls), cls);
  }
  assert.ok(walk(card.shadowRoot).find((n) => n.tagName === "smart-comfort-activity-card"), "activity shown");
  // No button to fold it, and a click outside leaves it as it is.
  assert.equal(byClass(card, "zoom").length, 0);
  tap({ composedPath: () => [new FakeNode("div")] });
  assert.ok(card._zoomed);
  assert.equal(byClass(card, "rooms").length, 1);
  assert.deepEqual(card.getGridOptions(), { columns: 12, min_columns: 6 });
  assert.equal(card.getCardSize(), 8);
  // Editor: the mini card's options but the compact view's.
  assert.deepEqual(Full.getStubConfig(), {});
  assert.deepEqual(Full.getConfigForm().schema.map((f) => f.name), ["title", "show_title", "show_subtitle", "rooms", "activity"]);
  assert.deepEqual(Mini.getConfigForm().schema.map((f) => f.name), ["title", "show_title", "show_subtitle", "rooms", "alerts", "activity"]);
  card.disconnectedCallback();
  mini.disconnectedCallback();
});

test("card picker: the card, the mini card and the activity card, each once", () => {
  assert.deepEqual(window.customCards.map((c) => c.type).sort(), [
    "smart-comfort-activity-card",
    "smart-comfort-card",
    "smart-comfort-mini-card",
  ]);
  assert.equal(window.customCards.find((c) => c.type === "smart-comfort-card").name, "Smart Comfort");
});

test("polluted air: fine particles in µg/m³, or the air quality index", () => {
  const alerts = [
    { room_name: "Living room", kind: "polluted_air", value: 47, metric: "pm25", since: "2026-10-24T11:00:00Z", handled: true },
    { room_name: "Bedroom", kind: "polluted_air", value: 4, metric: "aqi", since: "2026-10-24T11:10:00Z" },
  ];
  const { card } = make({ alerts: 2 }, { alerts });
  // The one a purifier handles comes after the other.
  assert.deepEqual(text(card, "avalue"), ["index 4", "47\u00a0µg/m³"]);
  assert.ok(byClass(card, "alert").every((a) => walk(a).some((n) => n.icon === "mdi:blur")));
});

test("zoom: a press in the card released outside does not close it; leaving the page brings the compact view back", () => {
  const { card } = make({}, { alerts: ALERTS });
  byClass(card, "zoom")[0].fire("click");
  tap({ composedPath: () => [card] });
  assert.ok(card._zoomed);
  card.disconnectedCallback();
  assert.ok(!card._zoomed);
  card.connectedCallback();
  assert.ok(!card._zoomed);
  assert.equal(byClass(card, "room").length, 0, "the compact view, with no rooms list");
  card.disconnectedCallback();
});

test("no rewrite under a press: drawn after its release, and at once by its click", async () => {
  const { card } = make({}, { alerts: ALERTS });
  card._pressing = true;
  card._zoomed = true;
  card._render();
  assert.equal(byClass(card, "room").length, 0, "no rewrite under the pointer");
  card._onPressEnd();
  await new Promise((r) => setTimeout(r, 0));
  assert.ok(byClass(card, "room").length > 0, "drawn right after the release");
  card._pressing = true;
  card._pressClick({ detail: 1 });
  byClass(card, "zoom")[0].fire("click");
  assert.equal(byClass(card, "room").length, 0, "the click draws at once");
  card.disconnectedCallback();
  assert.equal(card._pressing, false);
});
