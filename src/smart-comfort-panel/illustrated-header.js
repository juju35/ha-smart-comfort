// ── Illustrated header ─────────────────────────────────────────────────────────────────────────────────────────────
// Each tab opens on a 90 px header drawn like the ha-* cards' (and System Hub's panel): its icon in a frosted badge,
// its title and status pill on a wall, a 360 × 80 scene at the right (some furniture, then the tab's own piece, which
// follows the status) and a 10 px floor. Night with Home Assistant's dark theme. No id in the scenes, and no motion
// with prefers-reduced-motion.
import { SmartComfortPanel } from "./end-folded-top.js";

export const SCB_TONES = { good: "#43a047", warn: "#f5b400", bad: "#e5484d", info: "#2f80ed", idle: "#8a96a6" };
// The wall [day, night], the floor and the furniture of each tab
export const SCB_ROOMS = {
  overview: ["#eef1f6", "#262c3a", "parquet", "A"],
  activity: ["#f2efe9", "#2a2b33", "parquet", "C"],
  rooms: ["#f4ede3", "#2a2f3d", "parquet", "B"],
  outdoors: ["#dcebf7", "#1c2a44", "grass", "E"],
  alerts: ["#f3ede4", "#2b2a33", "parquet", "B"],
  schedule: ["#eef1f6", "#262c3a", "parquet", "C"],
  settings: ["#e4e6ea", "#22262e", "concrete", "D"],
  yaml_tab: ["#eef2f5", "#262c36", "tiles", "C"],
};
export const SCB_ICONS = {
  overview: "mdi:home-thermometer",
  activity: "mdi:history",
  rooms: "mdi:floor-plan",
  outdoors: "mdi:tree-outline",
  alerts: "mdi:bell-ring-outline",
  schedule: "mdi:calendar-clock",
  settings: "mdi:cog-outline",
  yaml_tab: "mdi:code-braces",
};
export const SCB_FAN = "M12 11a1 1 0 0 0-1 1 1 1 0 0 0 1 1 1 1 0 0 0 1-1 1 1 0 0 0-1-1m.5-9C17 2 17.11 5.57 14.75 6.75c-.99.49-1.43 1.54-1.62 2.47.48.2.9.51 1.22.91 3.7-2 7.68-1.21 7.68 2.37 0 4.5-3.57 4.6-4.75 2.23-.5-.99-1.56-1.43-2.49-1.62-.2.48-.51.89-.91 1.23 1.99 3.69 1.2 7.66-2.38 7.66-4.5 0-4.59-3.58-2.23-4.76.98-.49 1.42-1.53 1.62-2.45-.49-.2-.92-.52-1.24-.92C5.96 15.85 2 15.07 2 11.5 2 7 5.56 6.89 6.74 9.26c.5.99 1.55 1.42 2.48 1.61.19-.48.51-.9.92-1.22C8.15 5.96 8.94 2 12.5 2Z";

// The lawn, a tree and a fence: the furniture of the outdoors
export function scbGarden(n) {
  const p = (day, night) => (n ? night : day);
  const sky = n
    ? '<circle cx="34" cy="20" r="4" fill="#f3eed2"/><g fill="#fff" opacity=".85"><circle cx="70" cy="12" r=".8"/><circle cx="96" cy="26" r=".6"/><circle cx="128" cy="10" r=".7"/></g>'
    : `<circle cx="34" cy="22" r="7" fill="#ffd65a"/>${scbCloud(92, 20, 1)}`;
  const posts = Array.from({ length: 9 }, (_, i) => `<rect x="${84 + i * 9}" y="62" width="4" height="18" rx="1"/>`).join("");
  return `${sky}<path d="M0 66 C30 52 60 58 90 54 C120 50 140 60 160 56 V80 H0Z" fill="${p("#b9dba4", "#1d3a34")}"/>
    <g transform="translate(58 80)"><rect x="-2" y="-22" width="4" height="22" fill="${p("#8a5a3a", "#4a3a30")}"/><g class="sh-leaf"><circle cy="-30" r="12" fill="${p("#5aa83d", "#2f5e3a")}"/><circle cx="-8" cy="-24" r="8" fill="${p("#4e9a36", "#2a5434")}"/><circle cx="8" cy="-24" r="8" fill="${p("#4e9a36", "#2a5434")}"/></g></g>
    <g fill="${p("#e8dcc8", "#5a5448")}">${posts}<rect x="82" y="66" width="80" height="2.5"/><rect x="82" y="73" width="80" height="2.5"/></g>`;
}

// The thermometer and the air conditioner of the cards (their comfortScene), placed in a 104 × 80 box: the mercury,
// the breeze, then the sun, the heat, the snowflake or the alert sign of the state
export function scbComfort(mood, n) {
  const scene = mood.scene;
  const [col, top, h] = scene === "hot" ? ["#e5484d", 6, 30] : scene === "cool" ? ["#2f80ed", 18, 18] : scene === "cold" ? ["#2f80ed", 26, 10] : ["#43a047", 14, 22];
  const cool = scene === "cool";
  const breeze = cool
    ? '<g class="sh-fade" fill="none" stroke="#86b9de" stroke-width="1.4" stroke-linecap="round"><path d="M-20 20 q4 8 0 16"/><path d="M0 20 q4 8 0 16"/><path d="M20 20 q4 8 0 16"/></g>'
    : "";
  let mark = "";
  if (scene === "hot" && !n) {
    const rays = [0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => {
        const a = (i * Math.PI) / 4;
        return `<line x1="${(Math.cos(a) * 6).toFixed(1)}" y1="${(Math.sin(a) * 6).toFixed(1)}" x2="${(Math.cos(a) * 10).toFixed(1)}" y2="${(Math.sin(a) * 10).toFixed(1)}"/>`;
      })
      .join("");
    mark = `<g transform="translate(90 44)"><g class="sh-rot" stroke="#f5b400" stroke-width="1.6" stroke-linecap="round">${rays}</g><circle r="4" fill="#ffc83a"/></g>`;
  } else if (scene === "hot") {
    mark = '<g class="sh-fade" transform="translate(90 50)" fill="none" stroke="#e5484d" stroke-width="1.4" stroke-linecap="round"><path d="M-6 6 q-2 -4 0 -8 t0 -8"/><path d="M0 6 q-2 -4 0 -8 t0 -8"/><path d="M6 6 q-2 -4 0 -8 t0 -8"/></g>';
  } else if (scene === "cold") {
    const arms = [0, 60, 120].map((d) => `<path transform="rotate(${d})" d="M0 -8 V8 M-2.5 -6 L0 -4 L2.5 -6 M-2.5 6 L0 4 L2.5 6"/>`).join("");
    mark = `<g transform="translate(90 44)"><g class="sh-rot" fill="none" stroke="${n ? "#a9d2f5" : "#5aa9e6"}" stroke-width="1.3" stroke-linecap="round">${arms}</g></g>`;
  } else if (scene === "warn") {
    mark = `<g transform="translate(90 44)"><g class="sh-blink"><circle r="7" fill="${mood.level === "critical" ? "#e5484d" : "#ffa600"}"/><rect x="-1" y="-4.5" width="2" height="5.5" rx="1" fill="#fff"/><circle cy="3.4" r="1.1" fill="#fff"/></g></g>`;
  }
  return `<g transform="translate(44 12)"><rect x="-30" width="60" height="16" rx="5" fill="${n ? "#d8dce2" : "#fff"}" stroke="#c9ced6"/><rect x="-24" y="12" width="48" height="2" rx="1" fill="#9aa3ae"/>
      <circle class="${cool ? "sh-blink" : ""}" cx="22" cy="5" r="1.2" fill="${cool ? "#2f80ed" : "#9aa3ae"}"/>${breeze}</g>
    <g transform="translate(8 22)"><rect x="-4" width="8" height="40" rx="4" fill="#fff" stroke="#9aa3ae"/>
      <g stroke="#9aa3ae" stroke-width=".6"><line x1="5" y1="8" x2="7" y2="8"/><line x1="5" y1="16" x2="7" y2="16"/><line x1="5" y1="24" x2="7" y2="24"/><line x1="5" y1="32" x2="7" y2="32"/></g>
      <rect x="-1.6" y="${top}" width="3.2" height="${h}" rx="1.6" fill="${col}"/><circle cy="42" r="5" fill="${col}"/></g>${mark}`;
}

