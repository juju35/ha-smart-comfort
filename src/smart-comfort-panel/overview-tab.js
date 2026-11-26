// ── Overview tab ──
// The Overview tab: the home at a glance, its rooms, the outdoor places and the device control menu; the start card
// when nothing is set up yet. Methods of SmartComfortPanel, copied onto its prototype at registration.
import { DOMAIN, KIND_ICONS, unitOf } from "./constants.js";
import { intlLocale } from "./language.js";

export class SmartComfortPanelOverview {

  _time(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const today = new Date().toDateString() === d.toDateString();
    return today
      ? d.toLocaleTimeString(intlLocale(this._hass), { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleString(intlLocale(this._hass), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
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
      dehumidifiers: ["mdi:air-humidifier", "mdi:air-humidifier-off"],
      heating: ["mdi:radiator", "mdi:radiator-disabled"],
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
      control_dehumidifiers: "switch.smart_comfort_dehumidifier_control",
      control_heating: "switch.smart_comfort_heating_control",
      lighting: "switch.smart_comfort_adaptive_lighting",
    }[key] || "switch.smart_comfort_notifications";
  }
}
