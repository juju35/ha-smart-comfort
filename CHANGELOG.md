# Changelog

## 2.3.0 - 2026-11-26

### Features
- Dehumidifiers (`dehumidifiers:` of a room, `humidifier` or `switch` entities): dry from `on_above` (65 %) to `off_below` (55 %), or while a condensation risk is under way; their `mode` / `target_humidity`, a quiet `night_mode` or `night_off`, off when an opening stays open (`off_on_open`), left alone while their `tank` sensor says it is full. With `prefer_airing`, they wait `airing_wait` minutes while opening the windows would dry the room.
- Shower boost: a humidity rise of `control.shower_rise` points (10) within 10 minutes boosts the room's dehumidifiers (`boost_mode`) and its fans with a `shower_percentage` / `shower_preset` for `control.shower_boost` minutes (30).
- Heating (`heating:` of a room, `climate` entities): comfort / eco from a `schedule` helper, away while nobody is home, frost protection in an annex and while an opening stays open, off from `max_outdoor` (16 °C) outdoors and while the room's air conditioner cools (which no longer cools while the room heats). Pilot wire radiators by their presets of each mode. Comfort anticipated from the room's learnt warm-up rate (`preheat`, `preheat_max`). EDF Tempo: setpoints lowered on red (`tempo_red`, 2 °C) and white days, raised (`tempo_preheat`) in the off-peak hours before a red day. Pellet stoves (`stove`, `pellets`) as the main source, with `backup` heaters kept at eco while one heats.
- New alerts: `condensation_risk` (the coldest wall — a `surface_temperature` sensor, else estimated from the outdoor temperature — near the dew point), `air_to_dry` (a damp room whose windows are closed while the outdoor air is drier, from the new `outdoor_humidity` sensors), `tank_full`, `heating_fault` (heating on that doesn't warm the room for `fault_after` minutes) and `pellets_low`. High humidity, condensation risk and too cold are handled while a dehumidifier dries or a heater heats.
- Device control per family: `switch.smart_comfort_dehumidifier_control` and `switch.smart_comfort_heating_control`, in the panel's *Device control* menu and the mini card's *Devices* switch; turned off, the dehumidifiers drying are turned off and the heaters set back to comfort.
- Comfort score: a few points off short of an alert — a heated room below its setpoint, humidity outside 40–60 % in a living space (`score_penalty` of each room, in the Overview score too).
- Discover: dehumidifiers with their tank sensor and quiet mode, heaters (climate entities that heat but don't cool) with their pilot wire presets, pellet stoves with their pellet level, the humidity sensors of the outdoor places.
- Panel: the dehumidifiers and heaters of each room with their settings, their defaults and the shower boost in Settings, a wall temperature sensor per room, the outdoor humidity sensors.

## 2.2.4 - 2026-11-25

### Fixes
- Device commands: a light whose `light.turn_on` failed (such as *a coroutine was expected, got None*) was sent the command again at every evaluation, logging the same warning each time. A device whose command fails is now paused for 5 minutes (`FAILURE_PAUSE`): none of its commands are sent until then, its other commands of the same evaluation included, and it is tried again after. The warning says so and names the error type.
- No command is sent to an unavailable device (or to a purifier whose mode select is unavailable): it is skipped without a log line, and applied as soon as the device is back, without a retry delay.
- A command with no answer within the 15 s timeout (slow cloud devices, which often apply it anyway) is logged at debug level instead of a warning; the device is paused all the same.

## 2.2.3 - 2026-11-24

### Maintenance
- The frontend source is split into ES modules: `src/smart-comfort-panel/`, `src/smart-comfort-activity-card/` and `src/smart-comfort-mini-card/` (entry `src/<stem>/index.js`), cut by role (the panel's tabs each in their own module: their methods are copied onto the panel class at registration), with the translations in one file per language (`i18n/<lang>.js`). `scripts/build-frontend.mjs` assembles them, in their original order, into `custom_components/smart_comfort/frontend/`, no longer committed; the tests, the screenshots and the release build them first. The release zip is unchanged.

## 2.2.2 - 2026-11-24

### Fixes
- Air conditioners: no cooling while it is cool outdoors. With the default 23 °C threshold, a warm living room switched the air conditioner on in November with 8 °C outside, and again an hour after each turn-off by hand. New `climate.min_outdoor` option (default 18 °C, from the outdoor temperature sensors): below it Smart Comfort doesn't start cooling, and stops its own cooling once it gets 1 °C cooler still; a device cooled by hand is left alone. Empty it to cool whatever the outdoor temperature, as before.

## 2.2.1 - 2026-11-23

### Fixes
- Panel: the *Device control* menu of the overview was cut off by its card, hiding the fans and air purifiers switches (and part of the *+ N OK* menu). The card no longer clips them; the banner of the other tabs keeps its rounded corners.

## 2.2.0 - 2026-11-23

### Features
- Device control per family: the air conditioners, the fans and the air purifiers each have their own switch (`switch.smart_comfort_air_conditioner_control`, `…_fan_control`, `…_purifier_control`), under *Device control*. A family turned off is first put back to rest where Smart Comfort was driving it (the air conditioner it started cooling turned off, the fan it turned on off, the purifier it boosted back to normal — devices changed by hand left as they are), then left alone (no command, its indicator lights and displays untouched, no longer counted as handling an alert); the others are still controlled. Turned back on, it is applied again at once. The switches are restored after a restart.
- Panel: the *Device control* pill of the overview opens a menu with the general switch and one per family set up in a room; the pill shows *partial* while a family is off. The menu, like the *+ N OK* one, closes at a click elsewhere.
- Mini card: the *Devices* switch turns amber while a family is left alone, the families named in its title.
- A family left alone is skipped by the daily reset (`reset_at`) — no "back to normal" line in the activity for a device nothing is applied to. Its targets are dropped after any evaluation running when it was turned off, so a command sent at that moment is no longer counted as handling an alert.

## 2.1.4 - 2026-11-22

### Fixes
- Fans: a fan boosted for an open window is turned off again when it closes, even when a boost command failed (a cloud fan answering after the 15 s timeout, or a boost percentage the fan rounds, such as 95 % on a fan in steps of 25 %). The failed boost made Smart Comfort forget it had boosted the fan, so closing the window left it on.

## 2.1.3 - 2026-11-22

### Performance
- Card picker: the previews are back (`preview: true`), and light. Each card's preview is drawn only once it scrolls into view of Home Assistant's card picker, which otherwise builds the preview of every card at once: until then it holds Home Assistant's state (no render, no history request, no animation). On a dashboard or in the card editor the card is drawn as before.

## 2.1.2 - 2026-11-22

### Performance
- Card picker: the cards no longer ask Home Assistant for a live preview (`preview: false` in `window.customCards`). The picker drew every card at once (history requests, animations), which made the list slow to open; it now shows each card's description instead.

## 2.1.1 - 2026-11-21

### Fixes
- Panel: the icon of the top bar stays shown on a narrow screen (under 600 px), as on the other panels and the dashboards' illustrated headers.

## 2.1.0 - 2026-11-21

### Features
- Panel: past 24 px of scroll the top bar folds into one sticky bar, as on the dashboards' illustrated headers (ha-dashboard-header) — the icon, title and line, the tabs as round icon pills with their counts, the status pill and the round buttons; back at the top it unfolds. The content does not move. On a narrow panel the pills get a row of their own under the bar, the status turns to a dot and only the first round button is kept.

## 2.0.3 - 2026-11-20

### Fixes
- Sidebar: the panel's icon no longer stays blank on a page's first load (until a reload). Home Assistant draws an icon whose set is not registered yet in a legacy mode it never leaves; the icon module now clears it and draws the icon again once the sidebar is there.

## 2.0.2 - 2026-11-20

### Performance
- Dashboards' top bar module: its check every second is skipped while the page is in the background (a hidden tab, the companion app in the background), like the sidebar badge.

### Maintenance
- `brand/logo.png` (and `logo@2x.png`) in the common style, next to the icon, as in the other juju35 integrations.

## 2.0.1 - 2026-11-20

### Fixes
- `smart_comfort.yaml` rewritten from the panel: only the lines that change are written, the others stay as they
  were, byte for byte. ruamel used to redraw the whole file — another indentation (its guess read the sequence indent
  as the mapping one), `{ a: 1 }` becoming `{a: 1}`, blank lines after a changed list dropped.
- A key removed from the file no longer takes the comments written under it: they move to the key before (or the
  top of the file).

## 2.0.0 - 2026-11-20

### Breaking changes
- **Lights on presence moved to [House Rules](https://github.com/juju35/ha-house-rules)**: Smart Comfort no longer turns lights on and off with presence. A room's `presence:` is still read, so the configuration keeps working, but no longer applied; a repair lists the rooms and proposes the migration — House Rules (1.3.0 or later) imports them as they were from **Settings → Import → Analyze**, naps included. Then remove `presence:` from these rooms. The adaptive lighting, the naps (slots or a shared `schedule` helper) and the displays stay here.
- The panel shows a room's lights on presence as moved, with a button to remove them; the activity keeps the presence entries logged before.

### Fixes
- Panel: the unsaved changes (Discard / Save) leave the tabs bar, where they covered the tabs on a narrow screen, for a
  bar of their own sticky at the bottom of the page, as on System Hub.

## 1.30.0 - 2026-11-20

### Features
- **Presence slots during the naps**: `during_naps: true` instead of `start` / `end` makes a slot apply while a room of the house has its nap — a dimmer entrance during the nap — so its hours follow the naps (their slots or a `schedule` helper) instead of being written twice. In the panel: **During the naps** on a slot hides its hours.

## 1.29.0 - 2026-11-20

### Features
- **Nap entities**: a nap of `rooms[].naps` may also be an on/off entity — a nap while it is on. A core `schedule` helper is shared with House Rules, so the naps are defined once for both integrations; an `input_boolean` covers an unplanned nap. In the panel: room → Lighting → **Nap schedule**. The slots stay as they are.

## 1.28.0 - 2026-11-20

### Features
- **`smart_comfort.yaml`, kept in sync both ways**: while this file exists in the configuration folder, it is the configuration — nothing to add to `configuration.yaml`. What is saved in the panel is written to it, and changes made to it (or to the files it includes) are applied within seconds.
  - **Only what changed is rewritten**: comments, layout and the other settings stay as they are; the previous version of each rewritten file is kept as `.bak`. Times are quoted so Home Assistant reads them back as times.
  - **Included files**: `!include` and `!include_dir_merge_list` / `!include_dir_list` are followed — a room is rewritten in the file it comes from, a new room of an included folder gets its own file there. `!secret` stays while its value doesn't change.
  - **Settings → Configuration source**: the file, when it was modified, the number of rooms and the sync state, **Reload**, the included files, and two switches — **Editing in the panel** (`file_write`) and **File monitoring** (`file_watch`). Without the file, **Create smart_comfort.yaml** writes the configuration in use to it.
  - **The file changed while you were editing**: saving then shows what changed in the file next to the panel's values, with **Keep the file** / **Keep the panel**. An open panel without unsaved changes follows the file by itself.
  - An empty file is filled with the configuration in use; an invalid file is left alone (and not overwritten) with a repair until it is fixed.
  - A `smart_comfort:` block in `configuration.yaml` is left out while the file exists.
- The YAML tab shows the file's content when the configuration is kept in it. Translated in every language.

## 1.27.0 - 2026-11-20

### Features
- **YAML and UI together**: when the YAML changes, only what changed in it is applied to the options — the changes made in the panel to the other settings stay (they used to be all replaced). Rooms, outdoor places and devices are matched by room (name or id) and by entity, so a room added in the panel stays when the YAML changes another one. Where the YAML and the panel changed the same setting, the YAML wins and a repair lists the settings concerned. The YAML imported last is kept with the entry for that; an entry set up before keeps its panel changes and records its YAML at the first start, unless the YAML changed meanwhile (then it is replaced once, as before).
- **Reload the YAML without restarting**: action `smart_comfort.reload` (also in Developer tools → YAML), returning `applied` and `conflicts`, and a **Reload the YAML** button in the panel's YAML notice, which shows the result. Works with `!include` and packages. Translated in every language.

## 1.26.1 - 2026-11-19

### Fixes
- **Hide the top bar**: its choices read **No**, **For everyone** and **For non-admins**, as in the other ha-* panels, and its description says the panel's top bar goes too (its tabs stay), in every language.
- **Top bar status as a pill**: the points to watch (and each tab's status) show as a tinted pill with a coloured dot, as in the other ha-* panels; the banner's round badge takes the state's colour too.

### Maintenance
- **Screenshots**: the panel edge to edge, without Home Assistant's sidebar, as in the other ha-* repos; one shot (`panel-sidebar`) keeps the sidebar for the panel's item and its badge.

## 1.26.0 - 2026-11-19

### Features
- **Panel laid out like the ENT ONE panel**: the living room is the panel's top bar, across the page — Smart Comfort, the points to watch as a pill, the comfort score, the outdoor temperature and the quiet night, the picture showing the worst state, with Notify now and the integration as round buttons (the title bar is gone). The tabs sit under it on the page background, sticky, Alerts with the number of active alerts; Save / Discard at their right. *Hide the top bar* hides this banner too, the tabs staying. The other tabs keep a compact header without the picture.
- **Overview**: a room filter (rooms with alerts as chips, busiest first; the fine rooms behind **+ N OK**), the notifications / device control / adaptive lighting switches as pills, four tiles (alerts with how many are handled, outdoor temperature, outdoor air, noise), then **To handle** (the active alerts) and the rooms — both following the filter.
- Screenshots: a GIF of the panel's top bar per animated state (hot, cold, cooling, other alert), light and dark.

## 1.25.0 - 2026-11-19

### Features
- **Settings: "Hide the top bar"** of the dashboards, for everyone or for non-admins only (`hide_header: off | everyone | non_admins`): the title, the menu and the buttons go, the view tabs stay (a single-view dashboard loses the whole bar); the edit mode is left alone. A small module loaded on every page applies it for each user, admin or not; `?show_header` in a dashboard's address shows the bar anyway. The bar is hidden from the first frame: the style goes into the dashboard as soon as it is attached, before it is drawn, and the browser remembers whether the user is an administrator. Translated in every language.

## 1.24.0 - 2026-11-18

### Features
- **Panel: illustrated header on every tab**, like the cards: a Smart Comfort room per tab (living room for the overview, garden for the outdoors, office for the activity and the YAML, bedroom for the schedule…), animated, over its floor strip, with the tab's icon in a frosted badge, a title, a pill and a subtitle. The overview's header carries the comfort score ("Comfort 60 / 100"), the points to watch, the outdoor temperature and the quiet night, its wall tinted by the status; Alerts counts the active alerts, Rooms the rooms that are fine, Outdoors the outdoor air and noise. Night with a dark Home Assistant theme; reduced motion is honoured. It replaces the overview's former comfort block.
- **Panel: the charter look** of the cards — the header card gathers the tab's first blocks (summary tiles, help, discovery, the YAML notice); filled rounded tiles with a round tinted icon; uppercase section headers; icons centred everywhere.

### Maintenance
- Screenshots: the panel is drawn with the dark theme flag for the dark twins, and the icon stub lays icons out like Home Assistant.

## 1.23.0 - 2026-11-18

### Features
- **Illustrated header on the activity card**, as on the card and the mini card: the Smart Comfort room for the state of the home (hot, cold, cooling, an alert, all good), animated, over the parquet floor, the history icon in the colour of the status, a pill counting today's entries and the latest entry under the title. Night with a dark Home Assistant theme; `illustration_theme: day | night` forces it, `illustration: false` keeps the classic header. Both options are in the visual editor, translated in every language.

### Maintenance
- The illustration, the header's stylesheets, the pill placement and the entity discovery now live in the activity card's module, which the mini card already imports.

## 1.22.1 - 2026-11-18

### Fixes
- Illustrated header: `auto` now follows the Home Assistant theme alone — a light theme keeps the day picture after sunset, a dark theme still shows the night one.

## 1.22.0 - 2026-11-17

### Features
- Cards: an animated illustrated header, 90 px, on the card and the mini card — the room's wall with an air conditioner and a thermometer over a parquet floor strip. A green thermometer when all is well; the sun and a red thermometer when a room is too hot (heat waves at night); a snowflake and a low blue thermometer when it is too cold; an alert sign for any other problem; the air conditioner blowing and the thermometer going down while a device cools a room. The header icon's colour is the status (green all good, grey snoozed or handled only, blue cooling, amber an alert to deal with, red a critical one). Night when `sun.sun` is below the horizon or the Home Assistant theme is dark, forced with `illustration_theme: day | night`; `illustration: false` keeps the classic header with its status pill; reduced motion is honoured. Both options are in the visual editor, translated in every language.
- Cards: the status pill on every header, illustrated or classic — a dot and the status ("3 alerts", "All good") in the icon's colour, on the title row right after the title only when the whole title and its whole label fit there (measured, in every language); otherwise on its own line under the subtitle (then kept to one line), and only its dot when even that does not fit in the banner above the floor strip, beside the picture, or on a card 200 px wide or less. The subtitle keeps the outdoor temperature, in the other cards' size (13 px on the banner); the README pictures of the cards are drawn at the other cards' size and pixel density, so that their headers match side by side. The mini card's expand / collapse button sits in the banner's top right corner (24 px, frosted), like the other cards.
- Screenshots: the animated header states (too hot, too cold, cooling, alert) are recorded as GIFs, light and dark, shown in the README; the card screenshots are rendered in Home Assistant's dark mode (dark theme and `hass.themes.darkMode`).

### Fixes
- Cards: the body follows the common look of the other cards — 16 px padding, section titles (Alerts, Rooms, Activity) with their icon in small capitals, alert rows with a 40 px round icon lined up with the activity rows, room tiles on the secondary background with 12 px corners (an alerting room tinted), even row spacing.

## 1.21.2 - 2026-11-16

### Fixes
- Discovery: an appliance's temperature or humidity sensor is no longer taken as the room's — an air fryer, oven, dishwasher or other appliance (by its integration, a program / operation-state entity, or an appliance word in the id, device name or model) is left out of the room's temperature, humidity, CO₂ and noise, like its doors, lights and fans already were (#68). A countertop air fryer, kettle or coffee machine is recognised by name, so a VeSync humidifier of the same integration still provides the room's reading (#85).

## 1.21.1 - 2026-11-16

### Fixes
- Discovery: a purifier that also humidifies (a fan + humidifier + PM2.5 on one device, e.g. a Dyson Purifier Humidify+Cool) is kept as a purifier again — only a (de)humidifier's blower that is not a purifier is dropped from the room fans (#82).
- Discovery: a humidifier's or air conditioner's internal readings are now left out of the ambient fallback in every language, not only English — a French *température de l'eau* no longer becomes the room temperature (#82).
- Discovery: a room set back to living space in the form keeps that choice instead of being turned into an annex on the next discovery, and bedrooms or offices are no longer mistaken for annexes ("Chambre sous les combles", Spanish "Oficina") (#83).

### Features
- Room types: every room is now a **living space** (the default) or an **annex** — cellar, garage, workshop, laundry, attic. Annexes have their own alert defaults (frost at 5 °C and mould at 80 % only; too hot, ventilation, window, CO₂ and noise alerts off; polluted air kept on), so a cold, humid cellar no longer alerts all the time. Pick the type in each room's form; the annex defaults sit in the Alerts tab next to the living-space ones and can be tuned once for every annex, and any room can still override them. Discovery suggests the annex type from the area name (cellar, cave, garage, atelier, grenier, Keller, Werkstatt…). Annex rooms stay out of the home's Overview comfort score, so an unlived space never pulls it down.

## 1.20.4 - 2026-11-16

### Fixes
- Discovery now reads a room's air from its (de)humidifier or purifier when that device is the area's only sensor: their ambient temperature and humidity are used as a fallback (a standalone sensor still wins, and internal readings such as coil, tank or water are left out).
- A (de)humidifier's own `fan` entity (its blower) is no longer added as a room fan, so fan control can't switch the (de)humidifier by temperature — like the fans of air conditioners and appliances, it is skipped.

## 1.20.3 - 2026-11-16

### Fixes
- The Overview comfort score now weights each active alert by its severity (info 10, warning 25, critical 50), like the per-room comfort sensors, instead of a flat penalty per alert — so the ring agrees with the room scores. The ring and the sidebar badge turn red only when a critical alert is active and amber otherwise.

## 1.20.2 - 2026-11-15

### Maintenance
- The panel screenshots now show the sidebar badge (the active-alerts count) on the Smart Comfort item, so the README reflects it.

## 1.20.1 - 2026-11-15

### Fixes
- The sidebar icon no longer flickers and disappears when Home Assistant rebuilds the sidebar. The emblem is now a single path on the 24 grid, registered in both the current and the older frontend icon APIs (as the other integrations' sidebar icons are), so it resolves on every rebuild without a redraw loop.

## 1.20.0 - 2026-11-15

### Features
- **The integration's own emblem as the sidebar icon.** The Smart Comfort panel now uses a custom icon — a house with a thermometer and a bell, the integration's emblem — instead of a generic Material Design icon. It is a single monochrome shape that follows the sidebar's colour, and the active-alerts badge still sits over it.
- **A status header on the Overview.** The Overview now opens with a header, like System Hub's Status: a comfort score ring, the emblem tinted by the state (green, amber or red), and a title with a pill for each kind of active alert and the number of rooms that are fine. The score is 100 minus a fixed penalty per active alert. The header is hidden until something is set up.

## 1.19.1 - 2026-11-15

### Fixes
- Sidebar badge no longer pushes the panel label out of line. Home Assistant's recent sidebar places the collapsed badge over the icon with a `ha-svg-icon + .badge` rule, but a custom panel's sidebar icon is an `<ha-icon>`, so the rule did not match and the badge sat in the leading slot and shifted the "Smart Comfort" label to the right when the sidebar was expanded. The badge is now positioned over the icon by the integration itself, so the label stays aligned with the other panels.

## 1.19.0 - 2026-11-15

### Features
- **A count of the active alerts on the sidebar.** The Smart Comfort item in the sidebar now carries a badge with the number of active alerts, like the notifications count, coloured by the most serious one (red for a critical alert, amber for a warning, blue for an info one); it disappears when nothing is active. It is read from the Active alerts sensor for every administrator and kept up to date even with the panel closed. The sensor also gains a `severity` attribute (the most serious active alert).

## 1.18.3 - 2026-11-15

### Fixes
- Discovery no longer takes an appliance's own door, light or fan as a room's opening, lamp or fan. Fridge, freezer, dishwasher, oven, range-hood, washer and dryer parts are left out — by integration (Home Connect, Home Connect Local, Miele, LG ThinQ, SmartThings…), by name, or because the device also exposes a program / operation-state entity. This stops, for example, adaptive lighting dimming a fridge's interior light, an open fridge or dishwasher door counting as an open window, and a range hood being driven as a comfort fan ([#68](https://github.com/juju35/ha-smart-comfort/issues/68), reported by @FredM67). Appliances already added by hand stay; remove them once on this version.

## 1.18.2 - 2026-11-14

### Fixes
- Mini card visual editor: the `zoom` option (button to the full card) was missing; it is now offered, with its label and helper in every language. The full card's editor leaves it out, as it has no such button.

## 1.18.1 - 2026-11-13

### Fixes
- Folding back on a tap elsewhere now works on iOS (Safari and the companion app): a tap on something that is not clickable sent no click to the page, so the detailed view of the mini card stayed open. The press and the release are caught instead; a slider dragged out of the card and a scroll do not fold anything.
- Leaving the card (another dashboard view, a conditional card hidden) brings it back in its default state.
- Clicks lost under an update: Home Assistant updates the card several times a second, and an update that rewrote the card between the press and the release replaced the element pressed, so that the click landed on the card itself and did nothing. The card is no longer rewritten while a press is in progress; the pending update is drawn at the click, or right after the release.
- Focus ring after a mouse click: the focus was put back on the clicked element after each update, which drew the focus ring. It is now kept across updates only for the keyboard (and in a text field).

## 1.18.0 - 2026-11-13

### Improvements
- **Window open in the cold** (`window_open_cold`): no alert while the room airs out, that is while it has a too hot, high CO₂, polluted air or high humidity problem (pending or alerting). An alert already on ends, and the delay starts again once that problem is over.

## 1.17.0 - 2026-11-12

### Features
- `show_title` and `show_subtitle` options (also in the visual editor) hide the header's title and its subtitle separately on the card and mini card (the activity card gets `show_title`), for a card placed under a section heading of its own (asked in juju35/ha-vehicle-card#72).

## 1.16.1 - 2026-11-11

### Fixes
- **Discover**: no more deprecation warning `accesses ChildDeviceEntry.model` in the log (it would stop discovery from Home Assistant 2027.9) when a device is a sub-device: its model is read from its parent device (#58, #59, thanks @FredM67).

## 1.16.0 - 2026-11-10

### Improvements
- Panel, **Activity** tab: drawn by the panel itself instead of embedding the activity card, so it shows at the first opening. The lines by day with their time on the right, the filters on one line (all, devices, lights, notifications, by hand) and a new room filter.
- Panel shown at once: the release keeps its languages in the panel file instead of a separate file to wait for.

## 1.15.5 - 2026-11-10

### Fixes
- Panel empty on its first opening (fine when coming back to it): in the release, the panel is only defined once the page's language file has loaded, and Home Assistant had already handed it the connection, the address and the layout by then; they were lost and nothing was drawn. They are now taken up when the panel is defined.

## 1.15.4 - 2026-11-10

### Performance
- Panel opens faster: its files are cached by the browser (every URL is versioned, so a new release is still fetched), and the settings load alongside the translations instead of after them.

## 1.15.3 - 2026-11-09

### Improvements
- Panel: a failed load shows a **Retry** button next to its error (it is tried again on its own meanwhile).

## 1.15.2 - 2026-11-09

### Fixes
- Panel sometimes empty when opened: a load that failed (Home Assistant still starting after a restart or an update, the connection coming back after the app resumed) left the rooms, alerts and settings empty until the page was reloaded. It is now tried again after 2 s, 5 s, 15 s, then every 30 s while the panel is shown, and again as soon as the connection is back. The panel also no longer waits for Home Assistant's form component before drawing anything: opened before any page had loaded it, it stayed empty; the settings forms are drawn as soon as it is there.

## 1.15.1 - 2026-11-09

### Maintenance
- No code change: released again to check the installation from the Marketplace.

## 1.15.0 - 2026-11-09

### Features
- **Comfort score** per room (`sensor.smart_comfort_<room>_comfort_score`, 0 to 100 %): 100 with nothing wrong, minus 10, 25 or 50 for each problem under way by the severity set for its alert. A measurement with long-term statistics: a statistics card or graph gives the comfort of the day, the week or the month.

## 1.14.0 - 2026-11-09

### Performance
- **Translations load on demand**: in the release zip, the frontend files keep English only (`smart-comfort-activity-card.js` 54 KB → 26 KB, `smart-comfort-mini-card.js` 47 KB → 33 KB, `smart-comfort-panel.js` 277 KB → 107 KB) and each other language is its own `<file>.i18n.<lang>.js` file next to them, fetched the first time a card or the panel needs it. Home Assistant loads the card on every dashboard, so each page used to download and parse all 22 languages to use one. The cards and panel are defined once the page's language has arrived (a few milliseconds), so they render translated from the start.

### Maintenance
- The repository keeps every language in the sources: the release runs `scripts/split-frontend.mjs` before building the zip, and the Validate workflow checks the split on a copy (every table is rebuilt from the split files and compared).

## 1.13.0 - 2026-11-08

### What's new
- Indoor air quality: rooms take PM2.5, PM10 and air quality index sensors (lists, the worst counts), those of the air purifiers too, and Discover finds them in each area, on the purifiers as well.
- New **Polluted air** alert (`polluted_air`): PM2.5 above 25 µg/m³, PM10 above 50 µg/m³ or an air quality level above 3 of 6 for 10 minutes, over once back to 15 µg/m³, 30 µg/m³ or level 2; thresholds globally and per room, its value in the notification ("PM2.5 47 µg/m³, above 25 µg/m³").
- A HomeKit air quality index (1 excellent to 5 poor) is read as is, other indexes like the outdoor ones (European 1–6, US AQI by its bands).
- While a room's air is polluted, its purifiers are boosted with their window boost settings (mode, preset or speed), at any hour but quietly at night for those with night settings, and go back to their state before once the air is clean; a purifier changed by hand is left alone, and the alert counts as handled by a device while one is boosted.
- Panel, card, mini card and activity card: the new sensors in the room editor and in the Discover help, the thresholds in the Alerts tab (the PM2.5 one in the threshold help), PM2.5, PM10 and index chips, and the alert with its icon and value; translated in every language.

## 1.12.0 - 2026-11-08

### What's new
- Card `custom:smart-comfort-card`: the full view of the mini card as a card of its own — every alert, a tile per room, the switches and the latest activity — a whole section wide, with its visual editor; the mini card's button switches it to this same view.
- README: a Cards section (card, mini card, activity card) with screenshots of the card and of the activity card in light and dark mode.

## 1.11.1 - 2026-11-08

### Fixes
- A notification clear that no phone received, or that was waiting while the integration stopped, is now sent again instead of being lost.
- A clear that keeps failing is tried again after 1, 2, 4… minutes and given up after about an hour, with one warning in the log, and it no longer holds back the notification of a new alert.
- Less work in the background: the state is written to storage only when it changed, and the calendar no longer reads its whole history again at every update.

## 1.11.0 - 2026-11-07

### What's new
- Faster device control: the commands of different devices are sent at the same time (the lights first), so a slow or unreachable device no longer delays the others.
- Notifications are sent after the evaluation instead of during it, so a slow notifier no longer holds the next evaluations and device commands.

## 1.10.0 - 2026-11-07

### What's new
- Diagnostics: **Download diagnostics** on the integration gives the options and the current state (alerts, rooms, device targets, switches), with the notifiers and the notification link redacted.

## 1.9.0 - 2026-11-07

### What's new
- **Calendar of the alerts** (`calendar.smart_comfort_comfort_alerts`): every alert becomes an event, from when it started to when it ended, with the room as location, its kind in the summary (`🌡️ Bedroom: Too hot`) and its worst value in the description. The finished alerts are kept 90 days (at most 1000) across restarts; the ones going on are listed too, and the calendar is `on` while one lasts — usable as a trigger, and in the calendar view of Home Assistant to see when each room was too hot, too humid or noisy. Translated in every language of the integration.

## 1.8.2 - 2026-11-04

### Documentation
- README: images and links use absolute URLs, so the screenshots, icons, badges and links display in HACS (relative paths broke there).
- README: screenshots get a display size, so cards no longer show oversized in HACS and on GitHub.

## 1.8.1 - 2026-11-04

### What's new
- Added Romanian, Danish, Swedish, Bulgarian, Russian, Ukrainian, Hungarian, Slovak, Czech, Slovenian, Latvian and Greek translations (`ro`, `da`, `sv`, `bg`, `ru`, `uk`, `hu`, `sk`, `cs`, `sl`, `lv`, `el`): integration, notifications, panel, activity card and mini card (with the plural forms of each language for the alert count).

## 1.8.0 - 2026-11-04

### What's new
- Mini card (`custom:smart-comfort-mini-card`), added to the dashboards like the activity card: the alerts of the moment, the outdoor temperature and the notifications / device control / adaptive lighting switches (a tap turns them on or off). Its button at the top right switches it to the full card — every alert with since when and its state, a tile per room, the latest activity — and back, as does a click outside the card. Options: `title`, `rooms`, `alerts`, `activity`, `zoom`; visual editor in every language of the integration.
- Room comfort sensors: new `room_name` attribute (the room's name as set in Smart Comfort).

## 1.7.6 - 2026-11-02

### Fixes
- Activity card: on a dashboard it could stay "Custom element not found: smart-comfort-activity-card". It is now added to the dashboard resources (Settings → Dashboards → Resources), which a dashboard loads before building its cards; with resources in YAML it is still loaded on every page. Removing the integration removes the resource.

## 1.7.5 - 2026-11-01

### Fixes
- Discover: outdoor areas, bedrooms, air quality sensors, night lights, indicators and machines are now recognised by their names in Italian, Dutch, Portuguese, Polish and Serbian (Cyrillic and Latin), e.g. Giardino, Tuin, Jardim, Ogród, Bašta / Башта, Slaapkamer, Sypialnia, Spavaća soba. A garden was taken for an indoor room (with too hot / too cold alerts), and bedrooms didn't get their quiet morning.
- Discover: in Italian, the sensor of a bedroom ("camera") is no longer taken for a machine's and left out (the whole room was left out when it was its only sensor). A camera's own sensors are still left out, now by its device.
- Discover: Dutch back and front gardens (Achtertuin, Voortuin…) are outdoor places, an Italian room named just "Camera" or "Camera di …" / "Camera dei bambini" is a bedroom, and a German "ß" is read as "ss" (a sensor named "Außentemperatur" is an outdoor one).
- Activity card: giving the keyboard focus back to a line after a new entry no longer scrolls the page to the card.
- Activity card: no longer runs out of the card in narrow columns or on a long entity id; in a Sections view it is at least 6 columns wide.
- Activity card: its header now looks like the other cards' (a round tinted icon and the title), and its row icons are the same size.
- Activity card: follows a change of language, a renamed entity and the change of day without waiting for the next entry.
- Activity card editor: the kinds are listed by their translated names, and the room field explains what it expects.
- Panel on a phone: the header of a room or outdoor place no longer breaks over three lines; what it holds goes on its own line under its name.

## 1.7.4 - 2026-11-01

### What's new
- Added Italian, Dutch, European Portuguese and Polish translations (`it`, `nl`, `pt`, `pl`): integration, notifications, panel and activity card. Brazilian Portuguese: pt-BR uses the European Portuguese texts (integration, notifications, panel and activity card).

## 1.7.3 - 2026-11-01

### What's new
- **Serbian** translations, in Cyrillic (`sr`) and Latin (`sr-Latn`) script: integration, notifications, panel and activity card. Serbian translations by @cpmarexel2f (#12).

### Fixes
- Panel and activity card (and its editor): the language is matched on the full Home Assistant tag first (`sr-Latn`), then on its base (`fr-FR` → `fr`), then English.

## 1.7.2

### Fixes
- Activity tab: a light command that could not be sent is now under the **Lights** filter, not under Devices (an indicator light stays with the devices).
- Activity card and tab: a line that opens its entity can now be reached with Tab and opened with Enter or Space, and keeps the focus when a new entry comes in; the filters keep it too when one is chosen.
- Activity tab: the active filter is tinted like the other active states of the panel instead of a filled button, with text readable in light and dark themes.

## 1.7.1

### Fixes
- Activity card: on a dashboard, each new entry no longer shows up twice, and leaving the view now closes its live updates (one of them stayed open on the server every time the view was shown).
- Activity card and tab: a command that could not be sent now says which one in words (a presence light, an indicator, a brightness) instead of a raw key like `t_presence`.
- Snooze and acknowledge actions: **bad air outside** can now be picked in the kinds of the action editor.
- Lights on presence: the checks scheduled when a presence sensor changes are forgotten once done, instead of piling up in memory until the next reload.

## 1.7.0

### What's new
- Lights on presence: **`off_after` per slot** — the minutes with nobody before the lights are turned off while the slot applies (a bathroom off after 2 minutes by day, 22 from 17:00). Panel: on each slot.

## 1.6.0

### What's new
- **Activity** tab in the panel: what Smart Comfort did and why, live and by day — devices to their target (cooling, window boost, night mode, back to normal, turned back on…), lights (brightness of the moment, on with presence, off with nobody), indicator lights off and on, notifications sent and cleared, changes by hand that pause a device or a light, reset times, failed commands — with filters; a line opens its entity. The last 300 entries are kept across restarts.
- **Activity card** (`custom:smart-comfort-activity-card`), added to the dashboards by the integration: the latest entries, live, for any user, optionally for some kinds or one room.

## 1.5.2

### Fixes
- YAML: an unquoted `off: true` in a presence slot (read as a `false` key by YAML 1.1) no longer makes the configuration invalid.

## 1.5.1

### What's new
- Panel: a **YAML** tab with the configuration of Smart Comfort only, as it goes under `smart_comfort:` in `configuration.yaml`, and a **Copy** button.
- **`smart_comfort.get_config`** action: returns the options in use (rooms, alerts, control, lighting), to copy into the YAML or check what is set.

## 1.5.0

### What's new
- Lights on presence: **`transition`**, the seconds of the fade when the lights are turned on and off (10 s, like a presence automation).

### Fixes
- A light that is a presence light of two rooms (the hallway's, from the entrance and the hallway) is no longer turned off by one room while someone is in the other, and a light on because of the other room no longer stops a room from turning its own lights on.

## 1.4.0

### What's new
- **Indicator lights and displays** of the devices (`display` on a climate, fan or purifier item): an on/off indicator light or switch, a display brightness `number` (off: its minimum) or a brightness `select` (off: its off option, such as `Off` or `Fermer`). They are turned off in the `control.display_off` / `display_on` hours (the quiet night when unset) and during the naps of their room, and back on after, at the brightness or option they had. Smart Comfort acts only when these hours or naps start or end, like a timed automation: one turned back on by hand stays on until the next change. Discover finds them among the device's entities (settings entities included). Panel: on each device, and a **Displays off** line in the Schedule tab.
- **Back to normal at a set time** (`reset_at` on a device item): at this time the device goes back to its normal state (closed preset or mode, temperature control) and its manual pause ends — the purifier back to Auto at 20:40 even after it was set to Favorite by hand.
- Lights on presence: a **color** per slot (`color`, RGB: a blue night light), kept until the light is turned off, and **`on_after`**: the seconds a presence must last before the lights are turned on (someone passing by the sensor doesn't count).
- Panel: the presets, modes and fan modes are set on each device only (picked from the device's own list); the global ones are no longer in Settings, as they depend on the device. They stay valid in YAML.

## 1.3.0

### What's new
- **Lights on presence**, per room (`rooms[].presence`): its presence sensors turn its lights on when someone comes in — only when the room is dark enough with a light level sensor (`lux`, `max_lux`), at the brightness of the moment — and off after `off_after` minutes with nobody (2 by default). Any light can be added (the hallway's from the entrance). **Slots** keep some lights off (weekday mornings…) or turn them on at a set brightness (a dim entrance at night); `not_during_naps` lists the lights left off while a room of the house has its nap; night lights only at night and during the naps. A light already on is left as it is, and one turned off by hand while someone is there stays off until the room is empty. Never added by Discover. Panel: room → Lighting → Lights on presence; the presence of each room in the status.

## 1.2.1

### What's new
- Panel: the rooms and outdoor places show their icon — the icon of their Home Assistant area, or else one from their name (bedroom, living room, kitchen, bathroom, office, hallway, garden, terrace…, in English, French, German and Spanish) — in the Rooms and Outdoors tabs and on their cards in the overview, where it turns orange while the room has an alert.

## 1.2.0

### What's new
- **Simpler panel**, organized by subject: **Overview**, **Rooms**, **Outdoors**, **Alerts**, **Schedule**, **Settings**. Nothing is removed and the options are the same (no migration).
  - **Rooms**: each room folds into sections — Sensors, Windows and doors, Devices, Lighting (lights, quiet morning, naps), Alerts — each with a one-line summary. Only what the room has is shown; **+** buttons add the rest (a CO₂ sensor, a fan, a light, a nap…), and a room's alerts list only those it customizes, with a menu to customize another one. A light's night-light switch is folded with its other settings.
  - **Outdoors** (new tab): the outdoor places and the other outdoor sensors (moved from Notifications), together.
  - **Schedule** (new tab): the quiet hours, quiet night, quiet morning and window boost on one 24-hour line with the time now, and their times in one place (they were spread over three tabs).
  - **Settings**: notifications, device control and adaptive lighting, with the rarely changed settings under **Advanced**; the brightness of each moment on one row, the warmth values only when the warmth is on.
  - **Alerts**: one line per alert with its state, threshold and severity; hysteresis, delay and escalation under **Advanced**.
  - Shorter texts; the discovery is explained in one line, with the details on demand.

## 1.1.0

### What's new
- **Adaptive lighting**: the dimmable lights of a room (`rooms[].lights`) that are on get the brightness of the moment — day with the sun up (100 %), evening once it is down (60 %, a blend in between), night in the quiet night hours (15 %) — at once when turned on, then gradually (`transition`, 120 s). The warmth follows too (4000 / 2700 / 2200 K) for the lights that support it, and can be turned off (`warmth: false`). Smart Comfort never turns a light on or off; night lights (`night_only`) are only set at night; a light changed by hand is left alone until it is turned off (or for `manual_override`). Settings under `lighting:`, per room and per light; **Adaptive lighting** switch.
- **Quiet morning** for the bedrooms: their lights stay dimmer (40 %) from the end of the night until `morning_end` (09:30), set by Discover on the bedrooms (`lighting.quiet_morning`), and per room in the panel.
- **Naps** per room (`rooms[].naps`: start, end, optional days): the lights are dimmed (15 %) in these slots, night lights included. Never added by Discover; set in the panel (room → Lighting of this room) or in YAML.
- Discover adds the dimmable lights of each room (not the indicators of devices nor the floodlights of cameras; a light group stands for its members) and flags the night lights; a room with lights only is now worth following.
- Panel: lights in the rooms (with their own settings), an **Adaptive lighting** card in the Device control tab, the target of each light and an Adaptive lighting switch in the overview. Options flow: lights in the room form.

## 1.0.1

### Fixes
- Discover no longer adds the rooms with nothing to follow — no comfort sensor (temperature, CO₂, humidity, noise), air conditioner, fan nor purifier, such as a hallway with only its door — nor the outdoor areas without a sensor. Rooms already set up stay.
- Panel: the outdoor places appear in the overview with their values and each of their sensors, and the Notifications tab says which outdoor places add their sensors to the outdoor fields (empty once Discover has moved them to the places).
- Discover no longer takes the temperature of a machine for the room's: the sensors of NAS, internet boxes, servers, UPS, printers (by their integration), and those named CPU, disk, fridge, freezer, battery… are left out, in the rooms and outdoors.

## 1.0.0

### What's new
- **Outdoors**: outdoor places (`outdoors:` — garden, terrace…), each with its `temperature`, `air_quality` and `noise` sensors, shown in an **Outdoors** category below the rooms in the panel. Their sensors add up with the top-level outdoor options.
- **Outdoor air quality**: `outdoor_air_quality` sensors and those of the outdoor places, read as a level from 1 (good) to 6 (extremely poor) — European indexes (Atmo France, EAQI) as is, US AQI by its bands, text states — the worst one counts. A **close the windows (poor air outside)** alert (`bad_air_outside`, above level 3), and no suggestion to open the windows while the air is poor (`ventilate.max_outdoor_air`, 3). Shown in the overview and in the attributes of the active alerts sensor, with the outdoor noise.
- While nothing is set up (no room nor outdoor place), the overview of the panel offers **Discover**, which opens its result in the Rooms tab.
- Discover puts the outdoor areas in the Outdoors category instead of leaving them out, with their temperature, air quality and noise sensors (an outdoor module counts by the area of its device); their sensors leave the top-level options, where they would count twice. Outdoor sensors in no area are added to the top-level options: a sensor named outdoor, a city air quality index (Atmo France, WAQI, AirVisual…, not its forecast nor pollen), and the weather entity when there is no outdoor temperature sensor at all.

### Fixes
- Discover completes the outdoor sensors that are already set instead of skipping them as soon as one is there.
- Options flow: the noise alerts and the maximum outdoor noise show dB instead of °C.

## 0.4.0

### What's new
- **Noise alerts**: a room `noise` sensor (sound level, dB) and a **noisy room** alert (60 dB by default); outdoor noise sensors (`outdoor_noise`) with a **close the windows (noisy outside)** alert when an opening is open in the noise (65 dB), and no suggestion to open the windows while it is noisy outside (`ventilate.max_outdoor_noise`, 65 dB).
- **Quiet night**: between `night_start` and `night_end` (22:00–07:00 by default), devices with night settings run quieter — fans at `night_percentage` / `night_preset`, purifiers at `night_preset` / `night_percentage` / `night_mode` (mode select), air conditioners with `night_fan_mode` — and get no window boost. The day settings, or the state before the night, come back in the morning. An off purifier stays off at night.
- Discover fills in the room noise sensors, the outdoor noise sensors of the outdoor areas, and the night settings from the quiet presets and fan modes (sleep, silent…); devices already configured get the settings they don't have yet.
- Panel: noise in the overview (outdoor noise, quiet night, room noise) and in the forms.

### Fixes
- A purifier driven by a mode select gets its mode option back too when the state it had before a window boost is restored.

### Maintenance
- The panel subscription test no longer depends on the order of the unload and setup messages, which differs on Home Assistant 2024.12 (the minimum version job failed since 0.3.1).

## 0.3.1

### Fixes
- Panel: the overview no longer shows "Smart Comfort is not loaded" for up to 30 s after a reload (options saved, restart, integration reloaded): the status sent at the end of the setup is now taken into account, and the overview follows the live status instead of the state read when the panel opened.

## 0.3.0

### What's new
- **Discover** button in the Rooms tab of the panel: adds a room for every Home Assistant area except the outdoor ones and sets it up (sensors, windows and doors, air conditioner, fans and purifiers with their presets and modes); the outdoor areas give the outdoor temperature. What is already set is kept; the result is shown collapsed with a summary of each room and is saved with **Save**. WebSocket command `smart_comfort/discover`.
- Rooms remember the area they come from (`area`), so that discovering again completes them instead of adding them twice.

## 0.2.0

### What's new
- **Configuration panel** in the sidebar (administrators): overview of the active alerts, rooms and devices with snooze / acknowledge buttons and the notification and control switches; editing of the rooms (sensors, openings, air conditioner, fans and purifiers with their own settings, alert overrides), the alerts, the notifications and the device control, saved in one go. Each tab has its own address (`/smart-comfort/rooms`…).
- WebSocket commands `smart_comfort/config`, `smart_comfort/config/save` and `smart_comfort/subscribe`, used by the panel.

### Fixes
- Air conditioners are now switched to cooling with `climate.set_hvac_mode` followed by `climate.set_temperature`: some integrations (`generic_thermostat`…) ignored the mode given with the temperature and never started cooling.
- Device changes while Home Assistant starts (entities settling on their first state) no longer count as manual changes pausing their control.
- The `handled` flag of an alert in the attributes is now only set on the alerts a running device actually hides ("too hot"), not on every alert of its room.

## 0.1.4

### Fixes
- An air purifier driven by its mode select only (for example `closed_mode: auto` when the windows close) no longer pauses its own control for the manual override time when it answers the mode change by updating its preset or speed: the next window boost and "keep on" work again. Changing the purifier by hand still pauses its control.

## 0.1.3

### Fixes
- A device that ends up in the wanted state although its command failed (cloud air conditioner answering too slowly…) is now considered controlled right away instead of only after the retry delay (up to one hour): its room's "too hot" alert stays hidden while it cools, turning it off by hand pauses its control instead of having it turned back on, and the retry delay starts over from 5 minutes.

## 0.1.2

### Fixes
- Air purifiers go back to the speed or preset they had before the window boost even when the first try fails (device offline for a moment…), instead of staying at full speed.
- A device command that keeps failing (unsupported preset or mode…) is no longer sent again and logged every 30 seconds: it is tried again after 5 minutes, then 10, 20… up to one hour, and right away when the device needs something else.
- The ventilate, close windows and window open in the cold alerts end when every outdoor temperature entity is deleted, instead of staying active with reminders forever.

## 0.1.1

### Fixes
- A snoozed problem that is still going on is notified again when the snooze ends (or is cancelled), instead of staying silent: Snooze no longer behaves like Got it.
- Options: a field emptied in the form now stays empty instead of coming back to its default — fans driven by the windows only (no "On from" / "Off below"), purifiers boosted with a preset only (no speed), window boost all day (no hours), alerts without minimum / maximum temperature.
- Air purifiers go back to the preset or speed they had before the window boost when the windows close (unless a "windows closed" preset or mode is set), instead of staying at full speed.
- The problems of a sensor removed from a room, or of a deleted sensor entity, now end instead of staying active forever.
- `weather` entities used as outdoor temperature work: their temperature attribute is read. Temperatures in °F or K are converted to °C.
- A device command that fails is tried again at the next evaluation.
- Alerts are no longer lost when every notifier fails: they are sent again at the next evaluation.
- The "clear notification" message is sent to the Companion app notifiers and notify groups only: other notifiers (Telegram, e-mail…) no longer receive the text "clear_notification".
- The Snooze and Got it buttons of a notification only cover the alerts it showed, also after a restart.
- No duplicate notification when the options are changed while a notification is being sent.
- "Keep on" no longer turns a purifier back on right after it was turned off by hand: the manual override applies.
- An air conditioner is turned off when an opening stays open whatever its mode (heating included), not only when cooling.
- A window or door sensor unavailable for 10 minutes (dead battery…) is left out of its room instead of blocking its alerts and devices; listed in the `ignored_openings` attribute of the room sensor.
- Renaming a room created in the options keeps its sensor, its alerts and its snoozes; the sensor of a removed room is removed.
- The Notifications and Device control switches apply from the start, before their entities are restored.
- Window open in the cold: the escalation now triggers when it gets colder outside, not warmer.
- Quiet hours or window boost hours with the same start and end now mean all day instead of never.
- An invalid value in the options shows an error instead of failing.
- Removing the integration also forgets its alerts, snoozes and device targets.
- The release zip installed by HACS includes the integration icon.
- Texts: clearer descriptions (room overrides, "this cold or colder", snooze kinds, "no too hot alert" only for devices Smart Comfort turned on), German and Spanish wording fixes.

### Maintenance
- The readings, alerts and device attributes of the sensors are no longer stored in the recorder database at every evaluation.

## 0.1.0

### What's new
- First release.
- Seven comfort alerts per room — too hot, too cold, open the windows, close the windows, window open in the cold, high CO₂, high humidity — with threshold, hysteresis, delay, severity and escalation step, globally and per room.
- Problems tracked as episodes: notified once, again only when they get worse (or after an optional reminder delay).
- One grouped notification per digest window, replacing the previous one (notification tag), cleared when everything is back to normal.
- Quiet hours and presence: only critical alerts while they apply, the others sent at the end if still relevant.
- Snooze and Got it buttons in the notification; `snooze`, `unsnooze`, `acknowledge` and `notify_now` actions.
- Control of air conditioners, fans and air purifiers per room: temperature with hysteresis, window boost during the day, mode selects, keep on, pause after a manual change.
- Configuration in YAML (imported at startup, applied again only when it changes) or in the integration options.
- Sensors for the active alerts, the comfort of each room and the last notification; switches for the notifications and the device control; buttons.
- State kept across restarts: no notification sent again after a restart.
- English, French, German and Spanish.