// The tab's own piece (0–200, drawn at x 160). `x`: the overview's score, lines and mood; the rooms' tones; the
// outdoor air and noise; the alerts' count
export function scbScene(tab, tone, n, x = {}) {
  const p = (day, night) => (n ? night : day);
  const c = SCB_TONES[tone] || SCB_TONES.good;
  const ok = tone === "good" || tone === "info" || tone === "idle";
  const blink = ok ? "" : "sh-blink";
  const face = p("#fff", "#3d475c");
  const edge = p("#c9ced6", "#55617a");
  const ink = p("#5f6b7a", "#a9b4c2");
  const dark = p("#3a414c", "#20252e");
  const wood = p("#b98a5c", "#5c4836");
  const woodd = p("#a2744a", "#4a3a2c");
  const desk = (x0, w) =>
    `<rect x="${x0}" y="63" width="${w}" height="4" rx="1" fill="${wood}"/><rect x="${x0 + 4}" y="67" width="4" height="13" fill="${woodd}"/><rect x="${x0 + w - 8}" y="67" width="4" height="13" fill="${woodd}"/>`;
  if (tab === "overview") {
    const score = Math.max(0, Math.min(100, Number(x.score ?? 100)));
    const lines = (x.lines || ["good", "good", "good"])
      .slice(0, 3)
      .map((t, i) => `<circle cx="42" cy="${12 + i * 9}" r="2" fill="${SCB_TONES[t]}"/><rect x="47" y="${10.3 + i * 9}" width="${[22, 16, 20][i]}" height="3.4" rx="1.7" fill="${SCB_TONES[t]}"/>`)
      .join("");
    return `<rect class="sh-glow" x="0" y="2" width="92" height="56" rx="12" fill="${c}" opacity="${ok ? ".10" : ".16"}"/>
      <g transform="translate(6 8)"><rect width="80" height="44" rx="5" fill="${p("#2a3038", "#14181f")}"/><rect x="3" y="3" width="74" height="38" rx="3" fill="${p("#1b2129", "#0d1117")}"/>
        <circle cx="20" cy="22" r="12" fill="none" stroke="#2e3a4e" stroke-width="4.2"/><circle cx="20" cy="22" r="12" fill="none" stroke="${c}" stroke-width="4.2" stroke-dasharray="${((2 * Math.PI * 12 * score) / 100).toFixed(1)} 100" transform="rotate(-90 20 22)" stroke-linecap="round"/>
        <text x="20" y="25.4" text-anchor="middle" font-size="9.5" font-weight="700" font-family="Roboto,sans-serif" fill="#fff">${score}</text>${lines}</g>
      <rect x="42" y="52" width="10" height="4" fill="${p("#2a3038", "#14181f")}"/><g transform="translate(96 0)">${scbComfort(x.mood || { scene: "ok" }, n)}</g>`;
  }
  if (tab === "activity") {
    const log = [["#2f80ed", 34], ["#2f80ed", 26], ["#8a96a6", 30], ["#f5b400", 22]]
      .map(([col, w], i) => `<circle cx="10" cy="${12 + i * 9}" r="2.4" fill="${col}"/><rect x="16" y="${10.5 + i * 9}" width="${w}" height="3" rx="1.5" fill="${edge}"/>`)
      .join("");
    const grille = [12, 16, 20, 24, 28, 32, 36].map((y) => `<line x1="4" y1="${y}" x2="18" y2="${y}"/>`).join("");
    return `<g transform="translate(14 6)"><rect width="58" height="44" rx="3" fill="${face}" stroke="${edge}"/>${log}<rect x="22" y="-3" width="14" height="5" rx="1.5" fill="${ink}"/></g>
      <g transform="translate(108 80)"><rect x="-1.5" y="-30" width="3" height="30" fill="${ink}"/><ellipse cy="-1" rx="9" ry="2" fill="${ink}"/></g>
      <g transform="translate(108 44)"><circle r="13" fill="none" stroke="${edge}" stroke-width="1.4"/><g class="sh-rot-fast"><path transform="translate(-10 -10) scale(.84)" d="${SCB_FAN}" fill="${p("#9cc3e6", "#5a7a9a")}"/></g></g>
      <g transform="translate(150 30)"><rect width="22" height="50" rx="5" fill="${face}" stroke="${edge}"/><g stroke="${edge}" stroke-width="1">${grille}</g><circle class="sh-blink" cx="11" cy="6" r="1.6" fill="#2f80ed"/></g>
      <g class="sh-fade" fill="none" stroke="#86b9de" stroke-width="1.3" stroke-linecap="round"><path d="M152 24 q3 -6 0 -12"/><path d="M161 24 q3 -6 0 -12"/><path d="M170 24 q3 -6 0 -12"/></g>`;
  }
  if (tab === "rooms") {
    const tones = x.rooms || ["good", "good", "good", "good"];
    const cell = (cx, cy, t) =>
      `<rect x="${cx}" y="${cy}" width="34" height="24" fill="${face}"/><rect x="${cx}" y="${cy}" width="34" height="24" fill="${SCB_TONES[t] || SCB_TONES.good}" opacity=".22"/><circle cx="${cx + 29}" cy="${cy + 5}" r="2.6" fill="${SCB_TONES[t] || SCB_TONES.good}"${t === "bad" ? ' class="sh-blink"' : ""}/>`;
    const beam = p("#8a5a3a", "#6a5040");
    return `<g transform="translate(40 0)"><path d="M18 26 L60 4 L102 26" fill="none" stroke="${beam}" stroke-width="3" stroke-linejoin="round"/>
        ${cell(24, 28, tones[2])}${cell(61, 28, tones[3])}${cell(24, 54, tones[0])}${cell(61, 54, tones[1])}
        <rect x="30" y="66" width="18" height="6" rx="2" fill="${p("#d9826a", "#8a5a4a")}"/><rect x="68" y="67" width="22" height="5" rx="1" fill="${p("#9cc3e6", "#3a5a7a")}"/>
        <path d="M30 42 h18 v3 a5 5 0 0 1 -5 5 h-8 a5 5 0 0 1 -5 -5z" fill="${p("#e8f0fd", "#5a6a84")}"/><rect x="66" y="42" width="26" height="3" fill="${wood}"/><rect x="74" y="35" width="10" height="7" rx="1" fill="${dark}"/>
        <rect x="22" y="26" width="76" height="54" fill="none" stroke="${beam}" stroke-width="2.4"/><line x1="60" y1="26" x2="60" y2="80" stroke="${beam}" stroke-width="2"/><line x1="22" y1="52" x2="98" y2="52" stroke="${beam}" stroke-width="2"/></g>
      ${scbPlant(176, 1.35, n)}`;
  }
  if (tab === "outdoors") {
    const air = SCB_TONES[x.air || "good"];
    const noise = SCB_TONES[x.noise || "good"];
    return `<g transform="translate(96 80)"><path d="M0 -44 v44" stroke="${ink}" stroke-width="1.6"/><path d="M-22 -40 Q0 -54 22 -40Z" fill="${p("#e5484d", "#8a3a3a")}"/><rect x="-14" y="-16" width="28" height="3" rx="1" fill="${wood}"/><path d="M-10 -13 v13 M10 -13 v13" stroke="${woodd}" stroke-width="2"/></g>
      <g transform="translate(140 30)"><rect x="-1.5" width="3" height="50" fill="${ink}"/><rect x="-8" y="-10" width="16" height="12" rx="3" fill="${face}" stroke="${edge}"/><g class="sh-blink" fill="${air}"><circle cx="-3" cy="-4" r="1.2"/><circle cx="3" cy="-4" r="1.2"/></g></g>
      ${x.aq != null ? `<g transform="translate(160 14)"><g class="sh-float"><circle r="9" fill="${air}"/><text y="3.4" text-anchor="middle" font-size="9" font-weight="700" font-family="Roboto,sans-serif" fill="#fff">${x.aq}</text></g></g>` : ""}
      <g transform="translate(184 46)"><path d="M-4 -6 l4 -3 v18 l-4 -3 h-4 v-12z" fill="${ink}"/><g class="sh-fade" fill="none" stroke="${noise}" stroke-width="1.4" stroke-linecap="round"><path d="M4 -4 a6 6 0 0 1 0 8"/><path d="M7 -7 a10 10 0 0 1 0 14"/></g></g>`;
  }
  if (tab === "alerts") {
    const cards = [["#f5b400", 28], ["#e5484d", 22], ["#2f80ed", 26]]
      .map(([col, w], i) => `<g transform="translate(16 ${10 + i * 16})"><rect width="46" height="12" rx="3" fill="${face}" stroke="${edge}"/><circle cx="6" cy="6" r="2.6" fill="${col}"/><rect x="12" y="4.5" width="${w}" height="3" rx="1.5" fill="${edge}"/></g>`)
      .join("");
    return `${cards}<g transform="translate(92 36)"><g class="${ok ? "" : "sh-ring"}"><path d="M-14 10 h28 l-3 -4 v-10 a11 11 0 0 0 -22 0 v10z" fill="${ok ? p("#f5b400", "#c9922a") : c}"/><circle cy="13" r="3.4" fill="${p("#a2744a", "#6a5240")}"/><rect x="-1.5" y="-18" width="3" height="4" rx="1.5" fill="${ink}"/></g>
        ${ok ? "" : `<g class="sh-fade" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round"><path d="M-20 -10 a20 20 0 0 0 0 16"/><path d="M20 -10 a20 20 0 0 1 0 16"/></g>`}</g>
      <g transform="translate(150 30)"><rect width="22" height="40" rx="4" fill="${dark}"/><rect x="2" y="4" width="18" height="30" rx="2" fill="${p("#cfe8f8", "#1b2f52")}"/><rect x="5" y="9" width="12" height="5" rx="1.5" fill="${c}"/><rect x="5" y="17" width="9" height="3" rx="1.5" fill="${edge}"/>
        ${x.count ? `<g class="${blink}"><circle cx="21" cy="2" r="5" fill="${c}"/><text x="21" y="4.3" text-anchor="middle" font-size="6.5" font-weight="700" font-family="Roboto,sans-serif" fill="#fff">${x.count > 9 ? "9+" : x.count}</text></g>` : ""}</g>
      <rect x="146" y="70" width="30" height="4" rx="1" fill="${wood}"/><rect x="159" y="74" width="4" height="6" fill="${woodd}"/>${scbPlant(188, 1.1, n)}`;
  }
  if (tab === "schedule") {
    const ticks = Array.from({ length: 12 }, (_, a) => `<circle cx="${(Math.cos((a * Math.PI) / 6) * 13.5).toFixed(1)}" cy="${(Math.sin((a * Math.PI) / 6) * 13.5).toFixed(1)}" r=".9"/>`).join("");
    const frame = p("#fff", "#4a5568");
    return `<g transform="translate(44 30)"><circle r="17" fill="${face}" stroke="${ink}" stroke-width="2.4"/><g fill="${ink}">${ticks}</g><g class="sh-rot"><path d="M0 0 V-12" stroke="#2f80ed" stroke-width="1.4" stroke-linecap="round"/></g><path d="M0 0 L7 4" stroke="${dark}" stroke-width="2" stroke-linecap="round"/><circle r="1.6" fill="${dark}"/></g>
      <g transform="translate(88 10)"><rect width="44" height="40" rx="1.5" fill="${p("#cfe8f8", "#1b2f52")}" stroke="${frame}" stroke-width="2"/><rect x="22" width="22" height="40" fill="${p("#2a3b5c", "#0f1a2e")}"/><circle cx="11" cy="14" r="5" fill="#ffd65a"/>
        <path d="M36 10 a6 6 0 1 0 4 10 a5 5 0 1 1 -4 -10z" fill="#f3eed2"/><line x1="22" y1="0" x2="22" y2="40" stroke="${frame}" stroke-width="1.6"/></g><rect x="84" y="50" width="52" height="3" rx="1" fill="${frame}"/>
      <g transform="translate(150 80)"><rect y="-14" width="46" height="8" rx="2" fill="${wood}"/><rect y="-26" width="5" height="26" rx="1.5" fill="${woodd}"/><rect x="41" y="-18" width="5" height="18" rx="1.5" fill="${woodd}"/><rect x="6" y="-19" width="12" height="5" rx="2" fill="#fff"/><rect x="16" y="-18" width="25" height="5" rx="2" fill="${p("#9cc3e6", "#3a5a7a")}"/></g>
      <g class="sh-fade" font-family="Roboto,sans-serif" font-weight="700" fill="${p("#7f77dd", "#a9a3f0")}"><text x="168" y="48" font-size="8">z</text><text x="176" y="40" font-size="10">Z</text></g>`;
  }
  if (tab === "settings") {
    const holes = [];
    for (let i = 0; i < 13; i++) for (let j = 0; j < 6; j++) holes.push(`<circle cx="${6 + i * 8}" cy="${6 + j * 8}" r=".9"/>`);
    const sw = (x0, on) =>
      `<g transform="translate(${x0} 34)"><rect x="-10" y="-14" width="20" height="28" rx="3" fill="${face}" stroke="${edge}"/><rect x="-7" y="3" width="14" height="7" rx="3.5" fill="${on ? "#2f80ed" : edge}"/><circle cx="${on ? 3.5 : -3.5}" cy="6.5" r="2.6" fill="#fff"/><circle cy="-5" r="4" fill="${on ? "#2f80ed" : edge}" opacity=".5"/></g>`;
    return `<g transform="translate(40 8)"><rect width="104" height="50" rx="2" fill="${p("#d6c3a3", "#5a4c3a")}"/><g fill="${p("#b49e7c", "#463b2e")}">${holes.join("")}</g></g>
      ${sw(58, true)}${sw(82, true)}${sw(106, false)}<g transform="translate(132 34)"><circle r="10" fill="${face}" stroke="${ink}" stroke-width="1.6"/><g class="sh-rot"><path d="M0 -7 V-3" stroke="#e5484d" stroke-width="2" stroke-linecap="round"/></g></g>
      ${desk(36, 112)}${scbPlant(184, 1.2, n)}`;
  }
  // yaml_tab
  const code = [[0, 26, "#7fb4ff"], [1, 14, "#7fb4ff"], [2, 30, "#8fdc8f"], [2, 24, "#8fdc8f"], [1, 18, "#7fb4ff"], [2, 34, "#8fdc8f"]]
    .map(([ind, w, col], i) => `<rect x="${8 + ind * 6}" y="${8 + i * 5}" width="${w}" height="2.6" rx="1.3" fill="${col}"/>`)
    .join("");
  return `<g transform="translate(50 10)"><rect width="74" height="44" rx="3" fill="${dark}"/><rect x="3" y="3" width="68" height="38" rx="2" fill="${p("#1f262f", "#0f131a")}"/>${code}<rect class="sh-blink" x="45" y="33" width="1.6" height="4" fill="#fff"/></g>
    <rect x="82" y="54" width="10" height="6" fill="${dark}"/><rect x="72" y="60" width="30" height="3" rx="1.5" fill="${ink}"/>${desk(40, 116)}
    <g transform="translate(130 53)"><rect width="10" height="10" rx="2" fill="${p("#e8f0fd", "#4a5568")}"/><path d="M10 3 h2 a2 2 0 0 1 0 4 h-2" stroke="${p("#9aa3ae", "#55617a")}" fill="none"/><path class="sh-fade" d="M3 -2 q-2 -3 0 -6 M7 -2 q-2 -3 0 -6" stroke="${edge}" stroke-width="1" fill="none"/></g>${scbPlant(184, 1.2, n)}`;
}

