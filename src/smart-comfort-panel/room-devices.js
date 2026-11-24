// ── Room devices ──
// The devices of a room: its air conditioner, fans, air purifiers and lights, each with its settings folded. Methods
// of SmartComfortPanel, copied onto its prototype at registration.
import { EQUIPMENT, bool, entity, lightingLevels, minutes, num, percent } from "./form.js";

export class SmartComfortPanelRoomDevices {

  _attr(entityId, attribute) {
    const value = this._hass.states[entityId]?.attributes?.[attribute];
    return Array.isArray(value) ? value : [];
  }

  _choice(values, current) {
    const options = [...new Set([...values, ...(current ? [current] : [])])];
    return { select: { mode: "dropdown", custom_value: true, options } };
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
