// ── Settings tab ──
// The Settings tab: notifications, device control, adaptive lighting. Methods of SmartComfortPanel, copied onto its
// prototype at registration.
import { LEVEL_KEYS, bool, grid, humidity, lightingLevels, minutes, num, percent, pick, text, time } from "./form.js";

// Where the device control labels live: the step's own, then each device section's.
const CONTROL_SECTIONS = [null, "climate", "fans", "purifiers", "dehumidifiers", "heating"];

export class SmartComfortPanelSettings {

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
        { name: "presence", selector: pick("presence") },
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

  // Device control.

  _controlSchema() {
    // Each field keeps its section, for its label (off_on_open of the heating is not the air conditioners' one).
    const tag = (fields, section) => fields.map((f) => (f.schema ? { ...f, schema: tag(f.schema, section) } : { ...f, section }));
    const sec = (name, icon, schema) => ({ type: "expandable", name, icon, title: this._sectionTitle("control", name), schema: tag(schema, name) });
    // A group inside a section: folded, its fields kept at the section's level.
    const group = (key, icon, schema) => ({ type: "expandable", name: "", flatten: true, icon, title: this._t(key), schema });
    return [
      { name: "enabled", selector: bool },
      { name: "suppress_when_handled", selector: bool },
      { name: "manual_override", selector: minutes() },
      // A shower: the dehumidifiers (and the fans with a shower speed) of the room boosted.
      { name: "shower_rise", selector: humidity },
      { name: "shower_boost", selector: minutes() },
      sec("climate", "mdi:air-conditioner", [
        grid([
          { name: "cool_above", selector: num("°C") },
          { name: "off_below", selector: num("°C") },
          { name: "setpoint", selector: num("°C", { step: 0.5 }) },
        ]),
        grid([
          { name: "closed_for", selector: minutes() },
          { name: "off_on_open", selector: minutes() },
        ]),
        { name: "min_outdoor", selector: num("°C") },
      ]),
      sec("fans", "mdi:fan", [
        grid([
          { name: "on_above", selector: num("°C") },
          { name: "off_below", selector: num("°C") },
        ]),
        { name: "percentage", selector: percent },
        { name: "open_percentage", selector: percent },
        { name: "night_percentage", selector: percent },
      ]),
      sec("purifiers", "mdi:air-purifier", [
        { name: "open_percentage", selector: percent },
        { name: "keep_on", selector: bool },
        { name: "night_percentage", selector: percent },
      ]),
      sec("dehumidifiers", "mdi:air-humidifier", [
        grid([
          { name: "on_above", selector: humidity },
          { name: "off_below", selector: humidity },
        ]),
        { name: "night_off", selector: bool },
        { name: "prefer_airing", selector: bool },
        grid([
          { name: "airing_wait", selector: minutes() },
          { name: "off_on_open", selector: minutes() },
        ]),
      ]),
      sec("heating", "mdi:radiator", [
        group("heat_setpoints", "mdi:thermometer", [
          grid(["comfort", "eco", "frost", "away"].map((m) => ({ name: m, selector: num("°C", { step: 0.5, min: 0, max: 35 }) }))),
        ]),
        group("heat_schedule", "mdi:calendar-clock", [
          { name: "schedule", selector: pick("schedule") },
          { name: "preheat", selector: bool },
          { name: "preheat_max", selector: minutes() },
        ]),
        group("heat_tempo", "mdi:flash", [
          grid([
            { name: "tempo", selector: pick("tempo") },
            { name: "tempo_tomorrow", selector: pick("tempo") },
          ]),
          grid([
            { name: "tempo_red", selector: num("°C", { step: 0.5, min: 0, max: 10 }) },
            { name: "tempo_white", selector: num("°C", { step: 0.5, min: 0, max: 10 }) },
            { name: "tempo_preheat", selector: num("°C", { step: 0.5, min: 0, max: 5 }) },
          ]),
          { name: "offpeak", selector: pick("offpeak") },
          grid([
            { name: "offpeak_start", selector: time },
            { name: "offpeak_end", selector: time },
          ]),
        ]),
        group("heat_safety", "mdi:shield-check-outline", [
          grid([
            { name: "off_on_open", selector: minutes() },
            { name: "max_outdoor", selector: num("°C") },
            { name: "fault_after", selector: minutes(10) },
          ]),
        ]),
      ]),
    ];
  }

  _controlLabel(schema) {
    if (schema.type === "expandable") return schema.title || this._sectionTitle("control", schema.name);
    for (const section of [schema.section, ...CONTROL_SECTIONS].filter((x) => x !== undefined)) {
      const label = this._label("control", schema.name, section);
      if (label !== schema.name) return label;
    }
    return schema.name;
  }

  _controlHelper(schema) {
    for (const section of [schema.section, ...CONTROL_SECTIONS].filter((x) => x !== undefined)) {
      const help = this._helper("control", schema.name, section);
      if (help) return help;
    }
    return undefined;
  }
}
