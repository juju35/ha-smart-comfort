// ── Panel ──
import { DOMAIN, ROOM_ICONS, SCORE_PENALTY } from "./constants.js";
import { intlLocale, stringsFor } from "./language.js";
import { OLD_TABS, TABS } from "./tabs.js";
import { clone, prune } from "./configuration.js";
import { loadHaForm } from "./form.js";
import { smartComfortPanelFold } from "./folded-top-bar.js";
import { SCB_ICONS, scbBanner } from "./illustrated-header.js";
import { STYLE } from "./styles.js";
import { STRINGS } from "./i18n/strings.js";

/**
 * Smart Comfort — configuration panel.
 *
 * A plain web component (no build step) that Home Assistant loads in the sidebar. It reads and saves
 * the integration options over the WebSocket API (smart_comfort/config, smart_comfort/config/save),
 * follows the status (smart_comfort/subscribe) and renders the forms with Home Assistant's ha-form,
 * whose labels come from the integration's own translations (options flow strings).
 */

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

  _format(value, digits = 1) {
    if (typeof value !== "number") return "–";
    return value.toLocaleString(intlLocale(this._hass), { maximumFractionDigits: digits, minimumFractionDigits: 0 });
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

  // Notifications (general options).

  // Shared form helpers.

  _advanced(schema) {
    return { type: "expandable", name: "", flatten: true, title: this._t("advanced"), icon: "mdi:tune-variant", schema };
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
}
