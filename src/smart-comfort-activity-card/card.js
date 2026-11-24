import { pickerDefine } from "./card-picker.js";
import { STRINGS } from "./i18n/strings.js";

/**
 * Smart Comfort activity card: what Smart Comfort did and why, live.
 * Also used by the Activity tab of the Smart Comfort panel (with filters and days).
 *
 * type: custom:smart-comfort-activity-card
 * title: Smart Comfort      # optional
 * limit: 10                 # entries shown
 * kinds: [device, lighting] # optional: only these (device, lighting, presence, display, notified, manual, reset, failed)
 * room: Séjour              # optional: only this room
 */


/** The language helpers over a table of texts by language (this card's, the mini card's). */
export function languageOf(strings) {
  // Language of the texts: the full tag when translated (sr-Latn), else its base (fr-FR: fr), else English.
  const resolve = (language) => [language, String(language || "").split("-")[0]].find((l) => strings[l]) || "en";
  // Locale of numbers and dates: Home Assistant's own (pt-BR keeps its formats) when it speaks the language of the
  // texts, else that language; pt alone is European Portuguese for Home Assistant, pt-PT for Intl.
  const intlLocale = (hass) => {
    const resolved = resolve(hass?.language);
    const full = hass?.locale?.language || hass?.language || "";
    if (full.split("-")[0] !== resolved.split("-")[0]) return resolved === "pt" ? "pt-PT" : resolved;
    return full === "pt" ? "pt-PT" : full;
  };
  // A text in that language, else in English, else its key; {name} placeholders filled from `values`.
  const translate = (language, key, values = {}) => {
    const text = strings[resolve(language)][key] ?? strings.en[key] ?? key;
    return text.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? "");
  };
  return { resolve, stringsFor: (language) => strings[resolve(language)], intlLocale, translate };
}

export const { stringsFor, intlLocale, translate } = languageOf(STRINGS);

/** An element with a class and a text. */
export function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

export const ICONS = {
  device: "mdi:fan",
  lighting: "mdi:lightbulb-auto-outline",
  presence_on: "mdi:motion-sensor",
  presence_off: "mdi:motion-sensor-off",
  display: "mdi:led-off",
  notified: "mdi:bell-ring-outline",
  cleared: "mdi:bell-check-outline",
  manual: "mdi:hand-back-right-outline",
  reset: "mdi:clock-check-outline",
  failed: "mdi:alert-circle-outline",
};
export const DEVICE_ICONS = { climate: "mdi:air-conditioner", fan: "mdi:fan" };
// Filter groups of the Activity tab (a failed command goes with what it was sent to: see groupOf),
// and the kinds of the card option.
export const GROUPS = {
  devices: ["device", "display", "reset"],
  lights: ["lighting", "presence_on", "presence_off"],
  notifications: ["notified", "cleared"],
  manual: ["manual"],
};
export const KIND_OPTIONS = ["device", "lighting", "presence", "display", "notified", "manual", "reset", "failed"];

export function matches(entry, config) {
  if (config.room && entry.room !== config.room) return false;
  const kinds = config.kinds;
  if (!kinds?.length) return true;
  return kinds.some((k) => k === entry.kind || (k === "presence" && entry.kind.startsWith("presence")) || (k === "notified" && entry.kind === "cleared"));
}

/** Filter group of an entry. A failed command is sorted as it would have been (activity.py kind_of):
 * an indicator's is a device's, a light's is a light's, the others a device's. */
export function groupOf(entry) {
  if (entry.kind !== "failed") return Object.keys(GROUPS).find((group) => GROUPS[group].includes(entry.kind));
  if (entry.target === "display_off" || entry.target === "display_on") return "devices";
  const domain = (entry.action || entry.entity_id || "").split(".")[0];
  return domain === "light" ? "lights" : "devices";
}

/** What keeps the keyboard focus across a render: the same line, or the same filter. */
export const entryKey = (entry) => `${entry.at}|${entry.kind}|${entry.entity_id || ""}|${entry.target || ""}`;

