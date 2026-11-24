import { pickerDefine } from "./card-picker.js";
import { STRINGS } from "./i18n/strings.js";

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


// The activity card's module, the very one of the dashboard resource (same version): its helpers, and the
// activity card shown in the full card.
export const { languageOf, el, HEADER_STYLE, BANNER_STYLE, TITLE_STYLE, fitPill, statusPill, DOMAIN, SWITCHES, findEntities, comfortMood, comfortScene } = await import(
  new URL(`smart-comfort-activity-card.js${new URL(import.meta.url).search}`, import.meta.url).href
);
export const { resolve: resolvedLanguage, stringsFor, intlLocale, translate } = languageOf(STRINGS);

export const KIND_ICONS = {
  too_hot: "mdi:thermometer-high",
  too_cold: "mdi:thermometer-low",
  ventilate: "mdi:window-open-variant",
  close_windows: "mdi:window-closed-variant",
  window_open_cold: "mdi:snowflake",
  co2_high: "mdi:molecule-co2",
  polluted_air: "mdi:blur",
  humidity_high: "mdi:water-percent",
  noise_high: "mdi:volume-high",
  noisy_outside: "mdi:ear-hearing",
  bad_air_outside: "mdi:air-filter",
};
export const NBSP = " ";

// A click inside a dialog (more-info opened from the card, say) is not a click outside the card.
export const inDialog = (ev) => ev.composedPath().some((n) => ["ha-more-info-dialog", "ha-dialog", "dialog"].includes(n.localName));

// A click or tap outside of the card, and not in a Home Assistant dialog opened from it.
export const isOutside = (card, ev) => !ev.composedPath().includes(card) && !inDialog(ev);

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app)
// a tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to
// the page. It counts when the press and the release are both outside the card (a slider dragged out of the card
// does not fold it), and a scroll does not count (the browser cancels the pointer). Keyboard clicks still go through
// the click event.
export const watchOutside = (card, handler) => {
  let downOutside = false;
  const onDown = (ev) => {
    downOutside = isOutside(card, ev);
  };
  const onUp = (ev) => {
    if (downOutside && isOutside(card, ev)) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0 && isOutside(card, ev)) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    // A tap (press and release at the same spot), for the tests.
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
  };
};

// No rewrite of the card between a press and its click: Home Assistant updates the card several times a second, and a
// rewrite under the pointer replaces the element pressed, so that the click lands on the card itself and does nothing
// (a button or a row that does not react). While a press is in progress (`_pressing`), a render is left pending
// (`_dirty`): it is done at the click, or right after the release when no click follows (a drag, a scroll).
// `_byPointer` tells a mouse or touch use from the keyboard: after a rewrite, the focus is put back only for the
// keyboard (no focus ring after a click), and always in a text field.
export const holdUnderPress = (card, render) => {
  const root = card.shadowRoot;
  card._onPressEnd = () => {
    window.removeEventListener?.("pointerup", card._onPressEnd, true);
    window.removeEventListener?.("pointercancel", card._onPressEnd, true);
    setTimeout(() => card._endPress(), 0);
  };
  card._endPress = () => {
    card._pressing = false;
    if (!card._dirty) return;
    card._dirty = false;
    render();
  };
  // Left in the middle of a press (see disconnectedCallback).
  card._dropPress = () => {
    card._pressing = false;
    card._dirty = false;
    window.removeEventListener?.("pointerup", card._onPressEnd, true);
    window.removeEventListener?.("pointercancel", card._onPressEnd, true);
  };
  root.addEventListener?.("pointerdown", () => {
    card._byPointer = true;
    card._pressing = true;
    window.addEventListener?.("pointerup", card._onPressEnd, true);
    window.addEventListener?.("pointercancel", card._onPressEnd, true);
  });
  root.addEventListener?.("keydown", () => {
    card._byPointer = false;
  });
  // At the click (capture: before the card acts on it) the press is over, and what the click changes is drawn at once.
  card._pressClick = (ev) => {
    card._pressing = false;
    if (ev.detail === 0) card._byPointer = false;
  };
  root.addEventListener?.("click", card._pressClick, true);
};

// Whether the focus goes back to `el` after a rewrite (see holdUnderPress).
export const keepsFocus = (card, el) => !card._byPointer || typeof el?.selectionStart === "number";

/** The entities of Smart Comfort in the entity registry: the alerts sensor, the room sensors, the switches. */

/** The name of the room of a room sensor: its `room_name` attribute (set by the integration). */
export const roomName = (state) => state?.attributes?.room_name ?? state?.attributes?.friendly_name ?? state?.entity_id;


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


