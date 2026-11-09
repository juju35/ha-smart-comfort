# Smart Comfort — Agent Context

## Purpose
Home Assistant custom integration that replaces cooldown-based comfort automations: per-room alerts tracked as episodes and sent as grouped, replaceable notifications, plus control of air conditioners, fans and air purifiers.

## Architecture

```
custom_components/smart_comfort/
├── __init__.py      # YAML import (async_import_yaml), actions snooze/unsnooze/acknowledge/notify_now, entry setup
├── const.py         # Keys (same in YAML and options), kinds, DEFAULT_ALERTS, DEFAULT_CONTROL
├── schema.py        # voluptuous: CONFIG_SCHEMA (YAML) and OPTIONS (also validates what the options flow saves)
├── config.py        # Pure: build_settings(options) -> Settings/Room/AlertSettings/devices, defaults merged (global < room < device)
├── engine.py        # Pure: Episode, Engine.evaluate (readings -> episodes), Engine.step (gates -> Digest | Clear | None)
├── lighting.py    # Pure: LightController (brightness/warmth of the lights that are on, by sun elevation and night hours; manual pause until off)
├── control.py       # Pure: Controller.evaluate (room context + device states -> Commands), targets, manual overrides, keep_on
├── message.py       # Pure: render(digest, texts) -> title, message; texts = translations common.*
├── manager.py       # HA glue: state tracking, debounce, interval, commands with own Context, notify, mobile_app actions, Store
├── config_flow.py   # Single entry; import step; options menu general / alerts (per kind) / control (sections) / rooms
├── sensor.py        # alerts, room (enum per room), last_notification
├── calendar.py      # alerts_calendar: engine.history (finished, 90 days / HISTORY_SIZE) + engine.active() (end = now + 1 min) as events; kind names from the selector translations, description = message.problem_text(peak)
├── switch.py        # notifications, control (restored)
├── button.py        # notify_now, unsnooze
├── status.py        # episode_info / room_info / status: shared by the sensors and the panel
├── diagnostics.py   # async_get_config_entry_diagnostics: entry data/options + status(), notify and url redacted
├── websocket.py     # smart_comfort/config, smart_comfort/config/save (OPTIONS + unique room names), smart_comfort/subscribe (SIGNAL_UPDATE)
├── discovery.py     # discover_rooms -> Found (areas -> rooms, outdoor areas -> outdoor places, outdoor sensors in no area), merge (keeps what is set, matches on area then name; place sensors leave the top-level lists)
├── panel.py         # Static path /smart_comfort_static (once per run) + custom panel "smart-comfort" (admin), removed with the entry; activity and mini cards = dashboard resources (storage mode, once HA runs), else extra modules (YAML resources), resources removed with the entry
├── frontend/smart-comfort-panel.js  # Plain web component (no build): tabs overview/rooms/alerts/notifications/control, ha-form
├── frontend/smart-comfort-activity-card.js  # Activity card (smart_comfort/activity subscription, any user); also the panel's Activity tab
├── frontend/smart-comfort-mini-card.js  # Mini card + `smart-comfort-card` (subclass, FULL: always the full view, no zoom button, no `alerts` option). Mini card: reads the entities (registry platform + translation_key: alerts, room, switches), zoom to the full card (embeds the activity card)
├── entity.py / icons.json / services.yaml / translations/{en,fr,de,es,sr,sr-Latn,it,nl,pt,pt-BR,pl,ro,da,sv,bg,ru,uk,hu,sk,cs,sl,lv,el}.json (pt-BR: copy of pt) / brand/
```

