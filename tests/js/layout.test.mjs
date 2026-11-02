// Layout rules of the panel and the activity card at narrow widths (CSS read from the sources;
// the rendering itself was checked in Chromium, see the PR).
// Run by tests/test_frontend.py (pytest), or directly: node --test tests/js/
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const source = (name) => readFile(new URL(`../../custom_components/smart_comfort/frontend/${name}`, import.meta.url), "utf8");

/** The declarations of `selector` (exact) in `css`, the first rule that has it. */
function rule(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css.match(new RegExp(`(?:^|[}\\s,])${escaped}\\s*\\{([^}]*)\\}`))?.[1];
}

/** The body of the `@media (max-width: 600px)` blocks. */
function mobile(css) {
  const out = [];
  const re = /@media \(max-width: 600px\) \{/g;
  for (let m = re.exec(css); m; m = re.exec(css)) {
    let depth = 1;
    let i = re.lastIndex;
    for (; depth && i < css.length; i++) depth += css[i] === "{" ? 1 : css[i] === "}" ? -1 : 0;
    out.push(css.slice(re.lastIndex, i - 1));
  }
  return out.join("\n");
}

test("panel, mobile: a room's summary goes on its own line under its name and actions", async () => {
  const css = mobile(await source("smart-comfort-panel.js"));
  assert.match(rule(css, ".room-header") || "", /flex-wrap:\s*wrap/);
  const summary = rule(css, ".room-summary") || "";
  assert.match(summary, /order:\s*3/);
  assert.match(summary, /flex-basis:\s*100%/);
});

test("activity card: long texts and entity ids wrap inside the card", async () => {
  const css = await source("smart-comfort-activity-card.js");
  assert.match(rule(css, ".what") || "", /overflow-wrap:\s*anywhere/);
  assert.match(rule(css, ".detail") || "", /overflow-wrap:\s*anywhere/);
});

test("activity card header: the title block shrinks and truncates, the badge never shrinks", async () => {
  const css = await source("smart-comfort-activity-card.js");
  const titles = rule(css, ".titles") || "";
  assert.match(titles, /min-width:\s*4ch/);
  assert.match(titles, /flex:\s*1 1 0(;|\s|$)/);
  const name = rule(css, ".hname") || "";
  assert.match(name, /text-overflow:\s*ellipsis/);
  assert.match(name, /min-width:\s*4ch/);
  const badge = rule(css, ".hbadge") || "";
  assert.match(badge, /flex:\s*none/);
  assert.match(badge, /width:\s*40px/);
});
