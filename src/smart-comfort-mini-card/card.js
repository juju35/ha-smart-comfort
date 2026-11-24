// ── Card ──
/**
 * Smart Comfort mini card: the alerts of the moment and the switches of Smart Comfort, at a glance.
 * Its button at the top right switches it to the full card (every alert, the rooms, the latest activity) and back;
 * a click anywhere outside the card brings it back to the compact view. It reads the entities of the integration,
 * so it works for any user.
 *
 * type: custom:smart-comfort-mini-card
 * title: Smart Comfort      # optional ("" for the default)
 * rooms: [Séjour, Chambre]  # optional: only these rooms, by their name in the panel
 * alerts: 3                 # alerts listed in the compact view
 * activity: 5               # activity entries in the full card (0: none)
 * zoom: false               # optional: no full card button
 */
import { DOMAIN, SWITCHES, comfortMood, comfortScene, el, findEntities, fitPill, intlLocale, resolvedLanguage, statusPill, stringsFor, translate } from "./shared.js";
import { KIND_ICONS, NBSP, holdUnderPress, keepsFocus, roomName, watchOutside } from "./helpers.js";
import { STYLE } from "./styles.js";
import { STRINGS } from "./i18n/strings.js";

export class SmartComfortMiniCard extends HTMLElement {
  // The full card (smart-comfort-card) is this card always switched to its full view.
  static FULL = false;

  static getStubConfig() {
    return {};
  }

