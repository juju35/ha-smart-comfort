// ── Shared ──
// Header like the other cards, shared with the mini card: a tinted round badge, the title block shrinks and truncates.
import { el } from "./helpers.js";

export const HEADER_STYLE = `
  .hbadge { --c: var(--primary-color, #03a9f4); width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; flex: none;
    background: color-mix(in srgb, var(--c) 16%, transparent); color: var(--c); --mdc-icon-size: 24px; }
  .titles { flex: 1 1 0; min-width: 4ch; }
  .hname { min-width: 4ch; font-size: 16px; font-weight: 500; line-height: 1.25; color: var(--primary-text-color);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  :host([hide-title]) .titles > .hname { display: none; }
`;

// The integration's domain, and its switches by translation key, in the order shown (the mini card's controls).
export const DOMAIN = "smart_comfort";
export const SWITCHES = [
  ["notifications", "mdi:bell-outline", "mdi:bell-off-outline"],
  ["control", "mdi:fan", "mdi:fan"],
  ["lighting", "mdi:lightbulb-auto-outline", "mdi:lightbulb-auto-outline"],
];

// The device families, each with its own switch under the device control one (control_climate…).
export const FAMILIES = ["climate", "fans", "purifiers"];

/** The integration's entities: its alerts sensor, its room sensors, its switches and the device family ones. */
export function findEntities(hass) {
  const found = { alerts: null, rooms: [], switches: {}, families: {} };
  for (const entry of Object.values(hass?.entities || {})) {
    if (entry.platform !== DOMAIN) continue;
    const id = entry.entity_id;
    const key = entry.translation_key;
    if (id.startsWith("sensor.") && key === "alerts") found.alerts = id;
    else if (id.startsWith("sensor.") && key === "room") found.rooms.push(id);
    else if (id.startsWith("switch.") && SWITCHES.some(([k]) => k === key)) found.switches[key] = id;
    else if (id.startsWith("switch.") && FAMILIES.some((f) => key === `control_${f}`)) found.families[key.slice(8)] = id;
  }
  return found;
}

// Device targets that mean the room is being cooled: an air conditioner cooling, a fan blowing.
export const COOLING_TARGETS = new Set(["cool", "cool_night", "on", "on_night"]);
// Alert kinds drawn as a cold room.
export const COLD_KINDS = new Set(["too_cold", "window_open_cold"]);

/**
 * The state the header shows: `scene` picks the illustration (ok, hot, cold, cool, warn) and `level` the colour of
 * the icon (ok green, quiet grey, cool blue, warning amber, critical red). An alert to deal with comes first, then a
 * device cooling a room, then the alerts that are only snoozed or handled.
 */
export function comfortMood(alerts, roomStates) {
  if (!alerts) return { scene: "ok", level: "quiet" };
  const open = alerts.filter((a) => !a.snoozed && !a.handled);
  if (open.length) {
    const level = open.some((a) => a.severity === "critical") ? "critical" : "warning";
    if (open.some((a) => a.kind === "too_hot")) return { scene: "hot", level };
    if (open.some((a) => COLD_KINDS.has(a.kind))) return { scene: "cold", level };
    return { scene: "warn", level };
  }
  const cooling = roomStates.some((s) => Object.values(s?.attributes?.devices || {}).some((d) => COOLING_TARGETS.has(d?.target)));
  if (cooling || alerts.some((a) => a.handled && a.kind === "too_hot")) return { scene: "cool", level: "cool" };
  return { scene: "ok", level: alerts.length ? "quiet" : "ok" };
}