export function scbPlant(x, k, n) {
  return `<g transform="translate(${x} 80) scale(${k})"><path d="M-7 0 l-2 -11 h18 l-2 11z" fill="#c0603a"/><path class="sh-leaf" d="M0 -11 q-10 -6 -11 -20 q8 4 11 15 q2 -14 10 -18 q1 12 -10 23z" fill="${n ? '#3e7a4a' : '#5aa83d'}"/></g>`;
}
export function scbCloud(x, y, k, fill) {
  return `<g transform="translate(${x} ${y}) scale(${k})"><path class="sh-cloud" d="M-14,4 C-17,4 -18,0 -14.5,-1 C-14,-5 -8,-6 -6,-3 C-4,-8 4,-8 5,-2 C9,-3 12,0 10,4 Z" fill="${fill || '#fff'}"/></g>`;
}

// The furniture of the left part (0–160)
export function scbDecor(kind, n) {
  var p = (day, night) => (n ? night : day);
  var frame = p('#fff', '#4a5568');
  var glass = p('#cfe8f8', '#1b2f52');
  var wood = p('#b98a5c', '#5c4836');
  var woodd = p('#a2744a', '#4a3a2c');
  var ink = p('#8a8478', '#4a4f60');
  if (kind === 'A') {
    var sky = n
      ? '<circle cx="66" cy="22" r="3" fill="#f3eed2"/><g fill="#fff" opacity=".8"><circle cx="40" cy="18" r=".7"/><circle cx="52" cy="40" r=".6"/><circle cx="72" cy="38" r=".6"/></g>'
      : `<circle cx="68" cy="22" r="5" fill="#ffd65a"/>${scbCloud(44, 28, 0.8)}`;
    return `<rect x="28" y="10" width="52" height="46" rx="1.5" fill="${glass}" stroke="${frame}" stroke-width="2"/>${sky}<path d="M28 44 C40 38 60 40 80 36 V56 H28Z" fill="${p('#a7d39f', '#1d3a4a')}"/>
      <line x1="54" y1="10" x2="54" y2="56" stroke="${frame}" stroke-width="1.6"/><line x1="28" y1="33" x2="80" y2="33" stroke="${frame}" stroke-width="1.6"/><rect x="24" y="56" width="60" height="3" rx="1" fill="${frame}"/>
      <path d="M122 80 V30" stroke="${ink}" stroke-width="1.6"/><path d="M113 30 h18 l-4 -12 h-10z" fill="${p('#efe3c8', '#ffd27a')}"/><ellipse cx="122" cy="79" rx="7" ry="1.6" fill="${ink}"/>${n ? '<path d="M114 30 L100 80 H144 L130 30Z" fill="#ffd27a" opacity=".14"/>' : ''}`;
  }
  if (kind === 'B') {
    return `<rect x="26" y="14" width="40" height="28" rx="1" fill="${glass}" stroke="${p('#3a414c', '#20252e')}" stroke-width="2.4"/><path d="M28 38 L40 26 L48 33 L54 28 L64 38Z" fill="${p('#86c27f', '#2a5a3a')}"/><circle cx="56" cy="21" r="3" fill="#ffd65a"/>
      <rect x="74" y="20" width="22" height="30" rx="1" fill="${p('#fff', '#3d475c')}" stroke="${p('#3a414c', '#20252e')}" stroke-width="2.4"/><circle cx="85" cy="32" r="6" fill="${p('#f2b8a2', '#8a5a4a')}"/><rect x="79" y="40" width="12" height="3" rx="1" fill="${p('#9cc3e6', '#3a5a7a')}"/>
      <rect x="20" y="60" width="96" height="20" rx="2" fill="${p('#c9bfae', '#6b7586')}"/><rect x="24" y="64" width="42" height="12" rx="1" fill="${p('#d8cfc0', '#7a8496')}"/><rect x="70" y="64" width="42" height="12" rx="1" fill="${p('#d8cfc0', '#7a8496')}"/>
      <circle cx="62" cy="70" r="1" fill="${woodd}"/><circle cx="74" cy="70" r="1" fill="${woodd}"/><path d="M40 60 v-6 h8 v6" fill="${p('#e8f0fd', '#4a5568')}"/><path d="M44 54 q-4 -8 0 -12 q4 4 0 12z" fill="${p('#5aa83d', '#3e7a4a')}"/>`;
  }
  if (kind === 'C') {
    var books = [[34, 5, 16, '#2f80ed'], [40, 4, 13, '#e5484d'], [45, 6, 18, '#43a047'], [52, 4, 14, '#f5b400'], [57, 5, 16, '#7f77dd']]
      .map(([x, w, h, c]) => `<rect x="${x}" y="${34 - h}" width="${w}" height="${h}" rx=".8" fill="${c}"/>`)
      .join('');
    return `<rect x="28" y="34" width="74" height="3" rx="1" fill="${wood}"/><path d="M36 37 v5 h3 M94 37 v5 h-3" stroke="${woodd}" stroke-width="1.2" fill="none"/>${books}
      <path d="M76 34 l-2 -10 h10 l-2 10z" fill="${p('#9cc3e6', '#3a5a7a')}"/><path d="M79 24 q-6 -8 -2 -14 M79 24 q4 -10 8 -12" stroke="${p('#5aa83d', '#3e7a4a')}" stroke-width="1.4" fill="none"/>
      <g fill="${p('#c08a5a', '#5c4836')}"><rect x="104" y="60" width="26" height="5" rx="2"/><rect x="104" y="40" width="5" height="22" rx="2"/><rect x="106" y="65" width="3" height="15"/><rect x="125" y="65" width="3" height="15"/></g>`;
  }
  return `<path d="M0 12 H150" stroke="${p('#b5bbc2', '#3a414c')}" stroke-width="5"/><path d="M30 12 V40" stroke="${p('#b5bbc2', '#3a414c')}" stroke-width="5"/><rect x="26" y="40" width="8" height="5" fill="${p('#9aa1a9', '#2c323b')}"/><circle cx="90" cy="12" r="5" fill="${p('#e5484d', '#8a3a3a')}"/>
    <rect x="52" y="22" width="22" height="28" rx="2" fill="${p('#fff', '#3d475c')}" stroke="${p('#c9ced6', '#55617a')}"/><path d="M60 30 l-3 6 h4 l-2 6 l6 -8 h-4 l2 -4z" fill="#f5b400"/>
    <g fill="${p('#c9a06a', '#6a5236')}"><rect x="94" y="72" width="40" height="3"/><rect x="94" y="77" width="40" height="3"/><rect x="96" y="75" width="4" height="2"/><rect x="112" y="75" width="4" height="2"/><rect x="128" y="75" width="4" height="2"/></g>
    <rect x="98" y="54" width="32" height="18" rx="1" fill="${p('#c9a06a', '#7a6040')}"/><rect x="111" y="54" width="6" height="18" fill="${p('#e5c48f', '#9a8058')}"/>
    <path d="M140 80 l6 -20 h4 l6 20z" fill="#f57c00"/><rect x="143" y="68" width="10" height="3" fill="#fff"/><rect x="136" y="78" width="24" height="2" rx="1" fill="#e06a00"/>`;
}

