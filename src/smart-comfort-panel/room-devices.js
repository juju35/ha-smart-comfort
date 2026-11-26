// ── Room devices ──
// The devices of a room: its air conditioner, fans, air purifiers, dehumidifiers, heaters and lights. Each device shows
// its few essential settings, the rest under Advanced, in a tile of its own; an empty field shows the default it falls
// back to (greyed), an unset switch its default state. Methods of SmartComfortPanel, copied onto its prototype at registration.
import { EQUIPMENT, bool, entity, humidity, lightingLevels, minutes, num } from "./form.js";

// A percentage typed in a box, so that an empty one can show its default (a slider can't).
const pct = { number: { mode: "box", step: 1, min: 0, max: 100, unit_of_measurement: "%" } };
const pair = (fields) => ({ type: "grid", name: "", column_min_width: "120px", schema: fields });
const setpoint = num("°C", { step: 0.5, min: 0, max: 35 });
// How a dehumidifier spends the night: a choice standing for night_off and night_mode (never stored as such).
const NIGHT = "night_behaviour";

export class SmartComfortPanelRoomDevices {

  _attr(entityId, attribute) {
    const value = this._hass.states[entityId]?.attributes?.[attribute];
    return Array.isArray(value) ? value : [];
  }

  _choice(values, current) {
    const options = [...new Set([...values, ...(current ? [current] : [])])];
    return { select: { mode: "dropdown", custom_value: true, options } };
  }

  /** Air conditioner, fans, purifiers, dehumidifiers and heaters of a room, each with its settings. */
  _roomDevices(body, room, index) {
    if (room.climate || this._shown.has(`${index}:climate`)) {
      const climate = room.climate ? this._item(room.climate) : {};
      const defaults = this._effectiveControl(room, "climate");
      const line = this._el("div", "device-item slot");
      const form = this._deviceForm(
        "climate",
        climate,
        defaults,
        (value) => {
          if (!value.entity_id) delete room.climate;
          else room.climate = this._store(value);
        },
        (value) => this._climateSchema(value.entity_id)
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
    for (const key of ["fans", "purifiers", "dehumidifiers", "heating"]) this._deviceList(body, room, key);
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
      [this._t("dehumidifier"), () => this._addItem(room, "dehumidifiers")],
      [this._t("heater"), () => this._addItem(room, "heating")],
    ]);
  }