// The illustration, drawn in the right part (x 96–200) of a 200 × 80 room whose floor is the ground strip: an air
// conditioner on the wall and a thermometer, the sun (heat waves at night), a snowflake or an alert sign by state.
// It uses no id, so several cards on one page never clash.
export function comfortScene(scene, level, night) {
  const [mercury, top, height] =
    { hot: ["#e5484d", 6, 30], cool: ["#2f80ed", 18, 18], cold: ["#2f80ed", 26, 10] }[scene] || ["#43a047", 14, 22];
  const cooling = scene === "cool";
  const ticks = [8, 16, 24, 32].map((y) => `<line x1="5" y1="${y}" x2="7" y2="${y}"/>`).join("");
  const ac = `<g transform="translate(140 12)">
      <rect x="-30" y="0" width="60" height="16" rx="5" fill="${night ? "#d8dce2" : "#ffffff"}" stroke="#c9ced6"/>
      <rect x="-24" y="12" width="48" height="2" rx="1" fill="#9aa3ae"/>
      <circle class="${cooling ? "blink" : ""}" cx="22" cy="5" r="1.2" fill="${cooling ? "#2f80ed" : "#9aa3ae"}"/>
      ${
        cooling
          ? `<g class="breeze" fill="none" stroke="#86b9de" stroke-width="1.4" stroke-linecap="round">
        <path d="M-20 20 q4 8 0 16"/><path d="M0 20 q4 8 0 16"/><path d="M20 20 q4 8 0 16"/></g>`
          : ""
      }</g>`;
  const thermometer = `<g transform="translate(104 22)">
      <rect x="-4" y="0" width="8" height="40" rx="4" fill="#ffffff" stroke="#9aa3ae"/>
      <g stroke="#9aa3ae" stroke-width=".6">${ticks}</g>
      <rect class="merc${scene === "hot" ? " rise" : cooling ? " fall" : ""}" x="-1.6" y="${top}" width="3.2" height="${height}" rx="1.6" fill="${mercury}"/>
      <circle cy="42" r="5" fill="${mercury}"/></g>`;
  let extra = "";
  if (scene === "hot" && !night) {
    const rays = Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      const at = (r) => [(Math.cos(a) * r).toFixed(1), (Math.sin(a) * r).toFixed(1)];
      const [[x1, y1], [x2, y2]] = [at(6), at(10)];
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    }).join("");
    extra = `<g transform="translate(186 44)"><g class="rays" stroke="#f5b400" stroke-width="1.6" stroke-linecap="round">${rays}</g><circle r="4" fill="#ffc83a"/></g>`;
  } else if (scene === "hot") {
    extra = `<g class="heat" transform="translate(186 50)" fill="none" stroke="#e5484d" stroke-width="1.4" stroke-linecap="round">
      <path d="M-6 6 q-2 -4 0 -8 t0 -8"/><path d="M0 6 q-2 -4 0 -8 t0 -8"/><path d="M6 6 q-2 -4 0 -8 t0 -8"/></g>`;
  } else if (scene === "cold") {
    const arms = [0, 60, 120].map((d) => `<path transform="rotate(${d})" d="M0 -8 V8 M-2.5 -6 L0 -4 L2.5 -6 M-2.5 6 L0 4 L2.5 6"/>`).join("");
    extra = `<g transform="translate(186 44)"><g class="snow" fill="none" stroke="${night ? "#a9d2f5" : "#5aa9e6"}" stroke-width="1.3" stroke-linecap="round">${arms}</g></g>`;
  } else if (scene === "warn") {
    const color = level === "critical" ? "#e5484d" : "#ffa600";
    extra = `<g class="pulse" transform="translate(186 44)"><circle r="7" fill="${color}"/>
      <rect x="-1" y="-4.5" width="2" height="5.5" rx="1" fill="#ffffff"/><circle cy="3.4" r="1.1" fill="#ffffff"/></g>`;
  }
  return `<svg viewBox="96 0 104 80" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">${ac}${thermometer}${extra}</svg>`;
}

// The banner's ground strip (the parquet floor), that the title block keeps clear of, and the gap between the title
// and the status pill on its row (.trow).
export const PILL_GROUND_PX = 10;
export const PILL_GAP_PX = 8;

// The status pill goes on the title row, right after the title, only when the whole title and the pill's whole label
// fit there; otherwise it takes its own line under the subtitle, and in the banner its dot alone when even that does not
// fit above the ground strip. Measured after each render, never by a fixed width (the mini card's and the activity card's).
export function fitPill(root) {
  for (const t of root?.querySelectorAll?.(".titles") || []) {
    const row = t.querySelector?.(".trow");
    const name = row?.querySelector(".hname");
    const chips = row ? [...row.children].filter((n) => n.classList.contains("pill")) : [];
    if (!name?.getBoundingClientRect || !chips.length) continue;
    t.classList.remove("pill-below", "pill-dot");
    // The title's whole width (scrollWidth is rounded: 1 px more, so that a title that fits is never cut).
    const need = chips.reduce((w, c) => w + PILL_GAP_PX + c.getBoundingClientRect().width, name.scrollWidth + 1);
    if (need <= row.getBoundingClientRect().width + 0.5) continue;
    t.classList.add("pill-below");
    const banner = t.closest(".banner");
    if (!banner) continue;
    const box = banner.getBoundingClientRect();
    const ground = box.bottom - PILL_GROUND_PX;
    const right = t.getBoundingClientRect().right;
    const out = [name, ...t.querySelectorAll(".hsub"), ...chips].some((n) => {
      const r = n.getBoundingClientRect();
      return r.height > 0 && (r.top < box.top - 0.5 || r.bottom > ground + 0.5 || r.right > right + 0.5);
    });
    if (out) t.classList.add("pill-dot");
  }
}