export class SmartComfortActivityCard extends HTMLElement {
  static getStubConfig() {
    return { limit: 10 };
  }

  static getConfigForm() {
    // Home Assistant's language when the label is asked for (the editor keeps the form).
    const t = (key) => stringsFor(document.querySelector("home-assistant")?.hass?.language)[key] ?? STRINGS.en[key];
    return {
      schema: [
        { name: "title", selector: { text: {} } },
        { name: "show_title", default: true, selector: { boolean: {} } },
        { name: "illustration", default: true, selector: { boolean: {} } },
        {
          name: "illustration_theme",
          selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((value) => ({ value, label: t(`theme_${value}`) })) } },
        },
        { name: "limit", selector: { number: { min: 1, max: 100, mode: "box" } } },
        {
          name: "kinds",
          selector: { select: { multiple: true, mode: "list", options: KIND_OPTIONS.map((value) => ({ value, label: t(`k_${value}`) })) } },
        },
        { name: "room", selector: { text: {} } },
      ],
      computeLabel: (schema) => t(`f_${schema.name}`) || schema.name,
      computeHelper: (schema) => t(`h_${schema.name}`),
    };
  }

  // In a Sections view: narrower, the lines would hold one word each.
  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._entries = [];
    this._group = "all";
    this._loaded = true;
  }

  setConfig(config) {
    this._config = { limit: 10, ...config };
    // show_title: the header's title, hidden by the stylesheet
    this.toggleAttribute?.("hide-title", config.show_title === false);
    this._render();
  }

  // Subscribed only while attached: Lovelace sets hass before attaching the card, the panel after.
  // Rendered again only when what it shows changes: the language, the names shown, the day.
  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first && this.isConnected) this._subscribe();
    else if (!this._rendered || this._signature() !== this._shown) this._render();
  }

  connectedCallback() {
    if (this._hass && !this._subscription) this._subscribe();
  }

  disconnectedCallback() {
    this._unsubscribe();
    this._pillResize?.disconnect();
    this._pillResize = null;
  }

  getCardSize() {
    return Math.min(8, 1 + (this._config?.limit || 10));
  }

  _t(key, values = {}) {
    return translate(this._hass?.language, key, values);
  }

  /** One subscription at a time: `_subscription` is set from the request on, not only once it is ready. */
  async _subscribe() {
    this._unsubscribe();
    const subscription = {};
    this._subscription = subscription;
    const current = () => this._subscription === subscription;
    const limit = this._config?.panel ? 300 : Math.max(50, (this._config?.limit || 10) * 5);
    try {
      const unsub = await this._hass.connection.subscribeMessage(
        (msg) => {
          if (!current()) return;
          if (msg.entries) this._entries = msg.entries;
          if (msg.added) this._entries = [...[...msg.added].reverse(), ...this._entries].slice(0, 300);
          this._loaded = true;
          this._render();
        },
        { type: "smart_comfort/activity", limit }
      );
      // Detached (or subscribed again) while it was on its way: not needed any more.
      if (current()) this._unsub = unsub;
      else unsub();
    } catch (_err) {
      if (!current()) return;
      this._subscription = undefined;
      this._loaded = false;
      this._render();
    }
  }

  _unsubscribe() {
    this._subscription = undefined;
    if (this._unsub) {
      this._unsub();
      this._unsub = undefined;
    }
  }

  _name(entityId) {
    return this._hass?.states[entityId]?.attributes.friendly_name || entityId;
  }

  _time(iso, withDay = false) {
    const date = new Date(iso);
    const options = { hour: "2-digit", minute: "2-digit" };
    if (withDay) Object.assign(options, { day: "numeric", month: "short" });
    return date.toLocaleString(intlLocale(this._hass), options);
  }

  _day(iso) {
    const date = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return this._t("today");
    if (date.toDateString() === yesterday.toDateString()) return this._t("yesterday");
    return date.toLocaleDateString(intlLocale(this._hass), { weekday: "long", day: "numeric", month: "long" });
  }

  /** What happened, in a few words, and the icon. */
  _describe(entry) {
    const data = entry.data || {};
    const pct = data.brightness_pct ?? data.value;
    let text;
    let icon = ICONS[entry.kind] || "mdi:information-outline";
    switch (entry.kind) {
      case "device":
        text = this._t(`t_${entry.target}`);
        icon = DEVICE_ICONS[(entry.entity_id || "").split(".")[0]] || icon;
        if (data.preset_mode) text += ` · ${data.preset_mode}`;
        else if (data.option) text += ` · ${data.option}`;
        else if (data.fan_mode) text += ` · ${data.fan_mode}`;
        break;
      case "lighting":
      case "presence_on":
        text = this._t(entry.kind) + (pct !== undefined ? ` · ${pct} %` : "");
        break;
      case "display":
        text = this._t(entry.target === "display_on" ? "display_on" : "display_off");
        if (entry.target === "display_on") icon = "mdi:led-on";
        break;
      case "notified":
        return { icon, text: entry.title || this._t("notified"), detail: entry.message, severity: entry.severity };
      case "manual":
        text = entry.until ? this._t("manual_until", { time: this._time(entry.until) }) : this._t("manual");
        break;
      case "failed":
        text = this._t("failed") + (entry.target ? ` · ${this._target(entry.target)}` : "");
        break;
      default:
        text = this._t(entry.kind);
    }
    return { icon, text };
  }

  /** The target of a command: a device's, a presence light's, an indicator's or the brightness of a light. */
  _target(target) {
    if (`t_${target}` in STRINGS.en) return this._t(`t_${target}`);
    if (target === "presence") return this._t("presence_on");
    if (target === "display_off" || target === "display_on") return this._t(target);
    return `${this._t("lighting")} · ${target}`;
  }

  _visible() {
    const config = this._config || {};
    let entries = this._entries.filter((e) => matches(e, config));
    if (config.panel && this._group !== "all") entries = entries.filter((e) => groupOf(e) === this._group);
    return config.panel ? entries : entries.slice(0, config.limit || 10);
  }

  /** What the lines depend on besides the entries: the language, the names shown, today's date, the header's picture. */
  _signature() {
    const names = this._loaded ? this._visible().map((e) => (e.entity_id ? this._name(e.entity_id) : "")) : [];
    return JSON.stringify([this._hass?.language, new Date().toDateString(), names, this._illustrated() ? [this._mood(), this._night()] : null]);
  }

  // The illustrated header is on unless `illustration: false`; never in the panel (no header there).
  _illustrated() {
    return this._config?.illustration !== false && !this._config?.panel;
  }

  // Night picture: forced by illustration_theme, else Home Assistant's dark theme alone.
  _night() {
    const mode = this._config?.illustration_theme;
    if (mode === "night") return true;
    if (mode === "day") return false;
    return !!this._hass?.themes?.darkMode;
  }

  // The state of the home, as on the Smart Comfort card: its picture (scene) and the icon's colour (level).
  _mood() {
    const found = findEntities(this._hass);
    const alerts = this._hass?.states?.[found.alerts]?.attributes?.alerts;
    return comfortMood(Array.isArray(alerts) ? alerts : null, found.rooms.map((id) => this._hass.states[id]));
  }

  _render() {
    if (!this._config) return;
    this._rendered = Boolean(this._hass);
    this._shown = this._signature();
    const root = this.shadowRoot;
    // Rendered again on each new entry: the line or filter that has the focus gets it back.
    const focusKey = root.activeElement?.dataset?.key;
    root.innerHTML = `<style>${STYLE}</style>`;
    const card = document.createElement(this._config.panel ? "div" : "ha-card");
    root.append(card);
    const title = this._config.title ?? this._t("title");
    if (!this._config.panel && title) card.append(this._header(title));
    if (this._illustrated()) this._watchPill();
    const body = document.createElement("div");
    body.className = this._config.panel ? "body flat" : "body";
    card.append(body);
    if (this._config.panel) body.append(this._chips());
    if (!this._loaded) {
      body.append(this._el("div", "empty", this._t("not_loaded")));
      this._restoreFocus(body, focusKey);
      return;
    }
    const entries = this._visible();
    if (!entries.length) {
      body.append(this._el("div", "empty", this._t("empty")));
      this._restoreFocus(body, focusKey);
      return;
    }
    let day = null;
    for (const entry of entries) {
      const thisDay = this._day(entry.at);
      if (this._config.panel && thisDay !== day) {
        body.append(this._el("div", "day", thisDay));
        day = thisDay;
      }
      body.append(this._row(entry));
    }
    this._restoreFocus(body, focusKey);
  }

  /**
   * Header like the other cards: a tinted round badge and the title. Illustrated (the default): the Smart Comfort
   * card's room for the state of the home, the badge in its colour, the title with a pill counting today's entries and
   * the latest entry under it, over the parquet floor.
   */
  _header(title) {
    const icon = document.createElement("ha-icon");
    icon.icon = "mdi:history";
    if (!this._illustrated()) {
      const header = this._el("div", "header");
      const badge = this._el("span", "hbadge");
      badge.append(icon);
      const titles = this._el("div", "titles");
      titles.append(this._el("div", "hname", title));
      header.append(badge, titles);
      return header;
    }
    const mood = this._mood();
    const night = this._night();
    const badge = this._el("span", `hbadge ${mood.level}`);
    badge.append(icon);
    const titles = this._el("div", "titles");
    const row = this._el("div", "trow");
    row.append(this._el("div", "hname", title));
    titles.append(row);
    const entries = this._loaded ? this._visible() : [];
    if (entries.length) {
      const today = entries.filter((e) => this._day(e.at) === this._t("today")).length;
      const status = `${this._t("today")} · ${today}`;
      row.append(statusPill(mood.level, status));
      const { text } = this._describe(entries[0]);
      const who = entries[0].entity_id ? this._name(entries[0].entity_id) : null;
      const sub = this._el("div", "hsub", `${this._time(entries[0].at)} · ${who ? `${who} — ${text}` : text}`);
      sub.title = sub.textContent;
      titles.append(sub);
    }
    const header = this._el("div", `header banner ${mood.scene}${night ? " night" : ""}`);
    const scene = this._el("div", "scene");
    scene.innerHTML = comfortScene(mood.scene, mood.level, night);
    const head = this._el("div", "head");
    head.append(badge, titles);
    header.append(scene, this._el("div", "ground"), head);
    return header;
  }

  // The pill's place is measured (fitPill): after each render, on every new width and once the web font is loaded.
  _watchPill() {
    if (typeof requestAnimationFrame !== "function") return;
    const fit = () => {
      cancelAnimationFrame(this._pillFrame);
      this._pillFrame = requestAnimationFrame(() => fitPill(this.shadowRoot));
    };
    if (!this._pillResize && typeof ResizeObserver === "function") {
      this._pillResize = new ResizeObserver(fit);
      this._pillResize.observe(this);
      document.fonts?.ready?.then(fit);
    }
    fit();
  }

  _restoreFocus(body, key) {
    if (!key) return;
    const find = (node) => (node.dataset?.key === key ? node : [...(node.children || [])].map(find).find(Boolean));
    find(body)?.focus({ preventScroll: true });
  }

  _chips() {
    const chips = this._el("div", "chips");
    for (const group of ["all", ...Object.keys(GROUPS)]) {
      const chip = this._el("button", `chip${group === this._group ? " active" : ""}`, this._t(group === "all" ? "all" : `group_${group}`));
      chip.dataset.key = `chip:${group}`;
      chip.setAttribute("aria-pressed", String(group === this._group));
      chip.addEventListener("click", () => {
        this._group = group;
        this._render();
      });
      chips.append(chip);
    }
    return chips;
  }

  _row(entry) {
    const { icon, text, detail, severity } = this._describe(entry);
    const row = this._el("div", `row ${entry.kind}${severity ? ` ${severity}` : ""}`);
    const badge = this._el("div", "badge");
    const i = document.createElement("ha-icon");
    i.icon = icon;
    badge.append(i);
    const main = this._el("div", "main");
    const who = entry.entity_id ? this._name(entry.entity_id) : null;
    main.append(this._el("div", "what", who ? `${who} — ${text}` : text));
    if (detail) main.append(this._el("div", "detail", detail));
    const meta = [entry.room, this._time(entry.at, !this._config.panel && this._day(entry.at) !== this._t("today"))];
    main.append(this._el("div", "meta", meta.filter(Boolean).join(" · ")));
    row.append(badge, main);
    if (entry.entity_id) {
      row.classList.add("clickable");
      row.dataset.key = entryKey(entry);
      row.setAttribute("role", "button");
      row.setAttribute("tabindex", "0");
      const open = () => {
        const event = new Event("hass-more-info", { bubbles: true, composed: true });
        event.detail = { entityId: entry.entity_id };
        this.dispatchEvent(event);
      };
      row.addEventListener("click", open);
      row.addEventListener("keydown", (ev) => {
        if (ev.key !== "Enter" && ev.key !== " ") return;
        ev.preventDefault();
        open();
      });
    }
    return row;
  }

  _el(tag, cls, text) {
    return el(tag, cls, text);
  }
}