// The module's own piece (0–200, drawn at x 160): its look follows the tone. `extra`: the Status tab's score and
// group tones, the failing backup locations, the installs running

// The status the header shows (as the cards' comfortMood): an alert to deal with first (heat, cold, else a warning
// sign), then a device cooling a room, then the alerts only snoozed or handled
export function scbMood(alerts, rooms) {
  const open = alerts.filter((a) => !a.snoozed && !a.handled);
  if (open.length) {
    const level = open.some((a) => a.severity === "critical") ? "critical" : "warning";
    if (open.some((a) => a.kind === "too_hot")) return { scene: "hot", level };
    if (open.some((a) => a.kind === "too_cold" || a.kind === "window_open_cold")) return { scene: "cold", level };
    return { scene: "warn", level };
  }
  const cooling = rooms.some((r) => Object.values(r.devices || {}).some((d) => ["cool", "cool_night", "on", "on_night"].includes(d?.target)));
  return { scene: cooling ? "cool" : "ok", level: "ok" };
}

// A room's tone from its alerts: critical, to watch, else fine
export function scbRoomTone(room) {
  const alerts = room.alerts || [];
  return alerts.some((a) => a.severity === "critical") ? "bad" : alerts.length ? "warn" : "good";
}

/** The tab's header: its banner (title, pill, subtitle, scene), in a card the tab's first blocks are moved into. */
export function scbBanner(panel, tab = panel._tab, opts = {}) {
  const s = panel._status || null;
  const night = Boolean(panel._hass?.themes?.darkMode);
  let tone = "idle";
  let title = panel._t(tab);
  let pill = "";
  let sub = "";
  let extra = {};
  if (s && tab === "overview" && (panel._config?.options?.rooms?.length || panel._config?.options?.outdoors?.length)) {
    const c = panel._comfort(s);
    const label = panel._t("sc_score");
    tone = c.tone;
    title = c.points ? panel._t(c.points === 1 ? "sc_point" : "sc_points", { n: c.points }) : panel._t("sc_all_good");
    pill = `${label.charAt(0).toUpperCase()}${label.slice(1)} ${c.score} / 100`;
    sub = [`${panel._t("outdoor")} ${panel._format(s.outdoor_temperature)} °C`, ...(s.night ? [panel._t("quiet_night")] : [])].join(" · ");
    const tones = (s.rooms || []).filter((r) => !r.is_annex).map(scbRoomTone);
    const worst = (list) => (list.includes("bad") ? "bad" : list.includes("warn") ? "warn" : "good");
    extra = { score: c.score, lines: [worst(tones.slice(0, 2)), worst(tones.slice(2, 4)), worst(tones.slice(4))], mood: scbMood(s.alerts || [], s.rooms || []) };
    // The panel's top bar: Smart Comfort, the points to watch as its pill, the comfort score first on the line under it
    if (opts.head) {
      sub = `${pill} · ${sub}`;
      pill = title;
      title = "Smart Comfort";
    }
  } else if (opts.head) {
    title = "Smart Comfort";
  } else if (s && tab === "alerts") {
    const c = panel._comfort(s);
    tone = c.tone;
    pill = `${panel._t("active_alerts")} · ${(s.alerts || []).length}`;
    extra = { count: (s.alerts || []).length };
  } else if (tab === "rooms") {
    const rooms = (s?.rooms || []).filter((r) => !r.is_annex);
    const tones = rooms.map(scbRoomTone);
    tone = tones.includes("bad") ? "bad" : tones.includes("warn") ? "warn" : "good";
    if (rooms.length) pill = panel._t("n_rooms_ok", { n: tones.filter((t) => t === "good").length });
    extra = { rooms: [0, 1, 2, 3].map((i) => tones[i] || "good") };
  } else if (tab === "outdoors") {
    const air = typeof s?.outdoor_air === "number" ? s.outdoor_air : null;
    const noise = typeof s?.outdoor_noise === "number" ? s.outdoor_noise : null;
    tone = air !== null && air >= 4 ? "warn" : "good";
    pill = [air !== null ? `${panel._t("outdoor_air")} ${panel._format(air, 0)}/6` : "", noise !== null ? `${panel._format(noise, 0)} dB` : ""].filter(Boolean).join(" · ");
    extra = { aq: air !== null ? Math.round(air) : null, air: tone, noise: noise !== null && noise >= 65 ? "warn" : "good" };
  } else if (tab === "activity") {
    tone = "info";
  } else if (tab === "schedule") {
    tone = s?.night ? "info" : "idle";
    if (s?.night) pill = panel._t("quiet_night");
  }
  const [day, dark, floor, decor] = SCB_ROOMS[tab] || SCB_ROOMS.overview;
  let wall = night ? dark : day;
  if (tab === "overview" && tone !== "good" && tone !== "idle") wall = `color-mix(in srgb, ${SCB_TONES[tone]} ${night ? 14 : 9}%, ${wall})`;
  const furniture = decor === "E" ? scbGarden(night) : scbDecor(decor, night);
  const el = document.createElement("div");
  el.className = `shbanner ${tone}${night ? " night" : ""}${opts.compact ? " compact" : ""}${opts.head ? " head" : ""}`;
  el.style.setProperty("--sh-wall", wall);
  // The state's colour, for the round badge and the status pill
  el.style.setProperty("--tone", SCB_TONES[tone] || SCB_TONES.idle);
  const esc = (v) => String(v).replace(/[&<>"]/g, (ch) => `&#${ch.charCodeAt(0)};`);
  const scene = opts.compact
    ? ""
    : `<svg class="shscene" viewBox="0 0 360 80" preserveAspectRatio="xMaxYMax slice" aria-hidden="true" focusable="false">${furniture}<g transform="translate(160 0)">${scbScene(tab, tone, night, extra)}</g></svg>
    <div class="shground g-${floor}"></div>`;
  el.innerHTML = `${scene}<div class="shhead"><span class="shbadge" aria-hidden="true"><ha-icon icon="${SCB_ICONS[tab] || SCB_ICONS.overview}"></ha-icon></span>
      <div class="shtitles"><div class="shtrow"><span class="shtitle">${esc(title)}</span>${pill ? `<span class="shpill">${esc(pill)}</span>` : ""}</div>
        ${sub ? `<span class="shsub" title="${esc(sub)}">${esc(sub)}</span>` : ""}</div></div>`;
  return el;
}

export const STYLE = `
  :host {
    display: block;
    min-height: 100vh;
    background: var(--primary-background-color);
    color: var(--primary-text-color);
    font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
  }
  /* The top bar: the living room across the page (as on the ENT ONE panel); the tabs under it on the page background,
     sticky; the unsaved changes in a bar sticky at the bottom of the page */
  :host { --sc-accent: #21b7b6; }
  .topbar .shbanner { height: 90px; }
  .topbar .shhead { padding-left: 4px; right: calc(min(360px, 46%) + 96px); }
  .topbar .shscene { right: 96px; }
  .topbar .shtitle { font-size: 20px; }
  .hmenu { flex: none; color: inherit; }
  .hacts { position: absolute; z-index: 2; top: calc((100% - 10px) / 2 - 17px); right: 12px; display: flex; gap: 6px; }
  .hacts .icon-btn { width: 34px; height: 34px; padding: 0; border-radius: 50%; display: grid; place-items: center; box-sizing: border-box; text-decoration: none;
    color: #33506b; background: rgba(255, 255, 255, 0.55); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7); --mdc-icon-size: 20px; }
  .hacts .icon-btn:hover { background: rgba(255, 255, 255, 0.82); }
  .night .hacts .icon-btn { color: #fff; background: rgba(255, 255, 255, 0.12); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2); }
  :host([bare]) .topbar { display: none; }
  .tabs {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 12px;
    overflow-x: auto;
    background: var(--primary-background-color);
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    position: sticky;
    top: 0;
    z-index: 2;
  }
  .tablist { display: flex; gap: 4px; flex: 1; min-width: 0; }
  .tabmenu { display: none; color: var(--primary-text-color); }
  :host([bare]) .tabmenu { display: flex; }
  .tab {
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--secondary-text-color);
    padding: 12px 12px 10px;
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
  }
  .tab:hover { color: var(--primary-text-color); }
  .tab.active { color: var(--primary-text-color); border-bottom-color: var(--sc-accent); }
  .tab .cnt { display: inline-block; min-width: 18px; padding: 1px 5px; margin-left: 5px; border-radius: 9px; font-size: 11px; text-align: center; box-sizing: border-box;
    color: color-mix(in srgb, #f5a623 60%, var(--primary-text-color)); background: color-mix(in srgb, #f5a623 18%, transparent); }
  .savebar {
    position: sticky;
    bottom: 12px;
    z-index: 2;
    box-sizing: border-box;
    width: calc(100% - 32px);
    max-width: 1008px;
    margin: 0 auto 12px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 12px;
    background: var(--ha-card-background, var(--card-background-color, #fff));
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
    border: 1px solid color-mix(in srgb, var(--primary-color) 40%, transparent);
  }
  .savebar[hidden] { display: none; }
  .dirty { flex: 1; min-width: 0; font-size: 14px; font-weight: 500; }
  /* A tab's compact header (the picture is in the top bar) */
  .shbanner.compact { height: auto; background: none; color: inherit; --sh-sub: var(--secondary-text-color); }
  .shbanner.compact .shhead { position: static; padding: 12px 16px 0; }
  .shbanner.compact.night { color: inherit; }
  /* Overview: room filter, switches, tiles of the chart */
  .summary.ov { display: flex; flex-direction: column; gap: 12px; }
  .filters { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
  .filters .grow { flex: 1; }
  .fchip, .pill { display: inline-flex; align-items: center; gap: 6px; min-height: 30px; padding: 0 12px; border-radius: 16px; font: inherit; font-size: 13px; box-sizing: border-box; cursor: pointer;
    color: var(--secondary-text-color); background: var(--card-background-color, #fff); border: 1px solid var(--divider-color, #e0e0e0); }
  .fchip.on { color: var(--primary-text-color); border: 1.5px solid var(--sc-accent); }
  .fchip .dot { width: 7px; height: 7px; border-radius: 50%; }
  .fchip .dot.warn { background: #f5a623; } .fchip .dot.bad { background: var(--error-color, #db4437); } .fchip .dot.good { background: var(--success-color, #43a047); }
  .fchip .cnt { font-size: 11px; padding: 0 6px; border-radius: 8px; background: color-mix(in srgb, var(--sc-accent) 16%, transparent); color: color-mix(in srgb, var(--sc-accent) 55%, var(--primary-text-color)); }
  .more { position: relative; }
  .more > summary { list-style: none; border-style: dashed; } .more > summary::-webkit-details-marker { display: none; }
  .more .pop { position: absolute; z-index: 3; top: calc(100% + 6px); left: 0; min-width: 200px; max-height: 300px; overflow: auto; padding: 8px; box-sizing: border-box;
    display: flex; flex-direction: column; gap: 4px; background: var(--card-background-color, #fff); border: 1px solid var(--divider-color, rgba(127,127,127,.3));
    border-radius: 12px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14); }
  .pill { --mdc-icon-size: 16px; }
  .ctl > summary.pill { border-style: solid; } .ctl > summary.pill.on, .ctl > summary.pill.part { border-color: transparent; }
  .ctl .chev { --mdc-icon-size: 14px; margin-right: -4px; transition: transform .15s; } .ctl[open] .chev { transform: rotate(180deg); }
  .pill.part { color: color-mix(in srgb, #f5a623 60%, var(--primary-text-color)); background: color-mix(in srgb, #f5a623 14%, transparent); }
  .ctl .pop { left: auto; right: 0; min-width: 240px; }
  .crow { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 10px; border: 0; border-radius: 8px; background: none; font: inherit; font-size: 13px;
    color: var(--primary-text-color); cursor: pointer; text-align: left; --mdc-icon-size: 18px; }
  .crow:hover { background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .crow > ha-icon { color: var(--secondary-text-color); } .crow.on > ha-icon { color: var(--success-color, #43a047); }
  .crow:disabled { opacity: .45; cursor: default; } .crow:disabled:hover { background: none; }
  .ctl .pop > .crow:first-child { margin-bottom: 2px; border-radius: 8px 8px 0 0; box-shadow: 0 1px 0 var(--divider-color, rgba(127,127,127,.3)); }
  .crow .cl { flex: 1; }
  .crow .knob { position: relative; width: 30px; height: 18px; border-radius: 9px; background: var(--divider-color, rgba(127,127,127,.35)); flex: none; transition: background .15s; }
  .crow .knob::after { content: ""; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: #fff; transition: left .15s; box-shadow: 0 1px 2px rgba(0,0,0,.25); }
  .crow .knob.on { background: var(--success-color, #43a047); } .crow .knob.on::after { left: 14px; }
  .pill.on { color: color-mix(in srgb, var(--success-color, #43a047) 60%, var(--primary-text-color)); background: color-mix(in srgb, var(--success-color, #43a047) 14%, transparent); border-color: transparent; }
  .otiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; }
  .otile { display: flex; align-items: center; gap: 12px; min-width: 0; padding: 12px 14px; border-radius: 12px; box-sizing: border-box;
    background: var(--secondary-background-color, rgba(127,127,127,.08)); --c: #8a96a3; }
  .otile.warn { --c: #f5a623; } .otile.bad { --c: var(--error-color, #db4437); } .otile.good { --c: var(--success-color, #43a047); }
  .otile.info { --c: #2f80ed; } .otile.night { --c: #7f77dd; }
  .otile .pastille { position: relative; flex: none; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; --mdc-icon-size: 22px;
    color: var(--c); background: color-mix(in srgb, var(--c) 16%, transparent); }
  .otile .pbadge { position: absolute; top: -3px; right: -5px; min-width: 18px; height: 18px; padding: 0 4px; box-sizing: border-box; border-radius: 9px; font-size: 11px; font-weight: 600;
    line-height: 18px; text-align: center; color: #fff; background: var(--c); box-shadow: 0 0 0 2px var(--card-background-color, #fff); }
  .otile .tl { display: flex; flex-direction: column; min-width: 0; }
  .otile .tn { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .otile .ts { font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: color-mix(in srgb, var(--c) 65%, var(--primary-text-color)); }
  .otile.rest .ts { color: var(--secondary-text-color); }
  @media (max-width: 600px) { .topbar .shscene { display: none; } .topbar .shhead { right: 96px; } }
  .content { max-width: 1040px; margin: 0 auto; padding: 16px; display: flex; flex-direction: column; gap: 16px; }
  .card {
    background: var(--ha-card-background, var(--card-background-color, #fff));
    border-radius: var(--ha-card-border-radius, 12px);
    border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color));
    box-shadow: var(--ha-card-box-shadow, none);
    padding: 16px;
  }
  .card-header { display: flex; align-items: center; gap: 10px; font-size: 18px; margin-bottom: 12px; }
  .card-header > ha-icon { color: var(--primary-color); }
  /* Activity tab: the filters, then the lines by day, a time column on the right */
  .act-tools { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; margin: 12px 0 4px; }
  .seg { display: inline-flex; max-width: 100%; overflow-x: auto; scrollbar-width: none; padding: 3px; gap: 2px; border-radius: 10px; background: var(--secondary-background-color, rgba(127,127,127,.12)); }
  .seg button { border: 0; background: none; color: var(--secondary-text-color); font: inherit; font-size: 13px; padding: 6px 12px;
                border-radius: 8px; cursor: pointer; white-space: nowrap; }
  .seg button[aria-checked="true"] { background: var(--card-background-color, #fff); color: var(--primary-text-color); font-weight: 500;
                                     box-shadow: 0 1px 2px rgba(0,0,0,.15); }
  .seg button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 1px; }
  .act-room { font: inherit; font-size: 13px; color: inherit; padding: 6px 10px; border-radius: 8px; max-width: 100%;
              border: 1px solid var(--divider-color, rgba(127,127,127,.3)); background: var(--secondary-background-color, transparent); }
  .act-room option { color: initial; }
  .act-day { margin-top: 12px; }
  .act-date { padding: 6px 0; font-size: 12px; font-weight: 500; color: var(--secondary-text-color);
              border-bottom: 1px solid var(--divider-color, rgba(127,127,127,.2)); margin-bottom: 4px; }
  .act-row { display: flex; align-items: flex-start; gap: 12px; padding: 8px 6px; border-radius: 8px; }
  .act-row[data-entity] { cursor: pointer; }
  .act-row[data-entity]:hover { background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .act-row:focus-visible { outline: 2px solid var(--primary-color); outline-offset: -2px; }
  .act-icon { flex: none; width: 32px; height: 32px; overflow: hidden; border-radius: 50%; display: grid; place-items: center; --mdc-icon-size: 18px;
              color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 12%, transparent); }
  .act-row.failed .act-icon, .act-row.critical .act-icon { color: var(--error-color, #db4437); background: color-mix(in srgb, var(--error-color, #db4437) 12%, transparent); }
  .act-row.warning .act-icon { color: var(--warning-color, #ffa600); background: color-mix(in srgb, var(--warning-color, #ffa600) 14%, transparent); }
  .act-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .act-what { font-size: 14px; overflow-wrap: anywhere; }
  .act-detail { font-size: 13px; color: var(--secondary-text-color); white-space: pre-line; overflow-wrap: anywhere; }
  .act-room-name { font-size: 12px; color: var(--secondary-text-color); }
  .act-time { flex: none; font-size: 12px; color: var(--secondary-text-color); font-variant-numeric: tabular-nums; padding-top: 2px; }
  .act-empty { padding: 20px 4px; color: var(--secondary-text-color); }
  .card-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--divider-color); }
  .btn {
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    padding: 8px 14px;
    border-radius: 18px;
    border: 1px solid var(--divider-color);
    background: transparent;
    color: var(--primary-color);
    cursor: pointer;
  }
  .btn:hover { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08); }
  .btn:disabled { opacity: 0.6; cursor: default; }
  .btn.add { align-self: flex-start; }
  .btn.small { margin-top: 4px; padding: 6px 12px; font-size: 13px; }
  .icon-btn {
    background: none;
    border: none;
    color: var(--secondary-text-color);
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    display: inline-flex;
  }
  .icon-btn:hover { background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.06); color: var(--primary-color); }
  .banner { padding: 12px 16px; border-radius: 10px; font-size: 14px; line-height: 1.4; }
  .banner.info { background: rgba(var(--rgb-info-color, 3, 155, 229), 0.12); }
  .banner.error { background: rgba(var(--rgb-error-color, 219, 68, 55), 0.14); color: var(--error-color); }
  .banner.success { background: rgba(var(--rgb-success-color, 67, 160, 71), 0.14); }
  .banner .note { margin-top: 6px; font-weight: 500; }
  .source .sfile { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; background: var(--secondary-background-color, rgba(0, 0, 0, 0.04)); margin: 4px 0; }
  .source .sfile code { flex: 1 1 200px; font-size: 13px; }
  .source .sstatus { font-size: 12px; color: var(--secondary-text-color); }
  .source .sstatus.bad { color: var(--error-color); }
  .srow { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08)); }
  .srow:last-child { border-bottom: 0; }
  .stext { flex: 1 1 300px; min-width: 0; }
  .sname { font-size: 14px; font-weight: 600; }
  .shelp { font-size: 12px; color: var(--secondary-text-color); line-height: 1.4; }
  .shelp.note { margin: 4px 0 0; font-weight: 500; color: var(--primary-text-color); }
  .pill.info { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.14); color: var(--primary-color); }
  .sw { position: relative; display: inline-block; width: 40px; height: 24px; flex: none; }
  .sw input { position: absolute; inset: 0; opacity: 0; margin: 0; cursor: pointer; }
  .sw span { position: absolute; inset: 0; border-radius: 12px; background: var(--disabled-color, #bdbdbd); pointer-events: none; }
  .sw span::after { content: ""; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); transition: left 0.15s; }
  .sw input:checked + span { background: var(--primary-color); }
  .sw input:checked + span::after { left: 19px; }
  .sw input:focus-visible + span { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  .btn.primary { border-color: var(--primary-color); color: var(--primary-color); }
  .card.conflict { box-shadow: 0 0 0 2px var(--warning-color, #f59e0b); }
  .cgrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 10px; }
  .cbox { padding: 10px 12px; border-radius: 10px; min-width: 0; }
  .cbox.file { background: rgba(var(--rgb-warning-color, 245, 158, 11), 0.14); }
  .cbox.panel { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12); }
  .cbox .ctitle { font-size: 12px; font-weight: 600; margin-bottom: 4px; }
  .cbox pre { margin: 0; font: 13px/1.5 var(--code-font-family, monospace); white-space: pre-wrap; word-break: break-word; }
  .cactions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; margin-top: 12px; }
  .banner .retry { margin-left: 8px; font: inherit; font-weight: 500; color: var(--primary-color); background: none; border: 1px solid currentColor; border-radius: 16px; padding: 2px 12px; cursor: pointer; }
  .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; }
  .tile {
    font: inherit;
    text-align: left;
    color: inherit;
    background: var(--ha-card-background, var(--card-background-color, #fff));
    border: 1px solid var(--divider-color);
    border-radius: 12px;
    padding: 14px;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    column-gap: 12px;
    align-items: center;
  }
  button.tile { cursor: pointer; }
  .tile ha-icon { grid-row: span 2; color: var(--primary-color); --mdc-icon-size: 28px; }
  .tile.off ha-icon { color: var(--disabled-text-color, var(--secondary-text-color)); }
  .tile-value { font-size: 22px; font-weight: 500; }
  .tile-value:empty { display: none; }
  .tile-label { font-size: 13px; color: var(--secondary-text-color); }
  .alert { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-top: 1px solid var(--divider-color); }
  .alert:first-of-type { border-top: none; }
  .alert .kind { color: var(--warning-color, #ffa600); margin-top: 2px; }
  .alert .kind.too_cold, .alert .kind.window_open_cold { color: var(--info-color, #039be5); }
  .alert .kind.co2_high, .alert .kind.humidity_high, .alert .kind.ventilate,
  .alert .kind.noise_high, .alert .kind.noisy_outside, .alert .kind.bad_air_outside { color: var(--primary-color); }
  .alert .kind.close_windows { color: var(--error-color); }
  .alert-body { flex: 1; min-width: 0; }
  .alert-title { font-weight: 500; }
  .alert-meta { font-size: 13px; color: var(--secondary-text-color); margin-top: 2px; }
  .badges { display: flex; gap: 6px; margin-top: 4px; flex-wrap: wrap; }
  .badge { font-size: 12px; padding: 1px 8px; border-radius: 10px; border: 1px solid var(--divider-color); color: var(--secondary-text-color); }
  .row-actions { display: flex; gap: 2px; }
  .empty { color: var(--secondary-text-color); padding: 8px 0; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
  .grid .card { padding: 14px; }
  .grid .card.has-alert .card-header ha-icon { color: var(--warning-color, #ffa600); }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip {
    display: inline-flex; align-items: center; gap: 4px; font-size: 13px;
    padding: 3px 10px 3px 6px; border-radius: 14px; background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.05);
  }
  .chip ha-icon { --mdc-icon-size: 16px; color: var(--secondary-text-color); }
  .room-status { margin-top: 10px; font-size: 14px; }
  .is-ok .room-status { color: var(--success-color, #43a047); }
  .has-alert .room-status { color: var(--warning-color, #ffa600); }
  .devices { margin-top: 10px; border-top: 1px solid var(--divider-color); padding-top: 8px; display: flex; flex-direction: column; gap: 4px; }
  .device { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; }
  .device-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .device-state { color: var(--secondary-text-color); white-space: nowrap; }
  .last-title { font-weight: 500; }
  .last-message { white-space: pre-line; margin-top: 4px; }
  .room-header { justify-content: space-between; margin-bottom: 0; gap: 12px; }
  .room-summary { flex: 1; display: flex; flex-wrap: wrap; align-items: center; gap: 10px; color: var(--secondary-text-color); font-size: 13px; }
  .summary-item { display: inline-flex; align-items: center; gap: 2px; }
  .summary-item ha-icon { --mdc-icon-size: 18px; }
  .badge.new { color: var(--primary-color); border-color: var(--primary-color); }
  .room-toggle { display: flex; align-items: center; gap: 6px; background: none; border: none; color: inherit; font: inherit; font-size: 18px; cursor: pointer; padding: 0; }
  .room-toggle ha-icon { color: var(--secondary-text-color); }
  .room-toggle .room-icon { color: var(--primary-color); margin: 0 2px 0 -2px; }
  .subheader { font-size: 14px; font-weight: 500; color: var(--secondary-text-color); margin: 18px 0 8px; text-transform: uppercase; letter-spacing: 0.04em; }
  pre.yaml { margin: 12px 0 0; padding: 12px; overflow-x: auto; border-radius: 8px; font: 13px/1.5 var(--code-font-family, monospace); background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.05); white-space: pre; user-select: text; }
  .help { font-size: 13px; color: var(--secondary-text-color); margin: -4px 0 8px; }
  .section-title { display: flex; align-items: center; gap: 8px; font-size: 20px; margin: 28px 0 8px; }
  .section-title ha-icon { color: var(--secondary-text-color); }
  .section-help { margin: 0 0 12px; }
  .discover { display: flex; align-items: center; gap: 16px; }
  .discover-text { flex: 1; font-size: 14px; color: var(--secondary-text-color); line-height: 1.4; }
  @media (max-width: 600px) { .discover { flex-direction: column; align-items: flex-start; } }
  .device-item { display: flex; align-items: flex-start; gap: 4px; margin-bottom: 8px; }
  .device-item ha-form { flex: 1; }
  .device-item.slot { border: 1px solid var(--divider-color); border-radius: 12px; padding: 12px 4px 12px 12px; }
  .link { background: none; border: none; padding: 0; font: inherit; color: var(--primary-color); cursor: pointer; }
  .discover-more { margin-top: 8px; }
  /* Sections of a room and alert kinds: a line that opens, with a summary of what it holds */
  .sections { display: flex; flex-direction: column; margin-top: 12px; border-top: 1px solid var(--divider-color); }
  .section { border-bottom: 1px solid var(--divider-color); }
  .card > .section:last-child { border-bottom: none; }
  .section-head {
    width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 4px; background: none; border: none;
    font: inherit; color: inherit; cursor: pointer; text-align: left;
  }
  .section-head:hover { background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.03); }
  .section-head > ha-icon { color: var(--secondary-text-color); --mdc-icon-size: 22px; }
  .section.open .section-head > ha-icon:first-child { color: var(--primary-color); }
  .section-name { font-size: 15px; font-weight: 500; white-space: nowrap; }
  .section-summary {
    flex: 1; min-width: 0; text-align: right; font-size: 13px; color: var(--secondary-text-color);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .section-head .chevron { color: var(--secondary-text-color); }
  .section-body { padding: 4px 4px 16px 38px; display: flex; flex-direction: column; gap: 12px; }
  .section-body .help { margin: 0; }
  .section-body .subheader { margin: 8px 0 0; }
  .device-item { margin-bottom: 0; }
  /* "+ Something" for what isn't set yet */
  .add-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .add-chip {
    display: inline-flex; align-items: center; gap: 4px; padding: 5px 12px 5px 8px; border-radius: 16px;
    border: 1px dashed var(--divider-color); background: none; font: inherit; font-size: 13px;
    color: var(--primary-color); cursor: pointer;
  }
  .add-chip ha-icon { --mdc-icon-size: 18px; }
  .add-chip:hover { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08); border-style: solid; }
  /* Schedule */
  .timeline { display: grid; grid-template-columns: minmax(120px, max-content) 1fr; gap: 10px 14px; align-items: center; margin-top: 8px; }
  .tl-scale { position: relative; height: 16px; font-size: 11px; color: var(--secondary-text-color); }
  .tl-tick { position: absolute; transform: translateX(-50%); }
  .tl-tick:first-child { transform: none; }
  .tl-tick:last-child { transform: translateX(-100%); }
  .tl-label { display: flex; align-items: center; gap: 8px; font-size: 14px; }
  .tl-label ha-icon { --mdc-icon-size: 20px; color: var(--secondary-text-color); }
  .tl-bar { position: relative; height: 22px; border-radius: 11px; background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.06); overflow: hidden; }
  .tl-bar.unset::after { content: "–"; position: absolute; left: 10px; top: 1px; font-size: 13px; color: var(--secondary-text-color); }
  .tl-seg { position: absolute; top: 0; bottom: 0; background: var(--primary-color); opacity: 0.85; }
  .tl-bar.quiet .tl-seg { background: var(--info-color, #039be5); }
  .tl-bar.night .tl-seg { background: #5c6bc0; }
  .tl-bar.morning .tl-seg { background: var(--warning-color, #ffa600); }
  .tl-bar.boost .tl-seg { background: var(--success-color, #43a047); }
  .tl-bar.displays .tl-seg { background: #78909c; }
  .tl-now { position: absolute; top: -2px; bottom: -2px; width: 2px; background: var(--error-color, #db4437); }
  .sched-row { padding: 12px 0; border-top: 1px solid var(--divider-color); }
  .card-header + .sched-row { border-top: none; padding-top: 0; }
  .sched-head { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 500; margin-bottom: 4px; }
  .sched-head ha-icon { color: var(--primary-color); }
  .sched-row .help { margin: 0 0 8px; }
  @media (max-width: 600px) {
    .content { padding: 12px; }
    /* A room's or outdoor place's name and its actions on the first line, what it holds on the next one. */
    .room-header { flex-wrap: wrap; row-gap: 6px; }
    .room-summary { order: 3; flex-basis: 100%; }
    .section-body { padding-left: 4px; }
    .section-summary { display: none; }
    .section-name { flex: 1; }
    .timeline { grid-template-columns: 1fr; gap: 4px; }
    .tl-scale { display: none; }
    .tl-bar { margin-bottom: 8px; }
  }
    /* Not clipped: the overview's popovers (device control, + N OK) open past the card; the banner rounds its own corners. */
    .shtop { padding:0; overflow:visible; }
    .shtop > .shbanner:first-child { border-top-left-radius:inherit; border-top-right-radius:inherit; }
    .shbanner { position:relative; height:90px; overflow:hidden; color:#1d2733; background:var(--sh-wall); --sh-sub:#4a5a6c; container-type:inline-size; }
    .shbanner.night { color:#fff; --sh-sub:rgba(255,255,255,.78); }
    .shscene { position:absolute; right:0; bottom:10px; height:80px; width:min(360px, 46%); }
    .shground { position:absolute; left:0; right:0; bottom:0; height:10px; }
    .g-parquet { background:repeating-linear-gradient(90deg, #c99a6b 0 38px, #b98a5c 38px 40px); box-shadow:inset 0 2px 0 #a97c50; }
    .night .g-parquet { background:repeating-linear-gradient(90deg, #4a3a2c 0 38px, #3e3024 38px 40px); box-shadow:inset 0 2px 0 #5c4836; }
    .g-tiles { background:repeating-linear-gradient(90deg, #d9dfe3 0 18px, #c6cdd2 18px 19px); box-shadow:inset 0 2px 0 #b8c0c6; }
    .night .g-tiles { background:repeating-linear-gradient(90deg, #3a4250 0 18px, #2e3542 18px 19px); box-shadow:inset 0 2px 0 #4a5262; }
    .g-concrete { background:#9aa1a9; box-shadow:inset 0 2px 0 #b5bbc2; }
    .night .g-concrete { background:#2c323b; box-shadow:inset 0 2px 0 #3a414c; }
    .shhead { position:absolute; z-index:1; left:0; top:0; bottom:10px; right:calc(min(360px, 46%) + 4px); padding:6px 12px; box-sizing:border-box;
              display:flex; align-items:center; gap:10px; min-width:0; }
    .shbadge { width:40px; height:40px; flex:none; border-radius:50%; display:grid; place-items:center; --mdc-icon-size:24px; color:var(--tone);
               background:rgba(255,255,255,.62); box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--tone) 24%, transparent); }
    .night .shbadge { background:rgba(255,255,255,.12); color:color-mix(in srgb, var(--tone) 78%, #fff); box-shadow:inset 0 0 0 1px rgba(255,255,255,.14); }
    .shtitles { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
    .shtrow { display:flex; align-items:center; gap:8px; min-width:0; }
    .shtitle { flex:0 1 auto; min-width:0; font-size:16px; font-weight:500; line-height:1.25; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .shpill { flex:none; display:inline-flex; align-items:center; gap:5px; padding:1px 8px; border-radius:10px; font-size:12px; font-weight:500; line-height:16px;
              white-space:nowrap; max-width:60%; overflow:hidden; text-overflow:ellipsis;
              background:color-mix(in srgb, var(--tone) 16%, transparent); color:color-mix(in srgb, var(--tone) 60%, var(--primary-text-color, #1f2328)); }
    .shpill::before { content:""; flex:none; width:7px; height:7px; border-radius:50%; background:var(--tone); }
    .night .shpill { background:color-mix(in srgb, var(--tone) 22%, rgba(255,255,255,.12)); color:color-mix(in srgb, var(--tone) 55%, #fff); }
    .shsub { font-size:13px; line-height:18px; color:var(--sh-sub); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .idle { --tone:#8a96a6; }
    @container (max-width:560px) { .shscene { display:none; } .shhead { right:0; } }
    .shtop .subtabs { gap:4px; padding:0 12px; border-bottom:1px solid var(--divider-color, rgba(127,127,127,.2)); overflow-x:auto; flex-wrap:nowrap; }
    .shtop .subtab { min-height:0; padding:8px 10px; border:0; border-bottom:2px solid transparent; border-radius:6px 6px 0 0; margin-bottom:-1px;
                     background:none; color:var(--secondary-text-color); font-size:13px; font-weight:500; white-space:nowrap; gap:6px; --mdc-icon-size:16px; }
    .shtop .subtab:hover { color:var(--primary-text-color); border-color:transparent; }
    .shtop .subtab.active { color:var(--primary-text-color); background:none; border-bottom-color:var(--primary-color); }
    .shtop .subtab.active ha-icon { color:var(--primary-color); }
    .shtop .subdot { width:6px; height:6px; }
    .shscene .sh-blink { animation:sh-bl 1.2s steps(2) infinite; }
    .shscene .sh-fade { animation:sh-bl 1.6s ease-in-out infinite; }
    .shscene .sh-leaf { transform-box:fill-box; transform-origin:50% 100%; animation:sh-sway 4s ease-in-out infinite; }
    .shscene .sh-up { animation:sh-up 1.4s ease-in-out infinite; }
    .shscene .sh-cloud { animation:sh-drift 4s ease-in-out infinite alternate; }
    .shscene .sh-pir { opacity:.14; animation:sh-pir 2s ease-in-out infinite; }
    .shscene .sh-glow { animation:sh-glow 3s ease-in-out infinite; }
    .shscene .sh-float, .shscene .sh-dust { animation:sh-float 3s ease-in-out infinite; }
    .shscene :is(.sh-spin, .sh-rot, .sh-rot-rev, .sh-rot-fast, .sh-ping) { transform-box:fill-box; transform-origin:center; }
    .shscene .sh-spin { animation:sh-spin 1.6s linear infinite; }
    .shscene .sh-rot { animation:sh-spin 9s linear infinite; }
    .shscene .sh-rot-rev { animation:sh-spin 6s linear infinite reverse; }
    .shscene .sh-rot-fast { animation:sh-spin 1.4s linear infinite; }
    .shscene .sh-ping { animation:sh-ping 2s ease-out infinite; }
    @keyframes sh-bl { 50% { opacity:.2; } }
    @keyframes sh-sway { 0%, 100% { transform:rotate(-4deg); } 50% { transform:rotate(4deg); } }
    @keyframes sh-up { 50% { transform:translateY(-2px); } }
    @keyframes sh-drift { to { transform:translateX(4px); } }
    @keyframes sh-pir { 0%, 100% { opacity:.06; } 50% { opacity:.18; } }
    @keyframes sh-glow { 50% { opacity:.06; } }
    @keyframes sh-float { 50% { transform:translateY(-3px); } }
    @keyframes sh-ping { from { transform:scale(1); opacity:.9; } to { transform:scale(2.6); opacity:0; } }
    @media (prefers-reduced-motion: reduce) { .shscene * { animation:none !important; } }

    /* Charter: the header card's body, filled tiles with a round tinted icon, centred icons */
    ha-icon { display:inline-flex; align-items:center; justify-content:center; flex:none; line-height:0; }
    .shbody { display:flex; flex-direction:column; gap:12px; padding:12px 16px 16px; }
    .shbody > .card { border:0; padding:0; background:none; box-shadow:none; }
    .summary { gap:10px; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr)); }
    .tile { background:color-mix(in srgb, var(--primary-text-color) 5%, transparent); border:0; border-radius:14px; padding:10px 12px; min-height:56px; box-sizing:border-box; }
    button.tile:hover { background:color-mix(in srgb, var(--primary-color) 10%, transparent); }
    .tile > ha-icon { width:36px; height:36px; border-radius:50%; --mdc-icon-size:20px;
                      background:color-mix(in srgb, var(--primary-color) 14%, transparent); }
    .tile.off > ha-icon { background:color-mix(in srgb, var(--disabled-text-color, #9e9e9e) 16%, transparent); }
    .tile-value { font-size:18px; line-height:1.2; }
    .tile-label { font-size:12px; line-height:1.3; }
    .tile-value:empty + .tile-label { grid-row:span 2; font-size:13px; color:var(--primary-text-color); }
    .card-header { font-size:13px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:var(--secondary-text-color); }
    .card-header > ha-icon { --mdc-icon-size:20px; }
`;

if (!customElements.get("smart-comfort-panel")) customElements.define("smart-comfort-panel", SmartComfortPanel);
