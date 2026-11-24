// ── Schedule tab ──
// The Schedule tab: every time window on one 24-hour line, with the time now. Methods of SmartComfortPanel, copied
// onto its prototype at registration.
import { isEmpty, merged } from "./configuration.js";
import { grid, minutesOf, time } from "./form.js";

export class SmartComfortPanelSchedule {

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
}