  /** The fans, purifiers, dehumidifiers, heaters or lights of a room: one block each. */
  _deviceList(body, room, key) {
    const items = Array.isArray(room[key]) ? room[key] : room[key] ? [room[key]] : [];
    const defaults =
      key === "lights"
        ? { ...this._config.defaults.lighting, ...(this._draft.lighting || {}), ...(room.lighting || {}) }
        : this._effectiveControl(room, key);
    const schemaFor = (item) =>
      ({
        fans: () => this._fanSchema(item.entity_id),
        lights: () => this._lightSchema(item, defaults),
        dehumidifiers: () => this._dehumidifierSchema(item),
        heating: () => this._heaterSchema(item),
      })[key]?.() ?? this._purifierSchema(item);
    items.forEach((raw, i) => {
      const line = this._el("div", "device-item slot");
      const form = this._deviceForm(
        key,
        this._item(raw),
        defaults,
        (value) => {
          items[i] = this._store(value);
          room[key] = items.filter((x) => x && (typeof x === "string" || x.entity_id));
        },
        schemaFor
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

  /**
   * One device's form. Its empty fields show their defaults (greyed); an unset switch shows its default state, and
   * is stored only once changed from it, so that the device keeps following the defaults it doesn't override.
   */
  _deviceForm(key, item, defaults, store, schemaFor) {
    const own = { ...item };
    const shown = (value) => {
      const data = { ...value };
      for (const f of this._flatFields(schemaFor(value))) {
        if (f.selector?.boolean && data[f.name] === undefined && typeof defaults[f.name] === "boolean") {
          data[f.name] = defaults[f.name];
        }
      }
      if (key === "dehumidifiers") data[NIGHT] = this._nightOf(value, defaults);
      return data;
    };
    const kept = (value) => {
      const out = { ...value };
      for (const f of this._flatFields(schemaFor(out))) {
        // A switch left at its default state is not stored (it was only shown so).
        if (f.selector?.boolean && own[f.name] === undefined && out[f.name] === defaults[f.name]) delete out[f.name];
      }
      if (key === "dehumidifiers") this._setNight(out, out[NIGHT], defaults, this._attr(out.entity_id, "available_modes"));
      delete out[NIGHT];
      return out;
    };
    const form = this._form(
      this._withDefaults(schemaFor(item), defaults),
      shown(item),
      (value) => {
        const next = kept(value);
        for (const name of Object.keys(own)) if (!(name in next)) delete own[name];
        Object.assign(own, next);
        store(next);
        form.schema = this._withDefaults(schemaFor(next), defaults);
        form.data = shown(next);
      },
      (f) => (f.type === "expandable" ? f.title : f.name === NIGHT ? this._t("night_behaviour") : this._deviceLabel(key, f.name))
    );
    return form;
  }

  /** The fields of a schema, through its grids and expandables. */
  _flatFields(schema) {
    return schema.flatMap((f) => (f.schema ? this._flatFields(f.schema) : [f]));
  }

  /** The schema with each field's default as its placeholder (shown greyed while the field is empty). */
  _withDefaults(schema, defaults) {
    return schema.map((f) => {
      if (f.schema) return { ...f, schema: this._withDefaults(f.schema, defaults) };
      const value = defaults[f.name];
      if (f.name === "entity_id" || f.selector?.boolean || value === undefined || value === null || value === "") return f;
      return { ...f, default: value };
    });
  }

  _nightOf(item, defaults) {
    const off = item.night_off ?? defaults.night_off;
    if (off) return "off";
    return item.night_mode || defaults.night_mode ? "quiet" : "normal";
  }

  /** The night choice of a dehumidifier into night_off and night_mode (dropped when back to the defaults); a quiet
   *  night just chosen gets the device's quietest mode, to change at will. */
  _setNight(item, choice, defaults, modes = []) {
    if (!choice) return;
    if (choice === "off") {
      if (defaults.night_off) delete item.night_off;
      else item.night_off = true;
      return;
    }
    if (defaults.night_off) item.night_off = false;
    else delete item.night_off;
    if (choice === "normal") delete item.night_mode;
    else if (choice === "quiet" && !item.night_mode && !defaults.night_mode) {
      item.night_mode = modes.find((m) => /sleep|silent|quiet|night|nuit|nacht|calme/i.test(m)) || modes[0];
    }
  }

  _effectiveControl(room, section) {
    const defaults = this._config.defaults.control[section] || {};
    const global = this._draft.control?.[section] || {};
    const own = room.control?.[section] || {};
    return { ...defaults, ...global, ...own };
  }

  _deviceLabel(section, name) {
    if (name === "entity_id") {
      return this._t({ fans: "fan", lights: "light", dehumidifiers: "dehumidifier", heating: "heater", climate: "climate" }[section] || "purifier");
    }
    if (section === "lights") return this._label("lighting", name);
    const map = { mode_select: "purifier_mode_select", open_mode: "purifier_open_mode", closed_mode: "purifier_closed_mode" };
    if (map[name]) return this._label("room", map[name], "overrides");
    return this._label("control", name, section);
  }

  /** The essentials on show, then the rest under Advanced; only the entity picker until one is chosen. */
  _deviceSchema(domain, entityId, essentials, advanced) {
    return [{ name: "entity_id", selector: entity(domain) }, ...(entityId ? [...essentials, this._advanced([...advanced, ...EQUIPMENT])] : [])];
  }

  _climateSchema(entityId) {
    const fanModes = this._attr(entityId, "fan_modes");
    return this._deviceSchema(
      "climate",
      entityId,
      [pair([{ name: "cool_above", selector: num("°C") }, { name: "off_below", selector: num("°C") }]), { name: "setpoint", selector: num("°C", { step: 0.5 }) }],
      [
        { name: "fan_mode", selector: this._choice(fanModes) },
        { name: "night_fan_mode", selector: this._choice(fanModes) },
        pair([{ name: "closed_for", selector: minutes() }, { name: "off_on_open", selector: minutes() }]),
        { name: "min_outdoor", selector: num("°C") },
      ]
    );
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
    return this._deviceSchema(
      "fan",
      entityId,
      [pair([{ name: "on_above", selector: num("°C") }, { name: "off_below", selector: num("°C") }]), pair([{ name: "percentage", selector: pct }, { name: "open_percentage", selector: pct }])],
      [
        pair([{ name: "preset", selector: this._choice(presets) }, { name: "open_preset", selector: this._choice(presets) }]),
        { name: "off_preset", selector: this._choice(presets) },
        pair([{ name: "night_percentage", selector: pct }, { name: "night_preset", selector: this._choice(presets) }]),
        pair([{ name: "shower_percentage", selector: pct }, { name: "shower_preset", selector: this._choice(presets) }]),
      ]
    );
  }

  _purifierSchema(item) {
    const entityId = item?.entity_id;
    const presets = this._attr(entityId, "preset_modes");
    const modes = item?.mode_select ? this._attr(item.mode_select, "options") : [];
    return this._deviceSchema(
      "fan",
      entityId,
      [pair([{ name: "open_preset", selector: this._choice(presets) }, { name: "closed_preset", selector: this._choice(presets) }]), { name: "keep_on", selector: bool }],
      [
        { name: "open_percentage", selector: pct },
        { name: "mode_select", selector: entity("select") },
        ...(item?.mode_select
          ? [
              pair([{ name: "open_mode", selector: this._choice(modes) }, { name: "closed_mode", selector: this._choice(modes) }]),
              { name: "night_mode", selector: this._choice(modes) },
            ]
          : []),
        pair([{ name: "night_percentage", selector: pct }, { name: "night_preset", selector: this._choice(presets) }]),
      ]
    );
  }

  _dehumidifierSchema(item) {
    const entityId = item?.entity_id;
    const modes = this._attr(entityId, "available_modes");
    const humidifier = entityId?.startsWith("humidifier.");
    // A quiet night needs a mode to switch to: humidifier entities that have some.
    const nightChoices = ["normal", ...(humidifier && modes.length ? ["quiet"] : []), "off"];
    const quiet = humidifier && item.night_mode !== undefined && item.night_off !== true;
    return this._deviceSchema(
      ["humidifier", "switch"],
      entityId,
      [
        pair([
          { name: "on_above", selector: humidity },
          { name: "off_below", selector: humidity },
        ]),
        {
          name: NIGHT,
          selector: { select: { mode: "list", options: nightChoices.map((value) => ({ value, label: this._t(`night_${value}`) })) } },
        },
        ...(quiet ? [{ name: "night_mode", selector: this._choice(modes) }] : []),
        { name: "tank", selector: entity("binary_sensor") },
      ],
      [
        ...(humidifier
          ? [
              pair([{ name: "mode", selector: this._choice(modes) }, { name: "boost_mode", selector: this._choice(modes) }]),
              { name: "target_humidity", selector: pct },
            ]
          : []),
        { name: "prefer_airing", selector: bool },
        pair([{ name: "airing_wait", selector: minutes() }, { name: "off_on_open", selector: minutes() }]),
      ]
    );
  }

  _heaterSchema(item) {
    const entityId = item?.entity_id;
    const presets = this._attr(entityId, "preset_modes");
    const modes = ["comfort", "eco", "frost", "away"];
    return this._deviceSchema(
      "climate",
      entityId,
      [
        { type: "grid", name: "", column_min_width: "90px", schema: modes.map((m) => ({ name: m, selector: setpoint })) },
        { name: "schedule", selector: entity(["schedule", "input_boolean", "binary_sensor", "switch"]) },
        { name: "stove", selector: bool },
        ...(item.stove ? [{ name: "pellets", selector: entity("sensor") }] : []),
      ],
      [
        ...(presets.length
          ? [{ type: "grid", name: "", column_min_width: "120px", schema: modes.map((m) => ({ name: `${m}_preset`, selector: this._choice(presets) })) }]
          : []),
        { name: "backup", selector: bool },
        ...(item.backup ? [{ name: "backup_margin", selector: num("°C", { step: 0.5, min: 0, max: 10 }) }] : []),
      ]
    );
  }
}
