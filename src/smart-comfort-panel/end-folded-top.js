// ── End of the folded top bar ──
import { ACTIVITY_GROUPS, ACTIVITY_ICONS, ACTIVITY_MAX, DOMAIN, KIND_ICONS, ROOM_ICONS, SCORE_PENALTY, TABS, UNITS, intlLocale, stringsFor, unitOf } from "./core.js";
import { EQUIPMENT, LEVEL_KEYS, OLD_TABS, SENSOR_KEYS, WEEKDAYS, activityGroup, asList, bool, changedPaths, clone, diff, entity, grid, isEmpty, lightingLevels, loadHaForm, merged, minutes, minutesOf, num, pathValue, percent, prune, schemaKeys, shifted, text, time, toYaml } from "./core-2.js";
import { smartComfortPanelFold } from "./folded-top-bar.js";
import { SCB_ICONS, STYLE, scbBanner } from "./illustrated-header.js";
import { STRINGS } from "./i18n/strings.js";

export class SmartComfortPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._tab = "overview";
    this._config = null; // smart_comfort/config result
    this._draft = null; // options being edited
    this._status = undefined; // undefined: not received yet, null: not loaded
    this._labels = {};
    this._selector = {};
    this._forms = [];
    this._message = null;
    this._saving = false;
    this._expanded = new Set();
    this._expandedOutdoors = new Set();
    // Open sections ("room index:section", "alert:kind") and fields shown before they have a value.
    this._openSections = new Set();
    this._shown = new Set();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    for (const form of this._forms) form.hass = hass;
    if (first) this._init();
  }

  get hass() {
    return this._hass;
  }

  /** /smart-comfort/<tab> opens that tab. */
  set route(route) {
    const path = (route?.path || "").split("/").filter(Boolean)[0];
    const tab = OLD_TABS[path] || path;
    if (TABS.includes(tab) && tab !== this._tab) {
      this._tab = tab;
      if (this._config !== null || this._error) this._render();
    }
  }

  set narrow(narrow) {
    this._narrow = narrow;
    if (this._menu) this._menu.narrow = narrow;
  }

  connectedCallback() {
    this._upgradeProperties();
    if (!this._fold && this.shadowRoot?.querySelector?.(".topbar")) this._attachFold();
    if (this._hass && !this._unsub) this._subscribe();
    this._watchConnection(true);
    // Back on the panel after a failed load: try again now.
    if (this._hass && this._failed) this._reload();
    // The popovers of the overview (device control, + N OK) close at a click elsewhere.
    this._closePopovers ??= (ev) => {
      const path = ev.composedPath();
      for (const menu of this.shadowRoot?.querySelectorAll?.("details.more[open]") || []) {
        if (path.includes(menu)) continue;
        menu.open = false;
        if (menu.classList.contains("ctl")) this._controlOpen = false;
      }
    };
    this.shadowRoot?.addEventListener?.("click", this._closePopovers, true);
  }

  // Home Assistant creates the panel as soon as its file has run and sets narrow, route and hass right away. In the
  // release, the element is only defined once the page's language file is in (scripts/i18n-split.mjs): the values
  // set before land as plain properties on the not-yet-defined element and hide the setters, so the panel stayed
  // empty on its first opening. They are passed through the setters now (narrow and route before hass, which draws).
  _upgradeProperties() {
    for (const name of ["narrow", "route", "hass"]) {
      if (!Object.hasOwn(this, name)) continue;
      const value = this[name];
      delete this[name];
      this[name] = value;
    }
  }

  disconnectedCallback() {
    this.shadowRoot?.removeEventListener?.("click", this._closePopovers, true);
    this._controlOpen = false;
    this._watchConnection(false);
    this._fold?.detach();
    this._fold = null;
    clearTimeout(this._retryTimer);
    this._stopActivity();
    if (this._unsub) {
      this._unsub.then((unsub) => unsub()).catch(() => {});
      this._unsub = null;
    }
  }

  // The connection back (Home Assistant restarted, the app resumed): load again, the data may have changed meanwhile.
  _watchConnection(on) {
    const connection = this._hass?.connection;
    if (!connection?.addEventListener) return;
    // Unsaved edits are kept: only a failed load is redone then.
    this._onReady ||= () => {
      if (this._failed || !this._dirty) this._reload();
    };
    connection.removeEventListener("ready", this._onReady);
    if (on) connection.addEventListener("ready", this._onReady);
  }

  // A load that failed (Home Assistant still starting, the connection dropped) is tried again after 2 s, 5 s, 15 s,
  // then every 30 s while the panel is shown, instead of leaving it empty.
  _retry(failed) {
    clearTimeout(this._retryTimer);
    this._failed = failed;
    if (!failed) {
      this._retries = 0;
      return;
    }
    const delay = [2000, 5000, 15000, 30000][Math.min(this._retries || 0, 3)];
    this._retries = (this._retries || 0) + 1;
    this._retryTimer = setTimeout(() => {
      if (this.isConnected) this._reload();
    }, delay);
  }

  _reload() {
    this._load().then(() => this._subscribe());
  }

  // Strings.

  _t(key, values = {}) {
    let s = stringsFor(this._hass?.language)[key] ?? STRINGS.en[key] ?? key;
    for (const [k, v] of Object.entries(values)) s = s.replace(`{${k}}`, v);
    return s;
  }

  _label(step, name, section) {
    const base = `component.${DOMAIN}.options.step.${step}`;
    const r = this._labels || {};
    return (
      (section && r[`${base}.sections.${section}.data.${name}`]) || r[`${base}.data.${name}`] || name
    );
  }

  _helper(step, name, section) {
    const base = `component.${DOMAIN}.options.step.${step}`;
    const r = this._labels || {};
    return (section && r[`${base}.sections.${section}.data_description.${name}`]) || r[`${base}.data_description.${name}`];
  }

  _sectionTitle(step, section) {
    return this._labels?.[`component.${DOMAIN}.options.step.${step}.sections.${section}.name`] || section;
  }

  _kindName(kind) {
    return this._selector?.[`component.${DOMAIN}.selector.kind.options.${kind}`] || kind;
  }

  _options(selector, values) {
    return values.map((value) => ({
      value,
      label: this._selector?.[`component.${DOMAIN}.selector.${selector}.options.${value}`] || value,
    }));
  }

  // Data.

  async _init() {
    // The toolbar and tabs right away, whatever answers next.
    this._render();
    this._watchConnection(this.isConnected);
    const language = this._hass.language || "en";
    const get = (category) =>
      this._hass
        .callWS({ type: "frontend/get_translations", language, category, integration: [DOMAIN] })
        .then((r) => r?.resources || {})
        .catch(() => ({}));
    // ha-form (lazy-loaded by Home Assistant) only draws the settings forms: no waiting for it, they are drawn
    // again once it is there. Waiting held the whole panel empty until another page had loaded it.
    if (!customElements.get("ha-form")) {
      loadHaForm().catch(() => {});
      customElements.whenDefined("ha-form").then(() => {
        if (this._config) this._renderTab();
      });
    }
    // The settings are requested alongside the translations, not after them: labels fall back to the field
    // names until the translations are in, then the panel is drawn again.
    const translations = Promise.all([get("options"), get("selector")]).then(([labels, selector]) => {
      this._labels = labels;
      this._selector = selector;
      if (this._config) this._render();
    });
    await Promise.all([this._load().then(() => this._subscribe()), translations]);
  }

  async _load() {
    try {
      this._config = await this._hass.callWS({ type: `${DOMAIN}/config` });
      this._draft = clone(this._config.options);
      this._error = null;
      this._retry(false);
    } catch (err) {
      this._config = null;
      this._error = err.code === "not_found" ? this._t("not_setup") : err.message;
      // Not set up stays so; anything else (still starting, connection lost) is tried again.
      this._retry(err.code !== "not_found");
    }
    this._render();
  }

  _subscribe() {
    if (this._unsub || !this._hass) return;
    this._unsub = this._hass.connection.subscribeMessage(
      (msg) => {
        this._status = msg.status;
        // The options changed elsewhere (the file, the YAML, another window): load them, unless edits are pending.
        if (msg.revision && this._config && msg.revision !== this._config.revision && !this._dirty && !this._saving) {
          this._reload();
          return;
        }
        if (this._tab === "overview") this._renderTab();
        else this._renderHead();
      },
      { type: `${DOMAIN}/subscribe` }
    );
    this._unsub.catch(() => {
      this._unsub = null;
    });
  }

  get _dirty() {
    if (!this._config) return false;
    return JSON.stringify(prune(this._draft)) !== JSON.stringify(prune(this._config.options));
  }

  async _save(force = false) {
    this._saving = true;
    this._message = null;
    this._renderToolbar();
    try {
      const result = await this._hass.callWS({
        type: `${DOMAIN}/config/save`,
        options: prune(this._draft),
        revision: this._config.revision,
        force,
      });
      if (result.conflict) {
        // Changed meanwhile (the file, the YAML, another window): both shown, the user chooses.
        this._conflict = { ...result.conflict, base: this._config.options };
        this._saving = false;
        this._render();
        return;
      }
      this._conflict = null;
      this._config.options = result.options;
      this._config.revision = result.revision;
      this._draft = clone(result.options);
      window.dispatchEvent(new CustomEvent("smart-comfort-header", { detail: { hide_header: result.options.hide_header || "off" } }));
      this._message = { type: "success", text: this._t("saved") };
      this._discovered = null;
    } catch (err) {
      this._message = { type: "error", text: err.message };
    }
    this._saving = false;
    this._render();
  }

  _discard() {
    this._draft = clone(this._config.options);
    this._discovered = null;
    this._message = null;
    this._render();
  }

  _changed() {
    this._renderToolbar();
  }

  // Rendering.

  /** The top bar folds on scroll into one bar with the tabs as icon pills (see smartComfortPanelFold). */
  _attachFold() {
    this._fold?.detach();
    this._fold = smartComfortPanelFold(this, {
      top: ".topbar",
      tabs: ".tabs",
      tab: ".tab",
      key: (b) => b.dataset.tab,
      icons: SCB_ICONS,
      badge: ".cnt",
      name: ".topbar .shtitle",
      sub: ".topbar .shsub",
      icon: ".topbar .shbadge",
      status: ".topbar .shpill",
      acts: ".topbar .hacts > *",
      accent: "#26a69a",
      menu: () => ({ hass: this._hass, narrow: this._narrow, show: true }),
    });
  }

  _render() {
    const root = this.shadowRoot;
    // The top bar is the living room across the page (as on the ENT ONE panel); the tabs under it. The unsaved
    // changes get a bar of their own under the content, sticky at the bottom so it stays in reach (as on System Hub).
    root.innerHTML = `<style>${STYLE}</style>
      <div class="topbar"></div>
      <div class="tabs"><span class="tabmenu"></span><div class="tablist" role="tablist"></div></div>
      <div class="content"></div>
      <div class="savebar" role="region" hidden></div>`;
    const menu = document.createElement("ha-menu-button");
    menu.hass = this._hass;
    menu.narrow = this._narrow;
    this._menu = menu;
    const tabs = root.querySelector(".tablist");
    for (const tab of TABS) {
      const b = document.createElement("button");
      b.className = `tab${tab === this._tab ? " active" : ""}`;
      b.dataset.tab = tab;
      b.setAttribute("role", "tab");
      b.textContent = this._t(tab);
      b.addEventListener("click", () => this._goTab(tab));
      tabs.append(b);
    }
    this._renderHead();
    this._renderToolbar();
    this._renderTab();
    this._attachFold();
  }

  /** Whether the panel's top bar is hidden for this user: the dashboards' "Hide the top bar" option applies here too. */
  _bare() {
    const mode = this._config?.options?.hide_header || "off";
    return mode === "everyone" || (mode === "non_admins" && this._hass?.user?.is_admin === false);
  }

  /**
   * The top bar: Smart Comfort, the points to watch as a pill, the comfort score, the outdoor temperature and the
   * quiet night under it, the living room picturing the worst state; Notify now and the integration as round buttons.
   * Hidden (option): the tabs alone, the menu button in front of them. The menu button is kept across redraws.
   */
  _renderHead() {
    const root = this.shadowRoot;
    const bar = root?.querySelector?.(".topbar");
    if (!bar) return;
    const bare = this._bare();
    this.toggleAttribute("bare", bare);
    const menu = this._menu;
    if (bare) {
      bar.replaceChildren();
      if (menu) root.querySelector(".tabmenu")?.append(menu);
    } else {
      const banner = scbBanner(this, "overview", { head: true });
      const slot = banner.querySelector(".shhead");
      const hmenu = this._el("span", "hmenu");
      if (menu) hmenu.append(menu);
      slot?.prepend(hmenu);
      const acts = this._el("div", "hacts");
      if (this._status) {
        const notify = this._iconButton("mdi:bell-ring-outline", this._t("notify_now"), () => this._service("notify_now"));
        acts.append(notify);
      }
      const cog = document.createElement("a");
      cog.href = `/config/integrations/integration/${DOMAIN}`;
      cog.className = "icon-btn";
      cog.title = this._t("settings");
      cog.setAttribute("aria-label", this._t("settings"));
      const ci = document.createElement("ha-icon");
      ci.icon = "mdi:cog";
      cog.append(ci);
      acts.append(cog);
      banner.append(acts);
      bar.replaceChildren(banner);
    }
    // The active alerts on the Alerts tab, like the sidebar badge
    const points = this._status ? this._comfort(this._status).points : 0;
    const alertsTab = root.querySelector('.tab[data-tab="alerts"]');
    if (alertsTab) alertsTab.innerHTML = `${this._t("alerts").replace(/[&<>"]/g, (ch) => `&#${ch.charCodeAt(0)};`)}${points ? `<span class="cnt">${points}</span>` : ""}`;
  }

  _renderToolbar() {
    const actions = this.shadowRoot.querySelector(".savebar");
    if (!actions) return;
    actions.innerHTML = "";
    actions.hidden = !this._dirty;
    actions.setAttribute("aria-label", this._t("unsaved"));
    if (this._dirty) {
      const note = document.createElement("span");
      note.className = "dirty";
      note.textContent = this._t("unsaved");
      actions.append(note, this._button(this._t("discard"), () => this._discard()));
      const save = this._button(this._saving ? this._t("saving") : this._t("save"), () => this._save(), "primary");
      save.disabled = this._saving;
      actions.append(save);
    }
  }

  _button(label, onClick, kind = "") {
    const b = document.createElement("button");
    b.className = `btn ${kind}`;
    b.textContent = label;
    b.addEventListener("click", onClick);
    return b;
  }

  _iconButton(icon, label, onClick) {
    const b = document.createElement("button");
    b.className = "icon-btn";
    b.title = label;
    b.setAttribute("aria-label", label);
    const i = document.createElement("ha-icon");
    i.icon = icon;
    b.append(i);
    b.addEventListener("click", onClick);
    return b;
  }

  _el(tag, cls, content) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (content !== undefined) e.textContent = content;
    return e;
  }

  _card(title, icon) {
    const card = this._el("div", "card");
    if (title) {
      const h = this._el("div", "card-header");
      if (icon) {
        const i = document.createElement("ha-icon");
        i.icon = icon;
        h.append(i);
      }
      h.append(this._el("span", "", title));
      card.append(h);
    }
    return card;
  }

  _form(schema, data, onChange, label, helper) {
    const form = document.createElement("ha-form");
    form.hass = this._hass;
    form.schema = schema;
    form.data = data;
    form.computeLabel = label;
    if (helper) form.computeHelper = helper;
    form.addEventListener("value-changed", (ev) => {
      ev.stopPropagation();
      const value = ev.detail.value;
      form.data = value;
      onChange(value);
      this._changed();
    });
    this._forms.push(form);
    return form;
  }

  _renderTab() {
    const content = this.shadowRoot.querySelector(".content");
    if (!content) return;
    content.innerHTML = "";
    this._forms = [];
    this._activityList = null;
    if (this._message) {
      content.append(this._el("div", `banner ${this._message.type}`, this._message.text));
    }
    if (!this._config) {
      // Loading: a quiet "…"; a failed load (not "not set up"): its error and Retry, tried again on its own meanwhile.
      const banner = this._el("div", this._error ? "banner error" : "banner", this._error || "…");
      if (this._error && this._failed) {
        const retry = this._el("button", "retry", this._t("retry"));
        retry.addEventListener("click", () => this._reload());
        banner.append(" ", retry);
      }
      content.append(banner);
      return;
    }
    const render = {
      overview: () => this._renderOverview(content),
      rooms: () => this._renderRooms(content),
      outdoors: () => this._renderOutdoors(content),
      alerts: () => this._renderAlerts(content),
      schedule: () => this._renderSchedule(content),
      settings: () => this._renderSettings(content),
      yaml_tab: () => this._renderYaml(content),
      activity: () => this._renderActivity(content),
    }[this._tab];
    this._renderHead();
    // The tab's header card: a compact header (the picture is the panel's top bar), then the blocks that open the tab
    // (summary tiles, help, discover); the overview has no header of its own, the top bar is its header.
    const top = this._el("div", "card shtop");
    if (this._tab !== "overview") top.append(scbBanner(this, this._tab, { compact: true }));
    content.append(top);
    if (this._conflict) content.append(this._conflictCard());
    // Settings shows the file in its Source card.
    const banner = this._config.file ? !["overview", "settings"].includes(this._tab) : this._config.yaml && this._tab !== "overview";
    if (banner) content.append(this._yamlBanner());
    render();
    const body = this._el("div", "shbody");
    while (top.nextElementSibling?.matches(".banner.info, .summary, .section-help, .discover, .start")) body.append(top.nextElementSibling);
    if (body.childElementCount) top.append(body);
    if (!top.childElementCount) top.remove();
  }

  /** Everything Smart Comfort did and why, live, by day, with filters: drawn by the panel, not by a card. */
  _renderActivity(content) {
    const card = this._card(this._t("activity"), "mdi:history");
    card.classList.add("activity");
    card.append(this._el("div", "help", this._t("activity_help")));
    const tools = this._el("div", "act-tools");
    const chips = this._el("div", "seg");
    chips.setAttribute("role", "radiogroup");
    for (const group of ["all", ...Object.keys(ACTIVITY_GROUPS)]) {
      const chip = this._el("button", "", this._t(group === "all" ? "a_all" : `a_group_${group}`));
      chip.type = "button";
      chip.setAttribute("role", "radio");
      chip.setAttribute("aria-checked", String(group === (this._activityGroup || "all")));
      chip.addEventListener("click", () => {
        this._activityGroup = group;
        chips.querySelectorAll("button").forEach((b) => {
          b.setAttribute("aria-checked", String(b === chip));
        });
        this._drawActivity();
      });
      chips.append(chip);
    }
    const rooms = [...new Set((this._config?.options?.rooms || []).map((r) => r.name).filter(Boolean))];
    const select = this._el("select", "act-room");
    select.setAttribute("aria-label", this._t("rooms"));
    for (const [value, label] of [["", this._t("a_all_rooms")], ...rooms.map((r) => [r, r])]) {
      const option = this._el("option", "", label);
      option.value = value;
      option.selected = value === (this._activityRoom || "");
      select.append(option);
    }
    select.addEventListener("change", () => {
      this._activityRoom = select.value;
      this._drawActivity();
    });
    tools.append(chips, select);
    const list = this._el("div", "act-list");
    list.addEventListener("click", (ev) => {
      const row = ev.target.closest?.("[data-entity]");
      if (row) this._moreInfo(row.dataset.entity);
    });
    list.addEventListener("keydown", (ev) => {
      const row = ev.target.closest?.("[data-entity]");
      if (!row || (ev.key !== "Enter" && ev.key !== " ")) return;
      ev.preventDefault();
      this._moreInfo(row.dataset.entity);
    });
    card.append(tools, list);
    content.append(card);
    this._activityList = list;
    this._drawActivity();
    this._startActivity();
  }

  _moreInfo(entityId) {
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  }

  /** The live activity, from its first opening while the panel is shown: the last lines, then each new one. */
  async _startActivity() {
    if (this._activitySub || !this._hass?.connection) return;
    const sub = {};
    this._activitySub = sub;
    try {
      const unsub = await this._hass.connection.subscribeMessage(
        (msg) => {
          if (this._activitySub !== sub) return;
          if (msg.entries) this._activityEntries = msg.entries;
          if (msg.added) this._activityEntries = [...[...msg.added].reverse(), ...(this._activityEntries || [])].slice(0, ACTIVITY_MAX);
          this._drawActivity();
        },
        { type: "smart_comfort/activity", limit: ACTIVITY_MAX }
      );
      if (this._activitySub === sub) sub.unsub = unsub;
      else unsub();
    } catch (_err) {
      if (this._activitySub !== sub) return;
      this._activitySub = null;
      this._activityEntries = null;
      this._activityFailed = true;
      this._drawActivity();
    }
  }

  _stopActivity() {
    this._activitySub?.unsub?.();
    this._activitySub = null;
  }

  /** "Today", "Yesterday", else the date. */
  _activityDay(date) {
    const today = new Date();
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return this._t("a_today");
    if (date.toDateString() === yesterday.toDateString()) return this._t("a_yesterday");
    return date.toLocaleDateString(intlLocale(this._hass), { weekday: "long", day: "numeric", month: "long" });
  }

  /** What happened, in a few words, with its icon and the notification text. */
  _activityText(entry) {
    const data = entry.data || {};
    const pct = data.brightness_pct ?? data.value;
    const target = (t) => {
      if (this._t(`a_t_${t}`) !== `a_t_${t}`) return this._t(`a_t_${t}`);
      if (t === "presence") return this._t("a_presence_on");
      if (t === "display_off" || t === "display_on") return this._t(`a_${t}`);
      return `${this._t("a_lighting")} · ${t}`;
    };
    let icon = ACTIVITY_ICONS[entry.kind] || "mdi:information-outline";
    let text;
    if (entry.kind === "device") {
      text = target(entry.target);
      icon = { climate: "mdi:air-conditioner", fan: "mdi:fan" }[String(entry.entity_id).split(".")[0]] || icon;
      const setting = data.preset_mode ?? data.option ?? data.fan_mode;
      if (setting) text += ` · ${setting}`;
    } else if (entry.kind === "lighting" || entry.kind === "presence_on") {
      text = this._t(`a_${entry.kind}`) + (pct === undefined ? "" : ` · ${pct} %`);
    } else if (entry.kind === "display") {
      text = this._t(entry.target === "display_on" ? "a_display_on" : "a_display_off");
      if (entry.target === "display_on") icon = "mdi:led-on";
    } else if (entry.kind === "notified") {
      return { icon, text: entry.title || this._t("a_notified"), detail: entry.message };
    } else if (entry.kind === "manual") {
      const until = entry.until && new Date(entry.until).toLocaleTimeString(intlLocale(this._hass), { hour: "2-digit", minute: "2-digit" });
      text = until ? this._t("a_manual_until", { time: until }) : this._t("a_manual");
    } else if (entry.kind === "failed") {
      text = this._t("a_failed") + (entry.target ? ` · ${target(entry.target)}` : "");
    } else {
      text = this._t(`a_${entry.kind}`);
    }
    return { icon, text };
  }

  _drawActivity() {
    const list = this._activityList;
    if (!list) return;
    list.innerHTML = "";
    if (!this._activityEntries) {
      list.append(this._el("div", "act-empty", this._activityFailed ? this._t("a_not_loaded") : "…"));
      return;
    }
    const group = this._activityGroup || "all";
    const entries = this._activityEntries.filter(
      (e) => (group === "all" || activityGroup(e) === group) && (!this._activityRoom || e.room === this._activityRoom)
    );
    if (!entries.length) {
      list.append(this._el("div", "act-empty", this._t("a_empty")));
      return;
    }
    let day = null;
    let block = null;
    for (const entry of entries) {
      const date = new Date(entry.at);
      const thisDay = this._activityDay(date);
      if (thisDay !== day) {
        day = thisDay;
        block = this._el("div", "act-day");
        block.append(this._el("div", "act-date", thisDay));
        list.append(block);
      }
      const { icon, text, detail } = this._activityText(entry);
      const row = this._el("div", `act-row ${entry.kind}${entry.severity ? ` ${entry.severity}` : ""}`);
      const badge = this._el("span", "act-icon");
      const i = document.createElement("ha-icon");
      i.icon = icon;
      badge.append(i);
      const main = this._el("div", "act-main");
      const who = entry.entity_id ? this._hass?.states?.[entry.entity_id]?.attributes?.friendly_name || entry.entity_id : "";
      main.append(this._el("div", "act-what", who ? `${who} — ${text}` : text));
      if (detail) main.append(this._el("div", "act-detail", detail));
      if (entry.room) main.append(this._el("div", "act-room-name", entry.room));
      const time = this._el("time", "act-time", date.toLocaleTimeString(intlLocale(this._hass), { hour: "2-digit", minute: "2-digit" }));
      row.append(badge, main, time);
      if (entry.entity_id) {
        row.dataset.entity = entry.entity_id;
        row.tabIndex = 0;
        row.setAttribute("role", "button");
      }
      block.append(row);
    }
  }

  // YAML: the configuration of the integration, as it goes under `smart_comfort:` in configuration.yaml.

  _renderYaml(content) {
    const card = this._card(this._t("yaml_tab"), "mdi:code-braces");
    // Kept in smart_comfort.yaml: the file as it is (or will be once saved), without the `smart_comfort:` key.
    const file = this._config.file;
    const text = file ? `${toYaml(this._draft || {}, "")}\n` : `smart_comfort:\n${toYaml(this._draft || {}, "  ")}\n`;
    let help = file ? this._t("yaml_help_file", { file: file.name }) : this._t(this._dirty ? "yaml_help_unsaved" : "yaml_help");
    if (file && this._dirty) help += ` · ${this._t("unsaved")}`;
    card.append(this._el("div", "help", help));
    const pre = this._el("pre", "yaml", text);
    const copy = this._button(this._t("yaml_copy"), async () => {
      try {
        await navigator.clipboard.writeText(text);
        copy.textContent = this._t("yaml_copied");
      } catch (_err) {
        const range = document.createRange();
        range.selectNodeContents(pre);
        const selection = this.shadowRoot.getSelection?.() || window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });
    card.append(copy, pre);
    content.append(card);
  }

  // Overview.

  _format(value, digits = 1) {
    if (typeof value !== "number") return "–";
    return value.toLocaleString(intlLocale(this._hass), { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  }

  _time(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const today = new Date().toDateString() === d.toDateString();
    return today
      ? d.toLocaleTimeString(intlLocale(this._hass), { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleString(intlLocale(this._hass), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  /** Settings: smart_comfort.yaml, kept in sync both ways (or how to start it). */
  _sourceCard() {
    const card = this._card(this._t("src_title"), "mdi:file-sync-outline");
    card.classList.add("source");
    const file = this._config.file;
    const name = file?.name || "smart_comfort.yaml";
    if (!file) {
      const row = this._el("div", "srow");
      const text = this._el("div", "stext");
      text.append(this._el("div", "sname", this._t("src_none", { file: name })), this._el("div", "shelp", this._t("src_create_help", { file: name })));
      const create = this._button(this._t("src_create", { file: name }), () => this._createFile(), "primary");
      row.append(text, create);
      card.append(row);
      return card;
    }
    const head = this._el("div", "sfile");
    head.append(this._el("span", "pill info", "YAML"), this._el("code", "", `/config/${name}`));
    const time = file.mtime ? new Date(file.mtime * 1000).toLocaleTimeString(this._hass.language, { hour: "2-digit", minute: "2-digit" }) : "—";
    const rooms = (this._config.options.rooms || []).length;
    const status = file.invalid ? this._t("src_status_invalid", { time, error: file.invalid }) : this._t("src_status", { time, rooms });
    head.append(this._el("span", `sstatus${file.invalid ? " bad" : ""}`, status));
    const reload = this._button(this._t("src_reload"), () => this._reloadYaml());
    reload.disabled = !!this._reloadingYaml;
    head.append(reload);
    card.append(head);
    if (this._yamlNote) card.append(this._el("div", "shelp note", this._yamlNote));
    const toggle = (key, label, help) => {
      const row = this._el("div", "srow");
      const text = this._el("div", "stext");
      text.append(this._el("div", "sname", label), this._el("div", "shelp", help));
      const sw = this._el("label", "sw");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = this._draft[key] !== false;
      input.setAttribute("aria-label", label);
      input.addEventListener("change", () => {
        if (input.checked) delete this._draft[key];
        else this._draft[key] = false;
        this._changed();
      });
      sw.append(input, this._el("span"));
      row.append(text, sw);
      card.append(row);
    };
    toggle("file_write", this._t("src_write"), this._t("src_write_help"));
    toggle("file_watch", this._t("src_watch"), this._t("src_watch_help"));
    if (file.included?.length) {
      const row = this._el("div", "srow");
      const text = this._el("div", "stext");
      text.append(this._el("div", "sname", this._t("src_included")), this._el("div", "shelp", this._t("src_included_help", { files: file.included.join(", ") })));
      row.append(text, this._el("span", "pill", String(file.included.length)));
      card.append(row);
    }
    return card;
  }

  async _createFile() {
    try {
      await this._hass.callWS({ type: `${DOMAIN}/file/create` });
      this._yamlNote = null;
    } catch (err) {
      this._message = { type: "error", text: err.message };
    }
    this._reload();
  }

  /** Saving found options changed elsewhere: what changed there, the file's value against the panel's. */
  _conflictCard() {
    const c = this._conflict;
    const card = this._card(this._t("conflict_title"), "mdi:file-alert-outline");
    card.classList.add("conflict");
    const paths = changedPaths(c.base, c.options);
    const time = c.file?.mtime ? new Date(c.file.mtime * 1000).toLocaleTimeString(this._hass.language, { hour: "2-digit", minute: "2-digit" }) : "";
    card.append(
      this._el("div", "shelp", c.file ? this._t("conflict_sub", { n: paths.length, file: c.file.name, time }) : this._t("conflict_sub_other", { n: paths.length }))
    );
    const show = (source) =>
      paths
        .slice(0, 8)
        .map((path) => `${path.join(".")}: ${JSON.stringify(pathValue(source, path)) ?? "—"}`)
        .join("\n");
    const grid = this._el("div", "cgrid");
    const side = (cls, title, text) => {
      const box = this._el("div", `cbox ${cls}`);
      box.append(this._el("div", "ctitle", title), this._el("pre", "", text));
      return box;
    };
    grid.append(side("file", this._t("conflict_file"), show(c.options)), side("panel", this._t("conflict_panel"), show(this._draft)));
    const actions = this._el("div", "cactions");
    actions.append(
      this._button(this._t("conflict_keep_file"), () => {
        this._conflict = null;
        this._reload();
      }),
      this._button(this._t("conflict_keep_panel"), () => this._save(true), "primary")
    );
    card.append(grid, actions);
    return card;
  }

  /** The configuration comes from YAML: what that means, and Reload the YAML (the result stays shown until the next one). */
  _yamlBanner() {
    const file = this._config.file;
    const text = file ? this._t("yaml_file", { file: file.name }) : this._t("yaml");
    const banner = this._el("div", "banner info", text);
    const reload = this._el("button", "retry", this._t("yaml_reload"));
    reload.type = "button";
    reload.disabled = !!this._reloadingYaml;
    reload.addEventListener("click", () => this._reloadYaml());
    banner.append(reload);
    if (this._yamlNote) banner.append(this._el("div", "note", this._yamlNote));
    return banner;
  }

  async _reloadYaml() {
    this._reloadingYaml = true;
    this._render();
    let applied = false;
    try {
      const { response } = await this._hass.callService(DOMAIN, "reload", {}, undefined, true, true);
      applied = response.applied;
      if (!applied) this._yamlNote = this._t("yaml_unchanged");
      else if (response.conflicts.length) this._yamlNote = this._t("yaml_conflicts", { paths: response.conflicts.join(", ") });
      else this._yamlNote = this._t("yaml_reloaded");
    } catch (err) {
      this._yamlNote = err.message;
    }
    this._reloadingYaml = false;
    // Applied: the options changed, load them again; otherwise the unsaved edits stay.
    if (applied) this._reload();
    else this._render();
  }

  _service(service, data = {}) {
    return this._hass.callService(DOMAIN, service, data);
  }

  _goTab(tab) {
    this._tab = tab;
    const base = (this.panel?.url_path || "smart-comfort").replace(/^\//, "");
    history.replaceState(history.state, "", `/${base}${tab === "overview" ? "" : `/${tab}`}`);
    this._render();
  }

  /** Nothing set up yet: the discovery offered right away, its result opened in the Rooms tab. */
  _renderStart(content) {
    const options = this._config.options;
    if (options.rooms?.length || options.outdoors?.length) return;
    const card = this._card(this._t("start"), "mdi:home-search-outline");
    card.classList.add("start");
    const body = this._el("div", "discover");
    const button = this._button(this._t("discover"), () => {
      this._goTab("rooms");
      this._discover();
    });
    body.append(this._el("div", "discover-text", this._t("start_help")), button);
    card.append(body);
    content.append(card);
  }

  /** The type chosen in a room's form: stored when the user changes it, living space included, since discovery
   *  suggests a type only to the rooms without one (a room set back to living space stays so); unchanged, left as is. */
  _setRoomType(room, type) {
    const chosen = type || "living_space";
    if (chosen !== (room.type || "living_space")) room.type = chosen;
  }

  /** The comfort score shown in the overview hero: 100 minus a penalty per active alert, weighted by severity like the
   *  per-room comfort sensors (SCORE_PENALTY), the tone from it, the active alerts grouped by kind, and how many rooms
   *  have nothing active. Annex rooms (cellar, garage…) stay out of it, so a cold cellar never pulls the home down. */
  _comfort(s) {
    const annex = new Set((s.rooms || []).filter((r) => r.is_annex).map((r) => r.room_id));
    const rooms = (s.rooms || []).filter((r) => !r.is_annex);
    const alerts = (s.alerts || []).filter((a) => !annex.has(a.room));
    const points = alerts.length;
    const penalty = alerts.reduce((sum, a) => sum + (SCORE_PENALTY[a.severity] ?? SCORE_PENALTY.info), 0);
    const score = Math.max(0, 100 - penalty);
    const tone = !points ? "good" : alerts.some((a) => a.severity === "critical") ? "bad" : "warn";
    const byKind = {};
    for (const a of alerts) byKind[a.kind] = (byKind[a.kind] || 0) + 1;
    const okRooms = rooms.filter((r) => !(r.alerts || []).length).length;
    return { score, tone, points, byKind, okRooms };
  }

  _renderOverview(content) {
    this._renderStart(content);
    const s = this._status;
    if (s === undefined) {
      content.append(this._el("div", "banner", "…"));
      return;
    }
    if (!s) {
      content.append(this._el("div", "banner error", this._t("not_loaded")));
      return;
    }

    // The comfort score, the points to watch and the outdoor temperature are in the tab's header (scbBanner)

    // Over the rest: the room filter (the rooms with alerts as chips, the fine ones behind "+ N OK"), the
    // notifications / device control / lighting switches as pills, then four tiles of the chart.
    const summary = this._el("div", "summary ov");
    const annex = new Set((s.rooms || []).filter((r) => r.is_annex).map((r) => r.room_id));
    const open = (s.alerts || []).filter((a) => !annex.has(a.room));
    const rooms = s.rooms || [];
    // A room by its id (its name in an older status), an alert in it by the same
    const keyOf = (room) => room.room_id ?? room.name;
    const inRoom = (a, room) => (room.room_id !== undefined ? a.room === room.room_id : a.room_name === room.name);
    this._room = rooms.some((r) => keyOf(r) === this._room) ? this._room : "";
    const countOf = (room) => s.alerts.filter((a) => inRoom(a, room)).length;
    const watched = rooms.filter((r) => countOf(r) > 0).sort((x, y) => countOf(y) - countOf(x) || x.name.localeCompare(y.name));
    const fine = rooms.filter((r) => countOf(r) === 0);
    const filters = this._el("div", "filters");
    const chip = (id, label, n, tone) => {
      const c = this._el("button", `fchip${(this._room || "") === id ? " on" : ""}`);
      c.dataset.room = id;
      c.setAttribute("aria-pressed", String((this._room || "") === id));
      if (tone) c.append(this._el("i", `dot ${tone}`));
      c.append(document.createTextNode(label));
      if (n) c.append(this._el("span", "cnt", String(n)));
      c.addEventListener("click", () => {
        this._room = this._room === id ? "" : id;
        this._renderTab();
      });
      return c;
    };
    filters.append(chip("", this._t("all_rooms"), s.alerts.length));
    const toneOf = (room) => (s.alerts.some((x) => inRoom(x, room) && x.severity === "critical") ? "bad" : "warn");
    for (const r of watched) filters.append(chip(keyOf(r), r.name, countOf(r), toneOf(r)));
    // The fine rooms: one chip when chosen, otherwise grouped in a popover (there can be many)
    const chosenFine = this._room ? fine.find((r) => keyOf(r) === this._room) : null;
    if (chosenFine) filters.append(chip(keyOf(chosenFine), chosenFine.name, 0, "good"));
    const others = fine.filter((r) => r !== chosenFine);
    if (others.length) {
      const more = this._el("details", "more");
      const sum = this._el("summary", "fchip", this._t("n_ok_rooms", { n: others.length }));
      const pop = this._el("div", "pop");
      for (const r of others) pop.append(chip(keyOf(r), r.name, 0, "good"));
      more.append(sum, pop);
      filters.append(more);
    }
    const spacer = this._el("span", "grow");
    filters.append(spacer);
    const toggle = (on, onIcon, offIcon, onKey, offKey, key) => {
      const b = this._el("button", `pill${on ? " on" : ""}`);
      const i = document.createElement("ha-icon");
      i.icon = on ? onIcon : offIcon;
      b.append(i, document.createTextNode(this._t(on ? onKey : offKey)));
      b.addEventListener("click", () =>
        this._hass.callService("switch", on ? "turn_off" : "turn_on", { entity_id: this._switch(key) })
      );
      return b;
    };
    filters.append(
      toggle(s.notifications_enabled, "mdi:bell", "mdi:bell-off", "notifications_on", "notifications_off", "notifications"),
      this._controlMenu(s, toggle),
      ...(rooms.some((r) => Object.keys(r.lights || {}).length)
        ? [toggle(s.lighting_enabled, "mdi:lightbulb-auto", "mdi:lightbulb-off-outline", "lighting_on", "lighting_off", "lighting")]
        : [])
    );
    summary.append(filters);
    const otile = (tone, icon, label, state, count) => {
      const t = this._el("div", `otile ${count || tone !== "warn" ? tone : "rest"}`);
      const past = this._el("span", "pastille");
      const i = document.createElement("ha-icon");
      i.icon = icon;
      past.append(i);
      if (count) past.append(this._el("span", "pbadge", String(count)));
      const tl = this._el("span", "tl");
      tl.append(this._el("span", "tn", label), this._el("span", "ts", state));
      t.append(past, tl);
      return t;
    };
    const handled = open.filter((a) => a.handled).length;
    const c = this._comfort(s);
    const tiles = this._el("div", "otiles");
    tiles.append(
      otile(c.tone === "good" ? "good" : c.tone, "mdi:alert-circle-outline", this._t("active_alerts"), open.length ? this._t("n_handled", { n: handled }) : this._t("no_alerts"), open.length),
      otile("info", "mdi:home-thermometer-outline", this._t("outdoor"), `${this._format(s.outdoor_temperature)} °C`, 0),
      ...(typeof s.outdoor_air === "number"
        ? [otile(s.outdoor_air >= 4 ? "warn" : "good", "mdi:weather-hazy", this._t("outdoor_air"), `${this._format(s.outdoor_air, 0)}/6`, 0)]
        : []),
      ...(typeof s.outdoor_noise === "number" || s.night
        ? [
            otile(
              "night",
              s.night ? "mdi:weather-night" : "mdi:volume-medium",
              this._t(typeof s.outdoor_noise === "number" ? "outdoor_noise" : "quiet_night"),
              [typeof s.outdoor_noise === "number" ? `${this._format(s.outdoor_noise, 0)} dB` : "", s.night && typeof s.outdoor_noise === "number" ? this._t("quiet_night") : ""].filter(Boolean).join(" · ") || this._t("quiet_night"),
              0
            ),
          ]
        : [])
    );
    summary.append(tiles);
    content.append(summary);

    // To handle: the active alerts (of the room chosen), snooze and acknowledge on each, Notify now under them
    const alerts = this._card(this._t("to_handle"), "mdi:bell-ring-outline");
    const chosen = rooms.find((r) => keyOf(r) === this._room);
    const shown = s.alerts.filter((a) => !chosen || inRoom(a, chosen));
    if (!shown.length) {
      alerts.append(this._el("div", "empty", this._t("no_alerts")));
    }
    for (const a of shown) {
      const row = this._el("div", "alert");
      const i = document.createElement("ha-icon");
      i.icon = KIND_ICONS[a.kind] || "mdi:alert";
      i.className = `kind ${a.kind}`;
      const body = this._el("div", "alert-body");
      body.append(this._el("div", "alert-title", `${a.room_name} · ${this._kindName(a.kind)}`));
      const unit = unitOf(a);
      const value = a.kind === "ventilate" || a.kind === "close_windows" ? a.temperature : a.value;
      const digits = ["co2_high", "polluted_air", "bad_air_outside"].includes(a.kind) ? 0 : 1;
      const parts = [`${this._format(value, digits)}${unit === "/6" ? "" : " "}${unit}`];
      parts.push(`${this._t("since")} ${this._time(a.since)}`);
      parts.push(a.notified_at ? `${this._t("notified")} ${this._time(a.notified_at)}` : this._t("pending"));
      body.append(this._el("div", "alert-meta", parts.join(" · ")));
      const badges = this._el("div", "badges");
      for (const flag of ["snoozed", "acknowledged", "handled"]) {
        if (a[flag]) badges.append(this._el("span", `badge ${flag}`, this._t(flag)));
      }
      body.append(badges);
      const actions = this._el("div", "row-actions");
      actions.append(
        this._iconButton("mdi:alarm-snooze", this._t("snooze"), () =>
          this._service("snooze", { rooms: [a.room], kinds: [a.kind] })
        ),
        this._iconButton("mdi:check", this._t("acknowledge"), () =>
          this._service("acknowledge", { rooms: [a.room], kinds: [a.kind] })
        )
      );
      row.append(i, body, actions);
      alerts.append(row);
    }
    const footer = this._el("div", "card-actions");
    footer.append(this._button(this._t("notify_now"), () => this._service("notify_now")));
    if (Object.keys(s.snoozes || {}).length || s.alerts.some((a) => a.snoozed)) {
      footer.append(this._button(this._t("unsnooze"), () => this._service("unsnooze")));
    }
    alerts.append(footer);
    content.append(alerts);

    const grid = this._el("div", "grid");
    for (const room of s.rooms.filter((r) => !chosen || r === chosen)) {
      const conf = (this._config.options.rooms || []).find((r) => r.name === room.name);
      const card = this._card(room.name, this._roomIcon(conf || room));
      card.classList.add(room.alerts.length ? "has-alert" : "is-ok");
      card.append(
        this._chips([
          ["mdi:thermometer", room.temperature, (v) => `${this._format(v)} °C`],
          ["mdi:molecule-co2", room.co2, (v) => `${this._format(v, 0)} ppm`],
          ["mdi:blur", room.pm25, (v) => `PM2.5 ${this._format(v, 0)} µg/m³`],
          ["mdi:blur-radial", room.pm10, (v) => `PM10 ${this._format(v, 0)} µg/m³`],
          ["mdi:air-filter", room.air_quality, (v) => `${this._format(v, 0)}/6`],
          ["mdi:water-percent", room.humidity, (v) => `${this._format(v, 0)} %`],
          ["mdi:volume-medium", room.noise, (v) => `${this._format(v, 0)} dB`],
          ["mdi:window-open-variant", room.open?.length || null, (n) => `${this._t("open")} (${n})`],
        ])
      );
      card.append(
        this._el(
          "div",
          "room-status",
          room.alerts.length ? room.alerts.map((k) => this._kindName(k)).join(", ") : this._t("ok")
        )
      );
      const devices = [...Object.entries(room.devices || {}), ...Object.entries(room.lights || {})];
      if (devices.length) {
        const list = this._el("div", "devices");
        for (const [entityId, d] of devices) {
          const state = this._hass.states[entityId];
          const line = this._el("div", "device");
          const name = state?.attributes?.friendly_name || entityId;
          line.append(this._el("span", "device-name", name));
          const info = [state ? this._hass.formatEntityState?.(state) ?? state.state : "–"];
          if (d.target) info.push(`${this._t("target")} ${d.target}`);
          if (d.override_until) info.push(`${this._t("manual")} ${this._time(d.override_until)}`);
          line.append(this._el("span", "device-state", info.join(" · ")));
          list.append(line);
        }
        card.append(list);
      }
      grid.append(card);
    }
    if (!chosen) for (const place of s.outdoors || []) grid.append(this._outdoorStatus(place));
    content.append(grid);

    if (s.last_notification) {
      const last = this._card(this._t("last_notification"), "mdi:bell-outline");
      last.append(this._el("div", "last-title", s.last_notification.title || ""));
      last.append(this._el("div", "last-message", s.last_notification.message || ""));
      last.append(this._el("div", "alert-meta", this._time(s.last_notification.at)));
      content.append(last);
    }
  }

  /** Chips of the values that are numbers: [icon, value, text of the value]. */
  _chips(entries) {
    const chips = this._el("div", "chips");
    for (const [icon, value, text] of entries) {
      if (typeof value !== "number") continue;
      const c = this._el("span", "chip");
      const i = document.createElement("ha-icon");
      i.icon = icon;
      c.append(i, document.createTextNode(text(value)));
      chips.append(c);
    }
    return chips;
  }

  /** An outdoor place in the overview: its values, and each of its sensors with its state. */
  _outdoorStatus(place) {
    const conf = (this._config.options.outdoors || []).find((p) => p.name === place.name);
    const card = this._card(place.name, this._roomIcon(conf || place, true));
    card.classList.add("outdoor");
    card.append(
      this._chips([
        ["mdi:thermometer", place.temperature, (v) => `${this._format(v)} °C`],
        ["mdi:weather-hazy", place.air_quality, (v) => `${this._format(v, 0)}/6`],
        ["mdi:volume-medium", place.noise, (v) => `${this._format(v, 0)} dB`],
      ])
    );
    const list = this._el("div", "devices");
    for (const entityId of place.sensors) {
      const state = this._hass.states[entityId];
      const line = this._el("div", "device");
      line.append(this._el("span", "device-name", state?.attributes?.friendly_name || entityId));
      line.append(this._el("span", "device-state", state ? (this._hass.formatEntityState?.(state) ?? state.state) : "–"));
      list.append(line);
    }
    if (!place.sensors.length) list.append(this._el("div", "device-state", this._t("no_sensor")));
    card.append(list);
    return card;
  }

  // Device control: one pill opening a menu, the general switch and one per device family set up.
  _controlMenu(s, toggle) {
    const families = Object.entries(s.control_families || {});
    if (!families.length) {
      return toggle(s.control_enabled, "mdi:air-conditioner", "mdi:hand-back-right-off", "control_on", "control_off", "control");
    }
    const partial = s.control_enabled && families.some(([, on]) => !on);
    const menu = this._el("details", "more ctl");
    menu.open = !!this._controlOpen;
    menu.addEventListener("toggle", () => (this._controlOpen = menu.open));
    const sum = this._el("summary", `pill${s.control_enabled ? (partial ? " part" : " on") : ""}`);
    const icon = document.createElement("ha-icon");
    icon.icon = s.control_enabled ? "mdi:air-conditioner" : "mdi:hand-back-right-off";
    const chevron = document.createElement("ha-icon");
    chevron.icon = "mdi:chevron-down";
    chevron.className = "chev";
    sum.append(icon, document.createTextNode(this._t(s.control_enabled ? (partial ? "control_partial" : "control_on") : "control_off")), chevron);
    const pop = this._el("div", "pop");
    const row = (on, iconOn, iconOff, label, key, disabled) => {
      const b = this._el("button", `crow${on ? " on" : ""}`);
      b.disabled = !!disabled;
      b.setAttribute("role", "switch");
      b.setAttribute("aria-checked", String(on));
      const i = document.createElement("ha-icon");
      i.icon = on ? iconOn : iconOff;
      b.append(i, this._el("span", "cl", label), this._el("span", `knob${on ? " on" : ""}`));
      b.addEventListener("click", () =>
        this._hass.callService("switch", on ? "turn_off" : "turn_on", { entity_id: this._switch(key) })
      );
      return b;
    };
    const icons = {
      climate: ["mdi:air-conditioner", "mdi:snowflake-off"],
      fans: ["mdi:fan", "mdi:fan-off"],
      purifiers: ["mdi:air-purifier", "mdi:air-purifier-off"],
    };
    pop.append(row(s.control_enabled, "mdi:air-conditioner", "mdi:hand-back-right-off", this._t("control_all"), "control"));
    for (const [family, on] of families) {
      // Under the general switch: greyed out while it is off, its own state kept.
      pop.append(row(on, ...icons[family], this._t(`control_${family}`), `control_${family}`, !s.control_enabled));
    }
    menu.append(sum, pop);
    return menu;
  }

  _switch(key) {
    const entries = Object.values(this._hass.entities || {}).filter(
      (e) => e.platform === DOMAIN && e.entity_id.startsWith("switch.")
    );
    const found = entries.find((e) => e.translation_key === key);
    if (found) return found.entity_id;
    return {
      control: "switch.smart_comfort_device_control",
      control_climate: "switch.smart_comfort_air_conditioner_control",
      control_fans: "switch.smart_comfort_fan_control",
      control_purifiers: "switch.smart_comfort_purifier_control",
      lighting: "switch.smart_comfort_adaptive_lighting",
    }[key] || "switch.smart_comfort_notifications";
  }

  // Notifications (general options).

  // Shared form helpers.

  _advanced(schema) {
    return { type: "expandable", name: "", flatten: true, title: this._t("advanced"), icon: "mdi:tune-variant", schema };
  }

  /** A form of top-level options: only what differs from the defaults is stored. */
  _topForm(schema) {
    const defaults = this._config.defaults.general;
    const keys = schemaKeys(schema);
    const own = Object.fromEntries(keys.filter((k) => k in this._draft).map((k) => [k, this._draft[k]]));
    return this._form(
      schema,
      merged(defaults, own),
      (value) => {
        const changed = diff(Object.fromEntries(keys.map((k) => [k, value[k]])), defaults);
        for (const key of keys) delete this._draft[key];
        Object.assign(this._draft, changed);
      },
      (f) => (f.type === "expandable" ? f.title : this._label("general", f.name)),
      (f) => this._helper("general", f.name)
    );
  }

  /** Writes values into a section of the options (control, lighting), keeping only what differs from its defaults. */
  _setSection(section, values) {
    const defaults = this._config.defaults[section];
    const changed = diff({ ...merged(defaults, this._draft[section] || {}), ...values }, defaults);
    if (Object.keys(changed).length) this._draft[section] = changed;
    else delete this._draft[section];
  }

  _sectionForm(section, schemaFor, label, helper) {
    const data = merged(this._config.defaults[section], this._draft[section] || {});
    const form = this._form(
      schemaFor(data),
      data,
      (value) => {
        this._setSection(section, value);
        form.schema = schemaFor(value);
      },
      label,
      helper
    );
    return form;
  }

  /** A row that opens and closes its content (sections of a room, alert kinds). */
  _section(parent, key, icon, title, summary, build) {
    const open = this._openSections.has(key);
    const wrap = this._el("div", `section${open ? " open" : ""}`);
    const head = this._el("button", "section-head");
    head.setAttribute("aria-expanded", String(open));
    const i = document.createElement("ha-icon");
    i.icon = icon;
    const chevron = document.createElement("ha-icon");
    chevron.className = "chevron";
    chevron.icon = open ? "mdi:chevron-up" : "mdi:chevron-down";
    head.append(i, this._el("span", "section-name", title), this._el("span", "section-summary", summary), chevron);
    head.addEventListener("click", () => {
      if (open) this._openSections.delete(key);
      else this._openSections.add(key);
      this._renderTab();
    });
    wrap.append(head);
    if (open) {
      const body = this._el("div", "section-body");
      build(body);
      wrap.append(body);
    }
    parent.append(wrap);
  }

  /** "+ Something" buttons, for what isn't set yet. */
  _addChips(parent, items) {
    if (!items.length) return;
    const row = this._el("div", "add-chips");
    for (const [label, onClick] of items) {
      const b = this._el("button", "add-chip");
      const i = document.createElement("ha-icon");
      i.icon = "mdi:plus";
      b.append(i, document.createTextNode(label));
      b.addEventListener("click", onClick);
      row.append(b);
    }
    parent.append(row);
  }

  // Settings: notifications, device control, adaptive lighting.

  _renderSettings(content) {
    content.append(this._sourceCard());
    const notify = Object.keys(this._hass.services.notify || {})
      .filter((n) => !["send_message", "persistent_notification"].includes(n))
      .map((n) => `notify.${n}`);
    const current = this._draft.notify || [];
    const notifications = this._card(this._t("notifications"), "mdi:bell-cog-outline");
    notifications.append(
      this._topForm([
        {
          name: "notify",
          selector: {
            select: { multiple: true, custom_value: true, mode: "dropdown", options: [...new Set([...notify, ...current])].sort() },
          },
        },
        { name: "presence", selector: entity(["zone", "person", "group", "binary_sensor", "input_boolean", "device_tracker"]) },
        { name: "digest_window", selector: minutes() },
        { name: "reminder", selector: minutes() },
        this._advanced([
          { name: "snooze_duration", selector: minutes(1) },
          { name: "startup_grace", selector: minutes() },
          { name: "clear_when_resolved", selector: bool },
          { name: "critical_volume", selector: { number: { mode: "slider", min: 0, max: 1, step: 0.05 } } },
          { name: "url", selector: text },
          { name: "tag", selector: text },
        ]),
      ])
    );
    content.append(notifications);

    const control = this._card(this._t("control"), "mdi:air-conditioner");
    control.append(
      this._sectionForm(
        "control",
        () => this._controlSchema(),
        (f) => this._controlLabel(f),
        (f) => this._controlHelper(f)
      )
    );
    content.append(control);

    const lighting = this._card(this._t("lighting"), "mdi:lightbulb-auto-outline");
    lighting.append(this._el("div", "help", this._t("lighting_help")));
    lighting.append(
      this._sectionForm(
        "lighting",
        (data) => [
          { name: "enabled", selector: bool },
          ...lightingLevels(data.warmth),
          this._advanced([
            { name: "transition", selector: { number: { mode: "box", step: 10, min: 0, max: 3600, unit_of_measurement: "s" } } },
          ]),
        ],
        (f) => (f.type === "expandable" ? f.title : this._label("lighting", f.name)),
        // The levels on a row speak for themselves; their help would make the row ragged.
        (f) => (LEVEL_KEYS.includes(f.name) ? undefined : this._helper("lighting", f.name))
      )
    );
    content.append(lighting);

    // The dashboards' top bar, hidden by smart-comfort-header.js (loaded on every page) for everyone or the non-admins
    const dashboards = this._card(this._t("dashboards"), "mdi:view-dashboard-outline");
    dashboards.append(
      this._topForm([
        {
          name: "hide_header",
          selector: {
            select: { mode: "dropdown", options: this._options("hide_header", this._config.hide_header_modes || ["off", "everyone", "non_admins"]) },
          },
        },
      ])
    );
    content.append(dashboards);
  }

  // Alerts.

  _alertSchema(kind, defaults, inherit = false) {
    const unit = UNITS[kind] || "°C";
    const fields = [];
    const choice = (options) => ({
      select: { mode: "dropdown", options: [...(inherit ? [{ value: "", label: this._t("inherit") }] : []), ...options] },
    });
    if (inherit) {
      fields.push({
        name: "enabled",
        selector: choice([
          { value: "on", label: this._t("enabled") },
          { value: "off", label: this._t("disabled") },
        ]),
      });
    } else {
      fields.push({ name: "enabled", selector: bool });
    }
    if ("threshold" in defaults) fields.push({ name: "threshold", selector: num(unit) });
    for (const key of ["min_indoor", "min_outdoor", "max_outdoor"]) {
      if (key in defaults) fields.push({ name: key, selector: num("°C") });
    }
    if ("max_outdoor_noise" in defaults) fields.push({ name: "max_outdoor_noise", selector: num("dB", { min: 0 }) });
    if ("max_outdoor_air" in defaults) fields.push({ name: "max_outdoor_air", selector: num("/6", { min: 1, max: 6 }) });
    // Polluted air: PM10 and the air quality index besides PM2.5 (the threshold).
    const polluted = "pm10_threshold" in defaults;
    if (polluted) {
      fields.push(
        { name: "pm10_threshold", selector: num("µg/m³", { min: 0 }) },
        { name: "aqi_threshold", selector: num("/6", { min: 1, max: 6 }) }
      );
    }
    fields.push(
      { name: "severity", selector: choice(this._options("severity", this._config.severities)) },
      this._advanced([
        { name: "hysteresis", selector: num(unit, { min: 0 }) },
        ...(polluted
          ? [
              { name: "pm10_hysteresis", selector: num("µg/m³", { min: 0 }) },
              { name: "aqi_hysteresis", selector: num("/6", { min: 0 }) },
            ]
          : []),
        { name: "delay", selector: minutes() },
        { name: "escalation", selector: num(unit, { min: 0 }) },
      ])
    );
    return fields;
  }

  /** One line about an alert's settings: on or off, its threshold, its severity. */
  _alertSummary(kind, settings) {
    if (settings.enabled === false) return this._t("disabled");
    const parts = [this._t("enabled")];
    const unit = UNITS[kind] || "°C";
    if (typeof settings.threshold === "number") {
      parts.push(`${this._format(settings.threshold)}${unit === "/6" ? "/6" : ` ${unit}`}`);
    }
    if (settings.severity) parts.push(this._options("severity", [settings.severity])[0].label.split(" (")[0]);
    return parts.join(" · ");
  }

  _renderAlerts(content) {
    const card = this._card(this._t("alerts"), "mdi:bell-alert-outline");
    card.append(this._el("div", "help", this._t("alerts_help")));
    this._alertGroup(card, this._config.defaults.alerts, "alerts", "alert");
    content.append(card);
    // The annex defaults (cellar, garage…), tuned once for every annex room; same fields as the living-space ones.
    const annex = this._card(this._t("annex_alerts"), "mdi:home-roof");
    annex.append(this._el("div", "help", this._t("annex_alerts_help")));
    this._alertGroup(annex, this._config.defaults.annex_alerts || {}, "annex_alerts", "annex");
    content.append(annex);
  }

  /** The per-kind alert sections of a defaults group (living spaces or annexes), reading and writing `draftKey`. */
  _alertGroup(card, defaults, draftKey, prefix) {
    for (const kind of this._config.kinds) {
      const own = this._draft[draftKey]?.[kind] || {};
      const settings = merged(defaults[kind], own);
      this._section(card, `${prefix}:${kind}`, KIND_ICONS[kind], this._kindName(kind), this._alertSummary(kind, settings), (body) =>
        body.append(
          this._form(
            this._alertSchema(kind, defaults[kind]),
            settings,
            (value) => {
              const alerts = (this._draft[draftKey] = this._draft[draftKey] || {});
              alerts[kind] = diff(value, defaults[kind]);
              if (!Object.keys(alerts[kind]).length) delete alerts[kind];
              if (!Object.keys(this._draft[draftKey]).length) delete this._draft[draftKey];
            },
            (f) => (f.type === "expandable" ? f.title : this._label("alert", f.name)),
            (f) => this._helper("alert", f.name)
          )
        )
      );
    }
  }

  // Device control.

  _controlSchema() {
    const sec = (name, schema) => ({ type: "expandable", name, title: this._sectionTitle("control", name), schema });
    return [
      { name: "enabled", selector: bool },
      { name: "suppress_when_handled", selector: bool },
      { name: "manual_override", selector: minutes() },
      sec("climate", [
        { name: "cool_above", selector: num("°C") },
        { name: "off_below", selector: num("°C") },
        { name: "setpoint", selector: num("°C", { step: 0.5 }) },
        { name: "closed_for", selector: minutes() },
        { name: "off_on_open", selector: minutes() },
        { name: "min_outdoor", selector: num("°C") },
      ]),
      sec("fans", [
        { name: "on_above", selector: num("°C") },
        { name: "off_below", selector: num("°C") },
        { name: "percentage", selector: percent },
        { name: "open_percentage", selector: percent },
        { name: "night_percentage", selector: percent },
      ]),
      sec("purifiers", [
        { name: "open_percentage", selector: percent },
        { name: "keep_on", selector: bool },
        { name: "night_percentage", selector: percent },
      ]),
    ];
  }

  _controlLabel(schema) {
    if (schema.type === "expandable") return this._sectionTitle("control", schema.name);
    for (const section of [null, "climate", "fans", "purifiers"]) {
      const label = this._label("control", schema.name, section);
      if (label !== schema.name) return label;
    }
    return schema.name;
  }

  _controlHelper(schema) {
    for (const section of [null, "climate", "fans", "purifiers"]) {
      const help = this._helper("control", schema.name, section);
      if (help) return help;
    }
    return undefined;
  }

  // Schedule: every time window on one 24-hour line.

  _scheduleRows() {
    const control = merged(this._config.defaults.control, this._draft.control || {});
    const lighting = merged(this._config.defaults.lighting, this._draft.lighting || {});
    const general = merged(this._config.defaults.general, this._draft);
    return [
      { key: "quiet", icon: "mdi:bell-sleep-outline", start: general.quiet_start, end: general.quiet_end },
      { key: "night", icon: "mdi:weather-night", start: control.night_start, end: control.night_end },
      { key: "morning", icon: "mdi:weather-sunset-up", start: control.night_end || "00:00", end: lighting.morning_end },
      { key: "boost", icon: "mdi:window-open-variant", start: control.start, end: control.end },
      {
        key: "displays",
        icon: "mdi:led-off",
        // Unset: the quiet night.
        start: control.display_off && control.display_on ? control.display_off : control.night_start,
        end: control.display_off && control.display_on ? control.display_on : control.night_end,
        own: { start: control.display_off, end: control.display_on },
      },
    ];
  }

  _renderSchedule(content) {
    const rows = this._scheduleRows();
    const day = this._card(this._t("sched_title"), "mdi:clock-outline");
    day.append(this._el("div", "help", this._t("sched_help")), this._timeline(rows));
    content.append(day);
    this._renderScheduleForms(content, rows);
  }

  /** The time windows on one 24-hour line, with the time now. */
  _timeline(rows) {
    const line = this._el("div", "timeline");
    const scale = this._el("div", "tl-scale");
    for (const h of [0, 6, 12, 18, 24]) {
      const tick = this._el("span", "tl-tick", `${String(h).padStart(2, "0")}:00`);
      tick.style.left = `${(h / 24) * 100}%`;
      scale.append(tick);
    }
    line.append(this._el("span", ""), scale);
    const now = new Date();
    const nowLeft = `${((now.getHours() * 60 + now.getMinutes()) / 1440) * 100}%`;
    for (const row of rows) {
      const label = this._el("span", "tl-label");
      const i = document.createElement("ha-icon");
      i.icon = row.icon;
      label.append(i, this._el("span", "", this._t(`sched_${row.key}`)));
      const bar = this._el("div", `tl-bar ${row.key}`);
      const from = minutesOf(row.start);
      const to = minutesOf(row.end);
      if (from === null || to === null || from === to) {
        // Unset (or equal bounds): never, except the window boost which then runs all day.
        if (row.key === "boost" && (from === null || from === to)) bar.append(this._segment(0, 1440));
        else bar.classList.add("unset");
      } else if (from < to) {
        bar.append(this._segment(from, to));
      } else {
        bar.append(this._segment(from, 1440), this._segment(0, to));
      }
      const marker = this._el("span", "tl-now");
      marker.style.left = nowLeft;
      bar.append(marker);
      line.append(label, bar);
    }
    return line;
  }

  _renderScheduleForms(content, rows) {
    const edit = this._card(this._t("sched_edit"), "mdi:clock-edit-outline");
    const range = [
      grid([
        { name: "start", selector: time },
        { name: "end", selector: time },
      ]),
    ];
    const labels = { start: this._t("sched_from"), end: this._t("sched_to") };
    const block = (row, schema, data, onChange) => {
      const box = this._el("div", "sched-row");
      const head = this._el("div", "sched-head");
      const i = document.createElement("ha-icon");
      i.icon = row.icon;
      head.append(i, this._el("span", "sched-name", this._t(`sched_${row.key}`)));
      box.append(head, this._el("div", "help", this._t(`sched_${row.key}_help`)));
      box.append(
        this._form(schema, data, (value) => {
          onChange(value);
          this._renderSchedulePreview();
        }, (f) => labels[f.name] || this._t(`sched_${f.name}`))
      );
      edit.append(box);
    };
    const [quiet, night, morning, boost, displays] = rows;
    block(quiet, range, { start: quiet.start, end: quiet.end }, (v) => {
      for (const [key, value] of [["quiet_start", v.start], ["quiet_end", v.end]]) {
        if (isEmpty(value)) delete this._draft[key];
        else this._draft[key] = value;
      }
    });
    block(night, range, { start: night.start, end: night.end }, (v) =>
      this._setSection("control", { night_start: v.start || null, night_end: v.end || null })
    );
    block(morning, [{ name: "morning_end", selector: time }], { morning_end: morning.end }, (v) =>
      this._setSection("lighting", { morning_end: v.morning_end || null })
    );
    block(boost, range, { start: boost.start, end: boost.end }, (v) =>
      this._setSection("control", { start: v.start || null, end: v.end || null })
    );
    block(displays, range, displays.own, (v) =>
      this._setSection("control", { display_off: v.start || null, display_on: v.end || null })
    );
    content.append(edit);
  }

  /** The timeline follows the times being edited, without rebuilding the forms. */
  _renderSchedulePreview() {
    this.shadowRoot.querySelector(".timeline")?.replaceWith(this._timeline(this._scheduleRows()));
  }

  _segment(from, to) {
    const seg = this._el("span", "tl-seg");
    seg.style.left = `${(from / 1440) * 100}%`;
    seg.style.width = `${((to - from) / 1440) * 100}%`;
    return seg;
  }

  // Rooms.

  _attr(entityId, attribute) {
    const value = this._hass.states[entityId]?.attributes?.[attribute];
    return Array.isArray(value) ? value : [];
  }

  _choice(values, current) {
    const options = [...new Set([...values, ...(current ? [current] : [])])];
    return { select: { mode: "dropdown", custom_value: true, options } };
  }

  /** Device list item <-> form data: an entity id alone, or a dict with its own settings. */
  _item(raw) {
    return typeof raw === "string" ? { entity_id: raw } : { ...raw };
  }

  _store(item) {
    const p = prune(item);
    const keys = Object.keys(p);
    return keys.length === 1 && keys[0] === "entity_id" ? p.entity_id : p;
  }

  async _discover() {
    this._discovering = true;
    this._renderTab();
    try {
      const result = await this._hass.callWS({ type: `${DOMAIN}/discover`, options: prune(this._draft) });
      const r = result.report;
      this._draft = result.options;
      // Marked in the list (collapsed, with a summary of what was found) until saved.
      this._discovered = {
        added: new Set(r.added),
        updated: new Set(r.updated),
        outdoorsAdded: new Set(r.outdoors_added),
        outdoorsUpdated: new Set(r.outdoors_updated),
      };
      const outdoors = r.outdoors_added.length + r.outdoors_updated.length;
      const sensors = r.outdoor.length + r.outdoor_noise.length + r.outdoor_air.length;
      this._message =
        r.added.length || r.updated.length || outdoors || sensors
          ? {
              type: "info",
              text: this._t("discover_result", {
                added: r.added.length,
                updated: r.updated.length,
                outdoors,
                outdoor: sensors ? this._t("discover_outdoor") : "",
              }),
            }
          : { type: "info", text: this._t("discover_none") };
    } catch (err) {
      this._message = { type: "error", text: err.message };
    }
    this._discovering = false;
    this._renderToolbar();
    this._renderTab();
  }

  _renderRooms(content) {
    const intro = this._el("div", "card discover");
    const text = this._el("div", "discover-text");
    text.append(this._el("span", "", this._t("discover_short")));
    const more = this._el("button", "link", this._t(this._discoverHelp ? "less" : "how"));
    more.addEventListener("click", () => {
      this._discoverHelp = !this._discoverHelp;
      this._renderTab();
    });
    text.append(" ", more);
    if (this._discoverHelp) text.append(this._el("div", "discover-more", this._t("discover_help")));
    const button = this._button(this._discovering ? this._t("discover_running") : this._t("discover"), () =>
      this._discover()
    );
    button.disabled = Boolean(this._discovering);
    intro.append(text, button);
    content.append(intro);
    const rooms = (this._draft.rooms = this._draft.rooms || []);
    if (!rooms.length) content.append(this._el("div", "empty card", this._t("no_rooms")));
    rooms.forEach((room, index) => {
      content.append(this._roomCard(room, index, rooms));
    });
    const add = this._button(this._t("add_room"), () => {
      let name = this._t("new_room");
      let n = 2;
      while (rooms.some((r) => r.name === name)) name = `${this._t("new_room")} ${n++}`;
      rooms.push({ name });
      this._expanded.add(rooms.length - 1);
      this._openSections.add(`${rooms.length - 1}:sensors`);
      this._changed();
      this._renderTab();
    });
    add.classList.add("add");
    content.append(add);
  }

  /** Outdoor places and the outdoor sensors in no place, together. */
  _renderOutdoors(content) {
    content.append(this._el("div", "help section-help", this._t("outdoors_help")));
    const places = (this._draft.outdoors = this._draft.outdoors || []);
    if (!places.length) content.append(this._el("div", "empty card", this._t("no_outdoors")));
    places.forEach((place, index) => {
      content.append(this._outdoorCard(place, index, places));
    });
    const add = this._button(this._t("add_outdoor"), () => {
      let name = this._t("new_outdoor");
      let n = 2;
      while (places.some((p) => p.name === name)) name = `${this._t("new_outdoor")} ${n++}`;
      places.push({ name });
      this._expandedOutdoors.add(places.length - 1);
      this._changed();
      this._renderTab();
    });
    add.classList.add("add");
    content.append(add);
    const other = this._card(this._t("other_outdoor"), "mdi:weather-partly-cloudy");
    other.append(this._el("div", "help", this._t("other_outdoor_help")));
    other.append(
      this._topForm([
        { name: "outdoor_temperature", selector: entity(["sensor", "weather"], { multiple: true }) },
        { name: "outdoor_air_quality", selector: entity("sensor", { multiple: true }) },
        { name: "outdoor_noise", selector: entity("sensor", { device_class: "sound_pressure", multiple: true }) },
        { name: "outdoor_aggregate", selector: { select: { mode: "dropdown", options: this._options("outdoor_aggregate", this._config.aggregates) } } },
      ])
    );
    content.append(other);
  }

  _outdoorCard(place, index, places) {
    const card = this._el("div", "card room");
    const header = this._el("div", "card-header room-header");
    const open = this._expandedOutdoors.has(index);
    const toggle = this._el("button", "room-toggle");
    const chevron = document.createElement("ha-icon");
    chevron.icon = open ? "mdi:chevron-down" : "mdi:chevron-right";
    toggle.append(chevron, this._iconOf(this._roomIcon(place, true)), this._el("span", "", place.name || "—"));
    toggle.addEventListener("click", () => {
      if (open) this._expandedOutdoors.delete(index);
      else this._expandedOutdoors.add(index);
      this._renderTab();
    });
    const summary = this._summary(
      [
        ["mdi:thermometer", place.temperature],
        ["mdi:weather-hazy", place.air_quality],
        ["mdi:volume-medium", place.noise],
      ],
      this._discovered?.outdoorsAdded?.has(place.name),
      this._discovered?.outdoorsUpdated?.has(place.name),
      true
    );
    const tools = this._el("div", "row-actions");
    tools.append(
      this._iconButton("mdi:delete-outline", this._t("remove"), () => {
        places.splice(index, 1);
        this._expandedOutdoors = shifted(this._expandedOutdoors, index);
        this._changed();
        this._renderTab();
      })
    );
    header.append(toggle, summary, tools);
    card.append(header);
    if (!open) return card;
    const keys = ["name", "temperature", "air_quality", "noise"];
    card.append(
      this._form(
        [
          { name: "name", required: true, selector: text },
          { name: "temperature", selector: entity(["sensor", "weather"], { multiple: true }) },
          { name: "air_quality", selector: entity("sensor", { multiple: true }) },
          { name: "noise", selector: entity("sensor", { device_class: "sound_pressure", multiple: true }) },
        ],
        Object.fromEntries(keys.filter((k) => k in place).map((k) => [k, place[k]])),
        (value) => {
          for (const key of keys) {
            if (isEmpty(value[key])) delete place[key];
            else place[key] = value[key];
          }
          toggle.lastChild.textContent = place.name || "—";
        },
        (f) => this._label("outdoor", f.name)
      )
    );
    return card;
  }

  _roomCard(room, index, rooms) {
    const card = this._el("div", "card room");
    const header = this._el("div", "card-header room-header");
    const open = this._expanded.has(index);
    const toggle = this._el("button", "room-toggle");
    const chevron = document.createElement("ha-icon");
    chevron.icon = open ? "mdi:chevron-down" : "mdi:chevron-right";
    toggle.append(chevron, this._iconOf(this._roomIcon(room)), this._el("span", "", room.name || "—"));
    toggle.addEventListener("click", () => {
      if (open) this._expanded.delete(index);
      else this._expanded.add(index);
      this._renderTab();
    });
    header.append(toggle, this._roomSummary(room));
    const tools = this._el("div", "row-actions");
    const move = (to) => {
      [rooms[index], rooms[to]] = [rooms[to], rooms[index]];
      const swap = (set, key) => {
        const a = set.has(key(index));
        const b = set.has(key(to));
        set.delete(key(index));
        set.delete(key(to));
        if (a) set.add(key(to));
        if (b) set.add(key(index));
      };
      swap(this._expanded, (i) => i);
      for (const name of ["sensors", "openings", "devices", "lighting", "alerts"]) swap(this._openSections, (i) => `${i}:${name}`);
      this._changed();
      this._renderTab();
    };
    if (index > 0) tools.append(this._iconButton("mdi:arrow-up", this._t("move_up"), () => move(index - 1)));
    if (index < rooms.length - 1) {
      tools.append(this._iconButton("mdi:arrow-down", this._t("move_down"), () => move(index + 1)));
    }
    tools.append(
      this._iconButton("mdi:delete-outline", this._t("remove"), () => {
        rooms.splice(index, 1);
        this._expanded = shifted(this._expanded, index);
        this._openSections = new Set(
          [...this._openSections].flatMap((k) => {
            const [i, rest] = k.split(":");
            if (!/^\d+$/.test(i)) return [k];
            const n = Number(i);
            return n === index ? [] : [`${n > index ? n - 1 : n}:${rest}`];
          })
        );
        this._changed();
        this._renderTab();
      })
    );
    header.append(tools);
    card.append(header);
    if (!open) return card;

    const typeOptions = this._options("room_type", this._config.room_types || ["living_space", "annex"]);
    card.append(
      this._form(
        [
          { name: "name", required: true, selector: text },
          { name: "type", selector: { select: { mode: "dropdown", options: typeOptions } } },
        ],
        { name: room.name, type: room.type || "living_space" },
        (value) => {
          room.name = value.name;
          toggle.lastChild.textContent = room.name || "—";
          this._setRoomType(room, value.type);
        },
        (f) => this._label("room", f.name),
        (f) => this._helper("room", f.name)
      )
    );
    const sections = this._el("div", "sections");
    const section = (name, icon, summary, build) =>
      this._section(sections, `${index}:${name}`, icon, this._t(`section_${name}`), summary, build);
    section("sensors", "mdi:thermometer", this._sensorsSummary(room), (body) => this._roomSensors(body, room, index));
    section("openings", "mdi:window-closed-variant", this._count(room.openings), (body) =>
      body.append(
        this._form(
          [{ name: "openings", selector: entity("binary_sensor", { multiple: true }) }],
          { openings: room.openings || [] },
          (value) => {
            if (isEmpty(value.openings)) delete room.openings;
            else room.openings = value.openings;
          },
          (f) => this._label("room", f.name),
          () => this._t("openings_help")
        )
      )
    );
    section("devices", "mdi:air-conditioner", this._devicesSummary(room), (body) => this._roomDevices(body, room, index));
    section("lighting", "mdi:lightbulb-outline", this._lightingSummary(room), (body) => this._roomLighting(body, room, index));
    section("alerts", "mdi:bell-cog-outline", this._roomAlertsSummary(room), (body) => this._roomAlerts(body, room, index));
    card.append(sections);
    return card;
  }

  /** The icon of a room or outdoor place: its area's, else one guessed from its name. */
  _roomIcon(item, outdoor = false) {
    const area = item?.area ? this._hass.areas?.[item.area] : undefined;
    if (area?.icon) return area.icon;
    const name = (item?.name || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    const found = ROOM_ICONS.find(([words]) => words.some((w) => name.includes(w)));
    return found ? found[1] : outdoor ? "mdi:tree-outline" : "mdi:home-outline";
  }

  _iconOf(icon) {
    const i = document.createElement("ha-icon");
    i.className = "room-icon";
    i.icon = icon;
    return i;
  }

  _count(value) {
    const n = Array.isArray(value) ? value.length : value ? 1 : 0;
    return n ? String(n) : this._t("none");
  }

  _sensorsSummary(room) {
    const names = SENSOR_KEYS.filter((k) => !isEmpty(room[k])).map((k) => this._label("room", k));
    return names.length ? names.join(", ") : this._t("none");
  }

  _devicesSummary(room) {
    const list = (v) => (Array.isArray(v) ? v : v ? [v] : []);
    const parts = [
      [list(room.climate).length, "climate"],
      [list(room.fans).length, "fans"],
      [list(room.purifiers).length, "purifiers"],
    ]
      .filter(([n]) => n)
      .map(([n, key]) => (n > 1 ? `${this._t(key)} (${n})` : this._t(key === "climate" ? key : key.slice(0, -1))));
    return parts.length ? parts.join(", ") : this._t("none");
  }

  _lightingSummary(room) {
    const lights = Array.isArray(room.lights) ? room.lights : [];
    const naps = Array.isArray(room.naps) ? room.naps : [];
    const parts = [];
    if (lights.length) parts.push(`${this._t("lights")} (${lights.length})`);
    if (room.lighting?.quiet_morning) parts.push(this._label("lighting", "quiet_morning"));
    if (naps.length) parts.push(`${this._t("naps")} (${naps.length})`);
    return parts.length ? parts.join(", ") : this._t("none");
  }

  _roomAlertsSummary(room) {
    const kinds = Object.keys(room.alerts || {});
    return kinds.length ? kinds.map((k) => this._kindName(k)).join(", ") : this._t("alerts_default");
  }

  /** Sensors of a room: only those it has, and buttons to add the others. */
  _roomSensors(body, room, index) {
    const all = [
      ["temperature", "temperature"],
      ["co2", "carbon_dioxide"],
      ["humidity", "humidity"],
      ["noise", "sound_pressure"],
      // Indoor air: lists (the worst counts), the purifiers' sensors too.
      ["pm25", "pm25", true],
      ["pm10", "pm10", true],
      ["air_quality", null, true],
    ];
    const shown = all.filter(([key]) => !isEmpty(room[key]) || this._shown.has(`${index}:${key}`));
    if (shown.length) {
      body.append(
        this._form(
          shown.map(([key, deviceClass, multiple]) => ({
            name: key,
            selector: entity("sensor", { ...(deviceClass ? { device_class: deviceClass } : {}), ...(multiple ? { multiple } : {}) }),
          })),
          Object.fromEntries(shown.map(([key]) => [key, room[key]])),
          (value) => {
            for (const [key] of shown) {
              if (isEmpty(value[key])) delete room[key];
              else room[key] = value[key];
            }
          },
          (f) => this._label("room", f.name)
        )
      );
    }
    this._addChips(
      body,
      all
        .filter(([key]) => !shown.some(([k]) => k === key))
        .map(([key]) => [
          this._label("room", key),
          () => {
            this._shown.add(`${index}:${key}`);
            this._renderTab();
          },
        ])
    );
  }

  /** Air conditioner, fans and purifiers of a room, each with its settings folded. */
  _roomDevices(body, room, index) {
    if (room.climate || this._shown.has(`${index}:climate`)) {
      const climate = room.climate ? this._item(room.climate) : {};
      const defaults = this._effectiveControl(room, "climate");
      const line = this._el("div", "device-item");
      const form = this._form(
        this._climateSchema(climate.entity_id),
        climate,
        (value) => {
          if (!value.entity_id) delete room.climate;
          else room.climate = this._store(value);
          form.schema = this._climateSchema(value.entity_id);
        },
        (f) => {
          if (f.type === "expandable") return this._t("device_settings");
          return f.name === "entity_id" ? this._t("climate") : this._label("control", f.name, "climate");
        },
        (f) => this._defaultHelp(f, defaults)
      );
      line.append(
        form,
        this._iconButton("mdi:delete-outline", this._t("remove"), () => {
          delete room.climate;
          this._shown.delete(`${index}:climate`);
          this._changed();
          this._renderTab();
        })
      );
      body.append(line);
    }
    this._deviceList(body, room, "fans");
    this._deviceList(body, room, "purifiers");
    this._addChips(body, [
      ...(room.climate || this._shown.has(`${index}:climate`)
        ? []
        : [
            [
              this._t("climate"),
              () => {
                this._shown.add(`${index}:climate`);
                this._renderTab();
              },
            ],
          ]),
      [this._t("fan"), () => this._addItem(room, "fans")],
      [this._t("purifier"), () => this._addItem(room, "purifiers")],
    ]);
  }

  _addItem(room, key) {
    const items = Array.isArray(room[key]) ? room[key] : room[key] ? [room[key]] : [];
    room[key] = [...items, { entity_id: "" }];
    this._renderTab();
  }

  /** The fans, purifiers or lights of a room: one line each, its own settings folded. */
  _deviceList(body, room, key) {
    const items = Array.isArray(room[key]) ? room[key] : room[key] ? [room[key]] : [];
    const defaults =
      key === "lights"
        ? { ...this._config.defaults.lighting, ...(this._draft.lighting || {}), ...(room.lighting || {}) }
        : this._effectiveControl(room, key);
    const schemaFor = (item) =>
      key === "fans"
        ? this._fanSchema(item.entity_id)
        : key === "lights"
          ? this._lightSchema(item, defaults)
          : this._purifierSchema(item);
    items.forEach((raw, i) => {
      const item = this._item(raw);
      const line = this._el("div", "device-item");
      const form = this._form(
        schemaFor(item),
        item,
        (value) => {
          items[i] = this._store(value);
          room[key] = items.filter((x) => x && (typeof x === "string" || x.entity_id));
          form.schema = schemaFor(value);
        },
        (f) => (f.type === "expandable" ? f.title || this._t("device_settings") : this._deviceLabel(key, f.name)),
        (f) => this._defaultHelp(f, defaults)
      );
      line.append(
        form,
        this._iconButton("mdi:delete-outline", this._t("remove"), () => {
          items.splice(i, 1);
          if (items.length) room[key] = items;
          else delete room[key];
          this._changed();
          this._renderTab();
        })
      );
      body.append(line);
    });
  }

  /** Overrides of the alerts for a room: only those set, and a menu to customize another one. */
  _roomAlerts(body, room, index) {
    const globals =
      (room.type === "annex" ? this._config.defaults.annex_alerts : null) || this._config.defaults.alerts;
    const roomAlerts = room.alerts || {};
    const kinds = this._config.kinds.filter((k) => roomAlerts[k] || this._shown.has(`${index}:alert:${k}`));
    body.append(this._el("div", "help", this._t("room_alerts_help")));
    if (kinds.length) {
      const data = {};
      for (const kind of kinds) {
        const own = { ...(roomAlerts[kind] || {}) };
        if ("enabled" in own) own.enabled = own.enabled ? "on" : "off";
        data[kind] = own;
      }
      body.append(
        this._form(
          kinds.map((kind) => ({
            type: "expandable",
            name: kind,
            title: this._kindName(kind),
            icon: KIND_ICONS[kind],
            expanded: this._shown.has(`${index}:alert:${kind}`),
            schema: this._alertSchema(kind, globals[kind], true),
          })),
          data,
          (value) => {
            const out = { ...(room.alerts || {}) };
            for (const kind of kinds) {
              const own = prune(value[kind] || {});
              if (own.enabled) own.enabled = own.enabled === "on";
              else delete own.enabled;
              if (Object.keys(own).length) out[kind] = own;
              else delete out[kind];
            }
            if (Object.keys(out).length) room.alerts = out;
            else delete room.alerts;
          },
          (f) => (f.type === "expandable" ? f.title || this._t("advanced") : this._label("alert", f.name))
        )
      );
    }
    const others = this._config.kinds.filter((k) => !kinds.includes(k));
    if (others.length) {
      body.append(
        this._form(
          [{ name: "customize", selector: { select: { mode: "dropdown", options: others.map((k) => ({ value: k, label: this._kindName(k) })) } } }],
          {},
          (value) => {
            if (!value.customize) return;
            this._shown.add(`${index}:alert:${value.customize}`);
            this._renderTab();
          },
          () => this._t("customize_alert")
        )
      );
    }
  }

  /** Lights of a room, its quiet morning (bedrooms) and its nap slots. */
  _roomLighting(body, room, index) {
    this._deviceList(body, room, "lights");
    this._addChips(body, [[this._t("light"), () => this._addItem(room, "lights")]]);
    const lighting = room.lighting || {};
    body.append(
      this._form(
        [{ name: "quiet_morning", selector: bool }],
        { quiet_morning: Boolean(lighting.quiet_morning) },
        (value) => {
          const next = { ...(room.lighting || {}) };
          if (value.quiet_morning) next.quiet_morning = true;
          else delete next.quiet_morning;
          if (Object.keys(next).length) room.lighting = next;
          else delete room.lighting;
        },
        (f) => this._label("lighting", f.name),
        (f) => this._helper("lighting", f.name)
      )
    );
    body.append(this._el("div", "subheader", this._t("naps")));
    const naps = Array.isArray(room.naps) ? room.naps : [];
    const days = { select: { multiple: true, mode: "list", options: WEEKDAYS.map((d) => ({ value: d, label: this._t(`day_${d}`) })) } };
    if (!naps.length) body.append(this._el("div", "help", this._t("no_naps")));
    const remove = (i) =>
      this._iconButton("mdi:delete-outline", this._t("remove"), () => {
        naps.splice(i, 1);
        if (naps.length) room.naps = naps;
        else delete room.naps;
        this._changed();
        this._renderTab();
      });
    naps.forEach((nap, i) => {
      const line = this._el("div", "device-item");
      if (typeof nap === "string") {
        // A nap entity (a schedule helper shared with House Rules…): a nap while it is on.
        line.append(
          this._form(
            [{ name: "entity", required: true, selector: entity(["schedule", "input_boolean", "binary_sensor", "switch"]) }],
            { entity: nap },
            (value) => {
              naps[i] = value.entity || nap;
              room.naps = naps;
            },
            () => this._t("nap_entity"),
            () => this._t("nap_entity_help")
          ),
          remove(i)
        );
        body.append(line);
        return;
      }
      line.append(
        this._form(
          [
            grid([
              { name: "start", required: true, selector: time },
              { name: "end", required: true, selector: time },
            ]),
            { name: "days", selector: days },
          ],
          nap,
          (value) => {
            naps[i] = prune(value);
            room.naps = naps;
          },
          (f) => this._t(`nap_${f.name}`),
          (f) => (f.name === "days" ? this._t("nap_days_help") : undefined)
        ),
        remove(i)
      );
      body.append(line);
    });
    this._addChips(body, [
      [
        this._t("nap"),
        () => {
          room.naps = [...naps, { start: "13:30:00", end: "15:30:00" }];
          this._changed();
          this._renderTab();
        },
      ],
      [
        this._t("nap_entity"),
        () => {
          room.naps = [...naps, ""];
          this._changed();
          this._renderTab();
        },
      ],
    ]);
    this._roomPresence(body, room);
  }

  /** Lights on presence moved to House Rules (2.0): a room that still has some says so, and can drop them. */
  _roomPresence(body, room) {
    if (!room.presence) return;
    body.append(this._el("div", "subheader", this._t("presence_title")));
    const line = this._el("div", "device-item");
    line.append(
      this._el("div", "help", this._t("presence_moved")),
      this._iconButton("mdi:delete-outline", this._t("presence_remove"), () => {
        delete room.presence;
        this._changed();
        this._renderTab();
      })
    );
    body.append(line);
  }

  /** Icons of what the room has (sensors, openings, devices), and a badge after a discovery. */
  _roomSummary(room) {
    const found = this._discovered;
    return this._summary(
      [
        ["mdi:thermometer", room.temperature],
        ["mdi:molecule-co2", room.co2],
        ["mdi:blur", [...asList(room.pm25), ...asList(room.pm10), ...asList(room.air_quality)]],
        ["mdi:water-percent", room.humidity],
        ["mdi:volume-medium", room.noise],
        ["mdi:window-closed-variant", room.openings],
        ["mdi:air-conditioner", room.climate],
        ["mdi:fan", room.fans],
        ["mdi:air-purifier", room.purifiers],
        ["mdi:lightbulb-outline", room.lights],
      ],
      found?.added.has(room.name),
      found?.updated.has(room.name)
    );
  }

  /** Icons with how many of each, and a badge after a discovery (an outdoor place has its own wording). */
  _summary(entries, added, updated, outdoor = false) {
    const box = this._el("div", "room-summary");
    const count = (v) => (Array.isArray(v) ? v.length : v ? 1 : 0);
    for (const [icon, value] of entries) {
      const n = count(value);
      if (!n) continue;
      const chip = this._el("span", "summary-item");
      const i = document.createElement("ha-icon");
      i.icon = icon;
      chip.append(i);
      if (n > 1) chip.append(document.createTextNode(String(n)));
      box.append(chip);
    }
    const suffix = outdoor ? "_outdoor" : "";
    if (added) box.append(this._el("span", "badge new", this._t(`discovered_new${suffix}`)));
    else if (updated) box.append(this._el("span", "badge new", this._t(`discovered_updated${suffix}`)));
    return box;
  }

  _effectiveControl(room, section) {
    const defaults = this._config.defaults.control[section] || {};
    const global = this._draft.control?.[section] || {};
    const own = room.control?.[section] || {};
    return { ...defaults, ...global, ...own };
  }

  _defaultHelp(schema, defaults) {
    if (schema.type || schema.name === "entity_id" || schema.name === "mode_select") return undefined;
    const value = defaults[schema.name];
    if (value === undefined || value === null || value === "") return undefined;
    return this._t("default_value", { value: typeof value === "boolean" ? this._t(value ? "enabled" : "disabled") : value });
  }

  _deviceLabel(section, name) {
    if (name === "entity_id") return this._t({ fans: "fan", lights: "light" }[section] || "purifier");
    if (section === "lights") return this._label("lighting", name);
    const map = { mode_select: "purifier_mode_select", open_mode: "purifier_open_mode", closed_mode: "purifier_closed_mode" };
    if (map[name]) return this._label("room", map[name], "overrides");
    return this._label("control", name, section);
  }

  _climateSchema(entityId) {
    return [
      { name: "entity_id", selector: entity("climate") },
      ...(entityId
        ? [
            {
              type: "expandable",
              name: "",
              flatten: true,
              title: this._t("device_settings"),
              schema: [
                { name: "cool_above", selector: num("°C") },
                { name: "off_below", selector: num("°C") },
                { name: "setpoint", selector: num("°C", { step: 0.5 }) },
                { name: "fan_mode", selector: this._choice(this._attr(entityId, "fan_modes")) },
                { name: "closed_for", selector: minutes() },
                { name: "off_on_open", selector: minutes() },
                { name: "min_outdoor", selector: num("°C") },
                { name: "night_fan_mode", selector: this._choice(this._attr(entityId, "fan_modes")) },
                ...EQUIPMENT,
              ],
            },
          ]
        : []),
    ];
  }

  _lightSchema(item, defaults) {
    return [
      { name: "entity_id", selector: entity("light") },
      ...(item.entity_id
        ? [
            {
              type: "expandable",
              name: "",
              flatten: true,
              title: item.night_only ? `${this._t("device_settings")} · ${this._label("lighting", "night_only")}` : this._t("device_settings"),
              schema: [{ name: "night_only", selector: bool }, ...lightingLevels(item.warmth ?? defaults.warmth)],
            },
          ]
        : []),
    ];
  }

  _fanSchema(entityId) {
    const presets = this._attr(entityId, "preset_modes");
    return [
      { name: "entity_id", selector: entity("fan") },
      ...(entityId
        ? [
            {
              type: "expandable",
              name: "",
              flatten: true,
              title: this._t("device_settings"),
              schema: [
                { name: "on_above", selector: num("°C") },
                { name: "off_below", selector: num("°C") },
                { name: "percentage", selector: percent },
                { name: "preset", selector: this._choice(presets) },
                { name: "open_percentage", selector: percent },
                { name: "open_preset", selector: this._choice(presets) },
                { name: "off_preset", selector: this._choice(presets) },
                { name: "night_percentage", selector: percent },
                { name: "night_preset", selector: this._choice(presets) },
                ...EQUIPMENT,
              ],
            },
          ]
        : []),
    ];
  }

  _purifierSchema(item) {
    const entityId = item?.entity_id;
    const presets = this._attr(entityId, "preset_modes");
    const modes = item?.mode_select ? this._attr(item.mode_select, "options") : [];
    return [
      { name: "entity_id", selector: entity("fan") },
      ...(entityId
        ? [
            {
              type: "expandable",
              name: "",
              flatten: true,
              title: this._t("device_settings"),
              schema: [
                { name: "open_percentage", selector: percent },
                { name: "open_preset", selector: this._choice(presets) },
                { name: "closed_preset", selector: this._choice(presets) },
                { name: "mode_select", selector: entity("select") },
                ...(item?.mode_select
                  ? [
                      { name: "open_mode", selector: this._choice(modes) },
                      { name: "closed_mode", selector: this._choice(modes) },
                      { name: "night_mode", selector: this._choice(modes) },
                    ]
                  : []),
                { name: "keep_on", selector: bool },
                { name: "night_percentage", selector: percent },
                { name: "night_preset", selector: this._choice(presets) },
                ...EQUIPMENT,
              ],
            },
          ]
        : []),
    ];
  }
}
