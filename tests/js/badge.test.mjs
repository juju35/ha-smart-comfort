// Sidebar badge module: the active-alerts count on the panel item, coloured by the worst severity.
// Run by tests/test_frontend.py (pytest), or directly: node --test tests/js/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../../custom_components/smart_comfort/frontend/smart-comfort-badge.js", import.meta.url), "utf8");

function matchEl(el, sel) {
  if (sel.startsWith(":scope > ")) {
    const rest = sel.slice(9);
    return el.children.filter((c) => matchEl(c, rest));
  }
  if (sel === ".smart-comfort-badge") return (el.className || "").includes("smart-comfort-badge") ? [el] : [];
  const slot = sel.match(/^(ha-svg-icon|ha-icon)\[slot="start"\]$/);
  if (slot) return el.localName === slot[1] && el.slot === "start" ? [el] : [];
  return [];
}

function makeEl(localName, props = {}) {
  return {
    localName,
    children: [],
    style: {},
    dataset: {},
    ...props,
    appendChild(child) {
      child.parent = this;
      this.children.push(child);
      return child;
    },
    insertBefore(child, ref) {
      child.parent = this;
      const i = ref ? this.children.indexOf(ref) : -1;
      if (i < 0) this.children.push(child);
      else this.children.splice(i, 0, child);
      return child;
    },
    get nextSibling() {
      const sibs = this.parent ? this.parent.children : [];
      return sibs[sibs.indexOf(this) + 1] || null;
    },
    remove() {
      if (this.parent) this.parent.children = this.parent.children.filter((c) => c !== this);
    },
    querySelector(sel) {
      return matchEl(this, sel)[0] || null;
    },
    querySelectorAll(sel) {
      return matchEl(this, sel);
    },
  };
}

function load() {
  const context = {
    window: {},
    document: { hidden: false, querySelector: () => null, createElement: () => makeEl("span") },
    localStorage: (() => {
      const store = {};
      return { getItem: (k) => store[k] ?? null, setItem: (k, v) => (store[k] = String(v)) };
    })(),
    requestAnimationFrame: (fn) => fn(),
    setTimeout: () => 0,
    setInterval: () => 0,
  };
  vm.createContext(context);
  vm.runInContext(`${source}\nthis.setBadge = scSetBadge;\nthis.follow = scFollow;\nthis.activeState = scActiveState;`, context);
  return context;
}

function withSidebar(context, item) {
  context.document.createElement = () => makeEl("span");
  const sidebarShadow = { querySelector: (s) => (s === "#sidebar-panel-smart-comfort" ? item : null) };
  const haRoot = {
    querySelector: (s) =>
      s === "home-assistant-main"
        ? { shadowRoot: { querySelector: (s2) => (s2 === "ha-sidebar" ? { shadowRoot: sidebarShadow } : null) } }
        : null,
  };
  context.document.querySelector = (s) => (s === "home-assistant" ? { shadowRoot: haRoot } : null);
}

test("the active-alerts sensor is found by its unique snoozes attribute", () => {
  const context = load();
  const hass = {
    entities: { "sensor.smart_comfort_active_alerts": { platform: "smart_comfort" }, "sensor.other": { platform: "foo" } },
    states: {
      "sensor.room": { state: "ok", attributes: { alerts: ["too_hot"] } },
      "sensor.other": { state: "3", attributes: { snoozes: {} } },
      "sensor.smart_comfort_active_alerts": { state: "2", attributes: { snoozes: {}, severity: "critical", alerts: [] } },
    },
  };
  assert.equal(context.activeState(hass).state, "2");
});

test("follow reads the count and colours by the worst severity", () => {
  const context = load();
  const item = makeEl("ha-list-item-button", { id: "sidebar-panel-smart-comfort" });
  item.appendChild(makeEl("ha-icon", { slot: "start" }));
  withSidebar(context, item);
  const hass = {
    user: { is_admin: true },
    states: { "sensor.a": { state: "3", attributes: { snoozes: {}, severity: "warning" } } },
    entities: {},
  };
  context.document.querySelector = ((orig) => (s) => (s === "home-assistant" ? { ...orig("home-assistant"), hass } : orig(s)))(
    context.document.querySelector,
  );
  context.follow();
  const badges = item.children.filter((c) => (c.className || "").includes("smart-comfort-badge"));
  assert.equal(badges.length, 2);
  assert.deepEqual(badges.map((b) => b.slot).sort(), ["end", "start"]);
  for (const b of badges) {
    assert.equal(b.textContent, "3");
    assert.match(b.className, /\bbadge\b/);
    assert.match(b.style.cssText, /--warning-color/);
  }
});

test("severity maps to a tone; none falls back to amber; zero clears the badge", () => {
  const context = load();
  const item = makeEl("a");
  withSidebar(context, item);
  context.setBadge(1, "bad");
  assert.match(item.children[0].style.cssText, /--error-color/);
  assert.match(item.children[0].style.cssText, /position:absolute/);
  context.setBadge(5, "info");
  assert.match(item.children[0].style.cssText, /--info-color/);
  // An unknown tone falls back to warning (amber)
  context.setBadge(2, "nope");
  assert.match(item.children[0].style.cssText, /--warning-color/);
  // Over 99 is capped; zero takes the badge away
  context.setBadge(150, "bad");
  assert.equal(item.children[0].textContent, "99+");
  context.setBadge(0, "bad");
  assert.equal(item.children.length, 0);
});