/** The status pill after the title, in the colour of the header's icon (`level`), its text in its tooltip too. */
export function statusPill(level, text) {
  const pill = el("span", `pill ${level}`);
  pill.title = text;
  pill.append(el("span", "pdot"), el("span", "ptxt", text));
  return pill;
}

// The title block's stylesheet, shared with the mini card: subtitle, badge colours by status, the title row and its pill.
export const TITLE_STYLE = `
  .hsub { font-size: 12px; line-height: 16px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  :host([hide-title]) .titles .hname, :host([hide-subtitle]) .titles > .hsub { display: none; }
  .top:empty { display: none; }
  /* The icon's colour is the status, in both headers. */
  .hbadge.ok { --c: var(--success-color, #43a047); }
  .hbadge.quiet { --c: var(--secondary-text-color, #727272); }
  .hbadge.cool { --c: var(--state-climate-cool-color, #2b9af9); }
  .hbadge.warning { --c: var(--warning-color, #ffa600); }
  .hbadge.critical { --c: var(--error-color, #db4437); }
  /* Title row: the title, then the status pill 8 px after it, only when the whole title and the pill's whole label fit
     there; otherwise the pill on its own line under the subtitle (then kept to one line), and its dot alone when the
     banner has no room left for its label or at 200 px or less (its text stays in its title and for screen readers).
     Measured after each render (_fitPill), in every language, never by a fixed width. */
  .header .titles { display: flex; flex-direction: column; justify-content: center; }
  .trow { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .trow .hname { flex: 0 1 auto; }
  .titles.pill-below .trow { display: contents; }
  .titles.pill-below .hsub { order: 1; }
  .titles.pill-below .pill { order: 2; align-self: flex-start; margin-top: 3px; }
  .titles.pill-dot .pill { padding: 4px; }
  .titles.pill-dot .ptxt { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  .pill { --c: var(--success-color, #43a047); display: inline-flex; align-items: center; gap: 4px; flex: none;
    box-sizing: border-box; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;
    line-height: 16px; white-space: nowrap;
    background: color-mix(in srgb, var(--c) 16%, transparent); color: color-mix(in srgb, var(--c) 70%, var(--primary-text-color)); }
  .pill .ptxt { white-space: nowrap; }
  .pill .pdot { width: 7px; height: 7px; border-radius: 50%; background: var(--c); flex: none; }
  .pill.ok { --c: var(--success-color, #43a047); }
  .pill.quiet { --c: var(--secondary-text-color, #727272); }
  .pill.cool { --c: var(--state-climate-cool-color, #2b9af9); }
  .pill.warning { --c: var(--warning-color, #ffa600); }
  .pill.critical { --c: var(--error-color, #db4437); }
  @container sc-card (max-width: 200px) {
    .pill { padding: 4px; }
    .pill .ptxt { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  }
`;