  static getConfigForm() {
    // Home Assistant's language when the label is asked for (the editor keeps the form).
    const hass = () => document.querySelector("home-assistant")?.hass;
    const t = (key) => stringsFor(hass()?.language)[key] ?? STRINGS.en[key];
    const rooms = findEntities(hass()).rooms.map((id) => roomName(hass()?.states?.[id]));
    return {
      schema: [
        { name: "title", selector: { text: {} } },
        { name: "show_title", default: true, selector: { boolean: {} } },
        { name: "show_subtitle", default: true, selector: { boolean: {} } },
        { name: "illustration", default: true, selector: { boolean: {} } },
        {
          name: "illustration_theme",
          default: "auto",
          selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((value) => ({ value, label: t(`theme_${value}`) })) } },
        },
        { name: "rooms", selector: { select: { multiple: true, custom_value: true, options: rooms } } },
        { name: "alerts", selector: { number: { min: 0, max: 10, mode: "box" } } },
        { name: "activity", selector: { number: { min: 0, max: 20, mode: "box" } } },
        { name: "zoom", default: true, selector: { boolean: {} } },
      ],
      computeLabel: (schema) => t(`f_${schema.name}`) || schema.name,
      computeHelper: (schema) => t(`h_${schema.name}`),
    };
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    holdUnderPress(this, () => this._render());
    this._zoomed = false;
    // A tap or click outside the card, and not in a dialog opened from it, brings it back to the compact view.
    this._outside = watchOutside(this, () => {
      if (this._zoomed) this._setZoom(false);
    });
  }

  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("Invalid configuration");
    this._config = { alerts: 3, activity: 5, ...config };
    // show_title / show_subtitle: the header's title / subtitle, hidden by the stylesheet
    this.toggleAttribute?.("hide-title", config.show_title === false);
    this.toggleAttribute?.("hide-subtitle", config.show_subtitle === false);
    this._shown = undefined;
    if (this._activity) this._activity.setConfig(this._activityConfig());
    this._render();
  }

  // Rendered again only when what it shows changes: the language, the states of the entities of Smart Comfort.
  set hass(hass) {
    this._hass = hass;
    if (this._activity) this._activity.hass = hass;
    if (this._signature() !== this._shown) this._render();
  }

  connectedCallback() {
    this._outside.on();
    this._watchPill();
    // Back on the page after leaving it: rendered again in the compact view.
    if (this._hass && this._config) this._render();
  }

  disconnectedCallback() {
    this._outside.off();
    this._unwatchPill();
    this._dropPress();
    // Left (another dashboard view, a conditional card hidden): back to the compact view on return.
    this._zoomed = false;
  }

  getCardSize() {
    if (this._zoomed) return 8;
    return 2 + Math.min(this._config?.alerts ?? 3, this._alerts().length);
  }

  getGridOptions() {
    return this._zoomed ? { columns: 12, min_columns: 6 } : { columns: 6, min_columns: 6 };
  }

  _t(key, values = {}) {
    return translate(this._hass?.language, key, values);
  }

  /** "{n} alerts", with the plural form of the language (one, few, many, other). */
  _count(n) {
    let form = "other";
    try {
      form = new Intl.PluralRules(resolvedLanguage(this._hass?.language)).select(n);
    } catch (_err) {
      // An unknown locale: other.
    }
    const strings = stringsFor(this._hass?.language);
    const key = `alerts_${form}` in strings ? `alerts_${form}` : "alerts_other";
    return this._t(key, { n: this._number(n, 0) });
  }

  _number(value, digits = 1) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return "–";
    return new Intl.NumberFormat(intlLocale(this._hass), { maximumFractionDigits: digits }).format(Number(value));
  }

  _temp(value) {
    return `${this._number(value)}${NBSP}°C`;
  }

  _time(iso) {
    return new Date(iso).toLocaleTimeString(intlLocale(this._hass), { hour: "2-digit", minute: "2-digit" });
  }

  /** The translated name of an alert kind (the states of the room sensors), else the kind itself. */
  _kind(kind) {
    const text = this._hass?.localize?.(`component.${DOMAIN}.entity.sensor.room.state.${kind}`);
    return text || kind.replace(/_/g, " ");
  }

  _state(id) {
    return id ? this._hass?.states?.[id] : undefined;
  }

  _rooms() {
    const only = this._config?.rooms;
    const ids = findEntities(this._hass).rooms.filter((id) => this._state(id));
    return only?.length ? ids.filter((id) => only.includes(roomName(this._state(id)))) : ids;
  }

  /** The active alerts (of the configured rooms), the ones to deal with first. */
  _alerts() {
    const list = this._state(findEntities(this._hass).alerts)?.attributes?.alerts;
    if (!Array.isArray(list)) return [];
    const only = this._config?.rooms;
    const alerts = only?.length ? list.filter((a) => only.includes(a.room_name)) : list;
    const quiet = (a) => (a.snoozed || a.handled ? 1 : 0);
    return [...alerts].sort((a, b) => quiet(a) - quiet(b));
  }

  /** The reading of an alert, in a few characters, in the unit of its kind. */
  _value(alert) {
    const ext = this._t("ext");
    switch (alert.kind) {
      case "too_hot":
      case "too_cold":
        return this._temp(alert.value);
      case "ventilate":
      case "close_windows":
        return `${this._temp(alert.temperature)} · ${ext} ${this._temp(alert.outdoor)}`;
      case "window_open_cold":
        return `${ext} ${this._temp(alert.outdoor ?? alert.value)}`;
      case "co2_high":
        return `${this._number(alert.value, 0)}${NBSP}ppm`;
      case "polluted_air":
        // Fine particles (PM2.5 or PM10), or the air quality index of the room.
        if (alert.metric === "aqi") return this._t("level", { value: this._number(alert.value, 0) });
        return `${this._number(alert.value, 0)}${NBSP}µg/m³`;
      case "humidity_high":
        return `${this._number(alert.value, 0)}${NBSP}%`;
      case "noise_high":
        return `${this._number(alert.value, 0)}${NBSP}dB`;
      case "noisy_outside":
        return `${ext} ${this._number(alert.outdoor_noise ?? alert.value, 0)}${NBSP}dB`;
      case "bad_air_outside":
        return `${ext} ${this._t("level", { value: this._number(alert.outdoor_air ?? alert.value, 0) })}`;
      default:
        return alert.value === null || alert.value === undefined ? "" : this._number(alert.value);
    }
  }

  /** What the card depends on: the language, the zoom, the states of the entities it shows. */
  _signature() {
    const found = findEntities(this._hass);
    const ids = [found.alerts, ...found.rooms, ...Object.values(found.switches), ...Object.values(found.families)];
    const states = ids.map((id) => {
      const s = this._state(id);
      return s ? [s.state, s.last_updated, s.attributes] : null;
    });
    return JSON.stringify([this._hass?.language, this._zoomed, ids, states, this._night()]);
  }

  /** Whether the header has the illustration (`illustration: false`: the classic header). */
  _illustrated() {
    return this._config?.illustration !== false;
  }

  /** Night illustration: forced by illustration_theme, else the dark theme alone (a light theme keeps the day after sunset). */
  _night() {
    const mode = this._config?.illustration_theme;
    if (mode === "night") return true;
    if (mode === "day") return false;
    return !!this._hass?.themes?.darkMode;
  }

  _setZoom(zoomed) {
    this._zoomed = zoomed;
    this._render();
    // Lovelace sizes the card again.
    this.dispatchEvent(new Event("iron-resize", { bubbles: true, composed: true }));
  }

  _activityConfig() {
    return { title: "", limit: this._config.activity, ...(this._config.rooms?.length === 1 ? { room: this._config.rooms[0] } : {}) };
  }

  _render() {
    if (!this._config) return;
    // Held under a press (see holdUnderPress), drawn after its click.
    if (this._pressing) {
      this._dirty = true;
      return;
    }
    this._dirty = false;
    this._shown = this._signature();
    const root = this.shadowRoot;
    const kept = keepsFocus(this, root.activeElement);
    const focusZoom = kept && root.activeElement?.classList?.contains("zoom");
    const focusSwitch = kept && root.activeElement?.dataset?.key;
    if (!this._card) {
      root.innerHTML = `<style>${STYLE}</style>`;
      this._card = document.createElement("ha-card");
      this._head = this._el("div", "head-box");
      this._top = this._el("div", "top");
      this._extra = this._el("div", "extra");
      this._card.append(this._head, this._top, this._extra);
      root.append(this._card);
    }
    this._card.classList.toggle("zoomed", this._zoomed);
    const found = findEntities(this._hass);
    // The illustrated header spans the card edge to edge, above the padded content; the classic one is in it.
    const banner = this._illustrated();
    const place = (header, content) => {
      this._head.replaceChildren(...(banner ? [header] : []));
      this._top.replaceChildren(...(banner ? [] : [header]), ...content);
      this._fitPill();
    };
    if (this._hass && !found.alerts) {
      place(this._header(null), [this._el("div", "empty", this._t("not_loaded"))]);
      this._showActivity(false);
      return;
    }
    const alerts = this._alerts();
    const children = [];
    if (this._zoomed) {
      children.push(this._section("alerts_title", this._alertList(alerts, alerts.length, true), "mdi:bell-alert-outline"));
      const rooms = this._rooms();
      if (rooms.length) children.push(this._section("rooms", this._roomGrid(rooms), "mdi:home-outline"));
      children.push(this._switches(found));
    } else {
      const shown = Math.max(0, this._config.alerts ?? 3);
      if (alerts.length && shown) children.push(this._alertList(alerts, shown, false));
      children.push(this._switches(found));
    }
    place(this._header(alerts), children);
    this._showActivity(this._zoomed && this._config.activity > 0);
    if (focusZoom) root.querySelector(".zoom")?.focus({ preventScroll: true });
    else if (focusSwitch) root.querySelector(`[data-key="${focusSwitch}"]`)?.focus({ preventScroll: true });
  }

  /** The latest activity, in the full card: the activity card, kept across renders (one subscription). */
  _showActivity(show) {
    if (!show) {
      this._extra.replaceChildren();
      return;
    }
    if (!this._activity) {
      // Defined by the module imported above.
      this._activity = document.createElement("smart-comfort-activity-card");
      // Its ha-card blends into this one: no second background, border or shadow.
      for (const [name, value] of [["--ha-card-background", "transparent"], ["--ha-card-box-shadow", "none"], ["--ha-card-border-width", "0"]]) {
        this._activity.style.setProperty(name, value);
      }
      this._activity.setConfig(this._activityConfig());
      if (this._hass) this._activity.hass = this._hass;
    }
    if (!this._extra.contains(this._activity)) {
      this._extra.replaceChildren(this._sectionTitle("activity", "mdi:history"), this._activity);
    }
  }

  /**
   * Header like the other cards: a round badge whose icon colour is the status, the title and the status. Illustrated
   * (the default): over the room's wall, the illustration of the state at the right, a parquet strip at the bottom,
   * the zoom button in the corner. Classic (`illustration: false`): the status pill and the zoom button at the right.
   */
  _header(alerts) {
    const rooms = findEntities(this._hass).rooms.map((id) => this._state(id));
    const mood = comfortMood(alerts, rooms);
    const badge = this._el("span", `hbadge ${mood.level}`);
    badge.append(this._icon("mdi:home-thermometer"));
    const titles = this._el("div", "titles");
    const row = this._el("div", "trow");
    row.append(this._el("div", "hname", this._config.title || this._t("title")));
    titles.append(row);
    if (alerts) {
      // The status pill right after the title, in the icon's colour; the subtitle keeps the outdoor temperature.
      const outdoor = this._state(findEntities(this._hass).alerts)?.attributes?.outdoor_temperature;
      const status = alerts.length ? this._count(alerts.length) : this._t("all_good");
      row.append(statusPill(mood.level, status));
      if (outdoor !== null && outdoor !== undefined) {
        const sub = this._el("div", "hsub", this._t("outside", { value: this._temp(outdoor) }));
        sub.title = sub.textContent;
        titles.append(sub);
      }
    }
    const zoom = !this.constructor.FULL && this._config.zoom !== false ? this._zoomButton() : null;
    if (!this._illustrated()) {
      const header = this._el("div", "header");
      header.append(badge, titles, ...(zoom ? [zoom] : []));
      return header;
    }
    const header = this._el("div", `header banner ${mood.scene}${this._night() ? " night" : ""}`);
    const scene = this._el("div", "scene");
    scene.innerHTML = comfortScene(mood.scene, mood.level, this._night());
    const head = this._el("div", "head");
    head.append(badge, titles);
    header.append(scene, this._el("div", "ground"), head, ...(zoom ? [zoom] : []));
    return header;
  }

  // The status pill goes on the title row, right after the title, only when the whole title and the pill's whole
  // label fit there; otherwise it takes its own line under the subtitle (the subtitle then on one line). In the
  // banner, when title, subtitle and pill still do not fit above the ground strip (or the pill's label runs past the
  // text, over the picture), the pill keeps its dot only.
  // Measured after each render and on every new width (or once the web font is loaded), never by a fixed width.
  _fitPill() {
    fitPill(this.shadowRoot);
  }

  _watchPill() {
    if (typeof ResizeObserver !== "function") return;
    this._pillResize ??= new ResizeObserver((entries) => {
      const w = Math.round(entries.at(-1).contentRect.width);
      if (w === this._pillWidth) return;
      this._pillWidth = w;
      cancelAnimationFrame(this._pillFrame);
      this._pillFrame = requestAnimationFrame(() => this._fitPill());
    });
    this._pillResize.observe(this);
    document.fonts?.ready?.then(() => this._fitPill());
  }

  _unwatchPill() {
    this._pillResize?.disconnect();
    this._pillWidth = null;
  }

  _zoomButton() {
    const label = this._t(this._zoomed ? "zoom_out" : "zoom_in");
    const button = this._el("button", "zoom");
    button.title = label;
    button.setAttribute("aria-label", label);
    button.setAttribute("aria-expanded", String(this._zoomed));
    button.append(this._icon(this._zoomed ? "mdi:arrow-collapse" : "mdi:arrow-expand"));
    button.addEventListener("click", (ev) => {
      ev.stopPropagation();
      this._setZoom(!this._zoomed);
    });
    return button;
  }

  _section(titleKey, content, icon) {
    const section = this._el("div", "section");
    section.append(this._sectionTitle(titleKey, icon), content);
    return section;
  }

  /** A section's title, like the other cards': its icon, then the name in small capitals. */
  _sectionTitle(titleKey, icon) {
    const title = this._el("div", "section-title");
    title.append(this._icon(icon), this._el("span", "", this._t(titleKey)));
    return title;
  }

  /** The alerts, the first `max` of them (and how many more); in the full card, with since when and their state. */
  _alertList(alerts, max, full) {
    const list = this._el("div", "alerts");
    if (!alerts.length) {
      list.append(this._el("div", "empty", this._t("no_alerts")));
      return list;
    }
    const rooms = findEntities(this._hass).rooms;
    for (const alert of alerts.slice(0, max)) {
      const quiet = alert.snoozed || alert.handled;
      const row = this._el("div", `alert${quiet ? " quiet" : ""}`);
      const badge = this._el("span", "abadge");
      badge.append(this._icon(KIND_ICONS[alert.kind] || "mdi:alert-circle-outline"));
      const main = this._el("div", "amain");
      main.append(this._el("div", "awhat", `${alert.room_name} — ${this._kind(alert.kind)}`));
      if (full) {
        const meta = [alert.since ? this._t("since", { time: this._time(alert.since) }) : null];
        if (alert.snoozed) meta.push(this._t("snoozed"));
        if (alert.handled) meta.push(this._t("handled"));
        if (alert.acknowledged) meta.push(this._t("acknowledged"));
        main.append(this._el("div", "ameta", meta.filter(Boolean).join(" · ")));
      }
      row.append(badge, main, this._el("span", "avalue", this._value(alert)));
      const sensor = rooms.find((id) => roomName(this._state(id)) === alert.room_name);
      if (sensor) this._clickable(row, sensor);
      list.append(row);
    }
    if (alerts.length > max) list.append(this._el("div", "more", `+${this._number(alerts.length - max, 0)}`));
    return list;
  }

  /** The rooms: their temperature (else humidity, else CO₂, else PM2.5) and their worst alert. */
  _roomGrid(ids) {
    const grid = this._el("div", "rooms");
    for (const id of ids) {
      const state = this._state(id);
      const a = state.attributes || {};
      const alert = state.state !== "ok" && KIND_ICONS[state.state];
      const tile = this._el("div", `room${alert ? " alerting" : ""}`);
      tile.append(this._el("div", "rname", roomName(state)));
      let main = null;
      if (a.temperature !== null && a.temperature !== undefined) main = this._temp(a.temperature);
      const extras = [];
      if (a.humidity !== null && a.humidity !== undefined) extras.push(`${this._number(a.humidity, 0)}${NBSP}%`);
      if (a.co2 !== null && a.co2 !== undefined) extras.push(`${this._number(a.co2, 0)}${NBSP}ppm`);
      if (a.pm25 !== null && a.pm25 !== undefined) extras.push(`${this._number(a.pm25, 0)}${NBSP}µg/m³`);
      if (!main && extras.length) main = extras.shift();
      tile.append(this._el("div", "rvalue", main ?? "–"));
      const line = this._el("div", "rstate");
      if (alert) {
        line.append(this._icon(KIND_ICONS[state.state]), this._el("span", "", this._kind(state.state)));
      } else if (extras.length) {
        line.textContent = extras.join(" · ");
      } else {
        line.append(this._icon("mdi:check-circle-outline"), this._el("span", "", this._t("all_good")));
        line.classList.add("ok");
      }
      tile.append(line);
      this._clickable(tile, id);
      grid.append(tile);
    }
    return grid;
  }

  /** The switches of the integration: tinted when on, a tap turns them on or off. */
  _switches(found) {
    const row = this._el("div", "switches");
    for (const [key, iconOn, iconOff] of SWITCHES) {
      const id = found.switches[key];
      const state = this._state(id);
      if (!state) continue;
      const on = state.state === "on";
      const name = this._t(`sw_${key}`);
      // Device control on with a family left alone (air conditioners…): partial, the families named in the title.
      const alone =
        key === "control" && on
          ? Object.entries(found.families)
              .filter(([, familyId]) => this._state(familyId)?.state === "off")
              .map(([family]) => this._t(`fam_${family}`))
          : [];
      const button = this._el("button", `switch${on ? " on" : ""}${alone.length ? " part" : ""}`);
      button.dataset.key = `switch:${key}`;
      button.title = alone.length
        ? `${name} — ${this._t("sw_partial", { families: alone.join(", ") })}`
        : `${name} — ${this._t(on ? "on" : "off")}`;
      button.setAttribute("aria-pressed", String(on));
      button.setAttribute("aria-label", name);
      button.disabled = state.state === "unavailable";
      button.append(this._icon(on ? iconOn : iconOff), this._el("span", "slabel", name));
      button.addEventListener("click", (ev) => {
        ev.stopPropagation();
        this._hass.callService("switch", on ? "turn_off" : "turn_on", { entity_id: id });
      });
      row.append(button);
    }
    return row;
  }

  /** Opens the more-info dialog of `entityId` on a click, Enter or Space. */
  _clickable(node, entityId) {
    node.classList.add("clickable");
    node.setAttribute("role", "button");
    node.setAttribute("tabindex", "0");
    const open = () => {
      const event = new Event("hass-more-info", { bubbles: true, composed: true });
      event.detail = { entityId };
      this.dispatchEvent(event);
    };
    node.addEventListener("click", open);
    node.addEventListener("keydown", (ev) => {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      ev.preventDefault();
      open();
    });
  }

  _icon(name) {
    const icon = document.createElement("ha-icon");
    icon.icon = name;
    return icon;
  }

  _el(tag, cls, text) {
    return el(tag, cls, text);
  }
}
