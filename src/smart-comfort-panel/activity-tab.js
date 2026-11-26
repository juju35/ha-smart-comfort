// ── Activity tab ──
// The Activity tab: what Smart Comfort did and why, day by day, live, with its filters. Methods of
// SmartComfortPanel, copied onto its prototype at registration.
import { intlLocale } from "./language.js";
import { ACTIVITY_GROUPS, ACTIVITY_ICONS, ACTIVITY_MAX, activityGroup } from "./tabs.js";

export class SmartComfortPanelActivity {

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
      const label = this._targetLabel(t);
      if (label !== null) return label;
      if (t === "presence") return this._t("a_presence_on");
      if (t === "display_off" || t === "display_on") return this._t(`a_${t}`);
      return `${this._t("a_lighting")} · ${t}`;
    };
    let icon = ACTIVITY_ICONS[entry.kind] || "mdi:information-outline";
    let text;
    if (entry.kind === "device") {
      text = target(entry.target);
      icon = String(entry.target || "").startsWith("heat:")
        ? "mdi:radiator"
        : ["dry", "dry_night", "off_night", "shower"].includes(entry.target)
          ? "mdi:air-humidifier"
          : { climate: "mdi:air-conditioner", fan: "mdi:fan", humidifier: "mdi:air-humidifier" }[String(entry.entity_id).split(".")[0]] || icon;
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
}
