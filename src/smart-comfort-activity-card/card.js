// ── Card ──
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
import { el, intlLocale, stringsFor, translate } from "./helpers.js";
import { DEVICE_ICONS, DRY_TARGETS, GROUPS, HEAT_ICON, ICONS, KIND_OPTIONS, entryKey, groupOf, matches, targetParts } from "./entries.js";
import { comfortMood, comfortScene, findEntities, fitPill, statusPill } from "./shared.js";
import { STYLE } from "./styles.js";
import { STRINGS } from "./i18n/strings.js";

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
        text = this._target(entry.target);
        icon = String(entry.target || "").startsWith("heat:")
          ? HEAT_ICON
          : DRY_TARGETS.has(entry.target)
            ? DEVICE_ICONS.humidifier
            : DEVICE_ICONS[(entry.entity_id || "").split(".")[0]] || icon;
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
    const [key, setpoint] = targetParts(target);
    if (`t_${key}` in STRINGS.en) return this._t(`t_${key}`) + (setpoint ? ` · ${setpoint} °C` : "");
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