## Rules
- Options dict is the single source of truth (entry.options), same shape as YAML. Missing keys mean defaults; keep it minimal. A field emptied in the options flow whose default is a value is stored as None (stays empty). Rooms created in the UI get a stable `id` (renaming keeps the sensor and the episodes).
- YAML: `async_import_yaml` creates the entry via the import flow, or, when the entry exists (a single-entry integration can't run a flow then), updates its options only if the sha256 of the YAML differs from `entry.data["yaml_hash"]`. Unchanged YAML keeps UI edits.
- Episode key `room|kind`. Pending until `delay`, active after; ends when the check is False (hysteresis applied once the episode exists). A check returning None (unknown sensor/opening) leaves the episode untouched, unless the sensor entity no longer exists (`RoomReading.missing`, once HA runs and the startup grace is over; `outdoor` when every outdoor entity is gone, for the kinds whose `SOURCES` list it). Episodes whose sensor was removed from the room go away in `update_settings`. An opening unavailable for `OPENING_UNAVAILABLE` min is left out of its room. Temperatures are °C (°F/K converted; weather entities: `temperature` attribute).
- Due = never notified, worse by `escalation` (not when acknowledged), `reminder` elapsed or episode snooze over since the last notification (not when acknowledged). Snoozed (episode, room or "*") and handled too_hot (room whose AC/fan target is running) are invisible.
- Digest = all visible episodes (only critical ones while `hold`), sent when the batch is older than `digest_window` or a due item is critical. Same `tag` every time: it replaces the previous notification. `Clear` (clear_notification, to `notify.mobile_app_*` and legacy notify groups only) once no visible episode was notified. `step()` doesn't mark a digest: the manager calls `engine.sent()` once at least one notifier got it.
- History: `Engine._finish(ep, now)` keeps an episode that was active when it ends (`Episode.finished`: start, end, value, peak, details, notified), pruned to `HISTORY_DAYS` in `evaluate`, stored with the engine (`history`). `Episode.peak` = worst value (`worsening`).
- Gates: startup grace (only when HA was starting at setup), notifications switch, hold (quiet hours or presence away).
- Control: a target per device; commands only on a target change and when the device doesn't already satisfy it. Hysteresis band keeps the previous target. Climate in a mode other than cool/off is left alone, except by `off_open` (opening open for `off_on_open`). A purifier without closed preset/mode goes back to its pre-boost state (`before_boost`). A failed command forgets the target, retried after `COMMAND_RETRY` min doubled at each failure in a row (max `COMMAND_RETRY_MAX`, reset when all commands of the device succeed; another target is not held back); a failed pre-boost restore puts `before_boost` back. keep_on respects manual overrides. Manual change = device state/attribute change whose context isn't ours, outside 90 s after our last command → override `manual_override` min; when it ends the target is forgotten and applied again.
- State (episodes, snoozes, last notified keys, targets, overrides, pre-boost states, last notification, switches) in `Store` `smart_comfort`, and in `hass.data[DOMAIN]["state"]` across entry reloads; `async_stop` waits for the evaluation in progress first. `async_remove_entry` deletes both.
- Notification texts: translations `common.*` with `str.format`; a broken template falls back to English (message.FALLBACK).

## Noise and quiet night
- Kinds `noise_high` (room `noise`, sound_pressure sensor) and `noisy_outside` (opening open, `outdoor_noise` mean > threshold); `ventilate` is false while the outdoor noise is above `max_outdoor_noise` (unknown noise: no objection). `RoomReading.outdoor_noise` carries the global value to each room; `GLOBAL_SOURCES` are not room fields.
- Outdoors: `outdoors` places (name, area, lists temperature / air_quality / noise); `build_settings` unions them with the top-level `outdoor_temperature` / `outdoor_air_quality` / `outdoor_noise` into `Settings.outdoor` / `outdoor_air` / `outdoor_noise`. Air quality = level 1–6 (`manager.air_level`: European index as is, US AQI by bands when device class aqi or > 6, text states; ≤ 0 = no data), worst sensor wins. Kind `bad_air_outside` (opening open, level > threshold); `ventilate` false while the level is above `max_outdoor_air`.
- Indoor air: room lists `pm25` / `pm10` / `air_quality` (`Room.indoor_air`, source "indoor_air": missing only when all are gone), worst value each (`manager.indoor_air_level`: a `homekit_controller` index 1–5 as is, else `air_level`). Kind `polluted_air`: PM2.5 `threshold`/`hysteresis`, `pm10_threshold`/`pm10_hysteresis`, `aqi_threshold`/`aqi_hysteresis`; value = first metric over (pm25, pm10, aqi), `details.metric`; text `line_polluted_air` / `line_polluted_air_index`. The manager evaluates the engine before the control: `RoomContext.polluted` = active episode → purifier target `purify` (open_* settings, any hour, not at night for quiet ones), restored like a boost. `handled` holds room ids (too_hot: AC/fan) and episode keys (`room|polluted_air`: `Controller.purifying`); `engine.is_handled`. Discover takes the pm25/pm10/aqi sensors of the area, purifiers' included.
- `Settings.night(local)` (control `night_start`/`night_end`, none when either is unset). Device `quiet` = has night settings. Targets `cool_night` / `on_night` / `night` (purifier), normalized at each evaluation so day <-> night switches send only what changes (climate already cooling: fan mode only). No window boost at night for quiet devices. A purifier's night, like its boost, saves `_snapshot` (on, preset, percentage, mode option) in `before_boost` when it has no closed preset/mode, restored at `normal`.

## Panel
- Registered at entry setup when `frontend` is loaded, kept across entry reloads (saving reloads the entry; an open panel must not vanish), removed in `async_remove_entry`.
- Labels come from the translations through `frontend/get_translations` (category `options`: the options flow steps general / alert / control (+ sections) / room (+ section overrides); category `selector`: kinds, severities, aggregates). Panel-only strings are in `STRINGS` of the JS, panel, activity card and mini card (plural forms `_few`/`_many` where the language has them) (en/fr/de/es/sr/sr-Latn/it/nl/pt/pl/ro/da/sv/bg/ru/uk/hu/sk/cs/sl/lv/el; full language tag first, then its base, then en).
- ha-form is lazy-loaded by Home Assistant: `loadHaForm()` loads it through the entities card editor.
- The draft stores only what differs from the defaults (`diff`, `prune`); times "HH:MM" and "HH:MM:SS" compare equal. Device items with no own setting are stored as a bare entity id. Unknown keys of a room (room-level `control`, `id`) are kept.
- Discover: `smart_comfort/discover` returns the draft options with the discovered rooms merged (not saved); the panel marks them new/completed until Save or Discard.
- Discovery words (discovery.py) are in slug form for en/fr/de/es/it/nl/pt/pl/sr; `_slug` writes Serbian Cyrillic in Latin first. A word found anywhere in the slug, or at the start of a word when it begins with `_` ("_basta" is not in "sebastian"). Machine words (`EQUIPMENT_WORDS`) are whole words; not "camera" (an Italian bedroom): a camera's own sensors are left out by its device's `camera` domain (`BUSY_DOMAINS`).
- The status subscription listens to `SIGNAL_UPDATE`, sent by `_update_listeners` and by setup/unload, so it survives reloads.

## Release
Bump `version` in manifest.json and add its CHANGELOG.md section; pushing to main publishes `vX.Y.Z` with `smart_comfort.zip` when that tag doesn't exist yet.

## Tests
`pip install -r requirements_test.txt && pytest` — engine/control/message tests are pure Python; `tests/test_init.py` runs the integration with mocked notify and fan services. CI runs the latest Home Assistant (Python 3.14) and 2024.12.0.
- Lighting: `rooms[].lights` (entity or {entity_id, night_only, day/evening/night, warmth, *_kelvin}), merged global `lighting` < room `lighting` < light. Never turns lights on/off. A light turning on (context not ours) triggers an immediate evaluation; its first command uses transition 1, later ones `transition`. Commands are compared with the last target sent (not the state, which moves during a transition). Manual change = brightness/color_temp_kelvin change while on, not our context, after max(90 s, transition + 30 s) → pause until off or `manual_override`. Switch `lighting` (`lighting_enabled`, persisted). Phases by priority: night (control night hours) > nap (`rooms[].naps`, days optional) > quiet morning (lights with `quiet_morning`, night_end → `lighting.morning_end`) > day/evening blend. Night lights are set at night and in naps. Discover sets `lighting.quiet_morning` on bedrooms (by name), never naps.
- Presence lights (`rooms[].presence`, `PresenceController` in lighting.py): present = a sensor on (None when none known → nothing). Present: turn on the presence lights (chosen or the room's) only if none is on, not suppressed (turned off by hand while present), lux ≤ max_lux; per light: skipped in naps if in `not_during_naps`, first matching slot decides (off / brightness, a set brightness puts an adaptive override), night lights only in night/nap phases, else the adaptive target. Absent for `off_after` min: turn off the presence lights that are on, clear the suppression. A presence sensor change evaluates at once and again after `off_after`. Runs after the LightController in the evaluation (which forgets the lights it sees off).

## Translations
The frontend files keep every language in the sources. The release runs `scripts/split-frontend.mjs` before building the zip: English stays in each file, every other language goes to `<file>.i18n.<lang>.js` next to it, fetched when a card or the panel first needs it (`scripts/i18n-split.mjs`; it rebuilds every table to check the split, and the Validate job runs it on a copy with `--check`). The frontend folder is served as a whole, so those files are served next to the card.
