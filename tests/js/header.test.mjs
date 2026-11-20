// Dashboards' top bar module: hides the header for the chosen users, checked every second while the page is shown.
// Run by tests/test_frontend.py (pytest), or directly: node --test tests/js/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../../custom_components/smart_comfort/frontend/smart-comfort-header.js", import.meta.url), "utf8");

function load() {
  const intervals = [];
  let lookups = 0;
  const context = {
    window: { addEventListener() {} },
    location: { search: "" },
    document: {
      hidden: false,
      querySelector: () => {
        lookups += 1;
        return null;
      },
      createElement: () => ({}),
    },
    localStorage: { getItem: () => null, setItem() {} },
    customElements: { whenDefined: () => new Promise(() => {}), get: () => undefined },
    setInterval: (fn, ms) => intervals.push({ fn, ms }),
    setTimeout: () => 0,
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  return { context, intervals, lookups: () => lookups };
}

test("the top bar check is skipped while the page is hidden", () => {
  const { context, intervals, lookups } = load();
  const every = intervals.find((i) => i.ms === 1000);
  assert.ok(every, "a check every second");
  context.document.hidden = true;
  const before = lookups();
  every.fn();
  assert.equal(lookups(), before, "nothing looked up in the background");
  context.document.hidden = false;
  every.fn();
  assert.ok(lookups() > before, "checked again once shown");
});