// The illustrated header's stylesheet, shared with the mini card: the room's wall, the illustration, the floor strip.
export const BANNER_STYLE = `
  /* ── Illustrated header: the room's wall, the illustration at the right, a parquet floor strip ── */
  .banner { position: relative; height: var(--banner-h, 90px); overflow: hidden; --ground-h: 10px; --scene-w: 104px;
            --sky-text: #2a2f3a; --sky-muted: #5b6270; background: #f2eee8; }
  .banner.night { --sky-text: #ffffff; --sky-muted: rgba(255,255,255,.75); background: #2a2f3d; }
  .banner .scene { position: absolute; right: 0; bottom: var(--ground-h); height: calc(100% - var(--ground-h));
                   width: min(var(--scene-w), 45%); overflow: hidden; }
  .banner .scene svg { display: block; width: 100%; height: 100%; }
  .banner .ground { position: absolute; left: 0; right: 0; bottom: 0; height: var(--ground-h);
                    background: repeating-linear-gradient(90deg, #c99a6b 0 38px, #b98a5c 38px 40px); box-shadow: inset 0 2px 0 #a97c50; }
  .banner.night .ground { background: repeating-linear-gradient(90deg, #4a3a2c 0 38px, #3e3024 38px 40px); box-shadow: inset 0 2px 0 #5c4836; }
  .banner .head { position: absolute; z-index: 1; left: 0; top: 0; bottom: var(--ground-h); right: min(var(--scene-w), 45%);
                  box-sizing: border-box; display: flex; align-items: center; gap: 10px; padding: 8px 8px 8px 14px; min-width: 0; }
  .banner .hname { color: var(--sky-text); }
  .banner .hsub { color: var(--sky-muted); font-size: 13px; line-height: 17px; }
  .banner .hbadge { background: rgba(255,255,255,.62); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 22%, transparent); }
  .banner .hbadge.quiet { --c: #8a929c; }
  .banner.night .hbadge { background: rgba(255,255,255,.12); color: color-mix(in srgb, var(--c) 75%, #ffffff);
                          box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
  .banner.night .hbadge.quiet { --c: #b9c0c9; }
  /* The expand / collapse button: 24 px, round, frosted, in the banner's top right corner. */
  .banner .zoom { position: absolute; z-index: 2; top: 5px; right: 5px; width: 24px; height: 24px; margin: 0; color: #33506b;
                  background: rgba(255,255,255,.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,.7);
                  -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }
  .banner .zoom:hover { background: rgba(255,255,255,.75); color: #33506b; }
  .banner.night .zoom { color: #ffffff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .banner.night .zoom:hover { background: rgba(255,255,255,.22); color: #ffffff; }
  /* The status pill on the sky: a frosted glass under the tint. */
  .banner .pill { background: color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c) 45%, #0d2a45); }
  .banner.night .pill { background: color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c) 35%, #ffffff); }
  .banner .pill.quiet { --c: #8a929c; }
  .banner.night .pill.quiet { --c: #b9c0c9; }
  /* Animations of the illustration. */
  .scene .blink { animation: sc-blink 1.2s steps(2) infinite; }
  .scene .breeze path { animation: sc-breeze 2s ease-in-out infinite; }
  .scene .breeze path:nth-child(2) { animation-delay: -.66s; } .scene .breeze path:nth-child(3) { animation-delay: -1.33s; }
  .scene .rays { animation: sc-spin 12s linear infinite; transform-box: fill-box; transform-origin: center; }
  .scene .merc { transform-box: fill-box; transform-origin: 50% 100%; }
  .scene .merc.rise { animation: sc-rise 4s ease-in-out infinite; }
  .scene .merc.fall { animation: sc-fall 4s ease-in-out infinite; }
  .scene .snow { animation: sc-bob 3s ease-in-out infinite; }
  .scene .heat path { animation: sc-heat 2s ease-out infinite; }
  .scene .heat path:nth-child(2) { animation-delay: -.66s; } .scene .heat path:nth-child(3) { animation-delay: -1.33s; }
  .scene .pulse { animation: sc-pulse 2s ease-in-out infinite; }
  @keyframes sc-blink { 50% { opacity: .2; } }
  @keyframes sc-breeze { 0% { opacity: 0; transform: translateY(-3px); } 40% { opacity: 1; } 100% { opacity: 0; transform: translateY(5px); } }
  @keyframes sc-spin { to { transform: rotate(360deg); } }
  @keyframes sc-rise { 50% { transform: scaleY(1.1); } }
  @keyframes sc-fall { from { transform: scaleY(1.4); } to { transform: scaleY(1); } }
  @keyframes sc-bob { 50% { transform: translateY(2px); } }
  @keyframes sc-heat { from { opacity: .9; transform: translateY(2px); } to { opacity: 0; transform: translateY(-5px); } }
  @keyframes sc-pulse { 50% { opacity: .55; } }
  @media (prefers-reduced-motion: reduce) {
    .scene * { animation: none !important; }
  }
  /* A very narrow card keeps the wall and the floor for its texts: no illustration. */
  @container (max-width: 220px) {
    .banner .scene { display: none; }
    .banner .head { right: 0; padding-right: 34px; }
  }
`;
