// ── Rooms tab ──
// The Rooms tab: a card per room, with its sensors, its alert overrides, its lighting and its presence. Methods of
// SmartComfortPanel, copied onto its prototype at registration.
import { KIND_ICONS } from "./constants.js";
import { SENSOR_KEYS, asList, isEmpty, prune, shifted } from "./configuration.js";
import { WEEKDAYS, bool, grid, pick, text, time } from "./form.js";

export class SmartComfortPanelRooms {

  /** The type chosen in a room's form: stored when the user changes it, living space included, since discovery
   *  suggests a type only to the rooms without one (a room set back to living space stays so); unchanged, left as is. */
  _setRoomType(room, type) {
    const chosen = type || "living_space";
    if (chosen !== (room.type || "living_space")) room.type = chosen;
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
          [{ name: "openings", selector: pick("openings", { multiple: true }) }],
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
      [list(room.dehumidifiers).length, "dehumidifiers"],
      [list(room.heating).length, "heating"],
    ]
      .filter(([n]) => n)
      .map(([n, key]) => (n > 1 ? `${this._t(key)} (${n})` : this._t({ climate: "climate", heating: "heater" }[key] || key.slice(0, -1))));
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
      ["co2", "co2"],
      ["humidity", "humidity"],
      ["noise", "noise"],
      // Indoor air: lists (the worst counts), the purifiers' sensors too.
      ["pm25", "pm25", true],
      ["pm10", "pm10", true],
      ["air_quality", "air_quality", true],
      // Coldest wall or window (condensation risk), estimated from the outdoor temperature when unset.
      ["surface_temperature", "temperature"],
    ];
    const shown = all.filter(([key]) => !isEmpty(room[key]) || this._shown.has(`${index}:${key}`));
    if (shown.length) {
      body.append(
        this._form(
          shown.map(([key, kind, multiple]) => ({ name: key, selector: pick(kind, multiple ? { multiple } : {}) })),
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

  _addItem(room, key) {
    const items = Array.isArray(room[key]) ? room[key] : room[key] ? [room[key]] : [];
    room[key] = [...items, { entity_id: "" }];
    this._renderTab();
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
            [{ name: "entity", required: true, selector: pick("schedule") }],
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
        ["mdi:air-humidifier", room.dehumidifiers],
        ["mdi:radiator", room.heating],
        ["mdi:lightbulb-outline", room.lights],
      ],
      found?.added.has(room.name),
      found?.updated.has(room.name)
    );
  }
}
