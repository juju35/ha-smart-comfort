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

test("mini card header: the status pill follows the title, truncates, moves under it short of room, then only its dot shows", async () => {
  const css = await source("smart-comfort-mini-card.js");
  const titles = rule(css, ".header .titles") || "";
  assert.match(titles, /display:\s*grid/);
  assert.match(titles, /grid-template-columns:\s*minmax\(min\(4\.5ch, 100%\), max-content\) minmax\(0, max-content\)/);
  assert.match(titles, /container:\s*sc-titles \/ inline-size/);
  const pill = css.match(/\n {2}\.pill \{([^}]*)\}/)?.[1] || "";
  for (const d of [/min-width:\s*0/, /max-width:\s*100%/, /overflow:\s*hidden/, /font-size:\s*11px/, /padding:\s*1px 8px/]) assert.match(pill, d);
  assert.match(rule(css, ".pill .ptxt") || "", /text-overflow:\s*ellipsis/);
  assert.match(css, /@container sc-titles \(max-width: 200px\) \{ \.header \.titles > \.pill \{ grid-column: 1 \/ -1; grid-row: 3;/);
  // Only the dot: the text is hidden visually, never removed (screen readers and the pill's title keep it).
  assert.match(css, /@container sc-card \(max-width: 200px\) \{\s*\.pill \{ padding: 4px; \}\s*\.pill \.ptxt \{[^}]*clip-path: inset\(50%\)/);
});

test("mini card: the expand / collapse button sits in the banner's top right corner, 24 px", async () => {
  const z = rule(await source("smart-comfort-mini-card.js"), ".banner .zoom") || "";
  for (const d of [/position:\s*absolute/, /top:\s*5px/, /right:\s*5px/, /width:\s*24px/, /height:\s*24px/]) assert.match(z, d);
});