export const STYLE = `
  :host { display: block; }
  ha-card { container: sc-card / inline-size; overflow: hidden; }
  .top { padding: 16px; display: flex; flex-direction: column; gap: 14px; }
  .header { display: flex; align-items: center; gap: 10px; }
  ${HEADER_STYLE}
  ${TITLE_STYLE}

  ${BANNER_STYLE}
  .zoom { all: unset; flex: none; align-self: flex-start; cursor: pointer; width: 24px; height: 24px; margin: -2px -4px 0 0;
    border-radius: 50%; display: grid; place-items: center; color: var(--secondary-text-color); --mdc-icon-size: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--secondary-text-color) 16%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }
  .empty { color: var(--secondary-text-color); font-size: 14px; }
  .section { display: flex; flex-direction: column; gap: 8px; }
  /* Section titles like the other cards': a 16 px icon, the name in small capitals. */
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; line-height: 16px; text-transform: uppercase;
    letter-spacing: .04em; color: var(--secondary-text-color); --mdc-icon-size: 16px; }
  .section-title ha-icon { flex: none; }
  .alerts { display: flex; flex-direction: column; }
  .alert { display: grid; grid-template-columns: 40px minmax(0, 1fr) auto; align-items: center; column-gap: 12px; padding: 8px 0;
    border-bottom: 1px solid var(--divider-color); }
  .alert:last-child { border-bottom: none; }
  .abadge { --c: var(--warning-color, #ffa600); flex: none; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center;
    background: color-mix(in srgb, var(--c) 16%, transparent); color: var(--c); --mdc-icon-size: 20px; }
  .alert.quiet .abadge { --c: var(--secondary-text-color); }
  .amain { min-width: 0; }
  .awhat { font-size: 14px; line-height: 20px; overflow-wrap: anywhere; }
  .ameta { font-size: 12px; color: var(--secondary-text-color); overflow-wrap: anywhere; }
  .avalue { flex: none; font-size: 13px; color: var(--secondary-text-color); white-space: nowrap; font-variant-numeric: tabular-nums; }
  .more { font-size: 12px; color: var(--secondary-text-color); padding-top: 4px; }
  .rooms { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px; }
  /* Room tiles on the secondary background, like the other cards' tiles; a room with an alert tinted. */
  .room { border-radius: 12px; padding: 8px 10px; min-width: 0; background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .room.alerting { background: color-mix(in srgb, var(--warning-color, #ffa600) 14%, var(--secondary-background-color, transparent)); }
  .rname { font-size: 13px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .rvalue { font-size: 18px; font-weight: 500; line-height: 24px; font-variant-numeric: tabular-nums; }
  .rstate { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--secondary-text-color); --mdc-icon-size: 14px;
    min-width: 0; overflow: hidden; }
  .rstate span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .room.alerting .rstate { color: color-mix(in srgb, var(--warning-color, #ffa600) 70%, var(--primary-text-color)); }
  .rstate.ok { color: color-mix(in srgb, var(--success-color, #43a047) 70%, var(--primary-text-color)); }
  .clickable { cursor: pointer; }
  .alert.clickable { border-radius: 8px; }
  .clickable:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  .switches { display: flex; flex-wrap: wrap; gap: 8px; }
  /* Not filled: tinted with an accent icon when on, outlined when off. */
  .switch { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-radius: 16px; cursor: pointer;
    border: 1px solid var(--divider-color); background: none; color: var(--secondary-text-color); font: inherit; font-size: 13px;
    --mdc-icon-size: 18px; min-width: 0; }
  .switch.on { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12); border-color: var(--primary-color);
    color: color-mix(in srgb, var(--primary-color) 60%, var(--primary-text-color)); }
  .switch.on ha-icon { color: var(--primary-color); }
  .switch.on.part { background: color-mix(in srgb, #f5a623 14%, transparent); border-color: #f5a623; }
  .switch.on.part ha-icon { color: #f5a623; }
  .switch:disabled { opacity: 0.5; cursor: default; }
  .switch:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  .slabel { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .extra:empty { display: none; }
  .extra { display: flex; flex-direction: column; border-top: 1px solid var(--divider-color); }
  .extra > .section-title { padding: 16px 16px 0; }
  /* Narrow card: the reading of an alert goes under its text. */
  @container (max-width: 360px) {
    .alert { grid-template-columns: 40px minmax(0, 1fr); }
    .abadge { grid-row: span 2; align-self: start; margin-top: 0; }
    .avalue { grid-column: 2; white-space: normal; }
  }
  /* Narrow mini card (6 columns on a phone): the switches keep their icon only (their name stays in the tooltip). */
  @container (max-width: 300px) {
    .switch { padding: 0; width: 32px; justify-content: center; }
    .slabel { display: none; }
  }
`;

/**
 * The full card: what the mini card shows once switched to its full view — every alert, a tile per room,
 * the switches, the latest activity — always, with no compact view and no button to fold it.
 *
 * type: custom:smart-comfort-card
 * title: Smart Comfort      # optional
 * rooms: [Living room]      # optional: only these rooms
 * activity: 5               # activity entries (5 by default, 0 for none)
 */
export class SmartComfortCard extends SmartComfortMiniCard {
  static FULL = true;

  // The options of the mini card but the compact view's (alerts listed, zoom button).
  static getConfigForm() {
    const form = SmartComfortMiniCard.getConfigForm();
    return { ...form, schema: form.schema.filter((field) => field.name !== "alerts" && field.name !== "zoom") };
  }

  constructor() {
    super();
    this._zoomed = true;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  // Never folded (the click outside the card does nothing).
  _setZoom() {}
}

if (!customElements.get("smart-comfort-card")) {
  pickerDefine("smart-comfort-card", SmartComfortCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "smart-comfort-card",
    name: "Smart Comfort",
    description: "Every alert of Smart Comfort, a tile per room, its switches and its latest activity.",
    preview: true,
  });
}

if (!customElements.get("smart-comfort-mini-card")) {
  pickerDefine("smart-comfort-mini-card", SmartComfortMiniCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "smart-comfort-mini-card",
    name: "Smart Comfort mini",
    description: "The alerts of the moment and the switches of Smart Comfort; its button opens the full card.",
    preview: true,
  });
}
