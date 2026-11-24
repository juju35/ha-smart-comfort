// ── Alerts tab ──
// The Alerts tab: each kind of alert (on or off, its threshold, its severity), by group of rooms. Methods of
// SmartComfortPanel, copied onto its prototype at registration.
import { KIND_ICONS, UNITS } from "./constants.js";
import { diff, merged } from "./configuration.js";
import { bool, minutes, num } from "./form.js";

export class SmartComfortPanelAlerts {

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
}