// Header like the other cards, shared with the mini card: a tinted round badge, the title block shrinks and truncates.
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


export const STYLE = `
  :host { display: block; }
  ha-card { container: sc-card / inline-size; overflow: hidden; }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 16px 4px; }
  ${HEADER_STYLE}
  ${TITLE_STYLE}
  ${BANNER_STYLE}
  .header.banner { padding: 0; margin-bottom: 4px; }
  .body { padding: 0 16px 12px; }
  .body.flat { padding: 0; }
  .empty { color: var(--secondary-text-color); padding: 12px 0; }
  .day { margin: 14px 0 4px; font-size: 13px; font-weight: 500; color: var(--secondary-text-color); }
  .day::first-letter { text-transform: uppercase; }
  .row { display: flex; gap: 12px; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid var(--divider-color); }
  .row:last-child { border-bottom: none; }
  .row.clickable { cursor: pointer; border-radius: 4px; }
  .row.clickable:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  .badge { flex: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12); color: var(--primary-color); --mdc-icon-size: 20px; }
  .row.lighting .badge, .row.presence_on .badge, .row.presence_off .badge { background: rgba(255, 166, 0, 0.14); color: var(--warning-color, #ffa600); }
  .row.notified .badge, .row.cleared .badge { background: rgba(var(--rgb-info-color, 3, 155, 229), 0.12); color: var(--info-color, #039be5); }
  .row.notified.warning .badge { background: rgba(255, 166, 0, 0.14); color: var(--warning-color, #ffa600); }
  .row.notified.critical .badge, .row.failed .badge { background: rgba(219, 68, 55, 0.12); color: var(--error-color, #db4437); }
  .row.manual .badge, .row.display .badge { background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.06); color: var(--secondary-text-color); }
  .main { min-width: 0; flex: 1; }
  .what { font-size: 14px; line-height: 20px; overflow-wrap: anywhere; }
  .detail { font-size: 13px; color: var(--secondary-text-color); white-space: pre-line; margin-top: 2px; overflow-wrap: anywhere; }
  .meta { font-size: 12px; color: var(--secondary-text-color); margin-top: 2px; overflow-wrap: anywhere; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 4px 0 4px; }
  .chip { border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); border-radius: 16px;
    padding: 6px 12px; font: inherit; font-size: 13px; cursor: pointer; }
  .chip:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  /* Active filter: tinted, not filled, like the other active states of the panel. Its text is the primary
     colour toward the text colour, readable (WCAG AA) on the tint in light and dark themes. */
  .chip.active { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12); border-color: var(--primary-color);
    color: color-mix(in srgb, var(--primary-color) 60%, var(--primary-text-color)); }
`;

if (!customElements.get("smart-comfort-activity-card")) {
  pickerDefine("smart-comfort-activity-card", SmartComfortActivityCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "smart-comfort-activity-card",
    name: "Smart Comfort activity",
    description: "What Smart Comfort did and why, live: devices, lights, notifications, changes by hand.",
    preview: false,
  });
}
