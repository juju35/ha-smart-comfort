/**
 * Smart Comfort — configuration panel.
 *
 * A plain web component (no build step) that Home Assistant loads in the sidebar. It reads and saves
 * the integration options over the WebSocket API (smart_comfort/config, smart_comfort/config/save),
 * follows the status (smart_comfort/subscribe) and renders the forms with Home Assistant's ha-form,
 * whose labels come from the integration's own translations (options flow strings).
 */

const DOMAIN = "smart_comfort";

// Points a problem under way takes off the comfort score, by its severity: mirrors SCORE_PENALTY in sensor.py so the
// overview ring and the per-room comfort sensors agree.
const SCORE_PENALTY = { info: 10, warning: 25, critical: 50 };

const KIND_ICONS = {
  too_hot: "mdi:thermometer-high",
  close_windows: "mdi:window-closed-variant",
  ventilate: "mdi:window-open-variant",
  too_cold: "mdi:thermometer-low",
  window_open_cold: "mdi:snowflake-alert",
  co2_high: "mdi:molecule-co2",
  polluted_air: "mdi:blur",
  humidity_high: "mdi:water-percent-alert",
  noise_high: "mdi:volume-high",
  noisy_outside: "mdi:volume-off",
  bad_air_outside: "mdi:weather-hazy",
};

// Icon of a room by its name when its area has none (several languages, accents removed).
const ROOM_ICONS = [
  [["salle de bain", "bath", "bad", "bano", "douche", "shower"], "mdi:shower"],
  [["toilet", "wc"], "mdi:toilet"],
  [["salle a manger", "dining", "essz", "comedor"], "mdi:table-chair"],
  [["chambre", "bedroom", "schlafzimmer", "kinderzimmer", "dormitorio", "habitacion", "nursery"], "mdi:bed"],
  [["salon", "sejour", "living", "wohnzimmer", "lounge"], "mdi:sofa"],
  [["cuisine", "kitchen", "kuche", "cocina"], "mdi:silverware-fork-knife"],
  [["bureau", "office", "buro", "arbeitszimmer", "despacho", "study"], "mdi:desk"],
  [["entree", "entrance", "entry", "eingang", "entrada"], "mdi:door"],
  [["couloir", "hallway", "corridor", "flur", "pasillo", "hall"], "mdi:door-open"],
  [["garage"], "mdi:garage"],
  [["buanderie", "cellier", "laundry", "waschkuche", "lavadero"], "mdi:washing-machine"],
  [["terrasse", "terrace", "balcon", "balcony", "balkon", "patio"], "mdi:table-furniture"],
  [["jardin", "garden", "garten", "yard"], "mdi:flower"],
];

const UNITS = {
  co2_high: "ppm",
  polluted_air: "µg/m³",
  humidity_high: "%",
  noise_high: "dB",
  noisy_outside: "dB",
  bad_air_outside: "/6",
};
// Polluted air: by the reading over its threshold, fine particles or the air quality index.
const unitOf = (alert) => (alert.kind === "polluted_air" && alert.metric === "aqi" ? "/6" : UNITS[alert.kind] || "°C");

// Strings of the panel itself; field labels come from the integration translations.
const STRINGS = {
  en: {
    annex_alerts: "Annex defaults",
    annex_alerts_help: "Default alert thresholds for annex rooms — cellar, garage, workshop, laundry, attic. Set a room's type to Annex in the Rooms tab; each room can still override these.",
    outdoor_noise: "Outdoor noise",
    quiet_night: "Quiet night",
    to_handle: "To handle",
    all_rooms: "All rooms",
    n_ok_rooms: "+ {n} OK",
    n_handled: "{n} handled",
    discovered_new: "new",
    discovered_updated: "completed",
    discovered_new_outdoor: "new",
    discovered_updated_outdoor: "completed",
    discover: "Discover",
    discover_help: "Adds a room for each Home Assistant area with something to follow (a comfort sensor, an air conditioner, a fan, a purifier or a dimmable light) and sets it up: temperature, CO₂, humidity and noise sensors, PM2.5, PM10 and air quality index sensors (the purifiers' too), windows and doors, air conditioner, fans and purifiers with their presets and modes. The outdoor areas (garden, terrace…) go to the Outdoors, with their temperature, air quality and noise sensors; a city air quality index (Atmo France…) and the weather entity, for want of an outdoor sensor, go to the Notifications tab. Quiet presets and fan modes become the night settings. What is already set is kept. Check the result, then save.",
    discover_running: "Discovering…",
    discover_result: "Discovery: {added} room(s) added, {updated} completed, {outdoors} outdoor place(s){outdoor}. Check them, then save.",
    discover_outdoor: ", outdoor sensors set",
    discover_none: "Discovery found nothing new.",
    fan: "Fan",
    purifier: "Air purifier",
    overview: "Overview",
    sc_score: "comfort",
    sc_all_good: "Everything is comfortable",
    sc_point: "{n} point to watch",
    sc_points: "{n} points to watch",
    n_rooms_ok: "{n} rooms OK",
    rooms: "Rooms",
    alerts: "Alerts",
    notifications: "Notifications",
    dashboards: "Dashboards",
    control: "Device control",
    save: "Save",
    discard: "Discard",
    saved: "Saved",
    saving: "Saving…",
    unsaved: "Unsaved changes",
    yaml: "This configuration comes from YAML and can be edited here. When the YAML changes (at a restart or with Reload the YAML), only what changed in it is applied: your changes to the other settings stay.",
    yaml_reload: "Reload the YAML",
    yaml_reloaded: "YAML applied: only what changed in it was updated.",
    yaml_unchanged: "The YAML hasn't changed: nothing to apply.",
    yaml_conflicts: "YAML applied. It replaced what had been changed here for: {paths}",
    yaml_file: "This configuration is kept in {file} in the configuration folder: what you save here is written to it, and changes made to the file are applied within seconds.",
    yaml_help_file: "The content of {file} in the configuration folder (the defaults are not repeated).",
    src_title: "Configuration source",
    src_status: "Modified at {time} · {rooms} rooms · synced",
    src_status_invalid: "Modified at {time} · invalid, not applied: {error}",
    src_reload: "Reload",
    src_write: "Editing in the panel",
    src_write_help: "Each save rewrites only what changed in the file, comments and layout kept · backup .bak.",
    src_watch: "File monitoring",
    src_watch_help: "Read again at each change (included files too) · only what changed is applied.",
    src_included: "Included files",
    src_included_help: "{files} · a room is rewritten in its own file.",
    src_create: "Create {file}",
    src_create_help: "Writes the configuration in use to {file} in the configuration folder; the file and the panel then stay in sync.",
    src_none: "No {file}: the configuration is kept by Home Assistant only.",
    conflict_title: "The file changed while you were editing",
    conflict_sub: "{n} settings changed in {file} at {time}",
    conflict_sub_other: "{n} settings changed elsewhere (YAML or another window)",
    conflict_file: "File",
    conflict_panel: "Panel",
    conflict_keep_file: "Keep the file",
    conflict_keep_panel: "Keep the panel",
    not_loaded: "Smart Comfort is not loaded. Check the logs.",
    not_setup: "Smart Comfort is not set up yet: add it in Settings → Devices & services.",
    retry: "Retry",
    active_alerts: "Active alerts",
    no_alerts: "Everything is fine.",
    outdoor: "Outdoor",
    notifications_on: "Notifications on",
    notifications_off: "Notifications off",
    control_on: "Device control on",
    control_off: "Device control off",
    notify_now: "Notify now",
    unsnooze: "Cancel snoozes",
    snooze: "Snooze",
    acknowledge: "Got it",
    snoozed: "snoozed",
    acknowledged: "acknowledged",
    handled: "handled",
    notified: "notified",
    pending: "not notified yet",
    since: "since",
    ok: "OK",
    open: "Open",
    devices: "Devices",
    target: "target",
    manual: "manual until",
    last_notification: "Last notification",
    add_room: "Add a room",
    new_room: "New room",
    remove: "Remove",
    move_up: "Move up",
    move_down: "Move down",
    room_alerts: "Alerts of this room",
    inherit: "Default",
    enabled: "On",
    disabled: "Off",
    climate: "Air conditioner",
    fans: "Fans",
    purifiers: "Air purifiers",
    device_settings: "Settings of this device",
    default_value: "Default: {value}",
    no_rooms: "No room yet.",
    outdoor_air: "Outdoor air",
    outdoors: "Outdoors",
    add_outdoor: "Add an outdoor place",
    new_outdoor: "Outdoor",
    no_outdoors: "No outdoor place yet.",
    start: "Get started",
    start_help: "Nothing is set up yet. Discover finds the rooms and outdoor places of your Home Assistant areas with their sensors and devices, and sets them up; you check the result in the Rooms tab before saving.",
    no_sensor: "no sensor",
    lighting: "Adaptive lighting",
    lights: "Lights",
    light: "Light",
    lighting_on: "Adaptive lighting on",
    lighting_off: "Adaptive lighting off",
    nap_start: "Nap from",
    nap_end: "Until",
    nap_days: "Days",
    nap_days_help: "None: every day.",
    nap_entity: "Nap schedule",
    nap_entity_help: "On: a nap (a schedule helper shared with House Rules, an input boolean…).",
    day_mon: "Mon",
    day_tue: "Tue",
    day_wed: "Wed",
    day_thu: "Thu",
    day_fri: "Fri",
    day_sat: "Sat",
    day_sun: "Sun",
    advanced: "Advanced",
    alerts_help: "Defaults for every room; each room can customize its own.",
    schedule: "Schedule",
    settings: "Settings",
    activity: "Activity",
    activity_help: "What Smart Comfort did and why, live: devices, lights, notifications, changes by hand. A line opens its entity.",
    yaml_tab: "YAML",
    yaml_help: "Only the configuration of Smart Comfort, as it goes under smart_comfort: in configuration.yaml (the defaults are not repeated).",
    yaml_help_unsaved: "Only the configuration of Smart Comfort, as it goes under smart_comfort: in configuration.yaml (the defaults are not repeated). Includes the changes not saved yet.",
    yaml_copy: "Copy",
    yaml_copied: "Copied",
    sched_title: "Your day",
    sched_help: "When each time window applies, with the time now.",
    sched_edit: "Times",
    sched_quiet: "Quiet hours",
    sched_quiet_help: "Only critical alerts are sent; the others wait for the end.",
    sched_night: "Quiet night",
    sched_night_help: "Devices run quieter, no window boost, lights at their night level.",
    sched_morning: "Quiet morning",
    sched_morning_help: "From the end of the night: bedroom lights stay dimmer.",
    sched_boost: "Window boost",
    sched_boost_help: "Fans and purifiers at full speed while a window is open. Both empty: all day.",
    sched_displays: "Displays off",
    sched_displays_help: "Indicator lights and displays of the devices off (and during the naps of their room). Empty: the quiet night.",
    sched_from: "From",
    sched_to: "Until",
    sched_morning_end: "Until",
    discover_short: "Finds the rooms of your Home Assistant areas, with their sensors, devices and lights. Nothing is saved before you check.",
    how: "How it works",
    less: "Less",
    other_outdoor: "Other outdoor sensors",
    other_outdoor_help: "Sensors in no outdoor place: a weather entity, a city air quality index…",
    outdoors_help: "Garden, terrace, balcony…: their sensors give the outdoor temperature, air quality and noise.",
    section_sensors: "Sensors",
    section_openings: "Windows and doors",
    section_devices: "Devices",
    section_lighting: "Lighting",
    section_alerts: "Alerts",
    none: "None",
    openings_help: "Their state holds back or triggers the window alerts and boosts.",
    naps: "Naps",
    nap: "Nap",
    no_naps: "No nap: add one to dim the lights at set times.",
    alerts_default: "Default settings",
    customize_alert: "Customize an alert",
    room_alerts_help: "Only the alerts customized for this room; the others follow the Alerts tab.",
    lighting_help: "Lights that are on follow the time of day; Smart Comfort never turns them on or off. Times are in the Schedule tab.",
    presence_title: "Lights on presence",
    presence_help: "Turns the lights on when someone comes in and off once nobody is left, like a presence automation.",
    presence_add: "Lights on presence",
    presence_remove: "Stop the lights on presence",
    presence_short: "Presence",
    presence_sensors: "Presence sensors",
    presence_lights: "Lights",
    presence_lights_help: "Empty: the lights of the room. Any light can be added (the hallway's from the entrance…).",
    presence_lux: "Light level sensor",
    presence_max_lux: "Only below",
    presence_max_lux_help: "No light turned on when the room is brighter than this.",
    presence_off_after: "Off after nobody for",
    presence_on_after: "On after a presence of",
    presence_transition: "Fade",
    presence_on_after_help: "Someone just passing by the sensor doesn't turn the lights on.",
    presence_not_during_naps: "Off during the naps",
    presence_not_during_naps_help: "These lights are not turned on while a room of the house has its nap.",
    slots_help: "Slots, in order: the first one that applies to a light decides — kept off, or turned on at its brightness.",
    slot_add: "Slot",
    slot_lights: "For the lights",
    slot_lights_help: "Empty: all the presence lights.",
    slot_off: "Don't turn on",
    slot_brightness: "Brightness",
    slot_off_after: "Off after nobody for",
    slot_color: "Color",
    a_empty: "Nothing yet.",
    a_not_loaded: "Smart Comfort is not loaded.",
    a_all: "All",
    a_group_devices: "Devices",
    a_group_lights: "Lights",
    a_group_notifications: "Notifications",
    a_group_manual: "By hand",
    a_today: "Today",
    a_yesterday: "Yesterday",
    a_t_cool: "Cooling",
    a_t_cool_night: "Cooling, quiet night",
    a_t_off: "Off",
    a_t_off_open: "Off: a window stays open",
    a_t_on: "On: warm",
    a_t_on_night: "On, quiet night",
    a_t_boost: "Window boost",
    a_t_purify: "Boost: polluted air",
    a_t_normal: "Back to normal",
    a_t_night: "Night mode",
    a_t_keep_on: "Turned back on",
    a_lighting: "Brightness of the moment",
    a_presence_on: "On: someone came in",
    a_presence_off: "Off: nobody left",
    a_display_off: "Indicator off",
    a_display_on: "Indicator back on",
    a_notified: "Notification",
    a_cleared: "Notification cleared: everything is back to normal",
    a_manual: "Changed by hand: left alone",
    a_manual_until: "Changed by hand: left alone until {time}",
    a_reset: "Back to normal (set time)",
    a_failed: "Could not be sent",
    a_all_rooms: "All rooms",
  },
  fr: {
    annex_alerts: "Réglages des annexes",
    annex_alerts_help: "Seuils d'alerte par défaut des annexes — cave, garage, atelier, buanderie, grenier. Réglez le type d'une pièce sur Annexe dans l'onglet Pièces ; chaque pièce peut toujours les remplacer.",
    outdoor_noise: "Bruit extérieur",
    quiet_night: "Nuit calme",
    to_handle: "À traiter",
    all_rooms: "Toutes les pièces",
    n_ok_rooms: "+ {n} OK",
    n_handled: "{n} prises en charge",
    discovered_new: "nouvelle",
    discovered_updated: "complétée",
    discovered_new_outdoor: "nouvelle",
    discovered_updated_outdoor: "complétée",
    discover: "Découvrir",
    discover_help: "Ajoute chaque pièce de Home Assistant où il y a quelque chose à suivre (un capteur de confort, un climatiseur, un ventilateur, un purificateur ou une lumière variable) et la règle : capteurs de température, CO₂, humidité et bruit, capteurs PM2.5, PM10 et d'indice de qualité de l'air (ceux des purificateurs aussi), fenêtres et portes, climatiseur, ventilateurs et purificateurs avec leurs modes. Les pièces extérieures (jardin, terrasse…) vont dans Extérieurs, avec leurs capteurs de température, qualité de l'air et bruit ; un indice de qualité de l'air de la ville (Atmo France…) et l'entité météo, à défaut de capteur extérieur, vont dans l'onglet Notifications. Les modes silencieux deviennent les réglages de nuit. Ce qui est déjà réglé est conservé. Vérifiez le résultat, puis enregistrez.",
    discover_running: "Découverte…",
    discover_result: "Découverte : {added} pièce(s) ajoutée(s), {updated} complétée(s), {outdoors} extérieur(s){outdoor}. Vérifiez-les, puis enregistrez.",
    discover_outdoor: ", capteurs extérieurs renseignés",
    discover_none: "La découverte n'a rien trouvé de nouveau.",
    fan: "Ventilateur",
    purifier: "Purificateur",
    overview: "Vue d'ensemble",
    sc_score: "confort",
    sc_all_good: "Tout est confortable",
    sc_point: "{n} point à surveiller",
    sc_points: "{n} points à surveiller",
    n_rooms_ok: "{n} pièces OK",
    rooms: "Pièces",
    alerts: "Alertes",
    notifications: "Notifications",
    dashboards: "Tableaux de bord",
    control: "Pilotage des appareils",
    save: "Enregistrer",
    discard: "Annuler",
    saved: "Enregistré",
    saving: "Enregistrement…",
    unsaved: "Modifications non enregistrées",
    yaml: "Cette configuration vient du YAML et reste modifiable ici. Quand le YAML change (au redémarrage ou avec Recharger le YAML), seul ce qui y a changé est appliqué : vos modifications des autres réglages restent.",
    yaml_reload: "Recharger le YAML",
    yaml_reloaded: "YAML appliqué : seul ce qui y a changé a été mis à jour.",
    yaml_unchanged: "Le YAML n'a pas changé : rien à appliquer.",
    yaml_conflicts: "YAML appliqué. Il a remplacé ce qui avait été modifié ici pour : {paths}",
    yaml_file: "Cette configuration est gardée dans {file}, dans le dossier de configuration : ce que vous enregistrez ici y est écrit, et les modifications du fichier sont appliquées en quelques secondes.",
    yaml_help_file: "Le contenu de {file}, dans le dossier de configuration (les valeurs par défaut ne sont pas répétées).",
    src_title: "Source de la configuration",
    src_status: "Modifié à {time} · {rooms} pièces · synchronisé",
    src_status_invalid: "Modifié à {time} · invalide, non appliqué : {error}",
    src_reload: "Recharger",
    src_write: "Édition dans le panneau",
    src_write_help: "Chaque enregistrement ne réécrit que ce qui a changé dans le fichier, commentaires et mise en forme conservés · sauvegarde .bak.",
    src_watch: "Surveillance du fichier",
    src_watch_help: "Relecture à chaque modification (fichiers inclus compris) · seul ce qui a changé est appliqué.",
    src_included: "Fichiers inclus",
    src_included_help: "{files} · une pièce est réécrite dans son propre fichier.",
    src_create: "Créer {file}",
    src_create_help: "Écrit la configuration en vigueur dans {file}, dans le dossier de configuration ; le fichier et le panneau restent ensuite synchronisés.",
    src_none: "Pas de {file} : la configuration n'est gardée que par Home Assistant.",
    conflict_title: "Le fichier a changé pendant l'édition",
    conflict_sub: "{n} réglages modifiés dans {file} à {time}",
    conflict_sub_other: "{n} réglages modifiés ailleurs (YAML ou autre fenêtre)",
    conflict_file: "Fichier",
    conflict_panel: "Panneau",
    conflict_keep_file: "Garder le fichier",
    conflict_keep_panel: "Garder le panneau",
    not_loaded: "Smart Comfort n'est pas chargé. Consultez les journaux.",
    not_setup: "Smart Comfort n'est pas encore configuré : ajoutez-le dans Paramètres → Appareils et services.",
    retry: "Réessayer",
    active_alerts: "Alertes actives",
    no_alerts: "Tout va bien.",
    outdoor: "Extérieur",
    notifications_on: "Notifications activées",
    notifications_off: "Notifications coupées",
    control_on: "Pilotage activé",
    control_off: "Pilotage coupé",
    notify_now: "Notifier maintenant",
    unsnooze: "Annuler les sourdines",
    snooze: "Ignorer",
    acknowledge: "C'est noté",
    snoozed: "en sourdine",
    acknowledged: "acquittée",
    handled: "traitée",
    notified: "notifiée",
    pending: "pas encore notifiée",
    since: "depuis",
    ok: "OK",
    open: "Ouvert",
    devices: "Appareils",
    target: "cible",
    manual: "manuel jusqu'à",
    last_notification: "Dernière notification",
    add_room: "Ajouter une pièce",
    new_room: "Nouvelle pièce",
    remove: "Supprimer",
    move_up: "Monter",
    move_down: "Descendre",
    room_alerts: "Alertes de cette pièce",
    inherit: "Par défaut",
    enabled: "Activée",
    disabled: "Désactivée",
    climate: "Climatiseur",
    fans: "Ventilateurs",
    purifiers: "Purificateurs d'air",
    device_settings: "Réglages de cet appareil",
    default_value: "Par défaut : {value}",
    no_rooms: "Aucune pièce pour l'instant.",
    outdoor_air: "Air extérieur",
    outdoors: "Extérieurs",
    add_outdoor: "Ajouter un extérieur",
    new_outdoor: "Extérieur",
    no_outdoors: "Aucun extérieur pour l'instant.",
    start: "Pour commencer",
    start_help: "Rien n'est encore configuré. La découverte trouve les pièces et les extérieurs de vos zones Home Assistant avec leurs capteurs et appareils, et les règle ; vous vérifiez le résultat dans l'onglet Pièces avant d'enregistrer.",
    no_sensor: "aucun capteur",
    lighting: "Éclairage adaptatif",
    lights: "Lumières",
    light: "Lumière",
    lighting_on: "Éclairage adaptatif activé",
    lighting_off: "Éclairage adaptatif désactivé",
    nap_start: "Sieste de",
    nap_end: "Jusqu'à",
    nap_days: "Jours",
    nap_days_help: "Aucun : tous les jours.",
    nap_entity: "Planning de sieste",
    nap_entity_help: "Allumé : sieste (un planning partagé avec House Rules, un interrupteur virtuel…).",
    day_mon: "Lun",
    day_tue: "Mar",
    day_wed: "Mer",
    day_thu: "Jeu",
    day_fri: "Ven",
    day_sat: "Sam",
    day_sun: "Dim",
    advanced: "Avancé",
    alerts_help: "Réglages par défaut de toutes les pièces ; chaque pièce peut personnaliser les siens.",
    schedule: "Horaires",
    settings: "Réglages",
    activity: "Activité",
    activity_help: "Ce que Smart Comfort a fait et pourquoi, en direct : appareils, lumières, notifications, changements à la main. Une ligne ouvre son entité.",
    yaml_tab: "YAML",
    yaml_help: "Uniquement la configuration de Smart Comfort, telle qu'elle se met sous smart_comfort: dans configuration.yaml (les valeurs par défaut ne sont pas répétées).",
    yaml_help_unsaved: "Uniquement la configuration de Smart Comfort, telle qu'elle se met sous smart_comfort: dans configuration.yaml (les valeurs par défaut ne sont pas répétées). Inclut les modifications pas encore enregistrées.",
    yaml_copy: "Copier",
    yaml_copied: "Copié",
    sched_title: "Votre journée",
    sched_help: "Quand chaque plage s'applique, avec l'heure actuelle.",
    sched_edit: "Horaires",
    sched_quiet: "Heures calmes",
    sched_quiet_help: "Seules les alertes critiques sont envoyées ; les autres attendent la fin.",
    sched_night: "Nuit calme",
    sched_night_help: "Appareils plus silencieux, pas de boost fenêtre, lumières à leur niveau de nuit.",
    sched_morning: "Matin doux",
    sched_morning_help: "À partir de la fin de la nuit : les lumières des chambres restent moins fortes.",
    sched_boost: "Boost fenêtre",
    sched_boost_help: "Ventilateurs et purificateurs à fond quand une fenêtre est ouverte. Les deux vides : toute la journée.",
    sched_displays: "Voyants éteints",
    sched_displays_help: "Voyants et écrans des appareils éteints (et pendant les siestes de leur pièce). Vide : la nuit calme.",
    sched_from: "De",
    sched_to: "Jusqu'à",
    sched_morning_end: "Jusqu'à",
    discover_short: "Trouve les pièces de vos zones Home Assistant, avec leurs capteurs, appareils et lumières. Rien n'est enregistré avant votre vérification.",
    how: "Comment ça marche",
    less: "Moins",
    other_outdoor: "Autres capteurs extérieurs",
    other_outdoor_help: "Capteurs hors des extérieurs : une entité météo, un indice de qualité de l'air de la ville…",
    outdoors_help: "Jardin, terrasse, balcon… : leurs capteurs donnent la température, la qualité de l'air et le bruit extérieurs.",
    section_sensors: "Capteurs",
    section_openings: "Fenêtres et portes",
    section_devices: "Appareils",
    section_lighting: "Éclairage",
    section_alerts: "Alertes",
    none: "Aucun",
    openings_help: "Leur état retient ou déclenche les alertes et les boosts liés aux fenêtres.",
    naps: "Siestes",
    nap: "Sieste",
    no_naps: "Aucune sieste : ajoutez-en une pour baisser les lumières à heures fixes.",
    alerts_default: "Réglages par défaut",
    customize_alert: "Personnaliser une alerte",
    room_alerts_help: "Seulement les alertes personnalisées pour cette pièce ; les autres suivent l'onglet Alertes.",
    lighting_help: "Les lumières allumées suivent le moment de la journée ; Smart Comfort ne les allume ni ne les éteint jamais. Les heures sont dans l'onglet Horaires.",
    presence_title: "Allumage sur présence",
    presence_help: "Allume les lumières quand quelqu'un entre et les éteint une fois la pièce vide, comme une automatisation de présence.",
    presence_add: "Allumage sur présence",
    presence_remove: "Arrêter l'allumage sur présence",
    presence_short: "Présence",
    presence_sensors: "Capteurs de présence",
    presence_lights: "Lumières",
    presence_lights_help: "Vide : les lumières de la pièce. On peut ajouter n'importe quelle lumière (celle du couloir depuis l'entrée…).",
    presence_lux: "Capteur de luminosité",
    presence_max_lux: "Seulement sous",
    presence_max_lux_help: "Aucune lumière allumée quand la pièce est plus claire que ça.",
    presence_off_after: "Extinction après personne pendant",
    presence_on_after: "Allumage après une présence de",
    presence_transition: "Fondu",
    presence_on_after_help: "Quelqu'un qui passe juste devant le capteur n'allume pas les lumières.",
    presence_not_during_naps: "Éteintes pendant les siestes",
    presence_not_during_naps_help: "Ces lumières ne s'allument pas pendant la sieste d'une pièce de la maison.",
    slots_help: "Créneaux, dans l'ordre : le premier qui s'applique à une lumière décide — laissée éteinte, ou allumée à son intensité.",
    slot_add: "Créneau",
    slot_lights: "Pour les lumières",
    slot_lights_help: "Vide : toutes les lumières de présence.",
    slot_off: "Ne pas allumer",
    slot_brightness: "Intensité",
    slot_off_after: "Extinction après personne pendant",
    slot_color: "Couleur",
    a_empty: "Rien pour l'instant.",
    a_not_loaded: "Smart Comfort n'est pas chargé.",
    a_all: "Tout",
    a_group_devices: "Appareils",
    a_group_lights: "Lumières",
    a_group_notifications: "Notifications",
    a_group_manual: "À la main",
    a_today: "Aujourd'hui",
    a_yesterday: "Hier",
    a_t_cool: "Refroidit",
    a_t_cool_night: "Refroidit, nuit calme",
    a_t_off: "Éteint",
    a_t_off_open: "Éteint : une fenêtre reste ouverte",
    a_t_on: "Allumé : il fait chaud",
    a_t_on_night: "Allumé, nuit calme",
    a_t_boost: "Boost fenêtre",
    a_t_purify: "Boost : air pollué",
    a_t_normal: "Retour à la normale",
    a_t_night: "Mode nuit",
    a_t_keep_on: "Rallumé",
    a_lighting: "Intensité du moment",
    a_presence_on: "Allumée : quelqu'un est entré",
    a_presence_off: "Éteinte : plus personne",
    a_display_off: "Voyant éteint",
    a_display_on: "Voyant rallumé",
    a_notified: "Notification",
    a_cleared: "Notification effacée : tout est revenu à la normale",
    a_manual: "Changé à la main : laissé tel quel",
    a_manual_until: "Changé à la main : laissé tel quel jusqu'à {time}",
    a_reset: "Retour à la normale (heure fixe)",
    a_failed: "Commande non envoyée",
    a_all_rooms: "Toutes les pièces",
  },
  de: {
    annex_alerts: "Standardwerte für Nebenräume",
    annex_alerts_help: "Standard-Alarmschwellen für Nebenräume – Keller, Garage, Werkstatt, Waschküche, Dachboden. Setze den Typ eines Raums im Tab Räume auf Nebenraum; jeder Raum kann sie weiterhin überschreiben.",
    outdoor_noise: "Außenlärm",
    quiet_night: "Ruhige Nacht",
    to_handle: "Zu erledigen",
    all_rooms: "Alle Räume",
    n_ok_rooms: "+ {n} OK",
    n_handled: "{n} übernommen",
    discovered_new: "neu",
    discovered_updated: "ergänzt",
    discovered_new_outdoor: "neu",
    discovered_updated_outdoor: "ergänzt",
    discover: "Erkennen",
    discover_help: "Legt für jeden Home-Assistant-Bereich mit etwas zu überwachen (Komfortsensor, Klimaanlage, Lüfter, Luftreiniger oder dimmbares Licht) einen Raum an und richtet ihn ein: Temperatur-, CO₂-, Feuchte- und Lärmsensoren, PM2.5-, PM10- und Luftqualitätsindex-Sensoren (auch die der Luftreiniger), Fenster und Türen, Klimaanlage, Lüfter und Luftreiniger mit ihren Modi. Die Außenbereiche (Garten, Terrasse…) kommen zu „Außen“, mit ihren Temperatur-, Luftqualitäts- und Lärmsensoren; ein städtischer Luftqualitätsindex (Atmo France…) und die Wetter-Entität, mangels Außensensor, in den Reiter Benachrichtigungen. Leise Voreinstellungen und Lüftermodi werden zu den Nachteinstellungen. Bereits Eingestelltes bleibt erhalten. Ergebnis prüfen, dann speichern.",
    discover_running: "Erkennung…",
    discover_result: "Erkennung: {added} Raum/Räume hinzugefügt, {updated} ergänzt, {outdoors} Außenbereich(e){outdoor}. Prüfen, dann speichern.",
    discover_outdoor: ", Außensensoren gesetzt",
    discover_none: "Die Erkennung hat nichts Neues gefunden.",
    fan: "Lüfter",
    purifier: "Luftreiniger",
    overview: "Übersicht",
    sc_score: "Komfort",
    sc_all_good: "Alles ist angenehm",
    sc_point: "{n} Punkt zu beachten",
    sc_points: "{n} Punkte zu beachten",
    n_rooms_ok: "{n} Räume OK",
    rooms: "Räume",
    alerts: "Meldungen",
    notifications: "Benachrichtigungen",
    dashboards: "Dashboards",
    control: "Gerätesteuerung",
    save: "Speichern",
    discard: "Verwerfen",
    saved: "Gespeichert",
    saving: "Speichern…",
    unsaved: "Ungespeicherte Änderungen",
    yaml: "Diese Konfiguration stammt aus YAML und kann hier bearbeitet werden. Ändert sich das YAML (beim Neustart oder mit YAML neu laden), wird nur das Geänderte übernommen: deine Änderungen an den anderen Einstellungen bleiben.",
    yaml_reload: "YAML neu laden",
    yaml_reloaded: "YAML übernommen: nur das Geänderte wurde aktualisiert.",
    yaml_unchanged: "Das YAML hat sich nicht geändert: nichts zu übernehmen.",
    yaml_conflicts: "YAML übernommen. Es hat hier Geändertes ersetzt bei: {paths}",
    yaml_file: "Diese Konfiguration wird in {file} im Konfigurationsordner gehalten: was du hier speicherst, wird hineingeschrieben, und Änderungen an der Datei werden binnen Sekunden übernommen.",
    yaml_help_file: "Der Inhalt von {file} im Konfigurationsordner (Standardwerte werden nicht wiederholt).",
    src_title: "Quelle der Konfiguration",
    src_status: "Geändert um {time} · {rooms} Räume · synchronisiert",
    src_status_invalid: "Geändert um {time} · ungültig, nicht übernommen: {error}",
    src_reload: "Neu laden",
    src_write: "Bearbeitung im Panel",
    src_write_help: "Jedes Speichern schreibt nur das Geänderte in die Datei, Kommentare und Formatierung bleiben · Sicherung .bak.",
    src_watch: "Dateiüberwachung",
    src_watch_help: "Bei jeder Änderung neu gelesen (eingebundene Dateien auch) · nur das Geänderte wird übernommen.",
    src_included: "Eingebundene Dateien",
    src_included_help: "{files} · ein Raum wird in seiner eigenen Datei geschrieben.",
    src_create: "{file} erstellen",
    src_create_help: "Schreibt die aktuelle Konfiguration in {file} im Konfigurationsordner; Datei und Panel bleiben danach synchron.",
    src_none: "Keine {file}: die Konfiguration wird nur von Home Assistant gehalten.",
    conflict_title: "Die Datei hat sich während der Bearbeitung geändert",
    conflict_sub: "{n} Einstellungen in {file} um {time} geändert",
    conflict_sub_other: "{n} Einstellungen anderswo geändert (YAML oder anderes Fenster)",
    conflict_file: "Datei",
    conflict_panel: "Panel",
    conflict_keep_file: "Datei behalten",
    conflict_keep_panel: "Panel behalten",
    not_loaded: "Smart Comfort ist nicht geladen. Prüfen Sie die Protokolle.",
    not_setup: "Smart Comfort ist noch nicht eingerichtet: unter Einstellungen → Geräte & Dienste hinzufügen.",
    retry: "Erneut versuchen",
    active_alerts: "Aktive Meldungen",
    no_alerts: "Alles in Ordnung.",
    outdoor: "Außen",
    notifications_on: "Benachrichtigungen an",
    notifications_off: "Benachrichtigungen aus",
    control_on: "Gerätesteuerung an",
    control_off: "Gerätesteuerung aus",
    notify_now: "Jetzt benachrichtigen",
    unsnooze: "Stummschaltungen aufheben",
    snooze: "Stumm",
    acknowledge: "Verstanden",
    snoozed: "stumm",
    acknowledged: "bestätigt",
    handled: "behandelt",
    notified: "gemeldet",
    pending: "noch nicht gemeldet",
    since: "seit",
    ok: "OK",
    open: "Offen",
    devices: "Geräte",
    target: "Ziel",
    manual: "manuell bis",
    last_notification: "Letzte Benachrichtigung",
    add_room: "Raum hinzufügen",
    new_room: "Neuer Raum",
    remove: "Entfernen",
    move_up: "Nach oben",
    move_down: "Nach unten",
    room_alerts: "Meldungen dieses Raums",
    inherit: "Standard",
    enabled: "An",
    disabled: "Aus",
    climate: "Klimaanlage",
    fans: "Lüfter",
    purifiers: "Luftreiniger",
    device_settings: "Einstellungen dieses Geräts",
    default_value: "Standard: {value}",
    no_rooms: "Noch kein Raum.",
    outdoor_air: "Außenluft",
    outdoors: "Außen",
    add_outdoor: "Außenbereich hinzufügen",
    new_outdoor: "Außenbereich",
    no_outdoors: "Noch kein Außenbereich.",
    start: "Erste Schritte",
    start_help: "Noch ist nichts eingerichtet. Die Erkennung findet die Räume und Außenbereiche Ihrer Home-Assistant-Bereiche mit ihren Sensoren und Geräten und richtet sie ein; Sie prüfen das Ergebnis im Reiter Räume vor dem Speichern.",
    no_sensor: "kein Sensor",
    lighting: "Adaptive Beleuchtung",
    lights: "Lichter",
    light: "Licht",
    lighting_on: "Adaptive Beleuchtung an",
    lighting_off: "Adaptive Beleuchtung aus",
    nap_start: "Mittagsschlaf von",
    nap_end: "Bis",
    nap_days: "Tage",
    nap_days_help: "Keine: jeden Tag.",
    nap_entity: "Mittagsschlaf-Zeitplan",
    nap_entity_help: "Ein: Mittagsschlaf (ein mit House Rules geteilter Zeitplan, ein Eingabe-Schalter…).",
    day_mon: "Mo",
    day_tue: "Di",
    day_wed: "Mi",
    day_thu: "Do",
    day_fri: "Fr",
    day_sat: "Sa",
    day_sun: "So",
    advanced: "Erweitert",
    alerts_help: "Standard für alle Räume; jeder Raum kann eigene Werte setzen.",
    schedule: "Zeitplan",
    settings: "Einstellungen",
    activity: "Aktivität",
    activity_help: "Was Smart Comfort getan hat und warum, live: Geräte, Lichter, Benachrichtigungen, Änderungen von Hand. Eine Zeile öffnet ihre Entität.",
    yaml_tab: "YAML",
    yaml_help: "Nur die Konfiguration von Smart Comfort, wie sie unter smart_comfort: in configuration.yaml gehört (Standardwerte werden nicht wiederholt).",
    yaml_help_unsaved: "Nur die Konfiguration von Smart Comfort, wie sie unter smart_comfort: in configuration.yaml gehört (Standardwerte werden nicht wiederholt). Enthält noch nicht gespeicherte Änderungen.",
    yaml_copy: "Kopieren",
    yaml_copied: "Kopiert",
    sched_title: "Ihr Tag",
    sched_help: "Wann jedes Zeitfenster gilt, mit der aktuellen Uhrzeit.",
    sched_edit: "Zeiten",
    sched_quiet: "Ruhezeiten",
    sched_quiet_help: "Nur kritische Warnungen werden gesendet; die übrigen warten bis zum Ende.",
    sched_night: "Nachtruhe",
    sched_night_help: "Geräte leiser, kein Fenster-Boost, Lichter auf Nachtstufe.",
    sched_morning: "Sanfter Morgen",
    sched_morning_help: "Ab dem Ende der Nacht: Schlafzimmerlichter bleiben gedämpft.",
    sched_boost: "Fenster-Boost",
    sched_boost_help: "Lüfter und Luftreiniger auf voller Stufe bei offenem Fenster. Beide leer: den ganzen Tag.",
    sched_displays: "Anzeigen aus",
    sched_displays_help: "Kontrollleuchten und Displays der Geräte aus (auch während der Mittagsschläfchen im Raum). Leer: die Nachtruhe.",
    sched_from: "Von",
    sched_to: "Bis",
    sched_morning_end: "Bis",
    discover_short: "Findet die Räume Ihrer Home-Assistant-Bereiche mit Sensoren, Geräten und Lichtern. Nichts wird vor Ihrer Prüfung gespeichert.",
    how: "So funktioniert es",
    less: "Weniger",
    other_outdoor: "Weitere Außensensoren",
    other_outdoor_help: "Sensoren außerhalb der Außenbereiche: eine Wetter-Entität, ein städtischer Luftqualitätsindex…",
    outdoors_help: "Garten, Terrasse, Balkon…: ihre Sensoren liefern Außentemperatur, Luftqualität und Lärm.",
    section_sensors: "Sensoren",
    section_openings: "Fenster und Türen",
    section_devices: "Geräte",
    section_lighting: "Beleuchtung",
    section_alerts: "Warnungen",
    none: "Keine",
    openings_help: "Ihr Zustand hält Fensterwarnungen und Boosts zurück oder löst sie aus.",
    naps: "Mittagsschlaf",
    nap: "Mittagsschlaf",
    no_naps: "Kein Mittagsschlaf: fügen Sie einen hinzu, um das Licht zu festen Zeiten zu dämpfen.",
    alerts_default: "Standardeinstellungen",
    customize_alert: "Warnung anpassen",
    room_alerts_help: "Nur die für diesen Raum angepassten Warnungen; die übrigen folgen dem Reiter Warnungen.",
    lighting_help: "Eingeschaltete Lichter folgen der Tageszeit; Smart Comfort schaltet sie nie ein oder aus. Die Zeiten stehen im Reiter Zeitplan.",
    presence_title: "Licht bei Anwesenheit",
    presence_help: "Schaltet die Lichter ein, wenn jemand hereinkommt, und aus, sobald niemand mehr da ist – wie eine Anwesenheitsautomation.",
    presence_add: "Licht bei Anwesenheit",
    presence_remove: "Licht bei Anwesenheit beenden",
    presence_short: "Anwesenheit",
    presence_sensors: "Anwesenheitssensoren",
    presence_lights: "Lichter",
    presence_lights_help: "Leer: die Lichter des Raums. Jedes Licht kann hinzugefügt werden (das des Flurs vom Eingang aus…).",
    presence_lux: "Helligkeitssensor",
    presence_max_lux: "Nur unter",
    presence_max_lux_help: "Kein Licht wird eingeschaltet, wenn der Raum heller ist.",
    presence_off_after: "Aus nach niemand seit",
    presence_on_after: "An nach Anwesenheit von",
    presence_transition: "Überblendung",
    presence_on_after_help: "Wer nur am Sensor vorbeigeht, schaltet die Lichter nicht ein.",
    presence_not_during_naps: "Aus beim Mittagsschlaf",
    presence_not_during_naps_help: "Diese Lichter gehen nicht an, solange ein Raum des Hauses Mittagsschlaf hält.",
    slots_help: "Zeitfenster der Reihe nach: das erste, das für ein Licht gilt, entscheidet – aus lassen oder mit seiner Helligkeit einschalten.",
    slot_add: "Zeitfenster",
    slot_lights: "Für die Lichter",
    slot_lights_help: "Leer: alle Anwesenheitslichter.",
    slot_off: "Nicht einschalten",
    slot_brightness: "Helligkeit",
    slot_off_after: "Aus nach niemand seit",
    slot_color: "Farbe",
    a_empty: "Noch nichts.",
    a_not_loaded: "Smart Comfort ist nicht geladen.",
    a_all: "Alle",
    a_group_devices: "Geräte",
    a_group_lights: "Lichter",
    a_group_notifications: "Benachrichtigungen",
    a_group_manual: "Von Hand",
    a_today: "Heute",
    a_yesterday: "Gestern",
    a_t_cool: "Kühlt",
    a_t_cool_night: "Kühlt, Nachtruhe",
    a_t_off: "Aus",
    a_t_off_open: "Aus: ein Fenster bleibt offen",
    a_t_on: "An: warm",
    a_t_on_night: "An, Nachtruhe",
    a_t_boost: "Fenster-Boost",
    a_t_purify: "Boost: verschmutzte Luft",
    a_t_normal: "Zurück zum Normalzustand",
    a_t_night: "Nachtmodus",
    a_t_keep_on: "Wieder eingeschaltet",
    a_lighting: "Helligkeit des Moments",
    a_presence_on: "An: jemand ist gekommen",
    a_presence_off: "Aus: niemand mehr da",
    a_display_off: "Anzeige aus",
    a_display_on: "Anzeige wieder an",
    a_notified: "Benachrichtigung",
    a_cleared: "Benachrichtigung gelöscht: alles wieder normal",
    a_manual: "Von Hand geändert: in Ruhe gelassen",
    a_manual_until: "Von Hand geändert: in Ruhe gelassen bis {time}",
    a_reset: "Zurück zum Normalzustand (feste Uhrzeit)",
    a_failed: "Konnte nicht gesendet werden",
    a_all_rooms: "Alle Räume",
  },
  es: {
    annex_alerts: "Valores por defecto de anexos",
    annex_alerts_help: "Umbrales de alerta por defecto para anexos: bodega, garaje, taller, lavadero, desván. Cambia el tipo de una estancia a Anexo en la pestaña Estancias; cada estancia puede anularlos.",
    outdoor_noise: "Ruido exterior",
    quiet_night: "Noche tranquila",
    to_handle: "Por atender",
    all_rooms: "Todas las estancias",
    n_ok_rooms: "+ {n} OK",
    n_handled: "{n} atendidas",
    discovered_new: "nueva",
    discovered_updated: "completada",
    discovered_new_outdoor: "nueva",
    discovered_updated_outdoor: "completada",
    discover: "Descubrir",
    discover_help: "Añade una estancia por cada área de Home Assistant con algo que vigilar (un sensor de confort, un aire acondicionado, un ventilador, un purificador o una luz regulable) y la configura: sensores de temperatura, CO₂, humedad y ruido, sensores de PM2.5, PM10 e índice de calidad del aire (también los de los purificadores), ventanas y puertas, aire acondicionado, ventiladores y purificadores con sus modos. Las áreas exteriores (jardín, terraza…) van a Exteriores, con sus sensores de temperatura, calidad del aire y ruido; un índice de calidad del aire de la ciudad (Atmo France…) y la entidad meteorológica, a falta de sensor exterior, van a la pestaña Notificaciones. Los modos silenciosos pasan a ser los ajustes de noche. Lo ya configurado se conserva. Revise el resultado y guarde.",
    discover_running: "Descubriendo…",
    discover_result: "Descubrimiento: {added} estancia(s) añadida(s), {updated} completada(s), {outdoors} exterior(es){outdoor}. Revíselas y guarde.",
    discover_outdoor: ", sensores exteriores configurados",
    discover_none: "El descubrimiento no encontró nada nuevo.",
    fan: "Ventilador",
    purifier: "Purificador",
    overview: "Resumen",
    sc_score: "confort",
    sc_all_good: "Todo está confortable",
    sc_point: "{n} punto a vigilar",
    sc_points: "{n} puntos a vigilar",
    n_rooms_ok: "{n} estancias OK",
    rooms: "Estancias",
    alerts: "Alertas",
    notifications: "Notificaciones",
    dashboards: "Paneles",
    control: "Control de aparatos",
    save: "Guardar",
    discard: "Descartar",
    saved: "Guardado",
    saving: "Guardando…",
    unsaved: "Cambios sin guardar",
    yaml: "Esta configuración viene de YAML y se puede editar aquí. Cuando cambia el YAML (al reiniciar o con Recargar el YAML), solo se aplica lo que ha cambiado: tus cambios en los demás ajustes se mantienen.",
    yaml_reload: "Recargar el YAML",
    yaml_reloaded: "YAML aplicado: solo se ha actualizado lo que ha cambiado.",
    yaml_unchanged: "El YAML no ha cambiado: nada que aplicar.",
    yaml_conflicts: "YAML aplicado. Ha sustituido lo cambiado aquí en: {paths}",
    yaml_file: "Esta configuración se guarda en {file}, en la carpeta de configuración: lo que guardas aquí se escribe en él, y los cambios del archivo se aplican en unos segundos.",
    yaml_help_file: "El contenido de {file}, en la carpeta de configuración (los valores por defecto no se repiten).",
    src_title: "Origen de la configuración",
    src_status: "Modificado a las {time} · {rooms} estancias · sincronizado",
    src_status_invalid: "Modificado a las {time} · no válido, no aplicado: {error}",
    src_reload: "Recargar",
    src_write: "Edición en el panel",
    src_write_help: "Cada guardado solo reescribe lo que ha cambiado en el archivo, conservando comentarios y formato · copia .bak.",
    src_watch: "Vigilancia del archivo",
    src_watch_help: "Se relee en cada cambio (también los archivos incluidos) · solo se aplica lo que ha cambiado.",
    src_included: "Archivos incluidos",
    src_included_help: "{files} · una estancia se reescribe en su propio archivo.",
    src_create: "Crear {file}",
    src_create_help: "Escribe la configuración en uso en {file}, en la carpeta de configuración; después el archivo y el panel se mantienen sincronizados.",
    src_none: "No hay {file}: la configuración solo la guarda Home Assistant.",
    conflict_title: "El archivo ha cambiado durante la edición",
    conflict_sub: "{n} ajustes cambiados en {file} a las {time}",
    conflict_sub_other: "{n} ajustes cambiados en otro lugar (YAML u otra ventana)",
    conflict_file: "Archivo",
    conflict_panel: "Panel",
    conflict_keep_file: "Mantener el archivo",
    conflict_keep_panel: "Mantener el panel",
    not_loaded: "Smart Comfort no está cargado. Revise los registros.",
    not_setup: "Smart Comfort aún no está configurado: añádalo en Ajustes → Dispositivos y servicios.",
    retry: "Reintentar",
    active_alerts: "Alertas activas",
    no_alerts: "Todo va bien.",
    outdoor: "Exterior",
    notifications_on: "Notificaciones activadas",
    notifications_off: "Notificaciones desactivadas",
    control_on: "Control activado",
    control_off: "Control desactivado",
    notify_now: "Notificar ahora",
    unsnooze: "Cancelar pausas",
    snooze: "Posponer",
    acknowledge: "Entendido",
    snoozed: "pospuesta",
    acknowledged: "confirmada",
    handled: "gestionada",
    notified: "notificada",
    pending: "aún no notificada",
    since: "desde",
    ok: "OK",
    open: "Abierto",
    devices: "Aparatos",
    target: "objetivo",
    manual: "manual hasta",
    last_notification: "Última notificación",
    add_room: "Añadir una estancia",
    new_room: "Nueva estancia",
    remove: "Eliminar",
    move_up: "Subir",
    move_down: "Bajar",
    room_alerts: "Alertas de esta estancia",
    inherit: "Por defecto",
    enabled: "Activada",
    disabled: "Desactivada",
    climate: "Aire acondicionado",
    fans: "Ventiladores",
    purifiers: "Purificadores de aire",
    device_settings: "Ajustes de este aparato",
    default_value: "Por defecto: {value}",
    no_rooms: "Aún no hay estancias.",
    outdoor_air: "Aire exterior",
    outdoors: "Exteriores",
    add_outdoor: "Añadir un exterior",
    new_outdoor: "Exterior",
    no_outdoors: "Aún no hay exteriores.",
    start: "Para empezar",
    start_help: "Aún no hay nada configurado. El descubrimiento encuentra las estancias y los exteriores de sus áreas de Home Assistant con sus sensores y dispositivos, y los configura; revise el resultado en la pestaña Estancias antes de guardar.",
    no_sensor: "sin sensor",
    lighting: "Iluminación adaptativa",
    lights: "Luces",
    light: "Luz",
    lighting_on: "Iluminación adaptativa activada",
    lighting_off: "Iluminación adaptativa desactivada",
    nap_start: "Siesta de",
    nap_end: "Hasta",
    nap_days: "Días",
    nap_days_help: "Ninguno: todos los días.",
    nap_entity: "Horario de siesta",
    nap_entity_help: "Encendido: siesta (un horario compartido con House Rules, un interruptor virtual…).",
    day_mon: "Lun",
    day_tue: "Mar",
    day_wed: "Mié",
    day_thu: "Jue",
    day_fri: "Vie",
    day_sat: "Sáb",
    day_sun: "Dom",
    advanced: "Avanzado",
    alerts_help: "Ajustes por defecto de todas las estancias; cada estancia puede personalizar los suyos.",
    schedule: "Horarios",
    settings: "Ajustes",
    activity: "Actividad",
    activity_help: "Lo que Smart Comfort ha hecho y por qué, en directo: aparatos, luces, notificaciones, cambios a mano. Una línea abre su entidad.",
    yaml_tab: "YAML",
    yaml_help: "Solo la configuración de Smart Comfort, tal como va bajo smart_comfort: en configuration.yaml (los valores por defecto no se repiten).",
    yaml_help_unsaved: "Solo la configuración de Smart Comfort, tal como va bajo smart_comfort: en configuration.yaml (los valores por defecto no se repiten). Incluye los cambios aún no guardados.",
    yaml_copy: "Copiar",
    yaml_copied: "Copiado",
    sched_title: "Su día",
    sched_help: "Cuándo se aplica cada franja, con la hora actual.",
    sched_edit: "Horarios",
    sched_quiet: "Horas tranquilas",
    sched_quiet_help: "Solo se envían las alertas críticas; las demás esperan al final.",
    sched_night: "Noche tranquila",
    sched_night_help: "Dispositivos más silenciosos, sin refuerzo por ventana, luces a su nivel de noche.",
    sched_morning: "Mañana suave",
    sched_morning_help: "Desde el final de la noche: las luces de los dormitorios siguen más tenues.",
    sched_boost: "Refuerzo por ventana",
    sched_boost_help: "Ventiladores y purificadores al máximo con una ventana abierta. Ambos vacíos: todo el día.",
    sched_displays: "Pantallas apagadas",
    sched_displays_help: "Indicadores y pantallas de los aparatos apagados (y durante las siestas de su habitación). Vacío: la noche tranquila.",
    sched_from: "Desde",
    sched_to: "Hasta",
    sched_morning_end: "Hasta",
    discover_short: "Encuentra las estancias de sus áreas de Home Assistant, con sus sensores, dispositivos y luces. No se guarda nada antes de que lo revise.",
    how: "Cómo funciona",
    less: "Menos",
    other_outdoor: "Otros sensores exteriores",
    other_outdoor_help: "Sensores fuera de los exteriores: una entidad meteorológica, un índice de calidad del aire de la ciudad…",
    outdoors_help: "Jardín, terraza, balcón…: sus sensores dan la temperatura, la calidad del aire y el ruido exteriores.",
    section_sensors: "Sensores",
    section_openings: "Ventanas y puertas",
    section_devices: "Dispositivos",
    section_lighting: "Iluminación",
    section_alerts: "Alertas",
    none: "Ninguno",
    openings_help: "Su estado retiene o activa las alertas y refuerzos de ventanas.",
    naps: "Siestas",
    nap: "Siesta",
    no_naps: "Ninguna siesta: añada una para bajar las luces a horas fijas.",
    alerts_default: "Ajustes por defecto",
    customize_alert: "Personalizar una alerta",
    room_alerts_help: "Solo las alertas personalizadas para esta estancia; las demás siguen la pestaña Alertas.",
    lighting_help: "Las luces encendidas siguen el momento del día; Smart Comfort nunca las enciende ni apaga. Las horas están en la pestaña Horarios.",
    presence_title: "Luces con presencia",
    presence_help: "Enciende las luces cuando alguien entra y las apaga cuando no queda nadie, como una automatización de presencia.",
    presence_add: "Luces con presencia",
    presence_remove: "Quitar las luces con presencia",
    presence_short: "Presencia",
    presence_sensors: "Sensores de presencia",
    presence_lights: "Luces",
    presence_lights_help: "Vacío: las luces de la estancia. Se puede añadir cualquier luz (la del pasillo desde la entrada…).",
    presence_lux: "Sensor de luminosidad",
    presence_max_lux: "Solo por debajo de",
    presence_max_lux_help: "No se enciende ninguna luz si la estancia está más iluminada.",
    presence_off_after: "Apagado tras nadie durante",
    presence_on_after: "Encendido tras una presencia de",
    presence_transition: "Fundido",
    presence_on_after_help: "Alguien que solo pasa delante del sensor no enciende las luces.",
    presence_not_during_naps: "Apagadas durante las siestas",
    presence_not_during_naps_help: "Estas luces no se encienden mientras una estancia de la casa está en siesta.",
    slots_help: "Franjas, en orden: la primera que se aplica a una luz decide — apagada, o encendida con su brillo.",
    slot_add: "Franja",
    slot_lights: "Para las luces",
    slot_lights_help: "Vacío: todas las luces de presencia.",
    slot_off: "No encender",
    slot_brightness: "Brillo",
    slot_off_after: "Apagado tras nadie durante",
    slot_color: "Color",
    a_empty: "Nada por ahora.",
    a_not_loaded: "Smart Comfort no está cargado.",
    a_all: "Todo",
    a_group_devices: "Aparatos",
    a_group_lights: "Luces",
    a_group_notifications: "Notificaciones",
    a_group_manual: "A mano",
    a_today: "Hoy",
    a_yesterday: "Ayer",
    a_t_cool: "Enfriando",
    a_t_cool_night: "Enfriando, noche tranquila",
    a_t_off: "Apagado",
    a_t_off_open: "Apagado: una ventana sigue abierta",
    a_t_on: "Encendido: hace calor",
    a_t_on_night: "Encendido, noche tranquila",
    a_t_boost: "Refuerzo por ventana",
    a_t_purify: "Refuerzo: aire contaminado",
    a_t_normal: "Vuelta a lo normal",
    a_t_night: "Modo noche",
    a_t_keep_on: "Encendido de nuevo",
    a_lighting: "Brillo del momento",
    a_presence_on: "Encendida: alguien ha entrado",
    a_presence_off: "Apagada: ya no hay nadie",
    a_display_off: "Indicador apagado",
    a_display_on: "Indicador encendido",
    a_notified: "Notificación",
    a_cleared: "Notificación borrada: todo ha vuelto a la normalidad",
    a_manual: "Cambiado a mano: se deja así",
    a_manual_until: "Cambiado a mano: se deja así hasta las {time}",
    a_reset: "Vuelta a lo normal (hora fija)",
    a_failed: "No se pudo enviar",
    a_all_rooms: "Todas las habitaciones",
  },
  sr: {
    annex_alerts: "Подразумеване вредности за помоћне просторије",
    annex_alerts_help: "Подразумевани прагови упозорења за помоћне просторије — подрум, гаража, радионица, веш-соба, таван. Поставите тип просторије на Помоћна у картици Просторије; свака просторија их може заменити.",
    outdoor_noise: "Спољашња бука",
    quiet_night: "Мирна ноћ",
    to_handle: "За обраду",
    all_rooms: "Све просторије",
    n_ok_rooms: "+ {n} у реду",
    n_handled: "{n} преузето",
    discovered_new: "ново",
    discovered_updated: "допуњено",
    discovered_new_outdoor: "ново",
    discovered_updated_outdoor: "допуњено",
    discover: "Откриј",
    discover_help: "Додаје собу за сваку Home Assistant зону у којој има нешто за праћење (сензор комфора, клима уређај, вентилатор, пречишћавач или светло са подесивом јачином) и подешава је: сензоре температуре, CO₂, влажности ваздуха и буке, сензоре PM2.5, PM10 и индекса квалитета ваздуха (и оне на пречишћавачима), прозоре и врата, клима уређај, вентилаторе и пречишћаваче са њиховим предефинисаним режимима и опцијама. Спољашње зоне (башта, тераса…) иду у „Спољашњи простор“ са својим сензорима температуре, квалитета ваздуха и буке; индекс квалитета ваздуха у граду (Atmo France…) и ентитет временске прогнозе, у недостатку спољашњег сензора, иду у картицу „Обавештења“. Тихи предефинисани режими и режими вентилатора постају ноћна подешавања. Оно што је већ подешено се задржава. Проверите резултат, а затим сачувајте.",
    discover_running: "Откривање…",
    discover_result: "Откривање: додато соба: {added}, допуњено: {updated}, спољашњих простора: {outdoors}{outdoor}. Проверите их, а затим сачувајте.",
    discover_outdoor: ", спољашњи сензори су подешени",
    discover_none: "Откривањем није пронађено ништа ново.",
    fan: "Вентилатор",
    purifier: "Пречишћавач ваздуха",
    overview: "Преглед",
    sc_score: "удобност",
    sc_all_good: "Све је пријатно",
    sc_point: "{n} ставка за праћење",
    sc_points: "{n} ставке за праћење",
    n_rooms_ok: "{n} соба је у реду",
    rooms: "Собе",
    alerts: "Упозорења",
    notifications: "Обавештења",
    dashboards: "Контролне табле",
    control: "Контрола уређаја",
    save: "Сачувај",
    discard: "Одбаци",
    saved: "Сачувано",
    saving: "Чување…",
    unsaved: "Несачуване измене",
    yaml: "Ова конфигурација долази из YAML-а и може се мењати овде. Када се YAML промени (при поновном покретању или помоћу Поново учитај YAML), примењује се само оно што се променило: ваше измене осталих подешавања остају.",
    yaml_reload: "Поново учитај YAML",
    yaml_reloaded: "YAML је примењен: ажурирано је само оно што се променило.",
    yaml_unchanged: "YAML се није променио: нема шта да се примени.",
    yaml_conflicts: "YAML је примењен. Заменио је оно што је овде измењено за: {paths}",
    yaml_file: "Ова конфигурација се чува у {file} у фасцикли конфигурације: оно што сачувате овде уписује се у њега, а измене датотеке примењују се за неколико секунди.",
    yaml_help_file: "Садржај {file} у фасцикли конфигурације (подразумеване вредности се не понављају).",
    src_title: "Извор конфигурације",
    src_status: "Измењено у {time} · {rooms} просторија · усклађено",
    src_status_invalid: "Измењено у {time} · неисправно, није примењено: {error}",
    src_reload: "Поново учитај",
    src_write: "Измене у панелу",
    src_write_help: "Свако чување преписује у датотеци само оно што се променило, уз задржане коментаре и распоред · резервна копија се чува.",
    src_watch: "Праћење датотеке",
    src_watch_help: "Поново се чита при свакој измени (и укључене датотеке) · примењује се само оно што се променило.",
    src_included: "Укључене датотеке",
    src_included_help: "{files} · просторија се преписује у своју датотеку.",
    src_create: "Направи {file}",
    src_create_help: "Уписује тренутну конфигурацију у {file} у фасцикли конфигурације; датотека и панел затим остају усклађени.",
    src_none: "Нема {file}: конфигурацију чува само Home Assistant.",
    conflict_title: "Датотека се променила током измене",
    conflict_sub: "{n} подешавања промењено у {file} у {time}",
    conflict_sub_other: "{n} подешавања промењено на другом месту (YAML или други прозор)",
    conflict_file: "Датотека",
    conflict_panel: "Панел",
    conflict_keep_file: "Задржи датотеку",
    conflict_keep_panel: "Задржи панел",
    not_loaded: "Smart Comfort није учитан. Проверите дневнике логова.",
    not_setup: "Smart Comfort још увек није подешен: додајте га у Подешавања → Уређаји и услуге.",
    retry: "Покушај поново",
    active_alerts: "Активна упозорења",
    no_alerts: "Све је у реду.",
    outdoor: "Спољашња средина",
    notifications_on: "Обавештења су укључена",
    notifications_off: "Обавештења су искључена",
    control_on: "Контрола уређаја је укључена",
    control_off: "Контрола уређаја је искључена",
    notify_now: "Обавести одмах",
    unsnooze: "Поништи одлагања",
    snooze: "Одложи",
    acknowledge: "Потврди",
    snoozed: "одложено",
    acknowledged: "потврђено",
    handled: "решено",
    notified: "послато обавештење",
    pending: "још нема обавештења",
    since: "од",
    ok: "У реду",
    open: "Отворено",
    devices: "Уређаји",
    target: "циљ",
    manual: "ручно до",
    last_notification: "Последње обавештење",
    add_room: "Додај собу",
    new_room: "Нова соба",
    remove: "Уклони",
    move_up: "Помери нагоре",
    move_down: "Помери надоле",
    room_alerts: "Упозорења за ову собу",
    inherit: "Подразумевано",
    enabled: "Укључено",
    disabled: "Искључено",
    climate: "Клима уређај",
    fans: "Вентилатори",
    purifiers: "Пречишћавачи ваздуха",
    device_settings: "Подешавања овог уређаја",
    default_value: "Подразумевано: {value}",
    no_rooms: "Још увек нема соба.",
    outdoor_air: "Спољашњи ваздух",
    outdoors: "Спољашњи простор",
    add_outdoor: "Додај спољашњи простор",
    new_outdoor: "Спољашњи простор",
    no_outdoors: "Још увек нема спољашњих простора.",
    start: "Започни",
    start_help: "Ништа још није подешено. Опција „Откриј“ проналази собе и спољашње просторе у вашим зонама Home Assistant-а са њиховим сензорима и уређајима и подешава их; резултат проверавате у картици „Собе“ пре чувања.",
    no_sensor: "нема сензора",
    lighting: "Прилагодљиво осветљење",
    lights: "Светла",
    light: "Светло",
    lighting_on: "Прилагодљиво осветљење је укључено",
    lighting_off: "Прилагодљиво осветљење је искључено",
    nap_start: "Дремка од",
    nap_end: "До",
    nap_days: "Дани",
    nap_days_help: "Ништа: сваки дан.",
    nap_entity: "Распоред дремке",
    nap_entity_help: "Укључено: дремка (распоред дељен са House Rules, виртуелни прекидач…).",
    day_mon: "Пон",
    day_tue: "Уто",
    day_wed: "Сре",
    day_thu: "Чет",
    day_fri: "Пет",
    day_sat: "Суб",
    day_sun: "Нед",
    advanced: "Напредно",
    alerts_help: "Подразумевана подешавања за све собе; свака соба може да прилагоди своја.",
    schedule: "Распоред",
    settings: "Подешавања",
    activity: "Активност",
    activity_help: "Шта је Smart Comfort урадио и зашто, уживо: уређаји, светла, обавештења, ручне промене. Ред отвара свој ентитет.",
    yaml_tab: "YAML",
    yaml_help: "Само конфигурација Smart Comfort-а, онако како иде под smart_comfort: у configuration.yaml (подразумеване вредности се не понављају).",
    yaml_help_unsaved: "Само конфигурација Smart Comfort-а, онако како иде под smart_comfort: у configuration.yaml (подразумеване вредности се не понављају). Укључује и још несачуване измене.",
    yaml_copy: "Копирај",
    yaml_copied: "Копирано",
    sched_title: "Ваш дан",
    sched_help: "Када важи сваки временски период, уз тренутно време.",
    sched_edit: "Времена",
    sched_quiet: "Тихи период",
    sched_quiet_help: "Шаљу се само критична упозорења; остала чекају крај.",
    sched_night: "Мирна ноћ",
    sched_night_help: "Уређаји раде тише, без појачања због прозора, светла на ноћном нивоу.",
    sched_morning: "Мирно јутро",
    sched_morning_help: "Од краја ноћи: светла у спаваћим собама остају слабија.",
    sched_boost: "Појачање због прозора",
    sched_boost_help: "Вентилатори и пречишћавачи на максималној брзини док је прозор отворен. Ако су оба празна: цео дан.",
    sched_displays: "Индикатори искључени",
    sched_displays_help: "Индикаторска светла и екрани уређаја су искључени (и током дремке у њиховој соби). Празно: мирна ноћ.",
    sched_from: "Од",
    sched_to: "До",
    sched_morning_end: "До",
    discover_short: "Проналази собе у вашим зонама Home Assistant-а, са њиховим сензорима, уређајима и светлима. Ништа се не чува пре ваше провере.",
    how: "Како функционише",
    less: "Мање",
    other_outdoor: "Остали спољашњи сензори",
    other_outdoor_help: "Сензори ван спољашњих простора: ентитет временске прогнозе, индекс квалитета ваздуха у граду…",
    outdoors_help: "Башта, тераса, балкон…: њихови сензори дају спољашњу температуру, квалитет ваздуха и буку.",
    section_sensors: "Сензори",
    section_openings: "Прозори и врата",
    section_devices: "Уређаји",
    section_lighting: "Осветљење",
    section_alerts: "Упозорења",
    none: "Ништа",
    openings_help: "Њихово стање задржава или покреће упозорења и појачања везана за прозоре.",
    naps: "Дремке",
    nap: "Дремка",
    no_naps: "Нема дремки: додајте једну да бисте пригушили светла у задато време.",
    alerts_default: "Подразумевана подешавања",
    customize_alert: "Прилагоди упозорење",
    room_alerts_help: "Само упозорења прилагођена за ову собу; остала прате картицу „Упозорења“.",
    lighting_help: "Укључена светла прате доба дана; Smart Comfort их никада не укључује нити искључује. Времена су у картици „Распоред“.",
    presence_title: "Светла на присуство",
    presence_help: "Укључује светла када неко уђе и искључује их када у соби више нема никога, као аутоматизација присуства.",
    presence_add: "Светла на присуство",
    presence_remove: "Заустави светла на присуство",
    presence_short: "Присуство",
    presence_sensors: "Сензори присуства",
    presence_lights: "Светла",
    presence_lights_help: "Празно: светла у соби. Може се додати било које светло (светло у ходнику за улаз…).",
    presence_lux: "Сензор осветљености",
    presence_max_lux: "Само испод",
    presence_max_lux_help: "Ниједно светло се не укључује када је у соби светлије од овога.",
    presence_off_after: "Искључи кад нема никога током",
    presence_on_after: "Укључи после присуства од",
    presence_transition: "Претапање",
    presence_on_after_help: "Неко ко само прође поред сензора не укључује светла.",
    presence_not_during_naps: "Искључена током дремке",
    presence_not_during_naps_help: "Ова светла се не укључују док је у некој соби у кући дремка.",
    slots_help: "Термини, редом: први који важи за неко светло одлучује — остаје искључено или се укључује на своју јачину.",
    slot_add: "Термин",
    slot_lights: "За светла",
    slot_lights_help: "Празно: сва светла на присуство.",
    slot_off: "Не укључуј",
    slot_brightness: "Јачина светла",
    slot_off_after: "Искључи кад нема никога током",
    slot_color: "Боја",
    a_empty: "Још ништа.",
    a_not_loaded: "Smart Comfort није учитан.",
    a_all: "Све",
    a_group_devices: "Уређаји",
    a_group_lights: "Светла",
    a_group_notifications: "Обавештења",
    a_group_manual: "Ручно",
    a_today: "Данас",
    a_yesterday: "Јуче",
    a_t_cool: "Хлађење",
    a_t_cool_night: "Хлађење, мирна ноћ",
    a_t_off: "Искључено",
    a_t_off_open: "Искључено: прозор остаје отворен",
    a_t_on: "Укључено: топло је",
    a_t_on_night: "Укључено, мирна ноћ",
    a_t_boost: "Појачање због прозора",
    a_t_purify: "Појачање: загађен ваздух",
    a_t_normal: "Повратак на нормално",
    a_t_night: "Ноћни режим",
    a_t_keep_on: "Поново укључено",
    a_lighting: "Јачина светла за ово доба дана",
    a_presence_on: "Укључено: неко је ушао",
    a_presence_off: "Искључено: нема никога",
    a_display_off: "Индикатор искључен",
    a_display_on: "Индикатор поново укључен",
    a_notified: "Обавештење",
    a_cleared: "Обавештење уклоњено: све је поново у реду",
    a_manual: "Ручно промењено: не дира се",
    a_manual_until: "Ручно промењено: не дира се до {time}",
    a_reset: "Повратак на нормално (задато време)",
    a_failed: "Није могло да се пошаље",
    a_all_rooms: "Све просторије",
  },
  "sr-Latn": {
    annex_alerts: "Podrazumevane vrednosti za pomoćne prostorije",
    annex_alerts_help: "Podrazumevani pragovi upozorenja za pomoćne prostorije — podrum, garaža, radionica, veš-soba, tavan. Postavite tip prostorije na Pomoćna u kartici Prostorije; svaka prostorija ih može zameniti.",
    outdoor_noise: "Spoljašnja buka",
    quiet_night: "Mirna noć",
    to_handle: "Za obradu",
    all_rooms: "Sve prostorije",
    n_ok_rooms: "+ {n} u redu",
    n_handled: "{n} preuzeto",
    discovered_new: "novo",
    discovered_updated: "dopunjeno",
    discovered_new_outdoor: "novo",
    discovered_updated_outdoor: "dopunjeno",
    discover: "Otkrij",
    discover_help: "Dodaje sobu za svaku Home Assistant zonu u kojoj ima nešto za praćenje (senzor komfora, klima uređaj, ventilator, prečišćivač ili svetlo sa podesivom jačinom) i podešava je: senzore temperature, CO₂, vlažnosti vazduha i buke, senzore PM2,5, PM10 i indeksa kvaliteta vazduha (i one na prečišćivačima), prozore i vrata, klima uređaj, ventilatore i prečišćivače sa njihovim predefinisanim režimima i opcijama. Spoljašnje zone (bašta, terasa…) idu u „Spoljašnji prostor“ sa svojim senzorima temperature, kvaliteta vazduha i buke; indeks kvaliteta vazduha u gradu (Atmo France…) i entitet vremenske prognoze, u nedostatku spoljašnjeg senzora, idu u karticu „Obaveštenja“. Tihi predefinisani režimi i režimi ventilatora postaju noćna podešavanja. Ono što je već podešeno se zadržava. Proverite rezultat, a zatim sačuvajte.",
    discover_running: "Otkrivanje…",
    discover_result: "Otkrivanje: dodato soba: {added}, dopunjeno: {updated}, spoljašnjih prostora: {outdoors}{outdoor}. Proverite ih, a zatim sačuvajte.",
    discover_outdoor: ", spoljašnji senzori su podešeni",
    discover_none: "Otkrivanjem nije pronađeno ništa novo.",
    fan: "Ventilator",
    purifier: "Prečišćivač vazduha",
    overview: "Pregled",
    sc_score: "udobnost",
    sc_all_good: "Sve je prijatno",
    sc_point: "{n} stavka za praćenje",
    sc_points: "{n} stavke za praćenje",
    n_rooms_ok: "{n} soba je u redu",
    rooms: "Sobe",
    alerts: "Upozorenja",
    notifications: "Obaveštenja",
    dashboards: "Kontrolne table",
    control: "Kontrola uređaja",
    save: "Sačuvaj",
    discard: "Odbaci",
    saved: "Sačuvano",
    saving: "Čuvanje…",
    unsaved: "Nesačuvane izmene",
    yaml: "Ova konfiguracija dolazi iz YAML-a i može se menjati ovde. Kada se YAML promeni (pri ponovnom pokretanju ili pomoću Ponovo učitaj YAML), primenjuje se samo ono što se promenilo: vaše izmene ostalih podešavanja ostaju.",
    yaml_reload: "Ponovo učitaj YAML",
    yaml_reloaded: "YAML je primenjen: ažurirano je samo ono što se promenilo.",
    yaml_unchanged: "YAML se nije promenio: nema šta da se primeni.",
    yaml_conflicts: "YAML je primenjen. Zamenio je ono što je ovde izmenjeno za: {paths}",
    yaml_file: "Ova konfiguracija se čuva u {file} u fascikli konfiguracije: ono što sačuvate ovde upisuje se u njega, a izmene datoteke primenjuju se za nekoliko sekundi.",
    yaml_help_file: "Sadržaj {file} u fascikli konfiguracije (podrazumevane vrednosti se ne ponavljaju).",
    src_title: "Izvor konfiguracije",
    src_status: "Izmenjeno u {time} · {rooms} prostorija · usklađeno",
    src_status_invalid: "Izmenjeno u {time} · neispravno, nije primenjeno: {error}",
    src_reload: "Ponovo učitaj",
    src_write: "Izmene u panelu",
    src_write_help: "Svako čuvanje prepisuje u datoteci samo ono što se promenilo, uz zadržane komentare i raspored · rezerva .bak.",
    src_watch: "Praćenje datoteke",
    src_watch_help: "Ponovo se čita pri svakoj izmeni (i uključene datoteke) · primenjuje se samo ono što se promenilo.",
    src_included: "Uključene datoteke",
    src_included_help: "{files} · prostorija se prepisuje u svoju datoteku.",
    src_create: "Napravi {file}",
    src_create_help: "Upisuje trenutnu konfiguraciju u {file} u fascikli konfiguracije; datoteka i panel zatim ostaju usklađeni.",
    src_none: "Nema {file}: konfiguraciju čuva samo Home Assistant.",
    conflict_title: "Datoteka se promenila tokom izmene",
    conflict_sub: "{n} podešavanja promenjeno u {file} u {time}",
    conflict_sub_other: "{n} podešavanja promenjeno na drugom mestu (YAML ili drugi prozor)",
    conflict_file: "Datoteka",
    conflict_panel: "Panel",
    conflict_keep_file: "Zadrži datoteku",
    conflict_keep_panel: "Zadrži panel",
    not_loaded: "Smart Comfort nije učitan. Proverite dnevnike logova.",
    not_setup: "Smart Comfort još uvek nije podešen: dodajte ga u Podešavanja → Uređaji i usluge.",
    retry: "Pokušaj ponovo",
    active_alerts: "Aktivna upozorenja",
    no_alerts: "Sve je u redu.",
    outdoor: "Spoljašnja sredina",
    notifications_on: "Obaveštenja su uključena",
    notifications_off: "Obaveštenja su isključena",
    control_on: "Kontrola uređaja je uključena",
    control_off: "Kontrola uređaja je isključena",
    notify_now: "Obavesti odmah",
    unsnooze: "Poništi odlaganja",
    snooze: "Odloži",
    acknowledge: "Potvrdi",
    snoozed: "odloženo",
    acknowledged: "potvrđeno",
    handled: "rešeno",
    notified: "poslato obaveštenje",
    pending: "još nema obaveštenja",
    since: "od",
    ok: "U redu",
    open: "Otvoreno",
    devices: "Uređaji",
    target: "cilj",
    manual: "ručno do",
    last_notification: "Poslednje obaveštenje",
    add_room: "Dodaj sobu",
    new_room: "Nova soba",
    remove: "Ukloni",
    move_up: "Pomeri nagore",
    move_down: "Pomeri nadole",
    room_alerts: "Upozorenja za ovu sobu",
    inherit: "Podrazumevano",
    enabled: "Uključeno",
    disabled: "Isključeno",
    climate: "Klima uređaj",
    fans: "Ventilatori",
    purifiers: "Prečišćivači vazduha",
    device_settings: "Podešavanja ovog uređaja",
    default_value: "Podrazumevano: {value}",
    no_rooms: "Još uvek nema soba.",
    outdoor_air: "Spoljašnji vazduh",
    outdoors: "Spoljašnji prostor",
    add_outdoor: "Dodaj spoljašnji prostor",
    new_outdoor: "Spoljašnji prostor",
    no_outdoors: "Još uvek nema spoljašnjih prostora.",
    start: "Započni",
    start_help: "Ništa još nije podešeno. Opcija „Otkrij“ pronalazi sobe i spoljašnje prostore u vašim zonama Home Assistant-a sa njihovim senzorima i uređajima i podešava ih; rezultat proveravate u kartici „Sobe“ pre čuvanja.",
    no_sensor: "nema senzora",
    lighting: "Prilagodljivo osvetljenje",
    lights: "Svetla",
    light: "Svetlo",
    lighting_on: "Prilagodljivo osvetljenje je uključeno",
    lighting_off: "Prilagodljivo osvetljenje je isključeno",
    nap_start: "Dremka od",
    nap_end: "Do",
    nap_days: "Dani",
    nap_days_help: "Ništa: svaki dan.",
    nap_entity: "Raspored dremke",
    nap_entity_help: "Uključeno: dremka (raspored deljen sa House Rules, virtuelni prekidač…).",
    day_mon: "Pon",
    day_tue: "Uto",
    day_wed: "Sre",
    day_thu: "Čet",
    day_fri: "Pet",
    day_sat: "Sub",
    day_sun: "Ned",
    advanced: "Napredno",
    alerts_help: "Podrazumevana podešavanja za sve sobe; svaka soba može da prilagodi svoja.",
    schedule: "Raspored",
    settings: "Podešavanja",
    activity: "Aktivnost",
    activity_help: "Šta je Smart Comfort uradio i zašto, uživo: uređaji, svetla, obaveštenja, ručne promene. Red otvara svoj entitet.",
    yaml_tab: "YAML",
    yaml_help: "Samo konfiguracija Smart Comfort-a, onako kako ide pod smart_comfort: u configuration.yaml (podrazumevane vrednosti se ne ponavljaju).",
    yaml_help_unsaved: "Samo konfiguracija Smart Comfort-a, onako kako ide pod smart_comfort: u configuration.yaml (podrazumevane vrednosti se ne ponavljaju). Uključuje i još nesačuvane izmene.",
    yaml_copy: "Kopiraj",
    yaml_copied: "Kopirano",
    sched_title: "Vaš dan",
    sched_help: "Kada važi svaki vremenski period, uz trenutno vreme.",
    sched_edit: "Vremena",
    sched_quiet: "Tihi period",
    sched_quiet_help: "Šalju se samo kritična upozorenja; ostala čekaju kraj.",
    sched_night: "Mirna noć",
    sched_night_help: "Uređaji rade tiše, bez pojačanja zbog prozora, svetla na noćnom nivou.",
    sched_morning: "Mirno jutro",
    sched_morning_help: "Od kraja noći: svetla u spavaćim sobama ostaju slabija.",
    sched_boost: "Pojačanje zbog prozora",
    sched_boost_help: "Ventilatori i prečišćivači na maksimalnoj brzini dok je prozor otvoren. Ako su oba prazna: ceo dan.",
    sched_displays: "Indikatori isključeni",
    sched_displays_help: "Indikatorska svetla i ekrani uređaja su isključeni (i tokom dremke u njihovoj sobi). Prazno: mirna noć.",
    sched_from: "Od",
    sched_to: "Do",
    sched_morning_end: "Do",
    discover_short: "Pronalazi sobe u vašim zonama Home Assistant-a, sa njihovim senzorima, uređajima i svetlima. Ništa se ne čuva pre vaše provere.",
    how: "Kako funkcioniše",
    less: "Manje",
    other_outdoor: "Ostali spoljašnji senzori",
    other_outdoor_help: "Senzori van spoljašnjih prostora: entitet vremenske prognoze, indeks kvaliteta vazduha u gradu…",
    outdoors_help: "Bašta, terasa, balkon…: njihovi senzori daju spoljašnju temperaturu, kvalitet vazduha i buku.",
    section_sensors: "Senzori",
    section_openings: "Prozori i vrata",
    section_devices: "Uređaji",
    section_lighting: "Osvetljenje",
    section_alerts: "Upozorenja",
    none: "Ništa",
    openings_help: "Njihovo stanje zadržava ili pokreće upozorenja i pojačanja vezana za prozore.",
    naps: "Dremke",
    nap: "Dremka",
    no_naps: "Nema dremki: dodajte jednu da biste prigušili svetla u zadato vreme.",
    alerts_default: "Podrazumevana podešavanja",
    customize_alert: "Prilagodi upozorenje",
    room_alerts_help: "Samo upozorenja prilagođena za ovu sobu; ostala prate karticu „Upozorenja“.",
    lighting_help: "Uključena svetla prate doba dana; Smart Comfort ih nikada ne uključuje niti isključuje. Vremena su u kartici „Raspored“.",
    presence_title: "Svetla na prisustvo",
    presence_help: "Uključuje svetla kada neko uđe i isključuje ih kada u sobi više nema nikoga, kao automatizacija prisustva.",
    presence_add: "Svetla na prisustvo",
    presence_remove: "Zaustavi svetla na prisustvo",
    presence_short: "Prisustvo",
    presence_sensors: "Senzori prisustva",
    presence_lights: "Svetla",
    presence_lights_help: "Prazno: svetla u sobi. Može se dodati bilo koje svetlo (svetlo u hodniku za ulaz…).",
    presence_lux: "Senzor osvetljenosti",
    presence_max_lux: "Samo ispod",
    presence_max_lux_help: "Nijedno svetlo se ne uključuje kada je u sobi svetlije od ovoga.",
    presence_off_after: "Isključi kad nema nikoga tokom",
    presence_on_after: "Uključi posle prisustva od",
    presence_transition: "Pretapanje",
    presence_on_after_help: "Neko ko samo prođe pored senzora ne uključuje svetla.",
    presence_not_during_naps: "Isključena tokom dremke",
    presence_not_during_naps_help: "Ova svetla se ne uključuju dok je u nekoj sobi u kući dremka.",
    slots_help: "Termini, redom: prvi koji važi za neko svetlo odlučuje — ostaje isključeno ili se uključuje na svoju jačinu.",
    slot_add: "Termin",
    slot_lights: "Za svetla",
    slot_lights_help: "Prazno: sva svetla na prisustvo.",
    slot_off: "Ne uključuj",
    slot_brightness: "Jačina svetla",
    slot_off_after: "Isključi kad nema nikoga tokom",
    slot_color: "Boja",
    a_empty: "Još ništa.",
    a_not_loaded: "Smart Comfort nije učitan.",
    a_all: "Sve",
    a_group_devices: "Uređaji",
    a_group_lights: "Svetla",
    a_group_notifications: "Obaveštenja",
    a_group_manual: "Ručno",
    a_today: "Danas",
    a_yesterday: "Juče",
    a_t_cool: "Hlađenje",
    a_t_cool_night: "Hlađenje, mirna noć",
    a_t_off: "Isključeno",
    a_t_off_open: "Isključeno: prozor ostaje otvoren",
    a_t_on: "Uključeno: toplo je",
    a_t_on_night: "Uključeno, mirna noć",
    a_t_boost: "Pojačanje zbog prozora",
    a_t_purify: "Pojačanje: zagađen vazduh",
    a_t_normal: "Povratak na normalno",
    a_t_night: "Noćni režim",
    a_t_keep_on: "Ponovo uključeno",
    a_lighting: "Jačina svetla za ovo doba dana",
    a_presence_on: "Uključeno: neko je ušao",
    a_presence_off: "Isključeno: nema nikoga",
    a_display_off: "Indikator isključen",
    a_display_on: "Indikator ponovo uključen",
    a_notified: "Obaveštenje",
    a_cleared: "Obaveštenje uklonjeno: sve je ponovo u redu",
    a_manual: "Ručno promenjeno: ne dira se",
    a_manual_until: "Ručno promenjeno: ne dira se do {time}",
    a_reset: "Povratak na normalno (zadato vreme)",
    a_failed: "Nije moglo da se pošalje",
    a_all_rooms: "Sve prostorije",
  },
  it: {
    annex_alerts: "Valori predefiniti per locali di servizio",
    annex_alerts_help: "Soglie di allerta predefinite per i locali di servizio — cantina, garage, officina, lavanderia, soffitta. Imposta il tipo di una stanza su Locale di servizio nella scheda Stanze; ogni stanza può comunque sovrascriverle.",
    outdoor_noise: "Rumore esterno",
    quiet_night: "Notte silenziosa",
    to_handle: "Da gestire",
    all_rooms: "Tutte le stanze",
    n_ok_rooms: "+ {n} OK",
    n_handled: "{n} gestiti",
    discovered_new: "nuova",
    discovered_updated: "completata",
    discovered_new_outdoor: "nuovo",
    discovered_updated_outdoor: "completato",
    discover: "Scopri",
    discover_help: "Aggiunge una stanza per ogni area di Home Assistant con qualcosa da seguire (un sensore di comfort, un condizionatore, un ventilatore, un purificatore o una luce dimmerabile) e la configura: sensori di temperatura, CO₂, umidità e rumore, sensori di PM2.5, PM10 e indice di qualità dell'aria (anche quelli dei purificatori), finestre e porte, condizionatore, ventilatori e purificatori con le loro preimpostazioni e modalità. Le aree esterne (giardino, terrazza…) vanno negli Esterni, con i loro sensori di temperatura, qualità dell'aria e rumore; un indice di qualità dell'aria della città (Atmo France…) e l'entità meteo, in mancanza di un sensore esterno, vanno nella scheda Notifiche. Le preimpostazioni e le modalità ventola silenziose diventano le impostazioni notturne. Ciò che è già impostato viene mantenuto. Controlla il risultato, poi salva.",
    discover_running: "Scoperta in corso…",
    discover_result: "Scoperta: stanze aggiunte: {added}, completate: {updated}, luoghi esterni: {outdoors}{outdoor}. Controllale, poi salva.",
    discover_outdoor: ", sensori esterni impostati",
    discover_none: "La scoperta non ha trovato nulla di nuovo.",
    fan: "Ventilatore",
    purifier: "Purificatore d'aria",
    overview: "Panoramica",
    sc_score: "comfort",
    sc_all_good: "Tutto è confortevole",
    sc_point: "{n} punto da tenere d'occhio",
    sc_points: "{n} punti da tenere d'occhio",
    n_rooms_ok: "{n} stanze OK",
    rooms: "Stanze",
    alerts: "Avvisi",
    notifications: "Notifiche",
    dashboards: "Dashboard",
    control: "Controllo dei dispositivi",
    save: "Salva",
    discard: "Annulla",
    saved: "Salvato",
    saving: "Salvataggio…",
    unsaved: "Modifiche non salvate",
    yaml: "Questa configurazione viene dallo YAML e si può modificare qui. Quando lo YAML cambia (al riavvio o con Ricarica lo YAML), viene applicato solo ciò che è cambiato: le tue modifiche alle altre impostazioni restano.",
    yaml_reload: "Ricarica lo YAML",
    yaml_reloaded: "YAML applicato: è stato aggiornato solo ciò che è cambiato.",
    yaml_unchanged: "Lo YAML non è cambiato: niente da applicare.",
    yaml_conflicts: "YAML applicato. Ha sostituito ciò che era stato modificato qui per: {paths}",
    yaml_file: "Questa configurazione è conservata in {file}, nella cartella di configurazione: ciò che salvi qui vi viene scritto, e le modifiche al file sono applicate in pochi secondi.",
    yaml_help_file: "Il contenuto di {file}, nella cartella di configurazione (i valori predefiniti non sono ripetuti).",
    src_title: "Origine della configurazione",
    src_status: "Modificato alle {time} · {rooms} stanze · sincronizzato",
    src_status_invalid: "Modificato alle {time} · non valido, non applicato: {error}",
    src_reload: "Ricarica",
    src_write: "Modifica nel pannello",
    src_write_help: "Ogni salvataggio riscrive solo ciò che è cambiato nel file, mantenendo commenti e formattazione · copia .bak.",
    src_watch: "Sorveglianza del file",
    src_watch_help: "Riletto a ogni modifica (anche i file inclusi) · viene applicato solo ciò che è cambiato.",
    src_included: "File inclusi",
    src_included_help: "{files} · una stanza viene riscritta nel proprio file.",
    src_create: "Crea {file}",
    src_create_help: "Scrive la configurazione in uso in {file}, nella cartella di configurazione; poi file e pannello restano sincronizzati.",
    src_none: "Nessun {file}: la configurazione è conservata solo da Home Assistant.",
    conflict_title: "Il file è cambiato durante la modifica",
    conflict_sub: "{n} impostazioni modificate in {file} alle {time}",
    conflict_sub_other: "{n} impostazioni modificate altrove (YAML o un'altra finestra)",
    conflict_file: "File",
    conflict_panel: "Pannello",
    conflict_keep_file: "Tieni il file",
    conflict_keep_panel: "Tieni il pannello",
    not_loaded: "Smart Comfort non è caricato. Controlla i log.",
    not_setup: "Smart Comfort non è ancora configurato: aggiungilo in Impostazioni → Dispositivi e servizi.",
    retry: "Riprova",
    active_alerts: "Avvisi attivi",
    no_alerts: "Va tutto bene.",
    outdoor: "Esterno",
    notifications_on: "Notifiche attive",
    notifications_off: "Notifiche disattivate",
    control_on: "Controllo dei dispositivi attivo",
    control_off: "Controllo dei dispositivi disattivato",
    notify_now: "Notifica ora",
    unsnooze: "Annulla i posticipi",
    snooze: "Posticipa",
    acknowledge: "Ho capito",
    snoozed: "posticipato",
    acknowledged: "confermato",
    handled: "gestito",
    notified: "notificato",
    pending: "non ancora notificato",
    since: "da",
    ok: "OK",
    open: "Aperto",
    devices: "Dispositivi",
    target: "obiettivo",
    manual: "manuale fino a",
    last_notification: "Ultima notifica",
    add_room: "Aggiungi una stanza",
    new_room: "Nuova stanza",
    remove: "Rimuovi",
    move_up: "Sposta su",
    move_down: "Sposta giù",
    room_alerts: "Avvisi di questa stanza",
    inherit: "Predefinito",
    enabled: "Attivo",
    disabled: "Disattivato",
    climate: "Condizionatore",
    fans: "Ventilatori",
    purifiers: "Purificatori d'aria",
    device_settings: "Impostazioni di questo dispositivo",
    default_value: "Predefinito: {value}",
    no_rooms: "Ancora nessuna stanza.",
    outdoor_air: "Aria esterna",
    outdoors: "Esterni",
    add_outdoor: "Aggiungi un luogo esterno",
    new_outdoor: "Esterno",
    no_outdoors: "Ancora nessun luogo esterno.",
    start: "Per iniziare",
    start_help: "Non è ancora configurato nulla. Scopri trova le stanze e i luoghi esterni delle tue aree di Home Assistant con i loro sensori e dispositivi, e li configura; controlli il risultato nella scheda Stanze prima di salvare.",
    no_sensor: "nessun sensore",
    lighting: "Illuminazione adattiva",
    lights: "Luci",
    light: "Luce",
    lighting_on: "Illuminazione adattiva attiva",
    lighting_off: "Illuminazione adattiva disattivata",
    nap_start: "Riposino dalle",
    nap_end: "Fino alle",
    nap_days: "Giorni",
    nap_days_help: "Nessuno: tutti i giorni.",
    nap_entity: "Programma del riposino",
    nap_entity_help: "Acceso: riposino (un programma condiviso con House Rules, un interruttore virtuale…).",
    day_mon: "Lun",
    day_tue: "Mar",
    day_wed: "Mer",
    day_thu: "Gio",
    day_fri: "Ven",
    day_sat: "Sab",
    day_sun: "Dom",
    advanced: "Avanzate",
    alerts_help: "Valori predefiniti per tutte le stanze; ogni stanza può personalizzare i propri.",
    schedule: "Programma",
    settings: "Impostazioni",
    activity: "Attività",
    activity_help: "Cosa ha fatto Smart Comfort e perché, in tempo reale: dispositivi, luci, notifiche, modifiche manuali. Una riga apre la sua entità.",
    yaml_tab: "YAML",
    yaml_help: "Solo la configurazione di Smart Comfort, come va sotto smart_comfort: in configuration.yaml (i valori predefiniti non sono ripetuti).",
    yaml_help_unsaved: "Solo la configurazione di Smart Comfort, come va sotto smart_comfort: in configuration.yaml (i valori predefiniti non sono ripetuti). Include le modifiche non ancora salvate.",
    yaml_copy: "Copia",
    yaml_copied: "Copiato",
    sched_title: "La tua giornata",
    sched_help: "Quando si applica ciascuna fascia oraria, con l'ora attuale.",
    sched_edit: "Orari",
    sched_quiet: "Ore di silenzio",
    sched_quiet_help: "Vengono inviati solo gli avvisi critici; gli altri aspettano la fine.",
    sched_night: "Notte silenziosa",
    sched_night_help: "Dispositivi più silenziosi, niente boost finestra, luci al livello notturno.",
    sched_morning: "Mattino tranquillo",
    sched_morning_help: "Dalla fine della notte: le luci delle camere da letto restano più soffuse.",
    sched_boost: "Boost finestra",
    sched_boost_help: "Ventilatori e purificatori alla massima velocità mentre una finestra è aperta. Entrambi vuoti: tutto il giorno.",
    sched_displays: "Display spenti",
    sched_displays_help: "Spie e display dei dispositivi spenti (anche durante i riposini della loro stanza). Vuoto: la notte silenziosa.",
    sched_from: "Dalle",
    sched_to: "Fino alle",
    sched_morning_end: "Fino alle",
    discover_short: "Trova le stanze delle tue aree di Home Assistant, con i loro sensori, dispositivi e luci. Nulla viene salvato prima del tuo controllo.",
    how: "Come funziona",
    less: "Meno",
    other_outdoor: "Altri sensori esterni",
    other_outdoor_help: "Sensori fuori dai luoghi esterni: un'entità meteo, un indice di qualità dell'aria della città…",
    outdoors_help: "Giardino, terrazza, balcone…: i loro sensori forniscono la temperatura, la qualità dell'aria e il rumore esterni.",
    section_sensors: "Sensori",
    section_openings: "Finestre e porte",
    section_devices: "Dispositivi",
    section_lighting: "Illuminazione",
    section_alerts: "Avvisi",
    none: "Nessuno",
    openings_help: "Il loro stato trattiene o attiva gli avvisi e i boost legati alle finestre.",
    naps: "Riposini",
    nap: "Riposino",
    no_naps: "Nessun riposino: aggiungine uno per abbassare le luci a orari fissi.",
    alerts_default: "Impostazioni predefinite",
    customize_alert: "Personalizza un avviso",
    room_alerts_help: "Solo gli avvisi personalizzati per questa stanza; gli altri seguono la scheda Avvisi.",
    lighting_help: "Le luci accese seguono il momento della giornata; Smart Comfort non le accende né le spegne mai. Gli orari sono nella scheda Programma.",
    presence_title: "Luci su presenza",
    presence_help: "Accende le luci quando qualcuno entra e le spegne quando non resta più nessuno, come un'automazione di presenza.",
    presence_add: "Luci su presenza",
    presence_remove: "Disattiva le luci su presenza",
    presence_short: "Presenza",
    presence_sensors: "Sensori di presenza",
    presence_lights: "Luci",
    presence_lights_help: "Vuoto: le luci della stanza. Si può aggiungere qualsiasi luce (quella del corridoio dall'ingresso…).",
    presence_lux: "Sensore di luminosità",
    presence_max_lux: "Solo sotto",
    presence_max_lux_help: "Nessuna luce accesa quando la stanza è più luminosa di così.",
    presence_off_after: "Spegnimento dopo nessuno per",
    presence_on_after: "Accensione dopo una presenza di",
    presence_transition: "Dissolvenza",
    presence_on_after_help: "Chi passa soltanto davanti al sensore non accende le luci.",
    presence_not_during_naps: "Spente durante i riposini",
    presence_not_during_naps_help: "Queste luci non si accendono mentre una stanza della casa è nel suo riposino.",
    slots_help: "Fasce, in ordine: la prima che si applica a una luce decide — lasciata spenta, o accesa alla sua luminosità.",
    slot_add: "Fascia",
    slot_lights: "Per le luci",
    slot_lights_help: "Vuoto: tutte le luci di presenza.",
    slot_off: "Non accendere",
    slot_brightness: "Luminosità",
    slot_off_after: "Spegnimento dopo nessuno per",
    slot_color: "Colore",
    a_empty: "Ancora niente.",
    a_not_loaded: "Smart Comfort non è caricato.",
    a_all: "Tutto",
    a_group_devices: "Dispositivi",
    a_group_lights: "Luci",
    a_group_notifications: "Notifiche",
    a_group_manual: "A mano",
    a_today: "Oggi",
    a_yesterday: "Ieri",
    a_t_cool: "Raffreddamento",
    a_t_cool_night: "Raffreddamento, notte silenziosa",
    a_t_off: "Spento",
    a_t_off_open: "Spento: una finestra resta aperta",
    a_t_on: "Acceso: fa caldo",
    a_t_on_night: "Acceso, notte silenziosa",
    a_t_boost: "Boost finestra",
    a_t_purify: "Boost: aria inquinata",
    a_t_normal: "Ritorno alla normalità",
    a_t_night: "Modalità notte",
    a_t_keep_on: "Riacceso",
    a_lighting: "Luminosità del momento",
    a_presence_on: "Accesa: è entrato qualcuno",
    a_presence_off: "Spenta: non c'è più nessuno",
    a_display_off: "Spia spenta",
    a_display_on: "Spia riaccesa",
    a_notified: "Notifica",
    a_cleared: "Notifica cancellata: è tutto tornato alla normalità",
    a_manual: "Cambiato a mano: lasciato così",
    a_manual_until: "Cambiato a mano: lasciato così fino alle {time}",
    a_reset: "Ritorno alla normalità (orario fisso)",
    a_failed: "Impossibile inviare",
    a_all_rooms: "Tutte le stanze",
  },
  nl: {
    annex_alerts: "Standaardwaarden voor bijruimtes",
    annex_alerts_help: "Standaarddrempels voor bijruimtes — kelder, garage, werkplaats, washok, zolder. Stel het type van een ruimte in op Bijruimte op het tabblad Ruimtes; elke ruimte kan ze nog overschrijven.",
    outdoor_noise: "Buitengeluid",
    quiet_night: "Stille nacht",
    to_handle: "Af te handelen",
    all_rooms: "Alle kamers",
    n_ok_rooms: "+ {n} OK",
    n_handled: "{n} afgehandeld",
    discovered_new: "nieuw",
    discovered_updated: "aangevuld",
    discovered_new_outdoor: "nieuw",
    discovered_updated_outdoor: "aangevuld",
    discover: "Ontdekken",
    discover_help: "Voegt een kamer toe voor elke Home Assistant-ruimte met iets om te volgen (een comfortsensor, een airco, een ventilator, een luchtreiniger of een dimbare lamp) en stelt die in: sensoren voor temperatuur, CO₂, luchtvochtigheid en geluid, sensoren voor PM2.5, PM10 en luchtkwaliteitsindex (ook die van de luchtreinigers), ramen en deuren, airco, ventilatoren en luchtreinigers met hun voorinstellingen en modi. De buitenruimtes (tuin, terras…) gaan naar Buiten, met hun sensoren voor temperatuur, luchtkwaliteit en geluid; een luchtkwaliteitsindex van de stad (Atmo France…) en de weerentiteit, bij gebrek aan een buitensensor, gaan naar het tabblad Meldingen. Stille voorinstellingen en ventilatormodi worden de nachtinstellingen. Wat al is ingesteld, blijft behouden. Controleer het resultaat en sla daarna op.",
    discover_running: "Bezig met ontdekken…",
    discover_result: "Ontdekking: kamers toegevoegd: {added}, aangevuld: {updated}, buitenplekken: {outdoors}{outdoor}. Controleer ze en sla daarna op.",
    discover_outdoor: ", buitensensoren ingesteld",
    discover_none: "De ontdekking heeft niets nieuws gevonden.",
    fan: "Ventilator",
    purifier: "Luchtreiniger",
    overview: "Overzicht",
    sc_score: "comfort",
    sc_all_good: "Alles is comfortabel",
    sc_point: "{n} aandachtspunt",
    sc_points: "{n} aandachtspunten",
    n_rooms_ok: "{n} kamers OK",
    rooms: "Kamers",
    alerts: "Waarschuwingen",
    notifications: "Meldingen",
    dashboards: "Dashboards",
    control: "Apparaatbediening",
    save: "Opslaan",
    discard: "Verwerpen",
    saved: "Opgeslagen",
    saving: "Opslaan…",
    unsaved: "Niet-opgeslagen wijzigingen",
    yaml: "Deze configuratie komt uit YAML en kan hier worden bewerkt. Als de YAML verandert (bij een herstart of met YAML opnieuw laden), wordt alleen het gewijzigde toegepast: je wijzigingen aan de andere instellingen blijven.",
    yaml_reload: "YAML opnieuw laden",
    yaml_reloaded: "YAML toegepast: alleen wat veranderd is, is bijgewerkt.",
    yaml_unchanged: "De YAML is niet veranderd: niets toe te passen.",
    yaml_conflicts: "YAML toegepast. Het heeft hier gewijzigde waarden vervangen voor: {paths}",
    yaml_file: "Deze configuratie staat in {file} in de configuratiemap: wat je hier opslaat wordt erin geschreven, en wijzigingen in het bestand worden binnen enkele seconden toegepast.",
    yaml_help_file: "De inhoud van {file} in de configuratiemap (standaardwaarden worden niet herhaald).",
    src_title: "Bron van de configuratie",
    src_status: "Gewijzigd om {time} · {rooms} ruimtes · gesynchroniseerd",
    src_status_invalid: "Gewijzigd om {time} · ongeldig, niet toegepast: {error}",
    src_reload: "Opnieuw laden",
    src_write: "Bewerken in het paneel",
    src_write_help: "Elke keer opslaan herschrijft alleen wat in het bestand is gewijzigd, opmerkingen en opmaak blijven · back-up .bak.",
    src_watch: "Bestandsbewaking",
    src_watch_help: "Bij elke wijziging opnieuw gelezen (ook ingevoegde bestanden) · alleen het gewijzigde wordt toegepast.",
    src_included: "Ingevoegde bestanden",
    src_included_help: "{files} · een ruimte wordt in haar eigen bestand herschreven.",
    src_create: "{file} aanmaken",
    src_create_help: "Schrijft de huidige configuratie naar {file} in de configuratiemap; bestand en paneel blijven daarna gesynchroniseerd.",
    src_none: "Geen {file}: de configuratie wordt alleen door Home Assistant bewaard.",
    conflict_title: "Het bestand is tijdens het bewerken gewijzigd",
    conflict_sub: "{n} instellingen gewijzigd in {file} om {time}",
    conflict_sub_other: "{n} instellingen elders gewijzigd (YAML of een ander venster)",
    conflict_file: "Bestand",
    conflict_panel: "Paneel",
    conflict_keep_file: "Bestand behouden",
    conflict_keep_panel: "Paneel behouden",
    not_loaded: "Smart Comfort is niet geladen. Controleer de logboeken.",
    not_setup: "Smart Comfort is nog niet ingesteld: voeg het toe via Instellingen → Apparaten & diensten.",
    retry: "Opnieuw proberen",
    active_alerts: "Actieve waarschuwingen",
    no_alerts: "Alles is in orde.",
    outdoor: "Buiten",
    notifications_on: "Meldingen aan",
    notifications_off: "Meldingen uit",
    control_on: "Apparaatbediening aan",
    control_off: "Apparaatbediening uit",
    notify_now: "Nu melden",
    unsnooze: "Sluimeren annuleren",
    snooze: "Sluimeren",
    acknowledge: "Begrepen",
    snoozed: "gesluimerd",
    acknowledged: "bevestigd",
    handled: "afgehandeld",
    notified: "gemeld",
    pending: "nog niet gemeld",
    since: "sinds",
    ok: "OK",
    open: "Open",
    devices: "Apparaten",
    target: "doel",
    manual: "handmatig tot",
    last_notification: "Laatste melding",
    add_room: "Kamer toevoegen",
    new_room: "Nieuwe kamer",
    remove: "Verwijderen",
    move_up: "Omhoog",
    move_down: "Omlaag",
    room_alerts: "Waarschuwingen van deze kamer",
    inherit: "Standaard",
    enabled: "Aan",
    disabled: "Uit",
    climate: "Airco",
    fans: "Ventilatoren",
    purifiers: "Luchtreinigers",
    device_settings: "Instellingen van dit apparaat",
    default_value: "Standaard: {value}",
    no_rooms: "Nog geen kamer.",
    outdoor_air: "Buitenlucht",
    outdoors: "Buiten",
    add_outdoor: "Buitenplek toevoegen",
    new_outdoor: "Buiten",
    no_outdoors: "Nog geen buitenplek.",
    start: "Aan de slag",
    start_help: "Er is nog niets ingesteld. Ontdekken vindt de kamers en buitenplekken van je Home Assistant-ruimtes met hun sensoren en apparaten, en stelt ze in; je controleert het resultaat in het tabblad Kamers voordat je opslaat.",
    no_sensor: "geen sensor",
    lighting: "Adaptieve verlichting",
    lights: "Lampen",
    light: "Lamp",
    lighting_on: "Adaptieve verlichting aan",
    lighting_off: "Adaptieve verlichting uit",
    nap_start: "Dutje vanaf",
    nap_end: "Tot",
    nap_days: "Dagen",
    nap_days_help: "Geen: elke dag.",
    nap_entity: "Dutjesschema",
    nap_entity_help: "Aan: een dutje (een schema gedeeld met House Rules, een virtuele schakelaar…).",
    day_mon: "Ma",
    day_tue: "Di",
    day_wed: "Wo",
    day_thu: "Do",
    day_fri: "Vr",
    day_sat: "Za",
    day_sun: "Zo",
    advanced: "Geavanceerd",
    alerts_help: "Standaardwaarden voor elke kamer; elke kamer kan ze zelf aanpassen.",
    schedule: "Planning",
    settings: "Instellingen",
    activity: "Activiteit",
    activity_help: "Wat Smart Comfort deed en waarom, live: apparaten, lampen, meldingen, handmatige wijzigingen. Een regel opent zijn entiteit.",
    yaml_tab: "YAML",
    yaml_help: "Alleen de configuratie van Smart Comfort, zoals die onder smart_comfort: in configuration.yaml komt (de standaardwaarden worden niet herhaald).",
    yaml_help_unsaved: "Alleen de configuratie van Smart Comfort, zoals die onder smart_comfort: in configuration.yaml komt (de standaardwaarden worden niet herhaald). Inclusief de nog niet opgeslagen wijzigingen.",
    yaml_copy: "Kopiëren",
    yaml_copied: "Gekopieerd",
    sched_title: "Je dag",
    sched_help: "Wanneer elk tijdvak geldt, met de huidige tijd.",
    sched_edit: "Tijden",
    sched_quiet: "Stille uren",
    sched_quiet_help: "Alleen kritieke waarschuwingen worden verstuurd; de andere wachten tot het einde.",
    sched_night: "Stille nacht",
    sched_night_help: "Apparaten draaien stiller, geen raamboost, lampen op hun nachtniveau.",
    sched_morning: "Rustige ochtend",
    sched_morning_help: "Vanaf het einde van de nacht: de lampen in de slaapkamers blijven gedimder.",
    sched_boost: "Raamboost",
    sched_boost_help: "Ventilatoren en luchtreinigers op volle snelheid zolang een raam open is. Beide leeg: de hele dag.",
    sched_displays: "Displays uit",
    sched_displays_help: "Indicatielampjes en displays van de apparaten uit (ook tijdens de dutjes van hun kamer). Leeg: de stille nacht.",
    sched_from: "Vanaf",
    sched_to: "Tot",
    sched_morning_end: "Tot",
    discover_short: "Vindt de kamers van je Home Assistant-ruimtes, met hun sensoren, apparaten en lampen. Er wordt niets opgeslagen voordat je het controleert.",
    how: "Hoe het werkt",
    less: "Minder",
    other_outdoor: "Andere buitensensoren",
    other_outdoor_help: "Sensoren in geen enkele buitenplek: een weerentiteit, een luchtkwaliteitsindex van de stad…",
    outdoors_help: "Tuin, terras, balkon…: hun sensoren geven de buitentemperatuur, de luchtkwaliteit en het geluid buiten.",
    section_sensors: "Sensoren",
    section_openings: "Ramen en deuren",
    section_devices: "Apparaten",
    section_lighting: "Verlichting",
    section_alerts: "Waarschuwingen",
    none: "Geen",
    openings_help: "Hun status houdt de raamwaarschuwingen en -boosts tegen of activeert ze.",
    naps: "Dutjes",
    nap: "Dutje",
    no_naps: "Geen dutje: voeg er een toe om de lampen op vaste tijden te dimmen.",
    alerts_default: "Standaardinstellingen",
    customize_alert: "Een waarschuwing aanpassen",
    room_alerts_help: "Alleen de waarschuwingen die voor deze kamer zijn aangepast; de andere volgen het tabblad Waarschuwingen.",
    lighting_help: "Lampen die aan zijn volgen het moment van de dag; Smart Comfort zet ze nooit aan of uit. De tijden staan in het tabblad Planning.",
    presence_title: "Lampen bij aanwezigheid",
    presence_help: "Zet de lampen aan als iemand binnenkomt en uit zodra er niemand meer is, zoals een aanwezigheidsautomatisering.",
    presence_add: "Lampen bij aanwezigheid",
    presence_remove: "Lampen bij aanwezigheid stoppen",
    presence_short: "Aanwezigheid",
    presence_sensors: "Aanwezigheidssensoren",
    presence_lights: "Lampen",
    presence_lights_help: "Leeg: de lampen van de kamer. Elke lamp kan worden toegevoegd (die van de gang vanuit de hal…).",
    presence_lux: "Lichtsterktesensor",
    presence_max_lux: "Alleen onder",
    presence_max_lux_help: "Er gaat geen lamp aan als de kamer lichter is dan dit.",
    presence_off_after: "Uit na niemand gedurende",
    presence_on_after: "Aan na een aanwezigheid van",
    presence_transition: "Overgang",
    presence_on_after_help: "Iemand die alleen langs de sensor loopt, zet de lampen niet aan.",
    presence_not_during_naps: "Uit tijdens de dutjes",
    presence_not_during_naps_help: "Deze lampen gaan niet aan terwijl een kamer van het huis haar dutje heeft.",
    slots_help: "Tijdvakken, op volgorde: het eerste dat op een lamp van toepassing is, beslist — uit gelaten, of aangezet op zijn helderheid.",
    slot_add: "Tijdvak",
    slot_lights: "Voor de lampen",
    slot_lights_help: "Leeg: alle aanwezigheidslampen.",
    slot_off: "Niet aanzetten",
    slot_brightness: "Helderheid",
    slot_off_after: "Uit na niemand gedurende",
    slot_color: "Kleur",
    a_empty: "Nog niets.",
    a_not_loaded: "Smart Comfort is niet geladen.",
    a_all: "Alles",
    a_group_devices: "Apparaten",
    a_group_lights: "Lampen",
    a_group_notifications: "Meldingen",
    a_group_manual: "Handmatig",
    a_today: "Vandaag",
    a_yesterday: "Gisteren",
    a_t_cool: "Koelen",
    a_t_cool_night: "Koelen, stille nacht",
    a_t_off: "Uit",
    a_t_off_open: "Uit: een raam blijft open",
    a_t_on: "Aan: het is warm",
    a_t_on_night: "Aan, stille nacht",
    a_t_boost: "Raamboost",
    a_t_purify: "Boost: vervuilde lucht",
    a_t_normal: "Terug naar normaal",
    a_t_night: "Nachtmodus",
    a_t_keep_on: "Weer aangezet",
    a_lighting: "Helderheid van het moment",
    a_presence_on: "Aan: er kwam iemand binnen",
    a_presence_off: "Uit: niemand meer",
    a_display_off: "Indicatielampje uit",
    a_display_on: "Indicatielampje weer aan",
    a_notified: "Melding",
    a_cleared: "Melding gewist: alles is weer normaal",
    a_manual: "Handmatig gewijzigd: met rust gelaten",
    a_manual_until: "Handmatig gewijzigd: met rust gelaten tot {time}",
    a_reset: "Terug naar normaal (vaste tijd)",
    a_failed: "Kon niet worden verzonden",
    a_all_rooms: "Alle ruimtes",
  },
  pt: {
    annex_alerts: "Predefinições de anexos",
    annex_alerts_help: "Limites de alerta predefinidos para anexos — adega, garagem, oficina, lavandaria, sótão. Defina o tipo de uma divisão como Anexo no separador Divisões; cada divisão pode substituí-los.",
    outdoor_noise: "Ruído exterior",
    quiet_night: "Noite silenciosa",
    to_handle: "Por tratar",
    all_rooms: "Todas as divisões",
    n_ok_rooms: "+ {n} OK",
    n_handled: "{n} tratados",
    discovered_new: "nova",
    discovered_updated: "completada",
    discovered_new_outdoor: "novo",
    discovered_updated_outdoor: "completado",
    discover: "Descobrir",
    discover_help: "Adiciona uma divisão por cada área do Home Assistant com algo a seguir (um sensor de conforto, um ar condicionado, uma ventoinha, um purificador ou uma luz regulável) e configura-a: sensores de temperatura, CO₂, humidade e ruído, sensores de PM2.5, PM10 e índice de qualidade do ar (também os dos purificadores), janelas e portas, ar condicionado, ventoinhas e purificadores com as suas predefinições e modos. As áreas exteriores (jardim, terraço…) vão para Exteriores, com os seus sensores de temperatura, qualidade do ar e ruído; um índice de qualidade do ar da cidade (Atmo France…) e a entidade meteorológica, na falta de um sensor exterior, vão para o separador Notificações. As predefinições e os modos de ventoinha silenciosos tornam-se as definições noturnas. O que já está definido é mantido. Verifique o resultado e depois guarde.",
    discover_running: "A descobrir…",
    discover_result: "Descoberta: divisões adicionadas: {added}, completadas: {updated}, espaços exteriores: {outdoors}{outdoor}. Verifique-as e depois guarde.",
    discover_outdoor: ", sensores exteriores definidos",
    discover_none: "A descoberta não encontrou nada de novo.",
    fan: "Ventoinha",
    purifier: "Purificador de ar",
    overview: "Visão geral",
    sc_score: "conforto",
    sc_all_good: "Está tudo confortável",
    sc_point: "{n} ponto a vigiar",
    sc_points: "{n} pontos a vigiar",
    n_rooms_ok: "{n} divisões OK",
    rooms: "Divisões",
    alerts: "Alertas",
    notifications: "Notificações",
    dashboards: "Painéis",
    control: "Controlo dos dispositivos",
    save: "Guardar",
    discard: "Descartar",
    saved: "Guardado",
    saving: "A guardar…",
    unsaved: "Alterações não guardadas",
    yaml: "Esta configuração vem do YAML e pode ser editada aqui. Quando o YAML muda (ao reiniciar ou com Recarregar o YAML), só é aplicado o que mudou: as suas alterações às outras definições mantêm-se.",
    yaml_reload: "Recarregar o YAML",
    yaml_reloaded: "YAML aplicado: só foi atualizado o que mudou.",
    yaml_unchanged: "O YAML não mudou: nada a aplicar.",
    yaml_conflicts: "YAML aplicado. Substituiu o que tinha sido alterado aqui em: {paths}",
    yaml_file: "Esta configuração é guardada em {file}, na pasta de configuração: o que guarda aqui é escrito nele, e as alterações ao ficheiro são aplicadas em poucos segundos.",
    yaml_help_file: "O conteúdo de {file}, na pasta de configuração (os valores predefinidos não são repetidos).",
    src_title: "Origem da configuração",
    src_status: "Modificado às {time} · {rooms} divisões · sincronizado",
    src_status_invalid: "Modificado às {time} · inválido, não aplicado: {error}",
    src_reload: "Recarregar",
    src_write: "Edição no painel",
    src_write_help: "Cada gravação reescreve apenas o que mudou no ficheiro, mantendo comentários e formatação · cópia .bak.",
    src_watch: "Vigilância do ficheiro",
    src_watch_help: "Relido a cada alteração (incluindo ficheiros incluídos) · só é aplicado o que mudou.",
    src_included: "Ficheiros incluídos",
    src_included_help: "{files} · uma divisão é reescrita no seu próprio ficheiro.",
    src_create: "Criar {file}",
    src_create_help: "Escreve a configuração em uso em {file}, na pasta de configuração; depois o ficheiro e o painel ficam sincronizados.",
    src_none: "Sem {file}: a configuração só é guardada pelo Home Assistant.",
    conflict_title: "O ficheiro mudou durante a edição",
    conflict_sub: "{n} definições alteradas em {file} às {time}",
    conflict_sub_other: "{n} definições alteradas noutro lado (YAML ou outra janela)",
    conflict_file: "Ficheiro",
    conflict_panel: "Painel",
    conflict_keep_file: "Manter o ficheiro",
    conflict_keep_panel: "Manter o painel",
    not_loaded: "O Smart Comfort não está carregado. Consulte os registos.",
    not_setup: "O Smart Comfort ainda não está configurado: adicione-o em Definições → Dispositivos e serviços.",
    retry: "Tentar novamente",
    active_alerts: "Alertas ativos",
    no_alerts: "Está tudo bem.",
    outdoor: "Exterior",
    notifications_on: "Notificações ativadas",
    notifications_off: "Notificações desativadas",
    control_on: "Controlo dos dispositivos ativado",
    control_off: "Controlo dos dispositivos desativado",
    notify_now: "Notificar agora",
    unsnooze: "Cancelar os adiamentos",
    snooze: "Adiar",
    acknowledge: "Entendido",
    snoozed: "adiado",
    acknowledged: "confirmado",
    handled: "tratado",
    notified: "notificado",
    pending: "ainda não notificado",
    since: "desde",
    ok: "OK",
    open: "Aberto",
    devices: "Dispositivos",
    target: "objetivo",
    manual: "manual até",
    last_notification: "Última notificação",
    add_room: "Adicionar uma divisão",
    new_room: "Nova divisão",
    remove: "Remover",
    move_up: "Mover para cima",
    move_down: "Mover para baixo",
    room_alerts: "Alertas desta divisão",
    inherit: "Predefinição",
    enabled: "Ativado",
    disabled: "Desativado",
    climate: "Ar condicionado",
    fans: "Ventoinhas",
    purifiers: "Purificadores de ar",
    device_settings: "Definições deste dispositivo",
    default_value: "Predefinição: {value}",
    no_rooms: "Ainda nenhuma divisão.",
    outdoor_air: "Ar exterior",
    outdoors: "Exteriores",
    add_outdoor: "Adicionar um espaço exterior",
    new_outdoor: "Exterior",
    no_outdoors: "Ainda nenhum espaço exterior.",
    start: "Começar",
    start_help: "Ainda não está nada configurado. Descobrir encontra as divisões e os espaços exteriores das suas áreas do Home Assistant com os seus sensores e dispositivos, e configura-os; verifica o resultado no separador Divisões antes de guardar.",
    no_sensor: "nenhum sensor",
    lighting: "Iluminação adaptativa",
    lights: "Luzes",
    light: "Luz",
    lighting_on: "Iluminação adaptativa ativada",
    lighting_off: "Iluminação adaptativa desativada",
    nap_start: "Sesta das",
    nap_end: "Até às",
    nap_days: "Dias",
    nap_days_help: "Nenhum: todos os dias.",
    nap_entity: "Horário da sesta",
    nap_entity_help: "Ligado: sesta (um horário partilhado com o House Rules, um interruptor virtual…).",
    day_mon: "Seg",
    day_tue: "Ter",
    day_wed: "Qua",
    day_thu: "Qui",
    day_fri: "Sex",
    day_sat: "Sáb",
    day_sun: "Dom",
    advanced: "Avançado",
    alerts_help: "Predefinições para todas as divisões; cada divisão pode personalizar as suas.",
    schedule: "Horário",
    settings: "Definições",
    activity: "Atividade",
    activity_help: "O que o Smart Comfort fez e porquê, em direto: dispositivos, luzes, notificações, alterações manuais. Uma linha abre a sua entidade.",
    yaml_tab: "YAML",
    yaml_help: "Apenas a configuração do Smart Comfort, tal como fica sob smart_comfort: no configuration.yaml (as predefinições não são repetidas).",
    yaml_help_unsaved: "Apenas a configuração do Smart Comfort, tal como fica sob smart_comfort: no configuration.yaml (as predefinições não são repetidas). Inclui as alterações ainda não guardadas.",
    yaml_copy: "Copiar",
    yaml_copied: "Copiado",
    sched_title: "O seu dia",
    sched_help: "Quando se aplica cada intervalo horário, com a hora atual.",
    sched_edit: "Horas",
    sched_quiet: "Horas de silêncio",
    sched_quiet_help: "Só são enviados os alertas críticos; os outros esperam pelo fim.",
    sched_night: "Noite silenciosa",
    sched_night_help: "Dispositivos mais silenciosos, sem reforço de janela, luzes no seu nível noturno.",
    sched_morning: "Manhã tranquila",
    sched_morning_help: "A partir do fim da noite: as luzes dos quartos ficam mais suaves.",
    sched_boost: "Reforço de janela",
    sched_boost_help: "Ventoinhas e purificadores na velocidade máxima enquanto uma janela está aberta. Ambos vazios: o dia todo.",
    sched_displays: "Ecrãs desligados",
    sched_displays_help: "Luzes indicadoras e ecrãs dos dispositivos desligados (também durante as sestas da sua divisão). Vazio: a noite silenciosa.",
    sched_from: "Das",
    sched_to: "Até às",
    sched_morning_end: "Até às",
    discover_short: "Encontra as divisões das suas áreas do Home Assistant, com os seus sensores, dispositivos e luzes. Nada é guardado antes de verificar.",
    how: "Como funciona",
    less: "Menos",
    other_outdoor: "Outros sensores exteriores",
    other_outdoor_help: "Sensores fora dos espaços exteriores: uma entidade meteorológica, um índice de qualidade do ar da cidade…",
    outdoors_help: "Jardim, terraço, varanda…: os seus sensores dão a temperatura, a qualidade do ar e o ruído exteriores.",
    section_sensors: "Sensores",
    section_openings: "Janelas e portas",
    section_devices: "Dispositivos",
    section_lighting: "Iluminação",
    section_alerts: "Alertas",
    none: "Nenhum",
    openings_help: "O seu estado retém ou aciona os alertas e os reforços ligados às janelas.",
    naps: "Sestas",
    nap: "Sesta",
    no_naps: "Nenhuma sesta: adicione uma para baixar as luzes a horas fixas.",
    alerts_default: "Definições predefinidas",
    customize_alert: "Personalizar um alerta",
    room_alerts_help: "Apenas os alertas personalizados para esta divisão; os outros seguem o separador Alertas.",
    lighting_help: "As luzes acesas seguem o momento do dia; o Smart Comfort nunca as liga nem desliga. As horas estão no separador Horário.",
    presence_title: "Luzes por presença",
    presence_help: "Liga as luzes quando alguém entra e desliga-as quando já não resta ninguém, como uma automatização de presença.",
    presence_add: "Luzes por presença",
    presence_remove: "Parar as luzes por presença",
    presence_short: "Presença",
    presence_sensors: "Sensores de presença",
    presence_lights: "Luzes",
    presence_lights_help: "Vazio: as luzes da divisão. Pode ser adicionada qualquer luz (a do corredor a partir da entrada…).",
    presence_lux: "Sensor de luminosidade",
    presence_max_lux: "Só abaixo de",
    presence_max_lux_help: "Nenhuma luz é ligada quando a divisão está mais clara do que isto.",
    presence_off_after: "Desligar após ninguém durante",
    presence_on_after: "Ligar após uma presença de",
    presence_transition: "Transição",
    presence_on_after_help: "Alguém que apenas passa pelo sensor não liga as luzes.",
    presence_not_during_naps: "Desligadas durante as sestas",
    presence_not_during_naps_help: "Estas luzes não se ligam enquanto uma divisão da casa está na sua sesta.",
    slots_help: "Intervalos, por ordem: o primeiro que se aplica a uma luz decide — deixada desligada, ou ligada com o seu brilho.",
    slot_add: "Intervalo",
    slot_lights: "Para as luzes",
    slot_lights_help: "Vazio: todas as luzes de presença.",
    slot_off: "Não ligar",
    slot_brightness: "Brilho",
    slot_off_after: "Desligar após ninguém durante",
    slot_color: "Cor",
    a_empty: "Ainda nada.",
    a_not_loaded: "O Smart Comfort não está carregado.",
    a_all: "Tudo",
    a_group_devices: "Dispositivos",
    a_group_lights: "Luzes",
    a_group_notifications: "Notificações",
    a_group_manual: "À mão",
    a_today: "Hoje",
    a_yesterday: "Ontem",
    a_t_cool: "A arrefecer",
    a_t_cool_night: "A arrefecer, noite silenciosa",
    a_t_off: "Desligado",
    a_t_off_open: "Desligado: uma janela continua aberta",
    a_t_on: "Ligado: está calor",
    a_t_on_night: "Ligado, noite silenciosa",
    a_t_boost: "Reforço de janela",
    a_t_purify: "Reforço: ar poluído",
    a_t_normal: "De volta ao normal",
    a_t_night: "Modo noturno",
    a_t_keep_on: "Ligado de novo",
    a_lighting: "Brilho do momento",
    a_presence_on: "Ligada: alguém entrou",
    a_presence_off: "Desligada: já não está ninguém",
    a_display_off: "Indicador desligado",
    a_display_on: "Indicador ligado de novo",
    a_notified: "Notificação",
    a_cleared: "Notificação apagada: tudo voltou ao normal",
    a_manual: "Alterado à mão: deixado como está",
    a_manual_until: "Alterado à mão: deixado como está até às {time}",
    a_reset: "De volta ao normal (hora fixa)",
    a_failed: "Não foi possível enviar",
    a_all_rooms: "Todas as divisões",
  },
  pl: {
    annex_alerts: "Domyślne dla pomieszczeń gospodarczych",
    annex_alerts_help: "Domyślne progi alertów dla pomieszczeń gospodarczych — piwnica, garaż, warsztat, pralnia, strych. Ustaw typ pomieszczenia na Gospodarcze w zakładce Pomieszczenia; każde pomieszczenie może je nadpisać.",
    outdoor_noise: "Hałas na zewnątrz",
    quiet_night: "Cicha noc",
    to_handle: "Do obsłużenia",
    all_rooms: "Wszystkie pokoje",
    n_ok_rooms: "+ {n} OK",
    n_handled: "{n} obsłużono",
    discovered_new: "nowe",
    discovered_updated: "uzupełnione",
    discovered_new_outdoor: "nowe",
    discovered_updated_outdoor: "uzupełnione",
    discover: "Wykryj",
    discover_help: "Dodaje pomieszczenie dla każdego obszaru Home Assistant, w którym jest coś do śledzenia (czujnik komfortu, klimatyzator, wentylator, oczyszczacz lub ściemniane światło), i je konfiguruje: czujniki temperatury, CO₂, wilgotności i hałasu, czujniki PM2.5, PM10 i indeksu jakości powietrza (także oczyszczaczy), okna i drzwi, klimatyzator, wentylatory i oczyszczacze z ich ustawieniami wstępnymi i trybami. Obszary zewnętrzne (ogród, taras…) trafiają do zakładki Na zewnątrz, z ich czujnikami temperatury, jakości powietrza i hałasu; miejski indeks jakości powietrza (Atmo France…) i encja pogody, w braku czujnika zewnętrznego, trafiają do zakładki Powiadomienia. Ciche ustawienia wstępne i tryby wentylatora stają się ustawieniami nocnymi. To, co jest już ustawione, zostaje zachowane. Sprawdź wynik, a następnie zapisz.",
    discover_running: "Wykrywanie…",
    discover_result: "Wykrywanie: dodane pomieszczenia: {added}, uzupełnione: {updated}, miejsca na zewnątrz: {outdoors}{outdoor}. Sprawdź je, a następnie zapisz.",
    discover_outdoor: ", czujniki zewnętrzne ustawione",
    discover_none: "Wykrywanie nie znalazło niczego nowego.",
    fan: "Wentylator",
    purifier: "Oczyszczacz powietrza",
    overview: "Przegląd",
    sc_score: "komfort",
    sc_all_good: "Wszystko jest w porządku",
    sc_point: "{n} punkt do sprawdzenia",
    sc_points: "{n} punkty do sprawdzenia",
    n_rooms_ok: "{n} pomieszczeń OK",
    rooms: "Pomieszczenia",
    alerts: "Alerty",
    notifications: "Powiadomienia",
    dashboards: "Pulpity",
    control: "Sterowanie urządzeniami",
    save: "Zapisz",
    discard: "Odrzuć",
    saved: "Zapisano",
    saving: "Zapisywanie…",
    unsaved: "Niezapisane zmiany",
    yaml: "Ta konfiguracja pochodzi z YAML i można ją tu edytować. Gdy YAML się zmieni (przy ponownym uruchomieniu lub przez Przeładuj YAML), stosowane jest tylko to, co się zmieniło: twoje zmiany pozostałych ustawień pozostają.",
    yaml_reload: "Przeładuj YAML",
    yaml_reloaded: "Zastosowano YAML: zaktualizowano tylko to, co się zmieniło.",
    yaml_unchanged: "YAML się nie zmienił: nie ma czego stosować.",
    yaml_conflicts: "Zastosowano YAML. Zastąpił zmiany wprowadzone tutaj w: {paths}",
    yaml_file: "Ta konfiguracja jest przechowywana w {file} w folderze konfiguracji: to, co tu zapiszesz, trafia do niego, a zmiany w pliku są stosowane w ciągu kilku sekund.",
    yaml_help_file: "Zawartość {file} w folderze konfiguracji (wartości domyślne nie są powtarzane).",
    src_title: "Źródło konfiguracji",
    src_status: "Zmieniono o {time} · {rooms} pomieszczeń · zsynchronizowano",
    src_status_invalid: "Zmieniono o {time} · nieprawidłowy, nie zastosowano: {error}",
    src_reload: "Przeładuj",
    src_write: "Edycja w panelu",
    src_write_help: "Każdy zapis przepisuje w pliku tylko to, co się zmieniło, z zachowaniem komentarzy i formatowania · kopia .bak.",
    src_watch: "Obserwowanie pliku",
    src_watch_help: "Odczyt przy każdej zmianie (także plików dołączonych) · stosowane jest tylko to, co się zmieniło.",
    src_included: "Pliki dołączone",
    src_included_help: "{files} · pomieszczenie jest zapisywane we własnym pliku.",
    src_create: "Utwórz {file}",
    src_create_help: "Zapisuje bieżącą konfigurację do {file} w folderze konfiguracji; potem plik i panel pozostają zsynchronizowane.",
    src_none: "Brak {file}: konfigurację przechowuje tylko Home Assistant.",
    conflict_title: "Plik zmienił się podczas edycji",
    conflict_sub: "{n} ustawień zmienionych w {file} o {time}",
    conflict_sub_other: "{n} ustawień zmienionych gdzie indziej (YAML lub inne okno)",
    conflict_file: "Plik",
    conflict_panel: "Panel",
    conflict_keep_file: "Zachowaj plik",
    conflict_keep_panel: "Zachowaj panel",
    not_loaded: "Smart Comfort nie jest załadowany. Sprawdź logi.",
    not_setup: "Smart Comfort nie jest jeszcze skonfigurowany: dodaj go w Ustawienia → Urządzenia oraz usługi.",
    retry: "Spróbuj ponownie",
    active_alerts: "Aktywne alerty",
    no_alerts: "Wszystko w porządku.",
    outdoor: "Na zewnątrz",
    notifications_on: "Powiadomienia włączone",
    notifications_off: "Powiadomienia wyłączone",
    control_on: "Sterowanie urządzeniami włączone",
    control_off: "Sterowanie urządzeniami wyłączone",
    notify_now: "Powiadom teraz",
    unsnooze: "Anuluj wyciszenia",
    snooze: "Wycisz",
    acknowledge: "Rozumiem",
    snoozed: "wyciszony",
    acknowledged: "potwierdzony",
    handled: "obsłużony",
    notified: "powiadomiono",
    pending: "jeszcze bez powiadomienia",
    since: "od",
    ok: "OK",
    open: "Otwarte",
    devices: "Urządzenia",
    target: "cel",
    manual: "ręcznie do",
    last_notification: "Ostatnie powiadomienie",
    add_room: "Dodaj pomieszczenie",
    new_room: "Nowe pomieszczenie",
    remove: "Usuń",
    move_up: "Przesuń w górę",
    move_down: "Przesuń w dół",
    room_alerts: "Alerty tego pomieszczenia",
    inherit: "Domyślne",
    enabled: "Włączone",
    disabled: "Wyłączone",
    climate: "Klimatyzator",
    fans: "Wentylatory",
    purifiers: "Oczyszczacze powietrza",
    device_settings: "Ustawienia tego urządzenia",
    default_value: "Domyślnie: {value}",
    no_rooms: "Brak pomieszczeń.",
    outdoor_air: "Powietrze na zewnątrz",
    outdoors: "Na zewnątrz",
    add_outdoor: "Dodaj miejsce na zewnątrz",
    new_outdoor: "Na zewnątrz",
    no_outdoors: "Brak miejsc na zewnątrz.",
    start: "Pierwsze kroki",
    start_help: "Nic nie jest jeszcze skonfigurowane. Wykryj znajduje pomieszczenia i miejsca na zewnątrz w obszarach Home Assistant wraz z ich czujnikami i urządzeniami, i je konfiguruje; wynik sprawdzasz w zakładce Pomieszczenia przed zapisaniem.",
    no_sensor: "brak czujnika",
    lighting: "Adaptacyjne oświetlenie",
    lights: "Światła",
    light: "Światło",
    lighting_on: "Adaptacyjne oświetlenie włączone",
    lighting_off: "Adaptacyjne oświetlenie wyłączone",
    nap_start: "Drzemka od",
    nap_end: "Do",
    nap_days: "Dni",
    nap_days_help: "Brak: codziennie.",
    nap_entity: "Harmonogram drzemki",
    nap_entity_help: "Włączone: drzemka (harmonogram wspólny z House Rules, przełącznik wirtualny…).",
    day_mon: "Pn",
    day_tue: "Wt",
    day_wed: "Śr",
    day_thu: "Cz",
    day_fri: "Pt",
    day_sat: "Sb",
    day_sun: "Nd",
    advanced: "Zaawansowane",
    alerts_help: "Wartości domyślne dla każdego pomieszczenia; każde pomieszczenie może dostosować własne.",
    schedule: "Harmonogram",
    settings: "Ustawienia",
    activity: "Aktywność",
    activity_help: "Co zrobił Smart Comfort i dlaczego, na żywo: urządzenia, światła, powiadomienia, zmiany ręczne. Wiersz otwiera swoją encję.",
    yaml_tab: "YAML",
    yaml_help: "Tylko konfiguracja Smart Comfort, w postaci, w jakiej trafia pod smart_comfort: w configuration.yaml (wartości domyślne nie są powtarzane).",
    yaml_help_unsaved: "Tylko konfiguracja Smart Comfort, w postaci, w jakiej trafia pod smart_comfort: w configuration.yaml (wartości domyślne nie są powtarzane). Zawiera jeszcze niezapisane zmiany.",
    yaml_copy: "Kopiuj",
    yaml_copied: "Skopiowano",
    sched_title: "Twój dzień",
    sched_help: "Kiedy obowiązuje każdy przedział czasu, z aktualną godziną.",
    sched_edit: "Godziny",
    sched_quiet: "Godziny ciszy",
    sched_quiet_help: "Wysyłane są tylko alerty krytyczne; pozostałe czekają do końca.",
    sched_night: "Cicha noc",
    sched_night_help: "Urządzenia pracują ciszej, bez wzmocnienia przy oknie, światła na poziomie nocnym.",
    sched_morning: "Spokojny poranek",
    sched_morning_help: "Od końca nocy: światła w sypialniach pozostają przyciemnione.",
    sched_boost: "Wzmocnienie przy oknie",
    sched_boost_help: "Wentylatory i oczyszczacze na pełnej prędkości, gdy okno jest otwarte. Oba puste: przez cały dzień.",
    sched_displays: "Wyświetlacze wyłączone",
    sched_displays_help: "Kontrolki i wyświetlacze urządzeń wyłączone (także podczas drzemek w ich pomieszczeniu). Puste: cicha noc.",
    sched_from: "Od",
    sched_to: "Do",
    sched_morning_end: "Do",
    discover_short: "Znajduje pomieszczenia w obszarach Home Assistant, z ich czujnikami, urządzeniami i światłami. Nic nie jest zapisywane przed Twoim sprawdzeniem.",
    how: "Jak to działa",
    less: "Mniej",
    other_outdoor: "Inne czujniki zewnętrzne",
    other_outdoor_help: "Czujniki poza miejscami na zewnątrz: encja pogody, miejski indeks jakości powietrza…",
    outdoors_help: "Ogród, taras, balkon…: ich czujniki podają temperaturę, jakość powietrza i hałas na zewnątrz.",
    section_sensors: "Czujniki",
    section_openings: "Okna i drzwi",
    section_devices: "Urządzenia",
    section_lighting: "Oświetlenie",
    section_alerts: "Alerty",
    none: "Brak",
    openings_help: "Ich stan wstrzymuje lub wyzwala alerty i wzmocnienia związane z oknami.",
    naps: "Drzemki",
    nap: "Drzemka",
    no_naps: "Brak drzemek: dodaj jedną, aby przyciemniać światła o stałych porach.",
    alerts_default: "Ustawienia domyślne",
    customize_alert: "Dostosuj alert",
    room_alerts_help: "Tylko alerty dostosowane dla tego pomieszczenia; pozostałe są zgodne z zakładką Alerty.",
    lighting_help: "Włączone światła dostosowują się do pory dnia; Smart Comfort nigdy ich nie włącza ani nie wyłącza. Godziny są w zakładce Harmonogram.",
    presence_title: "Światła przy obecności",
    presence_help: "Włącza światła, gdy ktoś wchodzi, i wyłącza je, gdy nikogo już nie ma, jak automatyzacja obecności.",
    presence_add: "Światła przy obecności",
    presence_remove: "Wyłącz światła przy obecności",
    presence_short: "Obecność",
    presence_sensors: "Czujniki obecności",
    presence_lights: "Światła",
    presence_lights_help: "Puste: światła pomieszczenia. Można dodać dowolne światło (to z korytarza od wejścia…).",
    presence_lux: "Czujnik natężenia światła",
    presence_max_lux: "Tylko poniżej",
    presence_max_lux_help: "Żadne światło nie zostaje włączone, gdy w pomieszczeniu jest jaśniej niż to.",
    presence_off_after: "Wyłącz po braku obecności przez",
    presence_on_after: "Włącz po obecności przez",
    presence_transition: "Przejście",
    presence_on_after_help: "Ktoś, kto tylko przechodzi obok czujnika, nie włącza świateł.",
    presence_not_during_naps: "Wyłączone podczas drzemek",
    presence_not_during_naps_help: "Te światła nie włączają się, gdy w którymś pomieszczeniu domu trwa drzemka.",
    slots_help: "Przedziały, po kolei: pierwszy, który dotyczy danego światła, decyduje — pozostaje wyłączone lub włączone z jego jasnością.",
    slot_add: "Przedział",
    slot_lights: "Dla świateł",
    slot_lights_help: "Puste: wszystkie światła obecności.",
    slot_off: "Nie włączaj",
    slot_brightness: "Jasność",
    slot_off_after: "Wyłącz po braku obecności przez",
    slot_color: "Kolor",
    a_empty: "Jeszcze nic.",
    a_not_loaded: "Smart Comfort nie jest załadowany.",
    a_all: "Wszystko",
    a_group_devices: "Urządzenia",
    a_group_lights: "Światła",
    a_group_notifications: "Powiadomienia",
    a_group_manual: "Ręcznie",
    a_today: "Dzisiaj",
    a_yesterday: "Wczoraj",
    a_t_cool: "Chłodzenie",
    a_t_cool_night: "Chłodzenie, cicha noc",
    a_t_off: "Wyłączone",
    a_t_off_open: "Wyłączone: okno pozostaje otwarte",
    a_t_on: "Włączone: jest ciepło",
    a_t_on_night: "Włączone, cicha noc",
    a_t_boost: "Wzmocnienie przy oknie",
    a_t_purify: "Wzmocnienie: zanieczyszczone powietrze",
    a_t_normal: "Powrót do normy",
    a_t_night: "Tryb nocny",
    a_t_keep_on: "Ponownie włączone",
    a_lighting: "Jasność dla pory dnia",
    a_presence_on: "Włączone: ktoś wszedł",
    a_presence_off: "Wyłączone: nikogo nie ma",
    a_display_off: "Kontrolka wyłączona",
    a_display_on: "Kontrolka ponownie włączona",
    a_notified: "Powiadomienie",
    a_cleared: "Powiadomienie usunięte: wszystko wróciło do normy",
    a_manual: "Zmienione ręcznie: pozostawione bez zmian",
    a_manual_until: "Zmienione ręcznie: pozostawione bez zmian do {time}",
    a_reset: "Powrót do normy (stała godzina)",
    a_failed: "Nie udało się wysłać",
    a_all_rooms: "Wszystkie pomieszczenia",
  },
  ro: {
    annex_alerts: "Valori implicite pentru anexe",
    annex_alerts_help: "Praguri de alertă implicite pentru anexe — pivniță, garaj, atelier, spălătorie, pod. Setează tipul unei camere la Anexă în fila Camere; fiecare cameră le poate suprascrie.",
    outdoor_noise: "Zgomot exterior",
    quiet_night: "Noapte liniștită",
    to_handle: "De rezolvat",
    all_rooms: "Toate camerele",
    n_ok_rooms: "+ {n} OK",
    n_handled: "{n} preluate",
    discovered_new: "nouă",
    discovered_updated: "completată",
    discovered_new_outdoor: "nou",
    discovered_updated_outdoor: "completat",
    discover: "Descoperă",
    discover_help: "Adaugă o cameră pentru fiecare zonă Home Assistant cu ceva de urmărit (un senzor de confort, un aparat de aer condiționat, un ventilator, un purificator sau o lumină reglabilă) și o configurează: senzori de temperatură, CO₂, umiditate și zgomot, senzori PM2.5, PM10 și de indice al calității aerului (și cei ai purificatoarelor), ferestre și uși, aer condiționat, ventilatoare și purificatoare cu presetările și modurile lor. Zonele exterioare (grădină, terasă…) merg la Exterior, cu senzorii lor de temperatură, calitatea aerului și zgomot; un indice al calității aerului din oraș (Atmo France…) și entitatea meteo, în lipsa unui senzor exterior, merg în fila Notificări. Presetările și modurile de ventilator silențioase devin setările de noapte. Ce e deja setat se păstrează. Verificați rezultatul, apoi salvați.",
    discover_running: "Descoperire…",
    discover_result: "Descoperire: camere adăugate: {added}, completate: {updated}, locuri exterioare: {outdoors}{outdoor}. Verificați-le, apoi salvați.",
    discover_outdoor: ", senzori exteriori setați",
    discover_none: "Descoperirea nu a găsit nimic nou.",
    fan: "Ventilator",
    purifier: "Purificator de aer",
    overview: "Prezentare generală",
    sc_score: "confort",
    sc_all_good: "Totul este confortabil",
    sc_point: "{n} punct de verificat",
    sc_points: "{n} puncte de verificat",
    n_rooms_ok: "{n} camere OK",
    rooms: "Camere",
    alerts: "Alerte",
    notifications: "Notificări",
    dashboards: "Tablouri de bord",
    control: "Controlul aparatelor",
    save: "Salvează",
    discard: "Renunță",
    saved: "Salvat",
    saving: "Se salvează…",
    unsaved: "Modificări nesalvate",
    yaml: "Această configurație vine din YAML și poate fi editată aici. Când YAML se schimbă (la repornire sau cu Reîncarcă YAML), se aplică doar ce s-a schimbat: modificările dvs. la celelalte setări rămân.",
    yaml_reload: "Reîncarcă YAML",
    yaml_reloaded: "YAML aplicat: s-a actualizat doar ce s-a schimbat.",
    yaml_unchanged: "YAML nu s-a schimbat: nimic de aplicat.",
    yaml_conflicts: "YAML aplicat. A înlocuit ce fusese modificat aici pentru: {paths}",
    yaml_file: "Această configurație este păstrată în {file}, în folderul de configurare: ce salvați aici este scris în el, iar modificările fișierului sunt aplicate în câteva secunde.",
    yaml_help_file: "Conținutul {file}, din folderul de configurare (valorile implicite nu sunt repetate).",
    src_title: "Sursa configurației",
    src_status: "Modificat la {time} · {rooms} camere · sincronizat",
    src_status_invalid: "Modificat la {time} · invalid, neaplicat: {error}",
    src_reload: "Reîncarcă",
    src_write: "Editare în panou",
    src_write_help: "Fiecare salvare rescrie în fișier doar ce s-a schimbat, păstrând comentariile și formatarea · copie .bak.",
    src_watch: "Supravegherea fișierului",
    src_watch_help: "Recitit la fiecare modificare (inclusiv fișierele incluse) · se aplică doar ce s-a schimbat.",
    src_included: "Fișiere incluse",
    src_included_help: "{files} · o cameră este rescrisă în propriul fișier.",
    src_create: "Creează {file}",
    src_create_help: "Scrie configurația în uz în {file}, în folderul de configurare; apoi fișierul și panoul rămân sincronizate.",
    src_none: "Niciun {file}: configurația este păstrată doar de Home Assistant.",
    conflict_title: "Fișierul s-a schimbat în timpul editării",
    conflict_sub: "{n} setări modificate în {file} la {time}",
    conflict_sub_other: "{n} setări modificate în altă parte (YAML sau altă fereastră)",
    conflict_file: "Fișier",
    conflict_panel: "Panou",
    conflict_keep_file: "Păstrează fișierul",
    conflict_keep_panel: "Păstrează panoul",
    not_loaded: "Smart Comfort nu este încărcat. Verificați jurnalele.",
    not_setup: "Smart Comfort nu este încă configurat: adăugați-l din Setări → Dispozitive și servicii.",
    retry: "Reîncearcă",
    active_alerts: "Alerte active",
    no_alerts: "Totul este în regulă.",
    outdoor: "Exterior",
    notifications_on: "Notificări activate",
    notifications_off: "Notificări dezactivate",
    control_on: "Controlul aparatelor activat",
    control_off: "Controlul aparatelor dezactivat",
    notify_now: "Notifică acum",
    unsnooze: "Anulează amânările",
    snooze: "Amână",
    acknowledge: "Am înțeles",
    snoozed: "amânată",
    acknowledged: "confirmată",
    handled: "gestionată",
    notified: "notificată",
    pending: "încă nenotificată",
    since: "din",
    ok: "OK",
    open: "Deschise",
    devices: "Aparate",
    target: "țintă",
    manual: "manual până la",
    last_notification: "Ultima notificare",
    add_room: "Adăugați o cameră",
    new_room: "Cameră nouă",
    remove: "Elimină",
    move_up: "Mută în sus",
    move_down: "Mută în jos",
    room_alerts: "Alertele acestei camere",
    inherit: "Implicit",
    enabled: "Activat",
    disabled: "Dezactivat",
    climate: "Aer condiționat",
    fans: "Ventilatoare",
    purifiers: "Purificatoare de aer",
    device_settings: "Setările aparatului",
    default_value: "Implicit: {value}",
    no_rooms: "Încă nicio cameră.",
    outdoor_air: "Aer exterior",
    outdoors: "Exterior",
    add_outdoor: "Adăugați un loc exterior",
    new_outdoor: "Exterior",
    no_outdoors: "Încă niciun loc exterior.",
    start: "Să începem",
    start_help: "Nimic nu este încă configurat. Descoperă găsește camerele și locurile exterioare din zonele Home Assistant, cu senzorii și aparatele lor, și le configurează; verificați rezultatul în fila Camere înainte de a salva.",
    no_sensor: "niciun senzor",
    lighting: "Iluminare adaptivă",
    lights: "Lumini",
    light: "Lumină",
    lighting_on: "Iluminare adaptivă activată",
    lighting_off: "Iluminare adaptivă dezactivată",
    nap_start: "Siestă de la",
    nap_end: "Până la",
    nap_days: "Zile",
    nap_days_help: "Niciuna: în fiecare zi.",
    nap_entity: "Program de somn",
    nap_entity_help: "Pornit: somn de prânz (un program comun cu House Rules, un comutator virtual…).",
    day_mon: "Lun",
    day_tue: "Mar",
    day_wed: "Mie",
    day_thu: "Joi",
    day_fri: "Vin",
    day_sat: "Sâm",
    day_sun: "Dum",
    advanced: "Avansat",
    alerts_help: "Valori implicite pentru toate camerele; fiecare cameră le poate personaliza pe ale sale.",
    schedule: "Program",
    settings: "Setări",
    activity: "Activitate",
    activity_help: "Ce a făcut Smart Comfort și de ce, în timp real: aparate, lumini, notificări, modificări manuale. Un rând deschide entitatea sa.",
    yaml_tab: "YAML",
    yaml_help: "Doar configurația Smart Comfort, așa cum se pune sub smart_comfort: în configuration.yaml (valorile implicite nu se repetă).",
    yaml_help_unsaved: "Doar configurația Smart Comfort, așa cum se pune sub smart_comfort: în configuration.yaml (valorile implicite nu se repetă). Include modificările încă nesalvate.",
    yaml_copy: "Copiază",
    yaml_copied: "Copiat",
    sched_title: "Ziua dvs.",
    sched_help: "Când se aplică fiecare interval orar, cu ora curentă.",
    sched_edit: "Ore",
    sched_quiet: "Ore de liniște",
    sched_quiet_help: "Se trimit doar alertele critice; celelalte așteaptă sfârșitul.",
    sched_night: "Noapte liniștită",
    sched_night_help: "Aparatele merg mai silențios, fără impuls la fereastră, luminile la nivelul de noapte.",
    sched_morning: "Dimineață liniștită",
    sched_morning_help: "De la sfârșitul nopții: luminile din dormitoare rămân mai slabe.",
    sched_boost: "Impuls la fereastră",
    sched_boost_help: "Ventilatoarele și purificatoarele la viteză maximă cât timp o fereastră e deschisă. Ambele goale: toată ziua.",
    sched_displays: "Afișaje stinse",
    sched_displays_help: "Indicatoarele luminoase și afișajele aparatelor stinse (și în timpul siestelor din camera lor). Gol: noaptea liniștită.",
    sched_from: "De la",
    sched_to: "Până la",
    sched_morning_end: "Până la",
    discover_short: "Găsește camerele din zonele Home Assistant, cu senzorii, aparatele și luminile lor. Nimic nu se salvează înainte să verificați.",
    how: "Cum funcționează",
    less: "Mai puțin",
    other_outdoor: "Alți senzori exteriori",
    other_outdoor_help: "Senzori din niciun loc exterior: o entitate meteo, un indice al calității aerului din oraș…",
    outdoors_help: "Grădină, terasă, balcon…: senzorii lor dau temperatura, calitatea aerului și zgomotul de afară.",
    section_sensors: "Senzori",
    section_openings: "Ferestre și uși",
    section_devices: "Aparate",
    section_lighting: "Iluminare",
    section_alerts: "Alerte",
    none: "Niciunul",
    openings_help: "Starea lor reține sau declanșează alertele și impulsurile legate de ferestre.",
    naps: "Sieste",
    nap: "Siestă",
    no_naps: "Nicio siestă: adăugați una pentru a reduce luminile la ore fixe.",
    alerts_default: "Setări implicite",
    customize_alert: "Personalizați o alertă",
    room_alerts_help: "Doar alertele personalizate pentru această cameră; celelalte urmează fila Alerte.",
    lighting_help: "Luminile aprinse urmează momentul zilei; Smart Comfort nu le aprinde și nu le stinge niciodată. Orele sunt în fila Program.",
    presence_title: "Lumini la prezență",
    presence_help: "Aprinde luminile când intră cineva și le stinge când nu mai rămâne nimeni, ca o automatizare de prezență.",
    presence_add: "Lumini la prezență",
    presence_remove: "Oprește luminile la prezență",
    presence_short: "Prezență",
    presence_sensors: "Senzori de prezență",
    presence_lights: "Lumini",
    presence_lights_help: "Gol: luminile camerei. Se poate adăuga orice lumină (cea din hol, de la intrare…).",
    presence_lux: "Senzor de luminozitate",
    presence_max_lux: "Doar sub",
    presence_max_lux_help: "Nicio lumină aprinsă când camera e mai luminoasă de atât.",
    presence_off_after: "Stinse după o absență de",
    presence_on_after: "Aprinse după o prezență de",
    presence_transition: "Estompare",
    presence_on_after_help: "Cineva care doar trece pe lângă senzor nu aprinde luminile.",
    presence_not_during_naps: "Stinse în timpul siestelor",
    presence_not_during_naps_help: "Aceste lumini nu se aprind cât timp o cameră din casă are siestă.",
    slots_help: "Intervale, în ordine: primul care se aplică unei lumini decide — rămâne stinsă sau se aprinde la luminozitatea sa.",
    slot_add: "Interval",
    slot_lights: "Pentru luminile",
    slot_lights_help: "Gol: toate luminile de prezență.",
    slot_off: "Nu aprinde",
    slot_brightness: "Luminozitate",
    slot_off_after: "Stinse după o absență de",
    slot_color: "Culoare",
    a_empty: "Încă nimic.",
    a_not_loaded: "Smart Comfort nu este încărcat.",
    a_all: "Toate",
    a_group_devices: "Aparate",
    a_group_lights: "Lumini",
    a_group_notifications: "Notificări",
    a_group_manual: "Manual",
    a_today: "Azi",
    a_yesterday: "Ieri",
    a_t_cool: "Răcire",
    a_t_cool_night: "Răcire, noapte liniștită",
    a_t_off: "Oprit",
    a_t_off_open: "Oprit: o fereastră rămâne deschisă",
    a_t_on: "Pornit: e cald",
    a_t_on_night: "Pornit, noapte liniștită",
    a_t_boost: "Impuls la fereastră",
    a_t_purify: "Impuls: aer poluat",
    a_t_normal: "Revenire la normal",
    a_t_night: "Mod noapte",
    a_t_keep_on: "Repornit",
    a_lighting: "Luminozitatea momentului",
    a_presence_on: "Aprinsă: a intrat cineva",
    a_presence_off: "Stinsă: nu mai e nimeni",
    a_display_off: "Indicator stins",
    a_display_on: "Indicator reaprins",
    a_notified: "Notificare",
    a_cleared: "Notificare ștearsă: totul a revenit la normal",
    a_manual: "Modificat manual: lăsat în pace",
    a_manual_until: "Modificat manual: lăsat în pace până la {time}",
    a_reset: "Revenire la normal (oră fixă)",
    a_failed: "Nu a putut fi trimisă",
    a_all_rooms: "Toate camerele",
  },
  da: {
    annex_alerts: "Standardværdier for birum",
    annex_alerts_help: "Standard-alarmgrænser for birum — kælder, garage, værksted, bryggers, loft. Sæt et rums type til Birum under fanen Rum; hvert rum kan stadig tilsidesætte dem.",
    outdoor_noise: "Udendørs støj",
    quiet_night: "Stille nat",
    to_handle: "Skal håndteres",
    all_rooms: "Alle rum",
    n_ok_rooms: "+ {n} OK",
    n_handled: "{n} håndteret",
    discovered_new: "nyt",
    discovered_updated: "udfyldt",
    discovered_new_outdoor: "nyt",
    discovered_updated_outdoor: "udfyldt",
    discover: "Find",
    discover_help: "Tilføjer et rum for hvert Home Assistant-område med noget at følge (en komfortsensor, et klimaanlæg, en ventilator, en luftrenser eller et dæmpbart lys) og sætter det op: temperatur-, CO₂-, luftfugtigheds- og støjsensorer, PM2.5-, PM10- og luftkvalitetsindekssensorer (også luftrensernes), vinduer og døre, klimaanlæg, ventilatorer og luftrensere med deres forudindstillinger og tilstande. De udendørs områder (have, terrasse…) kommer under Udendørs med deres sensorer for temperatur, luftkvalitet og støj; et luftkvalitetsindeks for byen (Atmo France…) og vejrentiteten, i mangel af en udendørs sensor, kommer på fanen Notifikationer. Stille forudindstillinger og ventilatortilstande bliver natindstillingerne. Det, der allerede er sat, bevares. Kontrollér resultatet, og gem derefter.",
    discover_running: "Søger…",
    discover_result: "Fundet: tilføjede rum: {added}, udfyldte: {updated}, udendørs steder: {outdoors}{outdoor}. Kontrollér dem, og gem derefter.",
    discover_outdoor: ", udendørs sensorer sat",
    discover_none: "Søgningen fandt intet nyt.",
    fan: "Ventilator",
    purifier: "Luftrenser",
    overview: "Oversigt",
    sc_score: "komfort",
    sc_all_good: "Alt er behageligt",
    sc_point: "{n} punkt at holde øje med",
    sc_points: "{n} punkter at holde øje med",
    n_rooms_ok: "{n} rum OK",
    rooms: "Rum",
    alerts: "Advarsler",
    notifications: "Notifikationer",
    dashboards: "Dashboards",
    control: "Styring af enheder",
    save: "Gem",
    discard: "Kassér",
    saved: "Gemt",
    saving: "Gemmer…",
    unsaved: "Ikke-gemte ændringer",
    yaml: "Denne konfiguration kommer fra YAML og kan redigeres her. Når YAML ændres (ved genstart eller med Genindlæs YAML), anvendes kun det ændrede: dine ændringer af de andre indstillinger bevares.",
    yaml_reload: "Genindlæs YAML",
    yaml_reloaded: "YAML anvendt: kun det ændrede er opdateret.",
    yaml_unchanged: "YAML er ikke ændret: intet at anvende.",
    yaml_conflicts: "YAML anvendt. Det erstattede det, der var ændret her, for: {paths}",
    yaml_file: "Denne konfiguration gemmes i {file} i konfigurationsmappen: det, du gemmer her, skrives i den, og ændringer i filen anvendes inden for få sekunder.",
    yaml_help_file: "Indholdet af {file} i konfigurationsmappen (standardværdier gentages ikke).",
    src_title: "Konfigurationens kilde",
    src_status: "Ændret kl. {time} · {rooms} rum · synkroniseret",
    src_status_invalid: "Ændret kl. {time} · ugyldig, ikke anvendt: {error}",
    src_reload: "Genindlæs",
    src_write: "Redigering i panelet",
    src_write_help: "Hver gemning omskriver kun det ændrede i filen, kommentarer og layout bevares · backup .bak.",
    src_watch: "Overvågning af filen",
    src_watch_help: "Læses igen ved hver ændring (også inkluderede filer) · kun det ændrede anvendes.",
    src_included: "Inkluderede filer",
    src_included_help: "{files} · et rum omskrives i sin egen fil.",
    src_create: "Opret {file}",
    src_create_help: "Skriver den aktuelle konfiguration til {file} i konfigurationsmappen; derefter holdes filen og panelet synkroniseret.",
    src_none: "Ingen {file}: konfigurationen gemmes kun af Home Assistant.",
    conflict_title: "Filen blev ændret under redigeringen",
    conflict_sub: "{n} indstillinger ændret i {file} kl. {time}",
    conflict_sub_other: "{n} indstillinger ændret andetsteds (YAML eller et andet vindue)",
    conflict_file: "Fil",
    conflict_panel: "Panel",
    conflict_keep_file: "Behold filen",
    conflict_keep_panel: "Behold panelet",
    not_loaded: "Smart Comfort er ikke indlæst. Tjek logfilerne.",
    not_setup: "Smart Comfort er ikke sat op endnu: tilføj det under Indstillinger → Enheder og tjenester.",
    retry: "Prøv igen",
    active_alerts: "Aktive advarsler",
    no_alerts: "Alt er i orden.",
    outdoor: "Udendørs",
    notifications_on: "Notifikationer til",
    notifications_off: "Notifikationer fra",
    control_on: "Styring af enheder til",
    control_off: "Styring af enheder fra",
    notify_now: "Notificer nu",
    unsnooze: "Annuller udsættelser",
    snooze: "Udsæt",
    acknowledge: "Forstået",
    snoozed: "udsat",
    acknowledged: "kvitteret",
    handled: "håndteret",
    notified: "notificeret",
    pending: "ikke notificeret endnu",
    since: "siden",
    ok: "OK",
    open: "Åbne",
    devices: "Enheder",
    target: "mål",
    manual: "manuel indtil",
    last_notification: "Seneste notifikation",
    add_room: "Tilføj et rum",
    new_room: "Nyt rum",
    remove: "Fjern",
    move_up: "Flyt op",
    move_down: "Flyt ned",
    room_alerts: "Advarsler for dette rum",
    inherit: "Standard",
    enabled: "Til",
    disabled: "Fra",
    climate: "Klimaanlæg",
    fans: "Ventilatorer",
    purifiers: "Luftrensere",
    device_settings: "Indstillinger for denne enhed",
    default_value: "Standard: {value}",
    no_rooms: "Intet rum endnu.",
    outdoor_air: "Udendørs luft",
    outdoors: "Udendørs",
    add_outdoor: "Tilføj et udendørs sted",
    new_outdoor: "Udendørs",
    no_outdoors: "Intet udendørs sted endnu.",
    start: "Kom i gang",
    start_help: "Intet er sat op endnu. Find finder rummene og de udendørs steder i dine Home Assistant-områder med deres sensorer og enheder og sætter dem op; du kontrollerer resultatet på fanen Rum, før du gemmer.",
    no_sensor: "ingen sensor",
    lighting: "Adaptiv belysning",
    lights: "Lys",
    light: "Lys",
    lighting_on: "Adaptiv belysning til",
    lighting_off: "Adaptiv belysning fra",
    nap_start: "Lur fra",
    nap_end: "Indtil",
    nap_days: "Dage",
    nap_days_help: "Ingen: hver dag.",
    nap_entity: "Lur-tidsplan",
    nap_entity_help: "Til: en lur (en tidsplan delt med House Rules, en virtuel kontakt…).",
    day_mon: "man",
    day_tue: "tir",
    day_wed: "ons",
    day_thu: "tor",
    day_fri: "fre",
    day_sat: "lør",
    day_sun: "søn",
    advanced: "Avanceret",
    alerts_help: "Standardværdier for alle rum; hvert rum kan tilpasse sine egne.",
    schedule: "Tidsplan",
    settings: "Indstillinger",
    activity: "Aktivitet",
    activity_help: "Hvad Smart Comfort gjorde og hvorfor, live: enheder, lys, notifikationer, manuelle ændringer. En linje åbner dens entitet.",
    yaml_tab: "YAML",
    yaml_help: "Kun Smart Comforts konfiguration, som den skal stå under smart_comfort: i configuration.yaml (standardværdierne gentages ikke).",
    yaml_help_unsaved: "Kun Smart Comforts konfiguration, som den skal stå under smart_comfort: i configuration.yaml (standardværdierne gentages ikke). Indeholder de ændringer, der ikke er gemt endnu.",
    yaml_copy: "Kopiér",
    yaml_copied: "Kopieret",
    sched_title: "Din dag",
    sched_help: "Hvornår hvert tidsvindue gælder, med klokkeslættet lige nu.",
    sched_edit: "Tidspunkter",
    sched_quiet: "Stille timer",
    sched_quiet_help: "Kun kritiske advarsler sendes; de andre venter til slutningen.",
    sched_night: "Stille nat",
    sched_night_help: "Enhederne kører roligere, ingen vinduesboost, lysene på deres natniveau.",
    sched_morning: "Stille morgen",
    sched_morning_help: "Fra nattens afslutning: lysene i soveværelserne forbliver svagere.",
    sched_boost: "Vinduesboost",
    sched_boost_help: "Ventilatorer og luftrensere på fuld hastighed, mens et vindue er åbent. Begge tomme: hele dagen.",
    sched_displays: "Displays slukket",
    sched_displays_help: "Enhedernes indikatorlys og displays slukket (og under lurene i deres rum). Tomt: den stille nat.",
    sched_from: "Fra",
    sched_to: "Indtil",
    sched_morning_end: "Indtil",
    discover_short: "Finder rummene i dine Home Assistant-områder med deres sensorer, enheder og lys. Intet gemmes, før du har kontrolleret.",
    how: "Sådan virker det",
    less: "Mindre",
    other_outdoor: "Andre udendørs sensorer",
    other_outdoor_help: "Sensorer uden udendørs sted: en vejrentitet, et luftkvalitetsindeks for byen…",
    outdoors_help: "Have, terrasse, altan…: deres sensorer giver udendørstemperatur, luftkvalitet og støj.",
    section_sensors: "Sensorer",
    section_openings: "Vinduer og døre",
    section_devices: "Enheder",
    section_lighting: "Belysning",
    section_alerts: "Advarsler",
    none: "Ingen",
    openings_help: "Deres tilstand holder vinduesadvarsler og -boost tilbage eller udløser dem.",
    naps: "Lure",
    nap: "Lur",
    no_naps: "Ingen lur: tilføj en for at dæmpe lysene på faste tidspunkter.",
    alerts_default: "Standardindstillinger",
    customize_alert: "Tilpas en advarsel",
    room_alerts_help: "Kun de advarsler, der er tilpasset for dette rum; de andre følger fanen Advarsler.",
    lighting_help: "Tændte lys følger tidspunktet på dagen; Smart Comfort tænder eller slukker dem aldrig. Tidspunkterne står på fanen Tidsplan.",
    presence_title: "Lys ved tilstedeværelse",
    presence_help: "Tænder lysene, når nogen kommer ind, og slukker dem, når der ikke er nogen tilbage, som en tilstedeværelsesautomatisering.",
    presence_add: "Lys ved tilstedeværelse",
    presence_remove: "Stop lys ved tilstedeværelse",
    presence_short: "Tilstedeværelse",
    presence_sensors: "Tilstedeværelsessensorer",
    presence_lights: "Lys",
    presence_lights_help: "Tomt: rummets lys. Ethvert lys kan tilføjes (gangens fra indgangen…).",
    presence_lux: "Lysniveausensor",
    presence_max_lux: "Kun under",
    presence_max_lux_help: "Intet lys tændes, når rummet er lysere end dette.",
    presence_off_after: "Sluk efter ingen i",
    presence_on_after: "Tænd efter tilstedeværelse i",
    presence_transition: "Fade",
    presence_on_after_help: "En, der bare går forbi sensoren, tænder ikke lysene.",
    presence_not_during_naps: "Slukket under lurene",
    presence_not_during_naps_help: "Disse lys tændes ikke, mens et rum i huset har lur.",
    slots_help: "Perioder i rækkefølge: den første, der gælder for et lys, bestemmer — holdes slukket eller tændes med sin lysstyrke.",
    slot_add: "Periode",
    slot_lights: "For lysene",
    slot_lights_help: "Tomt: alle tilstedeværelseslysene.",
    slot_off: "Tænd ikke",
    slot_brightness: "Lysstyrke",
    slot_off_after: "Sluk efter ingen i",
    slot_color: "Farve",
    a_empty: "Intet endnu.",
    a_not_loaded: "Smart Comfort er ikke indlæst.",
    a_all: "Alle",
    a_group_devices: "Enheder",
    a_group_lights: "Lys",
    a_group_notifications: "Notifikationer",
    a_group_manual: "Manuelt",
    a_today: "I dag",
    a_yesterday: "I går",
    a_t_cool: "Køler",
    a_t_cool_night: "Køler, stille nat",
    a_t_off: "Slukket",
    a_t_off_open: "Slukket: et vindue står åbent",
    a_t_on: "Tændt: det er varmt",
    a_t_on_night: "Tændt, stille nat",
    a_t_boost: "Vinduesboost",
    a_t_purify: "Boost: forurenet luft",
    a_t_normal: "Tilbage til normal",
    a_t_night: "Nattilstand",
    a_t_keep_on: "Tændt igen",
    a_lighting: "Øjeblikkets lysstyrke",
    a_presence_on: "Tændt: nogen kom ind",
    a_presence_off: "Slukket: ingen tilbage",
    a_display_off: "Indikator slukket",
    a_display_on: "Indikator tændt igen",
    a_notified: "Notifikation",
    a_cleared: "Notifikation ryddet: alt er normalt igen",
    a_manual: "Ændret manuelt: ladet i fred",
    a_manual_until: "Ændret manuelt: ladet i fred indtil {time}",
    a_reset: "Tilbage til normal (fast tidspunkt)",
    a_failed: "Kunne ikke sendes",
    a_all_rooms: "Alle rum",
  },
  sv: {
    annex_alerts: "Standardvärden för biutrymmen",
    annex_alerts_help: "Standardtrösklar för biutrymmen — källare, garage, verkstad, tvättstuga, vind. Ange ett rums typ till Biutrymme på fliken Rum; varje rum kan fortfarande åsidosätta dem.",
    outdoor_noise: "Buller utomhus",
    quiet_night: "Tyst natt",
    to_handle: "Att hantera",
    all_rooms: "Alla rum",
    n_ok_rooms: "+ {n} OK",
    n_handled: "{n} hanterade",
    discovered_new: "nytt",
    discovered_updated: "kompletterat",
    discovered_new_outdoor: "ny",
    discovered_updated_outdoor: "kompletterad",
    discover: "Upptäck",
    discover_help: "Lägger till ett rum för varje Home Assistant-område med något att följa (en komfortsensor, en luftkonditionering, en fläkt, en luftrenare eller en dimbar lampa) och ställer in det: temperatur-, CO₂-, luftfuktighets- och bullersensorer, PM2.5-, PM10- och luftkvalitetsindexsensorer (även luftrenarnas), fönster och dörrar, luftkonditionering, fläktar och luftrenare med deras förinställningar och lägen. Utomhusområdena (trädgård, terrass…) hamnar under Utomhus med sina sensorer för temperatur, luftkvalitet och buller; ett luftkvalitetsindex för staden (Atmo France…) och väderentiteten, i brist på en utomhussensor, hamnar på fliken Aviseringar. Tysta förinställningar och fläktlägen blir nattinställningarna. Det som redan är inställt behålls. Kontrollera resultatet och spara sedan.",
    discover_running: "Söker…",
    discover_result: "Upptäckt: tillagda rum: {added}, kompletterade: {updated}, utomhusplatser: {outdoors}{outdoor}. Kontrollera dem och spara sedan.",
    discover_outdoor: ", utomhussensorer inställda",
    discover_none: "Upptäckten hittade inget nytt.",
    fan: "Fläkt",
    purifier: "Luftrenare",
    overview: "Översikt",
    sc_score: "komfort",
    sc_all_good: "Allt är bekvämt",
    sc_point: "{n} punkt att hålla koll på",
    sc_points: "{n} punkter att hålla koll på",
    n_rooms_ok: "{n} rum OK",
    rooms: "Rum",
    alerts: "Varningar",
    notifications: "Aviseringar",
    dashboards: "Instrumentpaneler",
    control: "Styrning av enheter",
    save: "Spara",
    discard: "Förkasta",
    saved: "Sparat",
    saving: "Sparar…",
    unsaved: "Osparade ändringar",
    yaml: "Den här konfigurationen kommer från YAML och kan redigeras här. När YAML ändras (vid omstart eller med Läs in YAML igen) tillämpas bara det som ändrats: dina ändringar av de andra inställningarna behålls.",
    yaml_reload: "Läs in YAML igen",
    yaml_reloaded: "YAML tillämpad: bara det som ändrats uppdaterades.",
    yaml_unchanged: "YAML har inte ändrats: inget att tillämpa.",
    yaml_conflicts: "YAML tillämpad. Den ersatte det som ändrats här för: {paths}",
    yaml_file: "Den här konfigurationen sparas i {file} i konfigurationsmappen: det du sparar här skrivs till den, och ändringar i filen tillämpas inom några sekunder.",
    yaml_help_file: "Innehållet i {file} i konfigurationsmappen (standardvärden upprepas inte).",
    src_title: "Konfigurationens källa",
    src_status: "Ändrad {time} · {rooms} rum · synkroniserad",
    src_status_invalid: "Ändrad {time} · ogiltig, inte tillämpad: {error}",
    src_reload: "Läs in igen",
    src_write: "Redigering i panelen",
    src_write_help: "Varje sparning skriver bara om det som ändrats i filen, kommentarer och layout behålls · säkerhetskopia .bak.",
    src_watch: "Bevakning av filen",
    src_watch_help: "Läses igen vid varje ändring (även inkluderade filer) · bara det som ändrats tillämpas.",
    src_included: "Inkluderade filer",
    src_included_help: "{files} · ett rum skrivs om i sin egen fil.",
    src_create: "Skapa {file}",
    src_create_help: "Skriver den aktuella konfigurationen till {file} i konfigurationsmappen; sedan hålls filen och panelen synkroniserade.",
    src_none: "Ingen {file}: konfigurationen sparas bara av Home Assistant.",
    conflict_title: "Filen ändrades medan du redigerade",
    conflict_sub: "{n} inställningar ändrade i {file} {time}",
    conflict_sub_other: "{n} inställningar ändrade på annat håll (YAML eller ett annat fönster)",
    conflict_file: "Fil",
    conflict_panel: "Panel",
    conflict_keep_file: "Behåll filen",
    conflict_keep_panel: "Behåll panelen",
    not_loaded: "Smart Comfort är inte inläst. Kontrollera loggarna.",
    not_setup: "Smart Comfort är inte konfigurerat än: lägg till det under Inställningar → Enheter och tjänster.",
    retry: "Försök igen",
    active_alerts: "Aktiva varningar",
    no_alerts: "Allt är i sin ordning.",
    outdoor: "Ute",
    notifications_on: "Aviseringar på",
    notifications_off: "Aviseringar av",
    control_on: "Styrning av enheter på",
    control_off: "Styrning av enheter av",
    notify_now: "Avisera nu",
    unsnooze: "Avbryt snooze",
    snooze: "Snooza",
    acknowledge: "Uppfattat",
    snoozed: "snoozad",
    acknowledged: "kvitterad",
    handled: "hanterad",
    notified: "aviserad",
    pending: "inte aviserad än",
    since: "sedan",
    ok: "OK",
    open: "Öppna",
    devices: "Enheter",
    target: "mål",
    manual: "manuell till",
    last_notification: "Senaste avisering",
    add_room: "Lägg till ett rum",
    new_room: "Nytt rum",
    remove: "Ta bort",
    move_up: "Flytta upp",
    move_down: "Flytta ner",
    room_alerts: "Varningar för detta rum",
    inherit: "Standard",
    enabled: "På",
    disabled: "Av",
    climate: "Luftkonditionering",
    fans: "Fläktar",
    purifiers: "Luftrenare",
    device_settings: "Enhetsinställningar",
    default_value: "Standard: {value}",
    no_rooms: "Inget rum än.",
    outdoor_air: "Utomhusluft",
    outdoors: "Utomhus",
    add_outdoor: "Lägg till en utomhusplats",
    new_outdoor: "Utomhus",
    no_outdoors: "Ingen utomhusplats än.",
    start: "Kom igång",
    start_help: "Inget är konfigurerat än. Upptäck hittar rummen och utomhusplatserna i dina Home Assistant-områden med deras sensorer och enheter och ställer in dem; du kontrollerar resultatet på fliken Rum innan du sparar.",
    no_sensor: "ingen sensor",
    lighting: "Adaptiv belysning",
    lights: "Lampor",
    light: "Lampa",
    lighting_on: "Adaptiv belysning på",
    lighting_off: "Adaptiv belysning av",
    nap_start: "Tupplur från",
    nap_end: "Till",
    nap_days: "Dagar",
    nap_days_help: "Ingen: varje dag.",
    nap_entity: "Tupplursschema",
    nap_entity_help: "På: tupplur (ett schema delat med House Rules, en virtuell brytare…).",
    day_mon: "mån",
    day_tue: "tis",
    day_wed: "ons",
    day_thu: "tors",
    day_fri: "fre",
    day_sat: "lör",
    day_sun: "sön",
    advanced: "Avancerat",
    alerts_help: "Standardvärden för alla rum; varje rum kan anpassa sina egna.",
    schedule: "Schema",
    settings: "Inställningar",
    activity: "Aktivitet",
    activity_help: "Vad Smart Comfort gjorde och varför, live: enheter, lampor, aviseringar, manuella ändringar. En rad öppnar sin entitet.",
    yaml_tab: "YAML",
    yaml_help: "Bara Smart Comforts konfiguration, så som den ska stå under smart_comfort: i configuration.yaml (standardvärdena upprepas inte).",
    yaml_help_unsaved: "Bara Smart Comforts konfiguration, så som den ska stå under smart_comfort: i configuration.yaml (standardvärdena upprepas inte). Inkluderar ändringarna som inte sparats än.",
    yaml_copy: "Kopiera",
    yaml_copied: "Kopierat",
    sched_title: "Din dag",
    sched_help: "När varje tidsfönster gäller, med klockslaget just nu.",
    sched_edit: "Tider",
    sched_quiet: "Tysta timmar",
    sched_quiet_help: "Bara kritiska varningar skickas; de andra väntar till slutet.",
    sched_night: "Tyst natt",
    sched_night_help: "Enheterna går tystare, ingen fönsterboost, lamporna på sin nattnivå.",
    sched_morning: "Tyst morgon",
    sched_morning_help: "Från nattens slut: sovrummens lampor förblir svagare.",
    sched_boost: "Fönsterboost",
    sched_boost_help: "Fläktar och luftrenare på full hastighet medan ett fönster är öppet. Båda tomma: hela dagen.",
    sched_displays: "Displayer av",
    sched_displays_help: "Enheternas indikatorlampor och displayer släckta (och under tupplurarna i deras rum). Tomt: den tysta natten.",
    sched_from: "Från",
    sched_to: "Till",
    sched_morning_end: "Till",
    discover_short: "Hittar rummen i dina Home Assistant-områden med deras sensorer, enheter och lampor. Inget sparas innan du har kontrollerat.",
    how: "Så fungerar det",
    less: "Mindre",
    other_outdoor: "Andra utomhussensorer",
    other_outdoor_help: "Sensorer utan utomhusplats: en väderentitet, ett luftkvalitetsindex för staden…",
    outdoors_help: "Trädgård, terrass, balkong…: deras sensorer ger utomhustemperatur, luftkvalitet och buller.",
    section_sensors: "Sensorer",
    section_openings: "Fönster och dörrar",
    section_devices: "Enheter",
    section_lighting: "Belysning",
    section_alerts: "Varningar",
    none: "Ingen",
    openings_help: "Deras läge håller tillbaka eller utlöser fönstervarningar och boost.",
    naps: "Tupplurar",
    nap: "Tupplur",
    no_naps: "Ingen tupplur: lägg till en för att dimma lamporna vid fasta tider.",
    alerts_default: "Standardinställningar",
    customize_alert: "Anpassa en varning",
    room_alerts_help: "Bara varningarna som anpassats för detta rum; de andra följer fliken Varningar.",
    lighting_help: "Tända lampor följer tiden på dygnet; Smart Comfort tänder eller släcker dem aldrig. Tiderna finns på fliken Schema.",
    presence_title: "Lampor vid närvaro",
    presence_help: "Tänder lamporna när någon kommer in och släcker dem när ingen är kvar, som en närvaroautomation.",
    presence_add: "Lampor vid närvaro",
    presence_remove: "Stoppa lampor vid närvaro",
    presence_short: "Närvaro",
    presence_sensors: "Närvarosensorer",
    presence_lights: "Lampor",
    presence_lights_help: "Tomt: rummets lampor. Vilken lampa som helst kan läggas till (hallens från entrén…).",
    presence_lux: "Ljusnivåsensor",
    presence_max_lux: "Bara under",
    presence_max_lux_help: "Ingen lampa tänds när rummet är ljusare än detta.",
    presence_off_after: "Av efter ingen i",
    presence_on_after: "På efter närvaro i",
    presence_transition: "Tona",
    presence_on_after_help: "Någon som bara går förbi sensorn tänder inte lamporna.",
    presence_not_during_naps: "Av under tupplurarna",
    presence_not_during_naps_help: "Dessa lampor tänds inte medan ett rum i huset har tupplur.",
    slots_help: "Perioder i ordning: den första som gäller för en lampa bestämmer — hålls släckt eller tänds med sin ljusstyrka.",
    slot_add: "Period",
    slot_lights: "För lamporna",
    slot_lights_help: "Tomt: alla närvarolampor.",
    slot_off: "Tänd inte",
    slot_brightness: "Ljusstyrka",
    slot_off_after: "Av efter ingen i",
    slot_color: "Färg",
    a_empty: "Inget än.",
    a_not_loaded: "Smart Comfort är inte inläst.",
    a_all: "Alla",
    a_group_devices: "Enheter",
    a_group_lights: "Lampor",
    a_group_notifications: "Aviseringar",
    a_group_manual: "Manuellt",
    a_today: "Idag",
    a_yesterday: "Igår",
    a_t_cool: "Kyler",
    a_t_cool_night: "Kyler, tyst natt",
    a_t_off: "Av",
    a_t_off_open: "Av: ett fönster står öppet",
    a_t_on: "På: det är varmt",
    a_t_on_night: "På, tyst natt",
    a_t_boost: "Fönsterboost",
    a_t_purify: "Boost: förorenad luft",
    a_t_normal: "Tillbaka till normalt",
    a_t_night: "Nattläge",
    a_t_keep_on: "Påslagen igen",
    a_lighting: "Stundens ljusstyrka",
    a_presence_on: "Tänd: någon kom in",
    a_presence_off: "Släckt: ingen kvar",
    a_display_off: "Indikator av",
    a_display_on: "Indikator på igen",
    a_notified: "Avisering",
    a_cleared: "Avisering rensad: allt är normalt igen",
    a_manual: "Ändrad manuellt: lämnad ifred",
    a_manual_until: "Ändrad manuellt: lämnad ifred till {time}",
    a_reset: "Tillbaka till normalt (fast tid)",
    a_failed: "Kunde inte skickas",
    a_all_rooms: "Alla rum",
  },
  bg: {
    annex_alerts: "Стойности по подразбиране за спомагателни помещения",
    annex_alerts_help: "Прагове за известия по подразбиране за спомагателни помещения — мазе, гараж, работилница, пералня, таван. Задайте типа на помещение на Спомагателно в раздела Помещения; всяко помещение може да ги замени.",
    outdoor_noise: "Външен шум",
    quiet_night: "Тиха нощ",
    to_handle: "За обработка",
    all_rooms: "Всички стаи",
    n_ok_rooms: "+ {n} наред",
    n_handled: "{n} поети",
    discovered_new: "нова",
    discovered_updated: "допълнена",
    discovered_new_outdoor: "ново",
    discovered_updated_outdoor: "допълнено",
    discover: "Откриване",
    discover_help: "Добавя стая за всяка зона на Home Assistant с нещо за следене (сензор за комфорт, климатик, вентилатор, пречиствател или лампа с регулиране) и я настройва: сензори за температура, CO₂, влажност и шум, сензори за PM2.5, PM10 и индекс за качество на въздуха (и тези на пречиствателите), прозорци и врати, климатик, вентилатори и пречистватели с техните предварителни настройки и режими. Външните зони (градина, тераса…) отиват във Външни, със сензорите си за температура, качество на въздуха и шум; градски индекс за качество на въздуха (Atmo France…) и метеорологичният обект, при липса на външен сензор, отиват в раздела Известия. Тихите предварителни настройки и режими на вентилатора стават нощните настройки. Вече зададеното се запазва. Проверете резултата, след това запазете.",
    discover_running: "Откриване…",
    discover_result: "Откриване: добавени стаи: {added}, допълнени: {updated}, външни места: {outdoors}{outdoor}. Проверете ги, след това запазете.",
    discover_outdoor: ", външните сензори са зададени",
    discover_none: "Откриването не намери нищо ново.",
    fan: "Вентилатор",
    purifier: "Пречиствател на въздух",
    overview: "Общ преглед",
    sc_score: "комфорт",
    sc_all_good: "Всичко е комфортно",
    sc_point: "{n} точка за наблюдение",
    sc_points: "{n} точки за наблюдение",
    n_rooms_ok: "{n} стаи са наред",
    rooms: "Стаи",
    alerts: "Сигнали",
    notifications: "Известия",
    dashboards: "Табла",
    control: "Управление на устройствата",
    save: "Запази",
    discard: "Отказ",
    saved: "Запазено",
    saving: "Запазване…",
    unsaved: "Незапазени промени",
    yaml: "Тази конфигурация идва от YAML и може да се редактира тук. Когато YAML се промени (при рестарт или с Презареждане на YAML), се прилага само промененото: вашите промени в другите настройки остават.",
    yaml_reload: "Презареждане на YAML",
    yaml_reloaded: "YAML е приложен: обновено е само промененото.",
    yaml_unchanged: "YAML не е променен: няма какво да се приложи.",
    yaml_conflicts: "YAML е приложен. Замени промененото тук за: {paths}",
    yaml_file: "Тази конфигурация се пази в {file} в папката с конфигурацията: това, което запазите тук, се записва в него, а промените във файла се прилагат до няколко секунди.",
    yaml_help_file: "Съдържанието на {file} в папката с конфигурацията (стойностите по подразбиране не се повтарят).",
    src_title: "Източник на конфигурацията",
    src_status: "Променено в {time} · {rooms} стаи · синхронизирано",
    src_status_invalid: "Променено в {time} · невалидно, не е приложено: {error}",
    src_reload: "Презареди",
    src_write: "Редактиране в панела",
    src_write_help: "Всяко запазване презаписва във файла само промененото, коментарите и форматът се запазват · резервно копие .bak.",
    src_watch: "Наблюдение на файла",
    src_watch_help: "Прочита се отново при всяка промяна (включително включените файлове) · прилага се само промененото.",
    src_included: "Включени файлове",
    src_included_help: "{files} · стая се презаписва в собствения си файл.",
    src_create: "Създай {file}",
    src_create_help: "Записва текущата конфигурация в {file} в папката с конфигурацията; след това файлът и панелът остават синхронизирани.",
    src_none: "Няма {file}: конфигурацията се пази само от Home Assistant.",
    conflict_title: "Файлът се промени по време на редактирането",
    conflict_sub: "{n} настройки променени в {file} в {time}",
    conflict_sub_other: "{n} настройки променени другаде (YAML или друг прозорец)",
    conflict_file: "Файл",
    conflict_panel: "Панел",
    conflict_keep_file: "Запази файла",
    conflict_keep_panel: "Запази панела",
    not_loaded: "Smart Comfort не е зареден. Проверете журналите.",
    not_setup: "Smart Comfort все още не е настроен: добавете го от Настройки → Устройства и услуги.",
    retry: "Опитай отново",
    active_alerts: "Активни сигнали",
    no_alerts: "Всичко е наред.",
    outdoor: "Навън",
    notifications_on: "Известията са включени",
    notifications_off: "Известията са изключени",
    control_on: "Управлението на устройствата е включено",
    control_off: "Управлението на устройствата е изключено",
    notify_now: "Известяване сега",
    unsnooze: "Отмяна на отлаганията",
    snooze: "Отлагане",
    acknowledge: "Разбрах",
    snoozed: "отложен",
    acknowledged: "потвърден",
    handled: "овладян",
    notified: "известен",
    pending: "още не е известен",
    since: "от",
    ok: "OK",
    open: "Отворени",
    devices: "Устройства",
    target: "цел",
    manual: "ръчно до",
    last_notification: "Последно известие",
    add_room: "Добавяне на стая",
    new_room: "Нова стая",
    remove: "Премахване",
    move_up: "Нагоре",
    move_down: "Надолу",
    room_alerts: "Сигнали на тази стая",
    inherit: "По подразбиране",
    enabled: "Вкл.",
    disabled: "Изкл.",
    climate: "Климатик",
    fans: "Вентилатори",
    purifiers: "Пречистватели на въздух",
    device_settings: "Настройки на устройството",
    default_value: "По подразбиране: {value}",
    no_rooms: "Все още няма стаи.",
    outdoor_air: "Външен въздух",
    outdoors: "Външни",
    add_outdoor: "Добавяне на външно място",
    new_outdoor: "Външно място",
    no_outdoors: "Все още няма външни места.",
    start: "Да започваме",
    start_help: "Все още нищо не е настроено. Откриване намира стаите и външните места от зоните на Home Assistant, с техните сензори и устройства, и ги настройва; проверявате резултата в раздела Стаи, преди да запазите.",
    no_sensor: "няма сензор",
    lighting: "Адаптивно осветление",
    lights: "Осветление",
    light: "Лампа",
    lighting_on: "Адаптивното осветление е включено",
    lighting_off: "Адаптивното осветление е изключено",
    nap_start: "Дрямка от",
    nap_end: "До",
    nap_days: "Дни",
    nap_days_help: "Няма: всеки ден.",
    nap_entity: "График за дрямка",
    nap_entity_help: "Включено: дрямка (график, споделен с House Rules, виртуален превключвател…).",
    day_mon: "пн",
    day_tue: "вт",
    day_wed: "ср",
    day_thu: "чт",
    day_fri: "пт",
    day_sat: "сб",
    day_sun: "нд",
    advanced: "Разширени",
    alerts_help: "Стойности по подразбиране за всички стаи; всяка стая може да персонализира своите.",
    schedule: "График",
    settings: "Настройки",
    activity: "Дейност",
    activity_help: "Какво е направил Smart Comfort и защо, на живо: устройства, осветление, известия, ръчни промени. Ред отваря своя обект.",
    yaml_tab: "YAML",
    yaml_help: "Само конфигурацията на Smart Comfort, така както се поставя под smart_comfort: в configuration.yaml (стойностите по подразбиране не се повтарят).",
    yaml_help_unsaved: "Само конфигурацията на Smart Comfort, така както се поставя под smart_comfort: в configuration.yaml (стойностите по подразбиране не се повтарят). Включва още незапазените промени.",
    yaml_copy: "Копиране",
    yaml_copied: "Копирано",
    sched_title: "Вашият ден",
    sched_help: "Кога важи всеки времеви интервал, с текущия час.",
    sched_edit: "Часове",
    sched_quiet: "Тихи часове",
    sched_quiet_help: "Изпращат се само критичните сигнали; останалите чакат края.",
    sched_night: "Тиха нощ",
    sched_night_help: "Устройствата работят по-тихо, без усилване при прозорец, осветлението на нощно ниво.",
    sched_morning: "Тиха сутрин",
    sched_morning_help: "От края на нощта: осветлението в спалните остава по-слабо.",
    sched_boost: "Усилване при прозорец",
    sched_boost_help: "Вентилатори и пречистватели на пълна скорост, докато прозорец е отворен. И двете празни: цял ден.",
    sched_displays: "Дисплеи изключени",
    sched_displays_help: "Светлинните индикатори и дисплеите на устройствата изключени (и по време на следобедния сън в стаята им). Празно: тихата нощ.",
    sched_from: "От",
    sched_to: "До",
    sched_morning_end: "До",
    discover_short: "Намира стаите от зоните на Home Assistant, с техните сензори, устройства и осветление. Нищо не се запазва, преди да проверите.",
    how: "Как работи",
    less: "По-малко",
    other_outdoor: "Други външни сензори",
    other_outdoor_help: "Сензори извън външните места: метеорологичен обект, градски индекс за качество на въздуха…",
    outdoors_help: "Градина, тераса, балкон…: техните сензори дават външната температура, качеството на въздуха и шума.",
    section_sensors: "Сензори",
    section_openings: "Прозорци и врати",
    section_devices: "Устройства",
    section_lighting: "Осветление",
    section_alerts: "Сигнали",
    none: "Няма",
    openings_help: "Състоянието им задържа или задейства сигналите и усилванията при прозорец.",
    naps: "Следобеден сън",
    nap: "Следобеден сън",
    no_naps: "Няма следобеден сън: добавете, за да намалите осветлението в определени часове.",
    alerts_default: "Настройки по подразбиране",
    customize_alert: "Персонализиране на сигнал",
    room_alerts_help: "Само сигналите, персонализирани за тази стая; останалите следват раздела Сигнали.",
    lighting_help: "Включените лампи следват времето от деня; Smart Comfort никога не ги включва и не ги изключва. Часовете са в раздела График.",
    presence_title: "Осветление при присъствие",
    presence_help: "Включва осветлението, когато някой влезе, и го изключва, когато не остане никой, като автоматизация за присъствие.",
    presence_add: "Осветление при присъствие",
    presence_remove: "Спиране на осветлението при присъствие",
    presence_short: "Присъствие",
    presence_sensors: "Сензори за присъствие",
    presence_lights: "Осветление",
    presence_lights_help: "Празно: осветлението на стаята. Може да се добави всяка лампа (тази в коридора от входа…).",
    presence_lux: "Сензор за осветеност",
    presence_max_lux: "Само под",
    presence_max_lux_help: "Не се включва лампа, когато стаята е по-светла от това.",
    presence_off_after: "Изкл. след отсъствие от",
    presence_on_after: "Вкл. след присъствие от",
    presence_transition: "Преход",
    presence_on_after_help: "Някой, който само минава покрай сензора, не включва осветлението.",
    presence_not_during_naps: "Изключено по време на следобедния сън",
    presence_not_during_naps_help: "Тези лампи не се включват, докато в стая от къщата тече следобеден сън.",
    slots_help: "Интервали, по ред: първият, който важи за дадена лампа, решава — остава изключена или се включва със своята яркост.",
    slot_add: "Интервал",
    slot_lights: "За лампите",
    slot_lights_help: "Празно: всички лампи за присъствие.",
    slot_off: "Без включване",
    slot_brightness: "Яркост",
    slot_off_after: "Изкл. след отсъствие от",
    slot_color: "Цвят",
    a_empty: "Все още нищо.",
    a_not_loaded: "Smart Comfort не е зареден.",
    a_all: "Всички",
    a_group_devices: "Устройства",
    a_group_lights: "Осветление",
    a_group_notifications: "Известия",
    a_group_manual: "Ръчно",
    a_today: "Днес",
    a_yesterday: "Вчера",
    a_t_cool: "Охлаждане",
    a_t_cool_night: "Охлаждане, тиха нощ",
    a_t_off: "Изключено",
    a_t_off_open: "Изключено: прозорец остава отворен",
    a_t_on: "Включено: топло е",
    a_t_on_night: "Включено, тиха нощ",
    a_t_boost: "Усилване при прозорец",
    a_t_purify: "Усилване: замърсен въздух",
    a_t_normal: "Връщане към нормалното",
    a_t_night: "Нощен режим",
    a_t_keep_on: "Включено отново",
    a_lighting: "Яркост за момента",
    a_presence_on: "Включено: някой влезе",
    a_presence_off: "Изключено: няма никой",
    a_display_off: "Индикаторът е изключен",
    a_display_on: "Индикаторът е включен отново",
    a_notified: "Известие",
    a_cleared: "Известието е изчистено: всичко е нормално отново",
    a_manual: "Променено ръчно: оставено на мира",
    a_manual_until: "Променено ръчно: оставено на мира до {time}",
    a_reset: "Връщане към нормалното (фиксиран час)",
    a_failed: "Не можа да бъде изпратено",
    a_all_rooms: "Всички стаи",
  },
  ru: {
    annex_alerts: "Значения по умолчанию для подсобных помещений",
    annex_alerts_help: "Пороги оповещений по умолчанию для подсобных помещений — погреб, гараж, мастерская, прачечная, чердак. Укажите тип помещения «Подсобное» на вкладке «Помещения»; каждое помещение может их переопределить.",
    outdoor_noise: "Шум на улице",
    quiet_night: "Тихая ночь",
    to_handle: "К обработке",
    all_rooms: "Все комнаты",
    n_ok_rooms: "+ {n} в норме",
    n_handled: "{n} обработано",
    discovered_new: "новая",
    discovered_updated: "дополнена",
    discovered_new_outdoor: "новое",
    discovered_updated_outdoor: "дополнено",
    discover: "Обнаружить",
    discover_help: "Добавляет комнату для каждого пространства Home Assistant, где есть что отслеживать (датчик комфорта, кондиционер, вентилятор, очиститель или диммируемый светильник), и настраивает её: датчики температуры, CO₂, влажности и шума, датчики PM2.5, PM10 и индекса качества воздуха (в том числе очистителей), окна и двери, кондиционер, вентиляторы и очистители с их предустановками и режимами. Уличные пространства (сад, терраса…) попадают в раздел «Улица» со своими датчиками температуры, качества воздуха и шума; городской индекс качества воздуха (Atmo France…) и объект погоды, при отсутствии уличного датчика, попадают на вкладку «Уведомления». Тихие предустановки и режимы вентилятора становятся ночными настройками. Уже заданное сохраняется. Проверьте результат, затем сохраните.",
    discover_running: "Обнаружение…",
    discover_result: "Обнаружение: добавлено комнат: {added}, дополнено: {updated}, уличных мест: {outdoors}{outdoor}. Проверьте их, затем сохраните.",
    discover_outdoor: ", уличные датчики заданы",
    discover_none: "Обнаружение не нашло ничего нового.",
    fan: "Вентилятор",
    purifier: "Очиститель воздуха",
    overview: "Обзор",
    sc_score: "комфорт",
    sc_all_good: "Всё в порядке",
    sc_point: "{n} момент для внимания",
    sc_points: "{n} момента для внимания",
    n_rooms_ok: "{n} комнат в норме",
    rooms: "Комнаты",
    alerts: "Оповещения",
    notifications: "Уведомления",
    dashboards: "Панели",
    control: "Управление устройствами",
    save: "Сохранить",
    discard: "Отменить",
    saved: "Сохранено",
    saving: "Сохранение…",
    unsaved: "Несохранённые изменения",
    yaml: "Эта конфигурация взята из YAML и может редактироваться здесь. Когда YAML меняется (при перезапуске или через «Перезагрузить YAML»), применяется только изменённое: ваши изменения других настроек сохраняются.",
    yaml_reload: "Перезагрузить YAML",
    yaml_reloaded: "YAML применён: обновлено только изменённое.",
    yaml_unchanged: "YAML не изменился: применять нечего.",
    yaml_conflicts: "YAML применён. Он заменил изменённое здесь для: {paths}",
    yaml_file: "Эта конфигурация хранится в {file} в папке конфигурации: то, что вы сохраняете здесь, записывается в него, а изменения файла применяются за несколько секунд.",
    yaml_help_file: "Содержимое {file} в папке конфигурации (значения по умолчанию не повторяются).",
    src_title: "Источник конфигурации",
    src_status: "Изменено в {time} · {rooms} комнат · синхронизировано",
    src_status_invalid: "Изменено в {time} · недействительно, не применено: {error}",
    src_reload: "Перезагрузить",
    src_write: "Редактирование в панели",
    src_write_help: "Каждое сохранение переписывает в файле только изменённое, комментарии и оформление сохраняются · копия .bak.",
    src_watch: "Отслеживание файла",
    src_watch_help: "Перечитывается при каждом изменении (включая подключённые файлы) · применяется только изменённое.",
    src_included: "Подключённые файлы",
    src_included_help: "{files} · комната переписывается в своём файле.",
    src_create: "Создать {file}",
    src_create_help: "Записывает текущую конфигурацию в {file} в папке конфигурации; затем файл и панель остаются синхронизированы.",
    src_none: "Нет {file}: конфигурацию хранит только Home Assistant.",
    conflict_title: "Файл изменился во время редактирования",
    conflict_sub: "{n} настроек изменено в {file} в {time}",
    conflict_sub_other: "{n} настроек изменено в другом месте (YAML или другое окно)",
    conflict_file: "Файл",
    conflict_panel: "Панель",
    conflict_keep_file: "Оставить файл",
    conflict_keep_panel: "Оставить панель",
    not_loaded: "Smart Comfort не загружен. Проверьте журналы.",
    not_setup: "Smart Comfort ещё не настроен: добавьте его в Настройки → Устройства и службы.",
    retry: "Повторить",
    active_alerts: "Активные оповещения",
    no_alerts: "Всё в порядке.",
    outdoor: "Улица",
    notifications_on: "Уведомления включены",
    notifications_off: "Уведомления выключены",
    control_on: "Управление устройствами включено",
    control_off: "Управление устройствами выключено",
    notify_now: "Уведомить сейчас",
    unsnooze: "Отменить откладывания",
    snooze: "Отложить",
    acknowledge: "Понятно",
    snoozed: "отложено",
    acknowledged: "подтверждено",
    handled: "устройство справляется",
    notified: "уведомлено",
    pending: "ещё не уведомлено",
    since: "с",
    ok: "OK",
    open: "Открыто",
    devices: "Устройства",
    target: "цель",
    manual: "вручную до",
    last_notification: "Последнее уведомление",
    add_room: "Добавить комнату",
    new_room: "Новая комната",
    remove: "Удалить",
    move_up: "Вверх",
    move_down: "Вниз",
    room_alerts: "Оповещения этой комнаты",
    inherit: "По умолчанию",
    enabled: "Вкл.",
    disabled: "Выкл.",
    climate: "Кондиционер",
    fans: "Вентиляторы",
    purifiers: "Очистители воздуха",
    device_settings: "Настройки устройства",
    default_value: "По умолчанию: {value}",
    no_rooms: "Комнат пока нет.",
    outdoor_air: "Воздух на улице",
    outdoors: "Улица",
    add_outdoor: "Добавить уличное место",
    new_outdoor: "Улица",
    no_outdoors: "Уличных мест пока нет.",
    start: "Начать",
    start_help: "Пока ничего не настроено. «Обнаружить» находит комнаты и уличные места в пространствах Home Assistant с их датчиками и устройствами и настраивает их; вы проверяете результат на вкладке «Комнаты» перед сохранением.",
    no_sensor: "нет датчика",
    lighting: "Адаптивное освещение",
    lights: "Освещение",
    light: "Светильник",
    lighting_on: "Адаптивное освещение включено",
    lighting_off: "Адаптивное освещение выключено",
    nap_start: "Дневной сон с",
    nap_end: "До",
    nap_days: "Дни",
    nap_days_help: "Не выбрано: каждый день.",
    nap_entity: "Расписание дневного сна",
    nap_entity_help: "Включено: дневной сон (расписание, общее с House Rules, виртуальный переключатель…).",
    day_mon: "Пн",
    day_tue: "Вт",
    day_wed: "Ср",
    day_thu: "Чт",
    day_fri: "Пт",
    day_sat: "Сб",
    day_sun: "Вс",
    advanced: "Дополнительно",
    alerts_help: "Значения по умолчанию для всех комнат; каждая комната может настроить свои.",
    schedule: "Расписание",
    settings: "Настройки",
    activity: "Активность",
    activity_help: "Что сделал Smart Comfort и почему, в реальном времени: устройства, освещение, уведомления, ручные изменения. Строка открывает свой объект.",
    yaml_tab: "YAML",
    yaml_help: "Только конфигурация Smart Comfort, в том виде, в каком она пишется под smart_comfort: в configuration.yaml (значения по умолчанию не повторяются).",
    yaml_help_unsaved: "Только конфигурация Smart Comfort, в том виде, в каком она пишется под smart_comfort: в configuration.yaml (значения по умолчанию не повторяются). Включает ещё не сохранённые изменения.",
    yaml_copy: "Копировать",
    yaml_copied: "Скопировано",
    sched_title: "Ваш день",
    sched_help: "Когда действует каждый временной интервал, с текущим временем.",
    sched_edit: "Время",
    sched_quiet: "Тихие часы",
    sched_quiet_help: "Отправляются только критические оповещения; остальные ждут конца.",
    sched_night: "Тихая ночь",
    sched_night_help: "Устройства работают тише, без усиления при открытом окне, свет на ночном уровне.",
    sched_morning: "Тихое утро",
    sched_morning_help: "С конца ночи: свет в спальнях остаётся приглушённым.",
    sched_boost: "Усиление при открытом окне",
    sched_boost_help: "Вентиляторы и очистители на полной скорости, пока окно открыто. Оба поля пустые: весь день.",
    sched_displays: "Дисплеи выключены",
    sched_displays_help: "Индикаторы и дисплеи устройств выключены (и во время дневного сна в их комнате). Пусто: тихая ночь.",
    sched_from: "С",
    sched_to: "До",
    sched_morning_end: "До",
    discover_short: "Находит комнаты в пространствах Home Assistant с их датчиками, устройствами и светильниками. Ничего не сохраняется, пока вы не проверите.",
    how: "Как это работает",
    less: "Свернуть",
    other_outdoor: "Другие уличные датчики",
    other_outdoor_help: "Датчики вне уличных мест: объект погоды, городской индекс качества воздуха…",
    outdoors_help: "Сад, терраса, балкон…: их датчики дают температуру, качество воздуха и шум на улице.",
    section_sensors: "Датчики",
    section_openings: "Окна и двери",
    section_devices: "Устройства",
    section_lighting: "Освещение",
    section_alerts: "Оповещения",
    none: "Нет",
    openings_help: "Их состояние сдерживает или запускает оповещения и усиление, связанные с окнами.",
    naps: "Дневной сон",
    nap: "Дневной сон",
    no_naps: "Нет дневного сна: добавьте, чтобы приглушать свет в заданное время.",
    alerts_default: "Настройки по умолчанию",
    customize_alert: "Настроить оповещение",
    room_alerts_help: "Только оповещения, настроенные для этой комнаты; остальные следуют вкладке «Оповещения».",
    lighting_help: "Включённые светильники следуют за временем суток; Smart Comfort никогда их не включает и не выключает. Время задаётся на вкладке «Расписание».",
    presence_title: "Свет по присутствию",
    presence_help: "Включает свет, когда кто-то входит, и выключает, когда никого не осталось, как автоматизация присутствия.",
    presence_add: "Свет по присутствию",
    presence_remove: "Отключить свет по присутствию",
    presence_short: "Присутствие",
    presence_sensors: "Датчики присутствия",
    presence_lights: "Освещение",
    presence_lights_help: "Пусто: светильники комнаты. Можно добавить любой светильник (в коридоре — от входа…).",
    presence_lux: "Датчик освещённости",
    presence_max_lux: "Только ниже",
    presence_max_lux_help: "Свет не включается, если в комнате светлее этого.",
    presence_off_after: "Выкл. после отсутствия",
    presence_on_after: "Вкл. после присутствия",
    presence_transition: "Затухание",
    presence_on_after_help: "Если кто-то просто проходит мимо датчика, свет не включается.",
    presence_not_during_naps: "Выключен во время дневного сна",
    presence_not_during_naps_help: "Эти светильники не включаются, пока в какой-либо комнате дома дневной сон.",
    slots_help: "Интервалы по порядку: первый подходящий для светильника решает — оставить выключенным или включить на его яркости.",
    slot_add: "Интервал",
    slot_lights: "Для светильников",
    slot_lights_help: "Пусто: все светильники присутствия.",
    slot_off: "Не включать",
    slot_brightness: "Яркость",
    slot_off_after: "Выкл. после отсутствия",
    slot_color: "Цвет",
    a_empty: "Пока ничего.",
    a_not_loaded: "Smart Comfort не загружен.",
    a_all: "Всё",
    a_group_devices: "Устройства",
    a_group_lights: "Освещение",
    a_group_notifications: "Уведомления",
    a_group_manual: "Вручную",
    a_today: "Сегодня",
    a_yesterday: "Вчера",
    a_t_cool: "Охлаждение",
    a_t_cool_night: "Охлаждение, тихая ночь",
    a_t_off: "Выключено",
    a_t_off_open: "Выключено: окно остаётся открытым",
    a_t_on: "Включено: жарко",
    a_t_on_night: "Включено, тихая ночь",
    a_t_boost: "Усиление при открытом окне",
    a_t_purify: "Усиление: загрязнённый воздух",
    a_t_normal: "Возврат к обычному",
    a_t_night: "Ночной режим",
    a_t_keep_on: "Снова включено",
    a_lighting: "Яркость для текущего времени",
    a_presence_on: "Включено: кто-то вошёл",
    a_presence_off: "Выключено: никого не осталось",
    a_display_off: "Индикатор выключен",
    a_display_on: "Индикатор снова включён",
    a_notified: "Уведомление",
    a_cleared: "Уведомление удалено: всё снова в норме",
    a_manual: "Изменено вручную: не трогаем",
    a_manual_until: "Изменено вручную: не трогаем до {time}",
    a_reset: "Возврат к обычному (заданное время)",
    a_failed: "Не удалось отправить",
    a_all_rooms: "Все комнаты",
  },
  uk: {
    annex_alerts: "Значення за замовчуванням для підсобних приміщень",
    annex_alerts_help: "Порогові значення сповіщень за замовчуванням для підсобних приміщень — погріб, гараж, майстерня, пральня, горище. Виберіть тип приміщення «Підсобне» на вкладці «Приміщення»; кожне приміщення може їх перевизначити.",
    outdoor_noise: "Шум надворі",
    quiet_night: "Тиха ніч",
    to_handle: "До опрацювання",
    all_rooms: "Усі кімнати",
    n_ok_rooms: "+ {n} в нормі",
    n_handled: "{n} опрацьовано",
    discovered_new: "нова",
    discovered_updated: "доповнено",
    discovered_new_outdoor: "нове",
    discovered_updated_outdoor: "доповнено",
    discover: "Виявити",
    discover_help: "Додає кімнату для кожного простору Home Assistant, де є що відстежувати (датчик комфорту, кондиціонер, вентилятор, очищувач або світильник із регулюванням яскравості), і налаштовує її: датчики температури, CO₂, вологості та шуму, датчики PM2.5, PM10 та індексу якості повітря (зокрема очищувачів), вікна й двері, кондиціонер, вентилятори й очищувачі з їхніми передустановками та режимами. Вуличні простори (сад, тераса…) потрапляють до розділу «Надворі» зі своїми датчиками температури, якості повітря й шуму; міський індекс якості повітря (Atmo France…) і об'єкт погоди, за відсутності вуличного датчика, потрапляють на вкладку «Сповіщення». Тихі передустановки й режими вентилятора стають нічними налаштуваннями. Уже задане зберігається. Перевірте результат, потім збережіть.",
    discover_running: "Виявлення…",
    discover_result: "Виявлення: додано кімнат: {added}, доповнено: {updated}, вуличних місць: {outdoors}{outdoor}. Перевірте їх, потім збережіть.",
    discover_outdoor: ", вуличні датчики задано",
    discover_none: "Виявлення не знайшло нічого нового.",
    fan: "Вентилятор",
    purifier: "Очищувач повітря",
    overview: "Огляд",
    sc_score: "комфорт",
    sc_all_good: "Усе гаразд",
    sc_point: "{n} момент для уваги",
    sc_points: "{n} моменти для уваги",
    n_rooms_ok: "{n} кімнат у нормі",
    rooms: "Кімнати",
    alerts: "Попередження",
    notifications: "Сповіщення",
    dashboards: "Панелі",
    control: "Керування пристроями",
    save: "Зберегти",
    discard: "Відхилити",
    saved: "Збережено",
    saving: "Збереження…",
    unsaved: "Незбережені зміни",
    yaml: "Ця конфігурація взята з YAML і може редагуватися тут. Коли YAML змінюється (під час перезапуску або через «Перезавантажити YAML»), застосовується лише змінене: ваші зміни інших налаштувань зберігаються.",
    yaml_reload: "Перезавантажити YAML",
    yaml_reloaded: "YAML застосовано: оновлено лише змінене.",
    yaml_unchanged: "YAML не змінився: нічого застосовувати.",
    yaml_conflicts: "YAML застосовано. Він замінив змінене тут для: {paths}",
    yaml_file: "Ця конфігурація зберігається в {file} у теці конфігурації: те, що ви зберігаєте тут, записується в нього, а зміни файлу застосовуються за кілька секунд.",
    yaml_help_file: "Вміст {file} у теці конфігурації (типові значення не повторюються).",
    src_title: "Джерело конфігурації",
    src_status: "Змінено о {time} · {rooms} кімнат · синхронізовано",
    src_status_invalid: "Змінено о {time} · недійсне, не застосовано: {error}",
    src_reload: "Перезавантажити",
    src_write: "Редагування в панелі",
    src_write_help: "Кожне збереження переписує у файлі лише змінене, коментарі та оформлення зберігаються · копія .bak.",
    src_watch: "Стеження за файлом",
    src_watch_help: "Перечитується після кожної зміни (разом із підключеними файлами) · застосовується лише змінене.",
    src_included: "Підключені файли",
    src_included_help: "{files} · кімната переписується у власному файлі.",
    src_create: "Створити {file}",
    src_create_help: "Записує поточну конфігурацію в {file} у теці конфігурації; далі файл і панель лишаються синхронізованими.",
    src_none: "Немає {file}: конфігурацію зберігає лише Home Assistant.",
    conflict_title: "Файл змінився під час редагування",
    conflict_sub: "{n} налаштувань змінено в {file} о {time}",
    conflict_sub_other: "{n} налаштувань змінено деінде (YAML або інше вікно)",
    conflict_file: "Файл",
    conflict_panel: "Панель",
    conflict_keep_file: "Залишити файл",
    conflict_keep_panel: "Залишити панель",
    not_loaded: "Smart Comfort не завантажено. Перевірте журнали.",
    not_setup: "Smart Comfort ще не налаштовано: додайте його в Налаштування → Пристрої та служби.",
    retry: "Повторити",
    active_alerts: "Активні попередження",
    no_alerts: "Усе гаразд.",
    outdoor: "Надворі",
    notifications_on: "Сповіщення увімкнено",
    notifications_off: "Сповіщення вимкнено",
    control_on: "Керування пристроями увімкнено",
    control_off: "Керування пристроями вимкнено",
    notify_now: "Сповістити зараз",
    unsnooze: "Скасувати відкладення",
    snooze: "Відкласти",
    acknowledge: "Зрозуміло",
    snoozed: "відкладено",
    acknowledged: "підтверджено",
    handled: "пристрій дає раду",
    notified: "сповіщено",
    pending: "ще не сповіщено",
    since: "з",
    ok: "OK",
    open: "Відчинено",
    devices: "Пристрої",
    target: "ціль",
    manual: "вручну до",
    last_notification: "Останнє сповіщення",
    add_room: "Додати кімнату",
    new_room: "Нова кімната",
    remove: "Видалити",
    move_up: "Вгору",
    move_down: "Вниз",
    room_alerts: "Попередження цієї кімнати",
    inherit: "За замовчуванням",
    enabled: "Увімк.",
    disabled: "Вимк.",
    climate: "Кондиціонер",
    fans: "Вентилятори",
    purifiers: "Очищувачі повітря",
    device_settings: "Налаштування пристрою",
    default_value: "За замовчуванням: {value}",
    no_rooms: "Кімнат поки немає.",
    outdoor_air: "Повітря надворі",
    outdoors: "Надворі",
    add_outdoor: "Додати вуличне місце",
    new_outdoor: "Надворі",
    no_outdoors: "Вуличних місць поки немає.",
    start: "Почати",
    start_help: "Поки нічого не налаштовано. «Виявити» знаходить кімнати й вуличні місця у просторах Home Assistant з їхніми датчиками та пристроями й налаштовує їх; ви перевіряєте результат на вкладці «Кімнати» перед збереженням.",
    no_sensor: "немає датчика",
    lighting: "Адаптивне освітлення",
    lights: "Освітлення",
    light: "Світильник",
    lighting_on: "Адаптивне освітлення увімкнено",
    lighting_off: "Адаптивне освітлення вимкнено",
    nap_start: "Денний сон з",
    nap_end: "До",
    nap_days: "Дні",
    nap_days_help: "Не вибрано: щодня.",
    nap_entity: "Розклад денного сну",
    nap_entity_help: "Увімкнено: денний сон (розклад, спільний з House Rules, віртуальний перемикач…).",
    day_mon: "Пн",
    day_tue: "Вт",
    day_wed: "Ср",
    day_thu: "Чт",
    day_fri: "Пт",
    day_sat: "Сб",
    day_sun: "Нд",
    advanced: "Додатково",
    alerts_help: "Значення за замовчуванням для всіх кімнат; кожна кімната може налаштувати свої.",
    schedule: "Розклад",
    settings: "Налаштування",
    activity: "Активність",
    activity_help: "Що зробив Smart Comfort і чому, наживо: пристрої, освітлення, сповіщення, ручні зміни. Рядок відкриває свій об'єкт.",
    yaml_tab: "YAML",
    yaml_help: "Лише конфігурація Smart Comfort, у тому вигляді, як вона пишеться під smart_comfort: у configuration.yaml (значення за замовчуванням не повторюються).",
    yaml_help_unsaved: "Лише конфігурація Smart Comfort, у тому вигляді, як вона пишеться під smart_comfort: у configuration.yaml (значення за замовчуванням не повторюються). Містить ще не збережені зміни.",
    yaml_copy: "Копіювати",
    yaml_copied: "Скопійовано",
    sched_title: "Ваш день",
    sched_help: "Коли діє кожен часовий проміжок, із поточним часом.",
    sched_edit: "Час",
    sched_quiet: "Тихі години",
    sched_quiet_help: "Надсилаються лише критичні попередження; інші чекають кінця.",
    sched_night: "Тиха ніч",
    sched_night_help: "Пристрої працюють тихіше, без посилення при відчиненому вікні, світло на нічному рівні.",
    sched_morning: "Тихий ранок",
    sched_morning_help: "З кінця ночі: світло в спальнях лишається приглушеним.",
    sched_boost: "Посилення при відчиненому вікні",
    sched_boost_help: "Вентилятори й очищувачі на повній швидкості, поки вікно відчинене. Обидва поля порожні: увесь день.",
    sched_displays: "Дисплеї вимкнено",
    sched_displays_help: "Індикатори та дисплеї пристроїв вимкнено (і під час денного сну в їхній кімнаті). Порожньо: тиха ніч.",
    sched_from: "З",
    sched_to: "До",
    sched_morning_end: "До",
    discover_short: "Знаходить кімнати у просторах Home Assistant з їхніми датчиками, пристроями й світильниками. Нічого не зберігається, доки ви не перевірите.",
    how: "Як це працює",
    less: "Згорнути",
    other_outdoor: "Інші вуличні датчики",
    other_outdoor_help: "Датчики поза вуличними місцями: об'єкт погоди, міський індекс якості повітря…",
    outdoors_help: "Сад, тераса, балкон…: їхні датчики дають температуру, якість повітря й шум надворі.",
    section_sensors: "Датчики",
    section_openings: "Вікна й двері",
    section_devices: "Пристрої",
    section_lighting: "Освітлення",
    section_alerts: "Попередження",
    none: "Немає",
    openings_help: "Їхній стан стримує або запускає попередження й посилення, пов'язані з вікнами.",
    naps: "Денний сон",
    nap: "Денний сон",
    no_naps: "Немає денного сну: додайте, щоб приглушувати світло в заданий час.",
    alerts_default: "Налаштування за замовчуванням",
    customize_alert: "Налаштувати попередження",
    room_alerts_help: "Лише попередження, налаштовані для цієї кімнати; інші йдуть за вкладкою «Попередження».",
    lighting_help: "Увімкнені світильники йдуть за часом доби; Smart Comfort ніколи їх не вмикає і не вимикає. Час задається на вкладці «Розклад».",
    presence_title: "Світло за присутністю",
    presence_help: "Вмикає світло, коли хтось заходить, і вимикає, коли нікого не лишилося, як автоматизація присутності.",
    presence_add: "Світло за присутністю",
    presence_remove: "Вимкнути світло за присутністю",
    presence_short: "Присутність",
    presence_sensors: "Датчики присутності",
    presence_lights: "Освітлення",
    presence_lights_help: "Порожньо: світильники кімнати. Можна додати будь-який світильник (у коридорі — від входу…).",
    presence_lux: "Датчик освітленості",
    presence_max_lux: "Лише нижче",
    presence_max_lux_help: "Світло не вмикається, коли в кімнаті світліше за це.",
    presence_off_after: "Вимк. після відсутності",
    presence_on_after: "Увімк. після присутності",
    presence_transition: "Згасання",
    presence_on_after_help: "Якщо хтось лише проходить повз датчик, світло не вмикається.",
    presence_not_during_naps: "Вимкнено під час денного сну",
    presence_not_during_naps_help: "Ці світильники не вмикаються, поки в будь-якій кімнаті будинку денний сон.",
    slots_help: "Проміжки по черзі: перший, що підходить для світильника, вирішує — залишити вимкненим чи увімкнути на його яскравості.",
    slot_add: "Проміжок",
    slot_lights: "Для світильників",
    slot_lights_help: "Порожньо: усі світильники присутності.",
    slot_off: "Не вмикати",
    slot_brightness: "Яскравість",
    slot_off_after: "Вимк. після відсутності",
    slot_color: "Колір",
    a_empty: "Поки нічого.",
    a_not_loaded: "Smart Comfort не завантажено.",
    a_all: "Усе",
    a_group_devices: "Пристрої",
    a_group_lights: "Освітлення",
    a_group_notifications: "Сповіщення",
    a_group_manual: "Вручну",
    a_today: "Сьогодні",
    a_yesterday: "Учора",
    a_t_cool: "Охолодження",
    a_t_cool_night: "Охолодження, тиха ніч",
    a_t_off: "Вимкнено",
    a_t_off_open: "Вимкнено: вікно лишається відчиненим",
    a_t_on: "Увімкнено: спекотно",
    a_t_on_night: "Увімкнено, тиха ніч",
    a_t_boost: "Посилення при відчиненому вікні",
    a_t_purify: "Посилення: забруднене повітря",
    a_t_normal: "Повернення до звичайного",
    a_t_night: "Нічний режим",
    a_t_keep_on: "Знову увімкнено",
    a_lighting: "Яскравість для поточного часу",
    a_presence_on: "Увімкнено: хтось зайшов",
    a_presence_off: "Вимкнено: нікого не лишилося",
    a_display_off: "Індикатор вимкнено",
    a_display_on: "Індикатор знову увімкнено",
    a_notified: "Сповіщення",
    a_cleared: "Сповіщення прибрано: усе знову гаразд",
    a_manual: "Змінено вручну: не чіпаємо",
    a_manual_until: "Змінено вручну: не чіпаємо до {time}",
    a_reset: "Повернення до звичайного (заданий час)",
    a_failed: "Не вдалося надіслати",
    a_all_rooms: "Усі кімнати",
  },
  hu: {
    annex_alerts: "Melléképületek alapértékei",
    annex_alerts_help: "Alapértelmezett riasztási küszöbök melléképületekhez — pince, garázs, műhely, mosókonyha, padlás. Állítsd a helyiség típusát Melléképületre a Helyiségek lapon; minden helyiség felülírhatja ezeket.",
    outdoor_noise: "Kültéri zaj",
    quiet_night: "Csendes éjszaka",
    to_handle: "Teendő",
    all_rooms: "Minden helyiség",
    n_ok_rooms: "+ {n} rendben",
    n_handled: "{n} kezelve",
    discovered_new: "új",
    discovered_updated: "kiegészítve",
    discovered_new_outdoor: "új",
    discovered_updated_outdoor: "kiegészítve",
    discover: "Felderítés",
    discover_help: "Minden olyan Home Assistant területhez, ahol van mit követni (komfortérzékelő, klíma, ventilátor, légtisztító vagy szabályozható fényerejű lámpa), hozzáad egy helyiséget, és beállítja: hőmérséklet-, CO₂-, páratartalom- és zajérzékelők, PM2.5-, PM10- és levegőminőségi index érzékelők (a légtisztítóké is), ablakok és ajtók, klíma, ventilátorok és légtisztítók az előbeállításaikkal és módjaikkal. A kültéri területek (kert, terasz…) a Kültér alá kerülnek a hőmérséklet-, levegőminőség- és zajérzékelőikkel; egy városi levegőminőségi index (Atmo France…) és az időjárás-entitás, kültéri érzékelő hiányában, az Értesítések lapra kerül. A csendes előbeállítások és ventilátormódok lesznek az éjszakai beállítások. Ami már be van állítva, az megmarad. Ellenőrizze az eredményt, majd mentsen.",
    discover_running: "Felderítés…",
    discover_result: "Felderítés: hozzáadott helyiségek: {added}, kiegészítve: {updated}, kültéri helyek: {outdoors}{outdoor}. Ellenőrizze őket, majd mentsen.",
    discover_outdoor: ", kültéri érzékelők beállítva",
    discover_none: "A felderítés nem talált semmi újat.",
    fan: "Ventilátor",
    purifier: "Légtisztító",
    overview: "Áttekintés",
    sc_score: "komfort",
    sc_all_good: "Minden rendben van",
    sc_point: "{n} figyelendő pont",
    sc_points: "{n} figyelendő pont",
    n_rooms_ok: "{n} szoba rendben",
    rooms: "Helyiségek",
    alerts: "Riasztások",
    notifications: "Értesítések",
    dashboards: "Irányítópultok",
    control: "Eszközvezérlés",
    save: "Mentés",
    discard: "Elvetés",
    saved: "Mentve",
    saving: "Mentés…",
    unsaved: "Nem mentett módosítások",
    yaml: "Ez a konfiguráció YAML-ből származik, és itt szerkeszthető. Ha a YAML változik (újraindításkor vagy a YAML újratöltése gombbal), csak a változás kerül alkalmazásra: a többi beállításon végzett módosításai megmaradnak.",
    yaml_reload: "YAML újratöltése",
    yaml_reloaded: "YAML alkalmazva: csak a változások frissültek.",
    yaml_unchanged: "A YAML nem változott: nincs mit alkalmazni.",
    yaml_conflicts: "YAML alkalmazva. Felülírta az itt módosítottakat ezeknél: {paths}",
    yaml_file: "Ez a konfiguráció a konfigurációs mappa {file} fájljában van: amit itt ment, beleíródik, a fájl módosításai pedig másodperceken belül érvénybe lépnek.",
    yaml_help_file: "A konfigurációs mappa {file} fájljának tartalma (az alapértékek nem ismétlődnek).",
    src_title: "A konfiguráció forrása",
    src_status: "Módosítva: {time} · {rooms} helyiség · szinkronban",
    src_status_invalid: "Módosítva: {time} · érvénytelen, nincs alkalmazva: {error}",
    src_reload: "Újratöltés",
    src_write: "Szerkesztés a panelen",
    src_write_help: "Minden mentés csak a változást írja a fájlba, a megjegyzések és a formázás megmaradnak · .bak mentés.",
    src_watch: "Fájlfigyelés",
    src_watch_help: "Minden módosításkor újraolvasva (a beillesztett fájlok is) · csak a változás kerül alkalmazásra.",
    src_included: "Beillesztett fájlok",
    src_included_help: "{files} · egy helyiség a saját fájljába íródik.",
    src_create: "{file} létrehozása",
    src_create_help: "A használt konfigurációt a konfigurációs mappa {file} fájljába írja; ezután a fájl és a panel szinkronban marad.",
    src_none: "Nincs {file}: a konfigurációt csak a Home Assistant tárolja.",
    conflict_title: "A fájl megváltozott szerkesztés közben",
    conflict_sub: "{n} beállítás módosult itt: {file}, {time}",
    conflict_sub_other: "{n} beállítás máshol módosult (YAML vagy másik ablak)",
    conflict_file: "Fájl",
    conflict_panel: "Panel",
    conflict_keep_file: "Fájl megtartása",
    conflict_keep_panel: "Panel megtartása",
    not_loaded: "A Smart Comfort nincs betöltve. Nézze meg a naplókat.",
    not_setup: "A Smart Comfort még nincs beállítva: adja hozzá a Beállítások → Eszközök és szolgáltatások menüben.",
    retry: "Újra",
    active_alerts: "Aktív riasztások",
    no_alerts: "Minden rendben.",
    outdoor: "Kint",
    notifications_on: "Értesítések be",
    notifications_off: "Értesítések ki",
    control_on: "Eszközvezérlés be",
    control_off: "Eszközvezérlés ki",
    notify_now: "Értesítés most",
    unsnooze: "Szundik törlése",
    snooze: "Szundi",
    acknowledge: "Értem",
    snoozed: "szundizva",
    acknowledged: "nyugtázva",
    handled: "kezelve",
    notified: "értesítve",
    pending: "még nincs értesítve",
    since: "kezdete:",
    ok: "OK",
    open: "Nyitva",
    devices: "Eszközök",
    target: "cél",
    manual: "kézi eddig:",
    last_notification: "Utolsó értesítés",
    add_room: "Helyiség hozzáadása",
    new_room: "Új helyiség",
    remove: "Eltávolítás",
    move_up: "Fel",
    move_down: "Le",
    room_alerts: "A helyiség riasztásai",
    inherit: "Alapértelmezett",
    enabled: "Be",
    disabled: "Ki",
    climate: "Klíma",
    fans: "Ventilátorok",
    purifiers: "Légtisztítók",
    device_settings: "Az eszköz beállításai",
    default_value: "Alapértelmezett: {value}",
    no_rooms: "Még nincs helyiség.",
    outdoor_air: "Kültéri levegő",
    outdoors: "Kültér",
    add_outdoor: "Kültéri hely hozzáadása",
    new_outdoor: "Kültér",
    no_outdoors: "Még nincs kültéri hely.",
    start: "Kezdjük",
    start_help: "Még semmi sincs beállítva. A Felderítés megkeresi a Home Assistant területeiből a helyiségeket és kültéri helyeket az érzékelőikkel és eszközeikkel, és beállítja őket; mentés előtt a Helyiségek lapon ellenőrzi az eredményt.",
    no_sensor: "nincs érzékelő",
    lighting: "Adaptív világítás",
    lights: "Lámpák",
    light: "Lámpa",
    lighting_on: "Adaptív világítás be",
    lighting_off: "Adaptív világítás ki",
    nap_start: "Szunyókálás ettől",
    nap_end: "Eddig",
    nap_days: "Napok",
    nap_days_help: "Egyik sem: minden nap.",
    nap_entity: "Szundi ütemezés",
    nap_entity_help: "Be: szundi (a House Rules-szal közös ütemezés, virtuális kapcsoló…).",
    day_mon: "H",
    day_tue: "K",
    day_wed: "Sze",
    day_thu: "Cs",
    day_fri: "P",
    day_sat: "Szo",
    day_sun: "V",
    advanced: "Haladó",
    alerts_help: "Alapértékek minden helyiségre; minden helyiség testre szabhatja a sajátjait.",
    schedule: "Ütemezés",
    settings: "Beállítások",
    activity: "Tevékenység",
    activity_help: "Mit csinált a Smart Comfort és miért, élőben: eszközök, lámpák, értesítések, kézi módosítások. Egy sor megnyitja az entitását.",
    yaml_tab: "YAML",
    yaml_help: "Csak a Smart Comfort konfigurációja, ahogy a configuration.yaml fájlban a smart_comfort: alá kerül (az alapértékek nem ismétlődnek).",
    yaml_help_unsaved: "Csak a Smart Comfort konfigurációja, ahogy a configuration.yaml fájlban a smart_comfort: alá kerül (az alapértékek nem ismétlődnek). Tartalmazza a még nem mentett módosításokat.",
    yaml_copy: "Másolás",
    yaml_copied: "Másolva",
    sched_title: "Az Ön napja",
    sched_help: "Mikor érvényes az egyes idősávok, a mostani idővel.",
    sched_edit: "Időpontok",
    sched_quiet: "Csendes órák",
    sched_quiet_help: "Csak kritikus riasztások mennek ki; a többi a végére vár.",
    sched_night: "Csendes éjszaka",
    sched_night_help: "Az eszközök halkabban mennek, nincs ablakos rásegítés, a lámpák éjszakai szinten.",
    sched_morning: "Csendes reggel",
    sched_morning_help: "Az éjszaka végétől: a hálószobák lámpái halványabbak maradnak.",
    sched_boost: "Ablakos rásegítés",
    sched_boost_help: "Ventilátorok és légtisztítók teljes sebességen, amíg egy ablak nyitva van. Mindkettő üres: egész nap.",
    sched_displays: "Kijelzők kikapcsolva",
    sched_displays_help: "Az eszközök jelzőfényei és kijelzői kikapcsolva (és a helyiségük szunyókálásai alatt). Üres: a csendes éjszaka.",
    sched_from: "Ettől",
    sched_to: "Eddig",
    sched_morning_end: "Eddig",
    discover_short: "Megkeresi a Home Assistant területeiből a helyiségeket az érzékelőikkel, eszközeikkel és lámpáikkal. Semmi sem mentődik, mielőtt ellenőrizné.",
    how: "Hogyan működik",
    less: "Kevesebb",
    other_outdoor: "Egyéb kültéri érzékelők",
    other_outdoor_help: "Kültéri helyhez nem tartozó érzékelők: időjárás-entitás, városi levegőminőségi index…",
    outdoors_help: "Kert, terasz, erkély…: érzékelőik adják a kültéri hőmérsékletet, levegőminőséget és zajt.",
    section_sensors: "Érzékelők",
    section_openings: "Ablakok és ajtók",
    section_devices: "Eszközök",
    section_lighting: "Világítás",
    section_alerts: "Riasztások",
    none: "Nincs",
    openings_help: "Állapotuk visszatartja vagy kiváltja az ablakokkal kapcsolatos riasztásokat és rásegítéseket.",
    naps: "Szunyókálások",
    nap: "Szunyókálás",
    no_naps: "Nincs szunyókálás: adjon hozzá egyet, hogy adott időpontokban halványítsa a lámpákat.",
    alerts_default: "Alapbeállítások",
    customize_alert: "Riasztás testreszabása",
    room_alerts_help: "Csak az ehhez a helyiséghez testre szabott riasztások; a többi a Riasztások lapot követi.",
    lighting_help: "A bekapcsolt lámpák a napszakot követik; a Smart Comfort soha nem kapcsolja be vagy ki őket. Az időpontok az Ütemezés lapon vannak.",
    presence_title: "Jelenlét-alapú világítás",
    presence_help: "Bekapcsolja a lámpákat, ha valaki belép, és lekapcsolja, ha már senki sincs bent, mint egy jelenlét-automatizálás.",
    presence_add: "Jelenlét-alapú világítás",
    presence_remove: "Jelenlét-alapú világítás leállítása",
    presence_short: "Jelenlét",
    presence_sensors: "Jelenlétérzékelők",
    presence_lights: "Lámpák",
    presence_lights_help: "Üres: a helyiség lámpái. Bármely lámpa hozzáadható (a folyosóé a bejárattól…).",
    presence_lux: "Fényerőérzékelő",
    presence_max_lux: "Csak ez alatt",
    presence_max_lux_help: "Nem kapcsol fel lámpát, ha a helyiség ennél világosabb.",
    presence_off_after: "Kikapcsolás távollét után",
    presence_on_after: "Bekapcsolás jelenlét után",
    presence_transition: "Áttűnés",
    presence_on_after_help: "Aki csak elmegy az érzékelő mellett, nem kapcsolja fel a lámpákat.",
    presence_not_during_naps: "Kikapcsolva szunyókálás alatt",
    presence_not_during_naps_help: "Ezek a lámpák nem kapcsolnak be, amíg a ház valamelyik helyiségében szunyókálás van.",
    slots_help: "Idősávok sorrendben: az első, amely egy lámpára érvényes, dönt — kikapcsolva marad, vagy a saját fényerején bekapcsol.",
    slot_add: "Idősáv",
    slot_lights: "Ezekhez a lámpákhoz",
    slot_lights_help: "Üres: az összes jelenlét-lámpa.",
    slot_off: "Ne kapcsoljon be",
    slot_brightness: "Fényerő",
    slot_off_after: "Kikapcsolás távollét után",
    slot_color: "Szín",
    a_empty: "Még semmi.",
    a_not_loaded: "A Smart Comfort nincs betöltve.",
    a_all: "Mind",
    a_group_devices: "Eszközök",
    a_group_lights: "Lámpák",
    a_group_notifications: "Értesítések",
    a_group_manual: "Kézzel",
    a_today: "Ma",
    a_yesterday: "Tegnap",
    a_t_cool: "Hűtés",
    a_t_cool_night: "Hűtés, csendes éjszaka",
    a_t_off: "Ki",
    a_t_off_open: "Ki: egy ablak nyitva marad",
    a_t_on: "Be: meleg van",
    a_t_on_night: "Be, csendes éjszaka",
    a_t_boost: "Ablakos rásegítés",
    a_t_purify: "Rásegítés: szennyezett levegő",
    a_t_normal: "Vissza a normálra",
    a_t_night: "Éjszakai mód",
    a_t_keep_on: "Újra bekapcsolva",
    a_lighting: "A pillanatnyi fényerő",
    a_presence_on: "Be: valaki belépett",
    a_presence_off: "Ki: senki sincs bent",
    a_display_off: "Jelzőfény ki",
    a_display_on: "Jelzőfény újra be",
    a_notified: "Értesítés",
    a_cleared: "Értesítés törölve: minden újra rendben",
    a_manual: "Kézzel módosítva: békén hagyva",
    a_manual_until: "Kézzel módosítva: békén hagyva eddig: {time}",
    a_reset: "Vissza a normálra (rögzített idő)",
    a_failed: "Nem sikerült elküldeni",
    a_all_rooms: "Minden helyiség",
  },
  sk: {
    annex_alerts: "Predvolené hodnoty pre vedľajšie priestory",
    annex_alerts_help: "Predvolené prahy upozornení pre vedľajšie priestory — pivnica, garáž, dielňa, práčovňa, povala. Nastav typ miestnosti na Vedľajší priestor na karte Miestnosti; každá miestnosť ich môže prepísať.",
    outdoor_noise: "Vonkajší hluk",
    quiet_night: "Tichá noc",
    to_handle: "Na vybavenie",
    all_rooms: "Všetky miestnosti",
    n_ok_rooms: "+ {n} v poriadku",
    n_handled: "{n} vybavené",
    discovered_new: "nová",
    discovered_updated: "doplnená",
    discovered_new_outdoor: "nové",
    discovered_updated_outdoor: "doplnené",
    discover: "Objaviť",
    discover_help: "Pridá miestnosť pre každú oblasť Home Assistant, kde je čo sledovať (senzor komfortu, klimatizácia, ventilátor, čistička alebo stmievateľné svetlo), a nastaví ju: senzory teploty, CO₂, vlhkosti a hluku, senzory PM2,5, PM10 a indexu kvality vzduchu (aj tie na čističkách), okná a dvere, klimatizáciu, ventilátory a čističky s ich predvoľbami a režimami. Vonkajšie oblasti (záhrada, terasa…) idú do časti Vonku so svojimi senzormi teploty, kvality vzduchu a hluku; mestský index kvality vzduchu (Atmo France…) a entita počasia, ak chýba vonkajší senzor, idú na kartu Oznámenia. Tiché predvoľby a režimy ventilátora sa stanú nočnými nastaveniami. Čo je už nastavené, sa zachová. Skontrolujte výsledok a potom uložte.",
    discover_running: "Objavovanie…",
    discover_result: "Objavovanie: pridané miestnosti: {added}, doplnené: {updated}, vonkajšie miesta: {outdoors}{outdoor}. Skontrolujte ich a potom uložte.",
    discover_outdoor: ", vonkajšie senzory nastavené",
    discover_none: "Objavovanie nenašlo nič nové.",
    fan: "Ventilátor",
    purifier: "Čistička vzduchu",
    overview: "Prehľad",
    sc_score: "komfort",
    sc_all_good: "Všetko je v poriadku",
    sc_point: "{n} bod na sledovanie",
    sc_points: "{n} body na sledovanie",
    n_rooms_ok: "{n} miestností OK",
    rooms: "Miestnosti",
    alerts: "Upozornenia",
    notifications: "Oznámenia",
    dashboards: "Dashboardy",
    control: "Ovládanie zariadení",
    save: "Uložiť",
    discard: "Zahodiť",
    saved: "Uložené",
    saving: "Ukladá sa…",
    unsaved: "Neuložené zmeny",
    yaml: "Táto konfigurácia pochádza z YAML a dá sa tu upravovať. Keď sa YAML zmení (pri reštarte alebo cez Znova načítať YAML), použije sa len to, čo sa zmenilo: vaše zmeny ostatných nastavení zostanú.",
    yaml_reload: "Znova načítať YAML",
    yaml_reloaded: "YAML použitý: aktualizovalo sa len to, čo sa zmenilo.",
    yaml_unchanged: "YAML sa nezmenil: nie je čo použiť.",
    yaml_conflicts: "YAML použitý. Nahradil to, čo bolo tu zmenené, pre: {paths}",
    yaml_file: "Táto konfigurácia sa uchováva v {file} v priečinku konfigurácie: čo tu uložíte, zapíše sa doň, a zmeny súboru sa použijú do niekoľkých sekúnd.",
    yaml_help_file: "Obsah {file} v priečinku konfigurácie (predvolené hodnoty sa neopakujú).",
    src_title: "Zdroj konfigurácie",
    src_status: "Zmenené o {time} · {rooms} miestností · synchronizované",
    src_status_invalid: "Zmenené o {time} · neplatné, nepoužité: {error}",
    src_reload: "Znova načítať",
    src_write: "Úpravy v paneli",
    src_write_help: "Každé uloženie prepíše v súbore len to, čo sa zmenilo, komentáre a formátovanie zostanú · záloha .bak.",
    src_watch: "Sledovanie súboru",
    src_watch_help: "Znova načítané pri každej zmene (aj vložené súbory) · použije sa len to, čo sa zmenilo.",
    src_included: "Vložené súbory",
    src_included_help: "{files} · miestnosť sa prepisuje vo vlastnom súbore.",
    src_create: "Vytvoriť {file}",
    src_create_help: "Zapíše aktuálnu konfiguráciu do {file} v priečinku konfigurácie; súbor a panel potom zostávajú synchronizované.",
    src_none: "Žiadny {file}: konfiguráciu uchováva len Home Assistant.",
    conflict_title: "Súbor sa zmenil počas úprav",
    conflict_sub: "{n} nastavení zmenených v {file} o {time}",
    conflict_sub_other: "{n} nastavení zmenených inde (YAML alebo iné okno)",
    conflict_file: "Súbor",
    conflict_panel: "Panel",
    conflict_keep_file: "Ponechať súbor",
    conflict_keep_panel: "Ponechať panel",
    not_loaded: "Smart Comfort nie je načítaný. Skontrolujte záznamy.",
    not_setup: "Smart Comfort ešte nie je nastavený: pridajte ho v Nastavenia → Zariadenia a služby.",
    retry: "Skúsiť znova",
    active_alerts: "Aktívne upozornenia",
    no_alerts: "Všetko je v poriadku.",
    outdoor: "Vonku",
    notifications_on: "Oznámenia zapnuté",
    notifications_off: "Oznámenia vypnuté",
    control_on: "Ovládanie zariadení zapnuté",
    control_off: "Ovládanie zariadení vypnuté",
    notify_now: "Oznámiť teraz",
    unsnooze: "Zrušiť odloženia",
    snooze: "Odložiť",
    acknowledge: "Rozumiem",
    snoozed: "odložené",
    acknowledged: "potvrdené",
    handled: "rieši sa",
    notified: "oznámené",
    pending: "ešte neoznámené",
    since: "od",
    ok: "OK",
    open: "Otvorené",
    devices: "Zariadenia",
    target: "cieľ",
    manual: "ručne do",
    last_notification: "Posledné oznámenie",
    add_room: "Pridať miestnosť",
    new_room: "Nová miestnosť",
    remove: "Odstrániť",
    move_up: "Posunúť vyššie",
    move_down: "Posunúť nižšie",
    room_alerts: "Upozornenia tejto miestnosti",
    inherit: "Predvolené",
    enabled: "Zap.",
    disabled: "Vyp.",
    climate: "Klimatizácia",
    fans: "Ventilátory",
    purifiers: "Čističky vzduchu",
    device_settings: "Nastavenia zariadenia",
    default_value: "Predvolené: {value}",
    no_rooms: "Zatiaľ žiadna miestnosť.",
    outdoor_air: "Vonkajší vzduch",
    outdoors: "Vonku",
    add_outdoor: "Pridať vonkajšie miesto",
    new_outdoor: "Vonku",
    no_outdoors: "Zatiaľ žiadne vonkajšie miesto.",
    start: "Začíname",
    start_help: "Zatiaľ nie je nič nastavené. Objaviť nájde miestnosti a vonkajšie miesta z oblastí Home Assistant s ich senzormi a zariadeniami a nastaví ich; výsledok skontrolujete na karte Miestnosti pred uložením.",
    no_sensor: "bez senzora",
    lighting: "Adaptívne osvetlenie",
    lights: "Svetlá",
    light: "Svetlo",
    lighting_on: "Adaptívne osvetlenie zapnuté",
    lighting_off: "Adaptívne osvetlenie vypnuté",
    nap_start: "Zdriemnutie od",
    nap_end: "Do",
    nap_days: "Dni",
    nap_days_help: "Žiadny: každý deň.",
    nap_entity: "Plán zdriemnutia",
    nap_entity_help: "Zapnuté: zdriemnutie (plán zdieľaný s House Rules, virtuálny prepínač…).",
    day_mon: "po",
    day_tue: "ut",
    day_wed: "st",
    day_thu: "št",
    day_fri: "pi",
    day_sat: "so",
    day_sun: "ne",
    advanced: "Rozšírené",
    alerts_help: "Predvolené hodnoty pre všetky miestnosti; každá miestnosť si môže prispôsobiť vlastné.",
    schedule: "Plán",
    settings: "Nastavenia",
    activity: "Aktivita",
    activity_help: "Čo Smart Comfort urobil a prečo, naživo: zariadenia, svetlá, oznámenia, ručné zmeny. Riadok otvorí svoju entitu.",
    yaml_tab: "YAML",
    yaml_help: "Len konfigurácia Smart Comfort, tak ako patrí pod smart_comfort: v configuration.yaml (predvolené hodnoty sa neopakujú).",
    yaml_help_unsaved: "Len konfigurácia Smart Comfort, tak ako patrí pod smart_comfort: v configuration.yaml (predvolené hodnoty sa neopakujú). Obsahuje aj ešte neuložené zmeny.",
    yaml_copy: "Kopírovať",
    yaml_copied: "Skopírované",
    sched_title: "Váš deň",
    sched_help: "Kedy platí ktoré časové okno, s aktuálnym časom.",
    sched_edit: "Časy",
    sched_quiet: "Tiché hodiny",
    sched_quiet_help: "Posielajú sa len kritické upozornenia; ostatné čakajú na koniec.",
    sched_night: "Tichá noc",
    sched_night_help: "Zariadenia bežia tichšie, bez posilnenia pri okne, svetlá na nočnej úrovni.",
    sched_morning: "Tiché ráno",
    sched_morning_help: "Od konca noci: svetlá v spálňach zostávajú tlmenejšie.",
    sched_boost: "Posilnenie pri okne",
    sched_boost_help: "Ventilátory a čističky na plný výkon, kým je okno otvorené. Obe prázdne: celý deň.",
    sched_displays: "Displeje vypnuté",
    sched_displays_help: "Kontrolky a displeje zariadení vypnuté (aj počas zdriemnutí v ich miestnosti). Prázdne: tichá noc.",
    sched_from: "Od",
    sched_to: "Do",
    sched_morning_end: "Do",
    discover_short: "Nájde miestnosti z oblastí Home Assistant s ich senzormi, zariadeniami a svetlami. Nič sa neuloží, kým to neskontrolujete.",
    how: "Ako to funguje",
    less: "Menej",
    other_outdoor: "Ďalšie vonkajšie senzory",
    other_outdoor_help: "Senzory mimo vonkajších miest: entita počasia, mestský index kvality vzduchu…",
    outdoors_help: "Záhrada, terasa, balkón…: ich senzory poskytujú vonkajšiu teplotu, kvalitu vzduchu a hluk.",
    section_sensors: "Senzory",
    section_openings: "Okná a dvere",
    section_devices: "Zariadenia",
    section_lighting: "Osvetlenie",
    section_alerts: "Upozornenia",
    none: "Žiadne",
    openings_help: "Ich stav zadržiava alebo spúšťa upozornenia a posilnenia súvisiace s oknami.",
    naps: "Zdriemnutia",
    nap: "Zdriemnutie",
    no_naps: "Žiadne zdriemnutie: pridajte ho, aby sa svetlá v stanovených časoch stlmili.",
    alerts_default: "Predvolené nastavenia",
    customize_alert: "Prispôsobiť upozornenie",
    room_alerts_help: "Len upozornenia prispôsobené pre túto miestnosť; ostatné sa riadia kartou Upozornenia.",
    lighting_help: "Rozsvietené svetlá sledujú dennú dobu; Smart Comfort ich nikdy nezapína ani nevypína. Časy sú na karte Plán.",
    presence_title: "Svetlá podľa prítomnosti",
    presence_help: "Rozsvieti svetlá, keď niekto vojde, a zhasne ich, keď už nikto nezostane, ako automatizácia prítomnosti.",
    presence_add: "Svetlá podľa prítomnosti",
    presence_remove: "Zrušiť svetlá podľa prítomnosti",
    presence_short: "Prítomnosť",
    presence_sensors: "Senzory prítomnosti",
    presence_lights: "Svetlá",
    presence_lights_help: "Prázdne: svetlá miestnosti. Pridať sa dá akékoľvek svetlo (na chodbe od vchodu…).",
    presence_lux: "Senzor osvetlenia",
    presence_max_lux: "Len pod",
    presence_max_lux_help: "Žiadne svetlo sa nerozsvieti, keď je v miestnosti jasnejšie.",
    presence_off_after: "Zhasnúť po neprítomnosti",
    presence_on_after: "Rozsvietiť po prítomnosti",
    presence_transition: "Stmievanie",
    presence_on_after_help: "Niekto, kto len prejde okolo senzora, svetlá nerozsvieti.",
    presence_not_during_naps: "Zhasnuté počas zdriemnutí",
    presence_not_during_naps_help: "Tieto svetlá sa nerozsvietia, kým má niektorá miestnosť v dome zdriemnutie.",
    slots_help: "Časy v poradí: prvý, ktorý platí pre svetlo, rozhodne — zostane zhasnuté alebo sa rozsvieti na svoj jas.",
    slot_add: "Čas",
    slot_lights: "Pre svetlá",
    slot_lights_help: "Prázdne: všetky svetlá prítomnosti.",
    slot_off: "Nerozsvecovať",
    slot_brightness: "Jas",
    slot_off_after: "Zhasnúť po neprítomnosti",
    slot_color: "Farba",
    a_empty: "Zatiaľ nič.",
    a_not_loaded: "Smart Comfort nie je načítaný.",
    a_all: "Všetko",
    a_group_devices: "Zariadenia",
    a_group_lights: "Svetlá",
    a_group_notifications: "Oznámenia",
    a_group_manual: "Ručne",
    a_today: "Dnes",
    a_yesterday: "Včera",
    a_t_cool: "Chladenie",
    a_t_cool_night: "Chladenie, tichá noc",
    a_t_off: "Vypnuté",
    a_t_off_open: "Vypnuté: okno zostáva otvorené",
    a_t_on: "Zapnuté: je teplo",
    a_t_on_night: "Zapnuté, tichá noc",
    a_t_boost: "Posilnenie pri okne",
    a_t_purify: "Posilnenie: znečistený vzduch",
    a_t_normal: "Návrat do normálu",
    a_t_night: "Nočný režim",
    a_t_keep_on: "Znova zapnuté",
    a_lighting: "Jas pre danú chvíľu",
    a_presence_on: "Rozsvietené: niekto vošiel",
    a_presence_off: "Zhasnuté: nikto nezostal",
    a_display_off: "Kontrolka vypnutá",
    a_display_on: "Kontrolka znova zapnutá",
    a_notified: "Oznámenie",
    a_cleared: "Oznámenie vymazané: všetko je opäť v norme",
    a_manual: "Zmenené ručne: ponechané tak",
    a_manual_until: "Zmenené ručne: ponechané tak do {time}",
    a_reset: "Návrat do normálu (pevný čas)",
    a_failed: "Nepodarilo sa odoslať",
    a_all_rooms: "Všetky miestnosti",
  },
  cs: {
    annex_alerts: "Výchozí hodnoty pro vedlejší prostory",
    annex_alerts_help: "Výchozí prahy upozornění pro vedlejší prostory — sklep, garáž, dílna, prádelna, půda. Nastav typ místnosti na Vedlejší prostor na kartě Místnosti; každá místnost je může přepsat.",
    outdoor_noise: "Venkovní hluk",
    quiet_night: "Tichá noc",
    to_handle: "K vyřízení",
    all_rooms: "Všechny místnosti",
    n_ok_rooms: "+ {n} v pořádku",
    n_handled: "{n} vyřízeno",
    discovered_new: "nová",
    discovered_updated: "doplněná",
    discovered_new_outdoor: "nové",
    discovered_updated_outdoor: "doplněné",
    discover: "Objevit",
    discover_help: "Přidá místnost pro každou oblast Home Assistant, kde je co sledovat (senzor komfortu, klimatizace, ventilátor, čistička nebo stmívatelné světlo), a nastaví ji: senzory teploty, CO₂, vlhkosti a hluku, senzory PM2,5, PM10 a indexu kvality vzduchu (i ty na čističkách), okna a dveře, klimatizaci, ventilátory a čističky s jejich předvolbami a režimy. Venkovní oblasti (zahrada, terasa…) jdou do části Venku se svými senzory teploty, kvality vzduchu a hluku; městský index kvality vzduchu (Atmo France…) a entita počasí, pokud chybí venkovní senzor, jdou na kartu Oznámení. Tiché předvolby a režimy ventilátoru se stanou nočním nastavením. Co je už nastaveno, zůstane zachováno. Zkontrolujte výsledek a pak uložte.",
    discover_running: "Objevování…",
    discover_result: "Objevování: přidané místnosti: {added}, doplněné: {updated}, venkovní místa: {outdoors}{outdoor}. Zkontrolujte je a pak uložte.",
    discover_outdoor: ", venkovní senzory nastaveny",
    discover_none: "Objevování nenašlo nic nového.",
    fan: "Ventilátor",
    purifier: "Čistička vzduchu",
    overview: "Přehled",
    sc_score: "komfort",
    sc_all_good: "Vše je v pořádku",
    sc_point: "{n} bod ke sledování",
    sc_points: "{n} body ke sledování",
    n_rooms_ok: "{n} místností OK",
    rooms: "Místnosti",
    alerts: "Upozornění",
    notifications: "Oznámení",
    dashboards: "Řídicí panely",
    control: "Ovládání zařízení",
    save: "Uložit",
    discard: "Zahodit",
    saved: "Uloženo",
    saving: "Ukládání…",
    unsaved: "Neuložené změny",
    yaml: "Tato konfigurace pochází z YAML a lze ji zde upravovat. Když se YAML změní (při restartu nebo přes Znovu načíst YAML), použije se jen to, co se změnilo: vaše změny ostatních nastavení zůstanou.",
    yaml_reload: "Znovu načíst YAML",
    yaml_reloaded: "YAML použit: aktualizovalo se jen to, co se změnilo.",
    yaml_unchanged: "YAML se nezměnil: není co použít.",
    yaml_conflicts: "YAML použit. Nahradil to, co bylo změněno zde, pro: {paths}",
    yaml_file: "Tato konfigurace se uchovává v {file} ve složce konfigurace: co zde uložíte, se do něj zapíše, a změny souboru se použijí během několika sekund.",
    yaml_help_file: "Obsah {file} ve složce konfigurace (výchozí hodnoty se neopakují).",
    src_title: "Zdroj konfigurace",
    src_status: "Změněno v {time} · {rooms} místností · synchronizováno",
    src_status_invalid: "Změněno v {time} · neplatné, nepoužito: {error}",
    src_reload: "Znovu načíst",
    src_write: "Úpravy v panelu",
    src_write_help: "Každé uložení přepíše v souboru jen to, co se změnilo, komentáře a formátování zůstanou · záloha .bak.",
    src_watch: "Sledování souboru",
    src_watch_help: "Znovu načteno při každé změně (i vložené soubory) · použije se jen to, co se změnilo.",
    src_included: "Vložené soubory",
    src_included_help: "{files} · místnost se přepisuje ve vlastním souboru.",
    src_create: "Vytvořit {file}",
    src_create_help: "Zapíše aktuální konfiguraci do {file} ve složce konfigurace; soubor a panel pak zůstávají synchronizované.",
    src_none: "Žádný {file}: konfiguraci uchovává jen Home Assistant.",
    conflict_title: "Soubor se změnil během úprav",
    conflict_sub: "{n} nastavení změněno v {file} v {time}",
    conflict_sub_other: "{n} nastavení změněno jinde (YAML nebo jiné okno)",
    conflict_file: "Soubor",
    conflict_panel: "Panel",
    conflict_keep_file: "Ponechat soubor",
    conflict_keep_panel: "Ponechat panel",
    not_loaded: "Smart Comfort není načten. Zkontrolujte protokoly.",
    not_setup: "Smart Comfort zatím není nastaven: přidejte ho v Nastavení → Zařízení a služby.",
    retry: "Zkusit znovu",
    active_alerts: "Aktivní upozornění",
    no_alerts: "Vše je v pořádku.",
    outdoor: "Venku",
    notifications_on: "Oznámení zapnuta",
    notifications_off: "Oznámení vypnuta",
    control_on: "Ovládání zařízení zapnuto",
    control_off: "Ovládání zařízení vypnuto",
    notify_now: "Oznámit nyní",
    unsnooze: "Zrušit odložení",
    snooze: "Odložit",
    acknowledge: "Rozumím",
    snoozed: "odloženo",
    acknowledged: "potvrzeno",
    handled: "řeší se",
    notified: "oznámeno",
    pending: "zatím neoznámeno",
    since: "od",
    ok: "OK",
    open: "Otevřeno",
    devices: "Zařízení",
    target: "cíl",
    manual: "ručně do",
    last_notification: "Poslední oznámení",
    add_room: "Přidat místnost",
    new_room: "Nová místnost",
    remove: "Odebrat",
    move_up: "Posunout nahoru",
    move_down: "Posunout dolů",
    room_alerts: "Upozornění této místnosti",
    inherit: "Výchozí",
    enabled: "Zap.",
    disabled: "Vyp.",
    climate: "Klimatizace",
    fans: "Ventilátory",
    purifiers: "Čističky vzduchu",
    device_settings: "Nastavení zařízení",
    default_value: "Výchozí: {value}",
    no_rooms: "Zatím žádná místnost.",
    outdoor_air: "Venkovní vzduch",
    outdoors: "Venku",
    add_outdoor: "Přidat venkovní místo",
    new_outdoor: "Venku",
    no_outdoors: "Zatím žádné venkovní místo.",
    start: "Začínáme",
    start_help: "Zatím není nic nastaveno. Objevit najde místnosti a venkovní místa z oblastí Home Assistant s jejich senzory a zařízeními a nastaví je; výsledek zkontrolujete na kartě Místnosti před uložením.",
    no_sensor: "bez senzoru",
    lighting: "Adaptivní osvětlení",
    lights: "Světla",
    light: "Světlo",
    lighting_on: "Adaptivní osvětlení zapnuto",
    lighting_off: "Adaptivní osvětlení vypnuto",
    nap_start: "Zdřímnutí od",
    nap_end: "Do",
    nap_days: "Dny",
    nap_days_help: "Žádný: každý den.",
    nap_entity: "Plán zdřímnutí",
    nap_entity_help: "Zapnuto: zdřímnutí (plán sdílený s House Rules, virtuální přepínač…).",
    day_mon: "po",
    day_tue: "út",
    day_wed: "st",
    day_thu: "čt",
    day_fri: "pá",
    day_sat: "so",
    day_sun: "ne",
    advanced: "Pokročilé",
    alerts_help: "Výchozí hodnoty pro všechny místnosti; každá místnost si může přizpůsobit vlastní.",
    schedule: "Plán",
    settings: "Nastavení",
    activity: "Aktivita",
    activity_help: "Co Smart Comfort udělal a proč, živě: zařízení, světla, oznámení, ruční změny. Řádek otevře svou entitu.",
    yaml_tab: "YAML",
    yaml_help: "Jen konfigurace Smart Comfort, tak jak patří pod smart_comfort: v configuration.yaml (výchozí hodnoty se neopakují).",
    yaml_help_unsaved: "Jen konfigurace Smart Comfort, tak jak patří pod smart_comfort: v configuration.yaml (výchozí hodnoty se neopakují). Obsahuje i dosud neuložené změny.",
    yaml_copy: "Kopírovat",
    yaml_copied: "Zkopírováno",
    sched_title: "Váš den",
    sched_help: "Kdy platí které časové okno, s aktuálním časem.",
    sched_edit: "Časy",
    sched_quiet: "Tiché hodiny",
    sched_quiet_help: "Posílají se jen kritická upozornění; ostatní čekají na konec.",
    sched_night: "Tichá noc",
    sched_night_help: "Zařízení běží tišeji, bez posílení u okna, světla na noční úrovni.",
    sched_morning: "Tiché ráno",
    sched_morning_help: "Od konce noci: světla v ložnicích zůstávají tlumenější.",
    sched_boost: "Posílení u okna",
    sched_boost_help: "Ventilátory a čističky na plný výkon, dokud je okno otevřené. Obě prázdné: celý den.",
    sched_displays: "Displeje vypnuté",
    sched_displays_help: "Kontrolky a displeje zařízení vypnuté (i během zdřímnutí v jejich místnosti). Prázdné: tichá noc.",
    sched_from: "Od",
    sched_to: "Do",
    sched_morning_end: "Do",
    discover_short: "Najde místnosti z oblastí Home Assistant s jejich senzory, zařízeními a světly. Nic se neuloží, dokud to nezkontrolujete.",
    how: "Jak to funguje",
    less: "Méně",
    other_outdoor: "Další venkovní senzory",
    other_outdoor_help: "Senzory mimo venkovní místa: entita počasí, městský index kvality vzduchu…",
    outdoors_help: "Zahrada, terasa, balkon…: jejich senzory poskytují venkovní teplotu, kvalitu vzduchu a hluk.",
    section_sensors: "Senzory",
    section_openings: "Okna a dveře",
    section_devices: "Zařízení",
    section_lighting: "Osvětlení",
    section_alerts: "Upozornění",
    none: "Žádné",
    openings_help: "Jejich stav zadržuje nebo spouští upozornění a posílení související s okny.",
    naps: "Zdřímnutí",
    nap: "Zdřímnutí",
    no_naps: "Žádné zdřímnutí: přidejte ho, aby se světla ve stanovených časech ztlumila.",
    alerts_default: "Výchozí nastavení",
    customize_alert: "Přizpůsobit upozornění",
    room_alerts_help: "Jen upozornění přizpůsobená pro tuto místnost; ostatní se řídí kartou Upozornění.",
    lighting_help: "Rozsvícená světla sledují denní dobu; Smart Comfort je nikdy nezapíná ani nevypíná. Časy jsou na kartě Plán.",
    presence_title: "Světla podle přítomnosti",
    presence_help: "Rozsvítí světla, když někdo vejde, a zhasne je, když už nikdo nezůstane, jako automatizace přítomnosti.",
    presence_add: "Světla podle přítomnosti",
    presence_remove: "Zrušit světla podle přítomnosti",
    presence_short: "Přítomnost",
    presence_sensors: "Senzory přítomnosti",
    presence_lights: "Světla",
    presence_lights_help: "Prázdné: světla místnosti. Přidat lze jakékoli světlo (na chodbě od vchodu…).",
    presence_lux: "Senzor osvětlení",
    presence_max_lux: "Jen pod",
    presence_max_lux_help: "Žádné světlo se nerozsvítí, když je v místnosti světleji.",
    presence_off_after: "Zhasnout po nepřítomnosti",
    presence_on_after: "Rozsvítit po přítomnosti",
    presence_transition: "Stmívání",
    presence_on_after_help: "Kdo jen projde kolem senzoru, světla nerozsvítí.",
    presence_not_during_naps: "Zhasnuto během zdřímnutí",
    presence_not_during_naps_help: "Tato světla se nerozsvítí, dokud má některá místnost v domě zdřímnutí.",
    slots_help: "Časy v pořadí: první, který platí pro světlo, rozhodne — zůstane zhasnuté, nebo se rozsvítí na svůj jas.",
    slot_add: "Čas",
    slot_lights: "Pro světla",
    slot_lights_help: "Prázdné: všechna světla přítomnosti.",
    slot_off: "Nerozsvěcovat",
    slot_brightness: "Jas",
    slot_off_after: "Zhasnout po nepřítomnosti",
    slot_color: "Barva",
    a_empty: "Zatím nic.",
    a_not_loaded: "Smart Comfort není načten.",
    a_all: "Vše",
    a_group_devices: "Zařízení",
    a_group_lights: "Světla",
    a_group_notifications: "Oznámení",
    a_group_manual: "Ručně",
    a_today: "Dnes",
    a_yesterday: "Včera",
    a_t_cool: "Chlazení",
    a_t_cool_night: "Chlazení, tichá noc",
    a_t_off: "Vypnuto",
    a_t_off_open: "Vypnuto: okno zůstává otevřené",
    a_t_on: "Zapnuto: je teplo",
    a_t_on_night: "Zapnuto, tichá noc",
    a_t_boost: "Posílení u okna",
    a_t_purify: "Posílení: znečištěný vzduch",
    a_t_normal: "Návrat do normálu",
    a_t_night: "Noční režim",
    a_t_keep_on: "Znovu zapnuto",
    a_lighting: "Jas pro danou chvíli",
    a_presence_on: "Rozsvíceno: někdo vešel",
    a_presence_off: "Zhasnuto: nikdo nezůstal",
    a_display_off: "Kontrolka vypnuta",
    a_display_on: "Kontrolka znovu zapnuta",
    a_notified: "Oznámení",
    a_cleared: "Oznámení smazáno: vše je opět v normálu",
    a_manual: "Změněno ručně: ponecháno být",
    a_manual_until: "Změněno ručně: ponecháno být do {time}",
    a_reset: "Návrat do normálu (pevný čas)",
    a_failed: "Nepodařilo se odeslat",
    a_all_rooms: "Všechny místnosti",
  },
  sl: {
    annex_alerts: "Privzete vrednosti za pomožne prostore",
    annex_alerts_help: "Privzeti pragovi opozoril za pomožne prostore — klet, garaža, delavnica, pralnica, podstrešje. Vrsto prostora nastavite na Pomožni prostor na zavihku Prostori; vsak prostor jih lahko prepiše.",
    outdoor_noise: "Zunanji hrup",
    quiet_night: "Tiha noč",
    to_handle: "Za obravnavo",
    all_rooms: "Vsi prostori",
    n_ok_rooms: "+ {n} v redu",
    n_handled: "{n} obravnavanih",
    discovered_new: "nov",
    discovered_updated: "dopolnjen",
    discovered_new_outdoor: "novo",
    discovered_updated_outdoor: "dopolnjeno",
    discover: "Odkrij",
    discover_help: "Doda prostor za vsako območje Home Assistant, kjer je kaj spremljati (tipalo udobja, klimatska naprava, ventilator, čistilnik ali zatemnilna luč), in ga nastavi: tipala temperature, CO₂, vlažnosti in hrupa, tipala PM2,5, PM10 in indeksa kakovosti zraka (tudi tista na čistilnikih), okna in vrata, klimatsko napravo, ventilatorje in čistilnike z njihovimi prednastavitvami in načini. Zunanja območja (vrt, terasa…) gredo v Zunaj, s svojimi tipali temperature, kakovosti zraka in hrupa; mestni indeks kakovosti zraka (Atmo France…) in entiteta vremena, če ni zunanjega tipala, gresta na zavihek Obvestila. Tihe prednastavitve in načini ventilatorja postanejo nočne nastavitve. Kar je že nastavljeno, se ohrani. Preverite rezultat, nato shranite.",
    discover_running: "Odkrivanje…",
    discover_result: "Odkrivanje: dodani prostori: {added}, dopolnjeni: {updated}, zunanja mesta: {outdoors}{outdoor}. Preverite jih, nato shranite.",
    discover_outdoor: ", zunanja tipala nastavljena",
    discover_none: "Odkrivanje ni našlo nič novega.",
    fan: "Ventilator",
    purifier: "Čistilnik zraka",
    overview: "Pregled",
    sc_score: "udobje",
    sc_all_good: "Vse je udobno",
    sc_point: "{n} točka za spremljanje",
    sc_points: "{n} točke za spremljanje",
    n_rooms_ok: "{n} sob je v redu",
    rooms: "Prostori",
    alerts: "Opozorila",
    notifications: "Obvestila",
    dashboards: "Nadzorne plošče",
    control: "Upravljanje naprav",
    save: "Shrani",
    discard: "Zavrzi",
    saved: "Shranjeno",
    saving: "Shranjevanje…",
    unsaved: "Neshranjene spremembe",
    yaml: "Ta konfiguracija prihaja iz YAML in jo lahko urejate tukaj. Ko se YAML spremeni (ob ponovnem zagonu ali z Znova naloži YAML), se uveljavi le spremenjeno: vaše spremembe drugih nastavitev ostanejo.",
    yaml_reload: "Znova naloži YAML",
    yaml_reloaded: "YAML uveljavljen: posodobljeno je le spremenjeno.",
    yaml_unchanged: "YAML se ni spremenil: ni česa uveljaviti.",
    yaml_conflicts: "YAML uveljavljen. Zamenjal je, kar je bilo tukaj spremenjeno, za: {paths}",
    yaml_file: "Ta konfiguracija je shranjena v {file} v mapi konfiguracije: kar shranite tukaj, se zapiše vanjo, spremembe datoteke pa se uveljavijo v nekaj sekundah.",
    yaml_help_file: "Vsebina {file} v mapi konfiguracije (privzete vrednosti se ne ponavljajo).",
    src_title: "Vir konfiguracije",
    src_status: "Spremenjeno ob {time} · {rooms} prostorov · usklajeno",
    src_status_invalid: "Spremenjeno ob {time} · neveljavno, ni uveljavljeno: {error}",
    src_reload: "Znova naloži",
    src_write: "Urejanje v plošči",
    src_write_help: "Vsako shranjevanje v datoteki prepiše le spremenjeno, komentarji in oblika ostanejo · varnostna kopija .bak.",
    src_watch: "Spremljanje datoteke",
    src_watch_help: "Znova prebrano ob vsaki spremembi (tudi vključene datoteke) · uveljavi se le spremenjeno.",
    src_included: "Vključene datoteke",
    src_included_help: "{files} · prostor se prepiše v svojo datoteko.",
    src_create: "Ustvari {file}",
    src_create_help: "Zapiše trenutno konfiguracijo v {file} v mapi konfiguracije; datoteka in plošča nato ostaneta usklajeni.",
    src_none: "Ni {file}: konfiguracijo hrani le Home Assistant.",
    conflict_title: "Datoteka se je med urejanjem spremenila",
    conflict_sub: "{n} nastavitev spremenjenih v {file} ob {time}",
    conflict_sub_other: "{n} nastavitev spremenjenih drugje (YAML ali drugo okno)",
    conflict_file: "Datoteka",
    conflict_panel: "Plošča",
    conflict_keep_file: "Obdrži datoteko",
    conflict_keep_panel: "Obdrži ploščo",
    not_loaded: "Smart Comfort ni naložen. Preverite dnevnike.",
    not_setup: "Smart Comfort še ni nastavljen: dodajte ga v Nastavitve → Naprave in storitve.",
    retry: "Poskusi znova",
    active_alerts: "Aktivna opozorila",
    no_alerts: "Vse je v redu.",
    outdoor: "Zunaj",
    notifications_on: "Obvestila vklopljena",
    notifications_off: "Obvestila izklopljena",
    control_on: "Upravljanje naprav vklopljeno",
    control_off: "Upravljanje naprav izklopljeno",
    notify_now: "Obvesti zdaj",
    unsnooze: "Prekliči odloge",
    snooze: "Odloži",
    acknowledge: "Razumem",
    snoozed: "odloženo",
    acknowledged: "potrjeno",
    handled: "poskrbljeno",
    notified: "obveščeno",
    pending: "še ni obveščeno",
    since: "od",
    ok: "OK",
    open: "Odprto",
    devices: "Naprave",
    target: "cilj",
    manual: "ročno do",
    last_notification: "Zadnje obvestilo",
    add_room: "Dodaj prostor",
    new_room: "Nov prostor",
    remove: "Odstrani",
    move_up: "Premakni gor",
    move_down: "Premakni dol",
    room_alerts: "Opozorila tega prostora",
    inherit: "Privzeto",
    enabled: "Vklop",
    disabled: "Izklop",
    climate: "Klimatska naprava",
    fans: "Ventilatorji",
    purifiers: "Čistilniki zraka",
    device_settings: "Nastavitve te naprave",
    default_value: "Privzeto: {value}",
    no_rooms: "Še ni prostorov.",
    outdoor_air: "Zunanji zrak",
    outdoors: "Zunaj",
    add_outdoor: "Dodaj zunanje mesto",
    new_outdoor: "Zunaj",
    no_outdoors: "Še ni zunanjih mest.",
    start: "Začnimo",
    start_help: "Nič še ni nastavljeno. Odkrij najde prostore in zunanja mesta iz območij Home Assistant z njihovimi tipali in napravami ter jih nastavi; rezultat preverite na zavihku Prostori, preden shranite.",
    no_sensor: "brez tipala",
    lighting: "Prilagodljiva razsvetljava",
    lights: "Luči",
    light: "Luč",
    lighting_on: "Prilagodljiva razsvetljava vklopljena",
    lighting_off: "Prilagodljiva razsvetljava izklopljena",
    nap_start: "Dremež od",
    nap_end: "Do",
    nap_days: "Dnevi",
    nap_days_help: "Noben: vsak dan.",
    nap_entity: "Urnik dremeža",
    nap_entity_help: "Vklopljeno: dremež (urnik, deljen s House Rules, navidezno stikalo…).",
    day_mon: "pon",
    day_tue: "tor",
    day_wed: "sre",
    day_thu: "čet",
    day_fri: "pet",
    day_sat: "sob",
    day_sun: "ned",
    advanced: "Napredno",
    alerts_help: "Privzete vrednosti za vse prostore; vsak prostor lahko prilagodi svoje.",
    schedule: "Urnik",
    settings: "Nastavitve",
    activity: "Dejavnost",
    activity_help: "Kaj je Smart Comfort naredil in zakaj, v živo: naprave, luči, obvestila, ročne spremembe. Vrstica odpre svojo entiteto.",
    yaml_tab: "YAML",
    yaml_help: "Le konfiguracija Smart Comfort, kot spada pod smart_comfort: v configuration.yaml (privzete vrednosti se ne ponavljajo).",
    yaml_help_unsaved: "Le konfiguracija Smart Comfort, kot spada pod smart_comfort: v configuration.yaml (privzete vrednosti se ne ponavljajo). Vključuje še neshranjene spremembe.",
    yaml_copy: "Kopiraj",
    yaml_copied: "Kopirano",
    sched_title: "Vaš dan",
    sched_help: "Kdaj velja katero časovno okno, s trenutnim časom.",
    sched_edit: "Časi",
    sched_quiet: "Tihe ure",
    sched_quiet_help: "Pošiljajo se le kritična opozorila; druga čakajo na konec.",
    sched_night: "Tiha noč",
    sched_night_help: "Naprave delujejo tišje, brez okenske okrepitve, luči na nočni ravni.",
    sched_morning: "Tiho jutro",
    sched_morning_help: "Od konca noči: luči v spalnicah ostanejo šibkejše.",
    sched_boost: "Okenska okrepitev",
    sched_boost_help: "Ventilatorji in čistilniki na polni hitrosti, dokler je okno odprto. Obe prazni: ves dan.",
    sched_displays: "Zasloni izklopljeni",
    sched_displays_help: "Indikatorske lučke in zasloni naprav izklopljeni (tudi med dremeži v njihovem prostoru). Prazno: tiha noč.",
    sched_from: "Od",
    sched_to: "Do",
    sched_morning_end: "Do",
    discover_short: "Najde prostore iz območij Home Assistant z njihovimi tipali, napravami in lučmi. Nič se ne shrani, preden preverite.",
    how: "Kako deluje",
    less: "Manj",
    other_outdoor: "Druga zunanja tipala",
    other_outdoor_help: "Tipala zunaj zunanjih mest: entiteta vremena, mestni indeks kakovosti zraka…",
    outdoors_help: "Vrt, terasa, balkon…: njihova tipala dajejo zunanjo temperaturo, kakovost zraka in hrup.",
    section_sensors: "Tipala",
    section_openings: "Okna in vrata",
    section_devices: "Naprave",
    section_lighting: "Razsvetljava",
    section_alerts: "Opozorila",
    none: "Nič",
    openings_help: "Njihovo stanje zadrži ali sproži okenska opozorila in okrepitve.",
    naps: "Dremeži",
    nap: "Dremež",
    no_naps: "Ni dremeža: dodajte ga, da zatemnite luči ob določenih urah.",
    alerts_default: "Privzete nastavitve",
    customize_alert: "Prilagodi opozorilo",
    room_alerts_help: "Le opozorila, prilagojena za ta prostor; druga sledijo zavihku Opozorila.",
    lighting_help: "Prižgane luči sledijo času dneva; Smart Comfort jih nikoli ne prižge ali ugasne. Časi so na zavihku Urnik.",
    presence_title: "Luči ob prisotnosti",
    presence_help: "Prižge luči, ko nekdo vstopi, in jih ugasne, ko ni več nikogar, kot avtomatizacija prisotnosti.",
    presence_add: "Luči ob prisotnosti",
    presence_remove: "Ustavi luči ob prisotnosti",
    presence_short: "Prisotnost",
    presence_sensors: "Tipala prisotnosti",
    presence_lights: "Luči",
    presence_lights_help: "Prazno: luči prostora. Dodate lahko katerokoli luč (hodnikovo od vhoda…).",
    presence_lux: "Tipalo osvetljenosti",
    presence_max_lux: "Le pod",
    presence_max_lux_help: "Nobena luč se ne prižge, ko je v prostoru svetleje.",
    presence_off_after: "Ugasni po odsotnosti",
    presence_on_after: "Prižgi po prisotnosti",
    presence_transition: "Pojemanje",
    presence_on_after_help: "Kdor le gre mimo tipala, ne prižge luči.",
    presence_not_during_naps: "Ugasnjene med dremeži",
    presence_not_during_naps_help: "Te luči se ne prižgejo, dokler ima kateri prostor v hiši dremež.",
    slots_help: "Termini po vrsti: prvi, ki velja za luč, odloči — ostane ugasnjena ali se prižge na svojo svetlost.",
    slot_add: "Termin",
    slot_lights: "Za luči",
    slot_lights_help: "Prazno: vse luči prisotnosti.",
    slot_off: "Ne prižgi",
    slot_brightness: "Svetlost",
    slot_off_after: "Ugasni po odsotnosti",
    slot_color: "Barva",
    a_empty: "Še nič.",
    a_not_loaded: "Smart Comfort ni naložen.",
    a_all: "Vse",
    a_group_devices: "Naprave",
    a_group_lights: "Luči",
    a_group_notifications: "Obvestila",
    a_group_manual: "Ročno",
    a_today: "Danes",
    a_yesterday: "Včeraj",
    a_t_cool: "Hlajenje",
    a_t_cool_night: "Hlajenje, tiha noč",
    a_t_off: "Izklopljeno",
    a_t_off_open: "Izklopljeno: okno ostaja odprto",
    a_t_on: "Vklopljeno: toplo je",
    a_t_on_night: "Vklopljeno, tiha noč",
    a_t_boost: "Okenska okrepitev",
    a_t_purify: "Okrepitev: onesnažen zrak",
    a_t_normal: "Nazaj na običajno",
    a_t_night: "Nočni način",
    a_t_keep_on: "Znova vklopljeno",
    a_lighting: "Svetlost trenutka",
    a_presence_on: "Prižgano: nekdo je vstopil",
    a_presence_off: "Ugasnjeno: nikogar ni več",
    a_display_off: "Indikator izklopljen",
    a_display_on: "Indikator znova vklopljen",
    a_notified: "Obvestilo",
    a_cleared: "Obvestilo počiščeno: vse je spet normalno",
    a_manual: "Ročno spremenjeno: puščeno pri miru",
    a_manual_until: "Ročno spremenjeno: puščeno pri miru do {time}",
    a_reset: "Nazaj na običajno (določena ura)",
    a_failed: "Ni bilo mogoče poslati",
    a_all_rooms: "Vsi prostori",
  },
  lv: {
    annex_alerts: "Palīgtelpu noklusējuma vērtības",
    annex_alerts_help: "Noklusējuma brīdinājumu sliekšņi palīgtelpām — pagrabs, garāža, darbnīca, veļas telpa, bēniņi. Iestatiet telpas tipu uz Palīgtelpa cilnē Telpas; katra telpa tos var ignorēt.",
    outdoor_noise: "Āra troksnis",
    quiet_night: "Klusā nakts",
    to_handle: "Jāapstrādā",
    all_rooms: "Visas telpas",
    n_ok_rooms: "+ {n} kārtībā",
    n_handled: "{n} apstrādāti",
    discovered_new: "jauna",
    discovered_updated: "papildināta",
    discovered_new_outdoor: "jauna",
    discovered_updated_outdoor: "papildināta",
    discover: "Atklāt",
    discover_help: "Pievieno telpu katram Home Assistant apgabalam, kurā ir kas sekojams (komforta sensors, gaisa kondicionieris, ventilators, attīrītājs vai regulējama gaisma), un iestata to: temperatūras, CO₂, mitruma un trokšņa sensori, PM2,5, PM10 un gaisa kvalitātes indeksa sensori (arī attīrītāju), logi un durvis, gaisa kondicionieris, ventilatori un attīrītāji ar to iepriekšējiem iestatījumiem un režīmiem. Āra apgabali (dārzs, terase…) nonāk sadaļā Ārā ar saviem temperatūras, gaisa kvalitātes un trokšņa sensoriem; pilsētas gaisa kvalitātes indekss (Atmo France…) un laikapstākļu entītija, ja nav āra sensora, nonāk cilnē Paziņojumi. Klusie iepriekšējie iestatījumi un ventilatora režīmi kļūst par nakts iestatījumiem. Jau iestatītais tiek saglabāts. Pārbaudiet rezultātu, pēc tam saglabājiet.",
    discover_running: "Notiek atklāšana…",
    discover_result: "Atklāšana: pievienotas telpas: {added}, papildinātas: {updated}, āra vietas: {outdoors}{outdoor}. Pārbaudiet tās, pēc tam saglabājiet.",
    discover_outdoor: ", āra sensori iestatīti",
    discover_none: "Atklāšana neatrada neko jaunu.",
    fan: "Ventilators",
    purifier: "Gaisa attīrītājs",
    overview: "Pārskats",
    sc_score: "komforts",
    sc_all_good: "Viss ir ērti",
    sc_point: "{n} vērā ņemams punkts",
    sc_points: "{n} vērā ņemami punkti",
    n_rooms_ok: "{n} istabas kārtībā",
    rooms: "Telpas",
    alerts: "Brīdinājumi",
    notifications: "Paziņojumi",
    dashboards: "Informācijas paneļi",
    control: "Ierīču vadība",
    save: "Saglabāt",
    discard: "Atmest",
    saved: "Saglabāts",
    saving: "Saglabā…",
    unsaved: "Nesaglabātas izmaiņas",
    yaml: "Šī konfigurācija nāk no YAML, un to var rediģēt šeit. Kad YAML mainās (pārstartējot vai ar Pārlādēt YAML), tiek piemērots tikai mainītais: jūsu citu iestatījumu izmaiņas paliek.",
    yaml_reload: "Pārlādēt YAML",
    yaml_reloaded: "YAML piemērots: atjaunināts tikai mainītais.",
    yaml_unchanged: "YAML nav mainījies: nav ko piemērot.",
    yaml_conflicts: "YAML piemērots. Tas aizstāja šeit mainīto šiem: {paths}",
    yaml_file: "Šī konfigurācija tiek glabāta failā {file} konfigurācijas mapē: tas, ko saglabājat šeit, tiek ierakstīts tajā, un faila izmaiņas tiek piemērotas dažās sekundēs.",
    yaml_help_file: "Faila {file} saturs konfigurācijas mapē (noklusējuma vērtības netiek atkārtotas).",
    src_title: "Konfigurācijas avots",
    src_status: "Mainīts {time} · {rooms} telpas · sinhronizēts",
    src_status_invalid: "Mainīts {time} · nederīgs, nav piemērots: {error}",
    src_reload: "Pārlādēt",
    src_write: "Rediģēšana panelī",
    src_write_help: "Katra saglabāšana failā pārraksta tikai mainīto, komentāri un formatējums saglabājas · rezerves kopija .bak.",
    src_watch: "Faila uzraudzība",
    src_watch_help: "Nolasīts no jauna pēc katras izmaiņas (arī iekļautie faili) · piemērots tikai mainītais.",
    src_included: "Iekļautie faili",
    src_included_help: "{files} · telpa tiek pārrakstīta savā failā.",
    src_create: "Izveidot {file}",
    src_create_help: "Ieraksta pašreizējo konfigurāciju failā {file} konfigurācijas mapē; pēc tam fails un panelis paliek sinhronizēti.",
    src_none: "Nav {file}: konfigurāciju glabā tikai Home Assistant.",
    conflict_title: "Fails mainījās rediģēšanas laikā",
    conflict_sub: "{n} iestatījumi mainīti failā {file} {time}",
    conflict_sub_other: "{n} iestatījumi mainīti citur (YAML vai citā logā)",
    conflict_file: "Fails",
    conflict_panel: "Panelis",
    conflict_keep_file: "Paturēt failu",
    conflict_keep_panel: "Paturēt paneli",
    not_loaded: "Smart Comfort nav ielādēts. Pārbaudiet žurnālus.",
    not_setup: "Smart Comfort vēl nav iestatīts: pievienojiet to sadaļā Iestatījumi → Ierīces un pakalpojumi.",
    retry: "Mēģināt vēlreiz",
    active_alerts: "Aktīvie brīdinājumi",
    no_alerts: "Viss kārtībā.",
    outdoor: "Ārā",
    notifications_on: "Paziņojumi ieslēgti",
    notifications_off: "Paziņojumi izslēgti",
    control_on: "Ierīču vadība ieslēgta",
    control_off: "Ierīču vadība izslēgta",
    notify_now: "Paziņot tagad",
    unsnooze: "Atcelt atlikšanas",
    snooze: "Atlikt",
    acknowledge: "Sapratu",
    snoozed: "atlikts",
    acknowledged: "apstiprināts",
    handled: "tiek risināts",
    notified: "paziņots",
    pending: "vēl nav paziņots",
    since: "kopš",
    ok: "OK",
    open: "Atvērts",
    devices: "Ierīces",
    target: "mērķis",
    manual: "manuāli līdz",
    last_notification: "Pēdējais paziņojums",
    add_room: "Pievienot telpu",
    new_room: "Jauna telpa",
    remove: "Noņemt",
    move_up: "Pārvietot augšup",
    move_down: "Pārvietot lejup",
    room_alerts: "Šīs telpas brīdinājumi",
    inherit: "Noklusējums",
    enabled: "Ieslēgts",
    disabled: "Izslēgts",
    climate: "Gaisa kondicionieris",
    fans: "Ventilatori",
    purifiers: "Gaisa attīrītāji",
    device_settings: "Šīs ierīces iestatījumi",
    default_value: "Noklusējums: {value}",
    no_rooms: "Vēl nav telpu.",
    outdoor_air: "Āra gaiss",
    outdoors: "Ārā",
    add_outdoor: "Pievienot āra vietu",
    new_outdoor: "Ārā",
    no_outdoors: "Vēl nav āra vietu.",
    start: "Sākt darbu",
    start_help: "Vēl nekas nav iestatīts. Atklāt atrod telpas un āra vietas jūsu Home Assistant apgabalos ar to sensoriem un ierīcēm un tās iestata; rezultātu pārbaudāt cilnē Telpas pirms saglabāšanas.",
    no_sensor: "nav sensora",
    lighting: "Adaptīvais apgaismojums",
    lights: "Gaismas",
    light: "Gaisma",
    lighting_on: "Adaptīvais apgaismojums ieslēgts",
    lighting_off: "Adaptīvais apgaismojums izslēgts",
    nap_start: "Diendusa no",
    nap_end: "Līdz",
    nap_days: "Dienas",
    nap_days_help: "Nav: katru dienu.",
    nap_entity: "Diendusas grafiks",
    nap_entity_help: "Ieslēgts: diendusa (grafiks, kopīgs ar House Rules, virtuāls slēdzis…).",
    day_mon: "P",
    day_tue: "O",
    day_wed: "T",
    day_thu: "C",
    day_fri: "Pk",
    day_sat: "S",
    day_sun: "Sv",
    advanced: "Papildu",
    alerts_help: "Noklusējumi visām telpām; katra telpa var pielāgot savus.",
    schedule: "Grafiks",
    settings: "Iestatījumi",
    activity: "Aktivitāte",
    activity_help: "Ko Smart Comfort darīja un kāpēc, tiešraidē: ierīces, gaismas, paziņojumi, manuālas izmaiņas. Rinda atver savu entītiju.",
    yaml_tab: "YAML",
    yaml_help: "Tikai Smart Comfort konfigurācija, tā, kā tā tiek rakstīta zem smart_comfort: failā configuration.yaml (noklusējumi netiek atkārtoti).",
    yaml_help_unsaved: "Tikai Smart Comfort konfigurācija, tā, kā tā tiek rakstīta zem smart_comfort: failā configuration.yaml (noklusējumi netiek atkārtoti). Ietver vēl nesaglabātās izmaiņas.",
    yaml_copy: "Kopēt",
    yaml_copied: "Nokopēts",
    sched_title: "Jūsu diena",
    sched_help: "Kad ir spēkā katrs laika logs, ar pašreizējo laiku.",
    sched_edit: "Laiki",
    sched_quiet: "Klusās stundas",
    sched_quiet_help: "Tiek sūtīti tikai kritiskie brīdinājumi; pārējie gaida beigas.",
    sched_night: "Klusā nakts",
    sched_night_help: "Ierīces darbojas klusāk, nav loga pastiprinājuma, gaismas nakts līmenī.",
    sched_morning: "Kluss rīts",
    sched_morning_help: "No nakts beigām: guļamistabu gaismas paliek blāvākas.",
    sched_boost: "Loga pastiprinājums",
    sched_boost_help: "Ventilatori un attīrītāji pilnā ātrumā, kamēr logs ir atvērts. Abi tukši: visu dienu.",
    sched_displays: "Displeji izslēgti",
    sched_displays_help: "Ierīču indikatoru gaismas un displeji izslēgti (arī to telpas diendusas laikā). Tukšs: klusā nakts.",
    sched_from: "No",
    sched_to: "Līdz",
    sched_morning_end: "Līdz",
    discover_short: "Atrod telpas jūsu Home Assistant apgabalos ar to sensoriem, ierīcēm un gaismām. Nekas netiek saglabāts, pirms pārbaudāt.",
    how: "Kā tas darbojas",
    less: "Mazāk",
    other_outdoor: "Citi āra sensori",
    other_outdoor_help: "Sensori, kas nav nevienā āra vietā: laikapstākļu entītija, pilsētas gaisa kvalitātes indekss…",
    outdoors_help: "Dārzs, terase, balkons…: to sensori nodrošina āra temperatūru, gaisa kvalitāti un troksni.",
    section_sensors: "Sensori",
    section_openings: "Logi un durvis",
    section_devices: "Ierīces",
    section_lighting: "Apgaismojums",
    section_alerts: "Brīdinājumi",
    none: "Nav",
    openings_help: "To stāvoklis aiztur vai izraisa ar logiem saistītos brīdinājumus un pastiprinājumus.",
    naps: "Diendusas",
    nap: "Diendusa",
    no_naps: "Nav diendusas: pievienojiet to, lai noteiktos laikos aptumšotu gaismas.",
    alerts_default: "Noklusējuma iestatījumi",
    customize_alert: "Pielāgot brīdinājumu",
    room_alerts_help: "Tikai šai telpai pielāgotie brīdinājumi; pārējie seko cilnei Brīdinājumi.",
    lighting_help: "Ieslēgtās gaismas seko diennakts laikam; Smart Comfort tās nekad neieslēdz un neizslēdz. Laiki ir cilnē Grafiks.",
    presence_title: "Gaismas pēc klātbūtnes",
    presence_help: "Ieslēdz gaismas, kad kāds ienāk, un izslēdz, kad neviena vairs nav, kā klātbūtnes automatizācija.",
    presence_add: "Gaismas pēc klātbūtnes",
    presence_remove: "Pārtraukt gaismas pēc klātbūtnes",
    presence_short: "Klātbūtne",
    presence_sensors: "Klātbūtnes sensori",
    presence_lights: "Gaismas",
    presence_lights_help: "Tukšs: telpas gaismas. Var pievienot jebkuru gaismu (gaiteņa gaismu no ieejas…).",
    presence_lux: "Apgaismojuma līmeņa sensors",
    presence_max_lux: "Tikai zem",
    presence_max_lux_help: "Neviena gaisma netiek ieslēgta, ja telpā ir gaišāk par šo.",
    presence_off_after: "Izslēgt pēc prombūtnes",
    presence_on_after: "Ieslēgt pēc klātbūtnes",
    presence_transition: "Izgaišana",
    presence_on_after_help: "Kāds, kurš tikai paiet garām sensoram, neieslēdz gaismas.",
    presence_not_during_naps: "Izslēgtas diendusas laikā",
    presence_not_during_naps_help: "Šīs gaismas netiek ieslēgtas, kamēr kādā mājas telpā ir diendusa.",
    slots_help: "Laika posmi secībā: pirmais, kas attiecas uz gaismu, nosaka — paliek izslēgta vai ieslēdzas ar savu spilgtumu.",
    slot_add: "Laika posms",
    slot_lights: "Gaismām",
    slot_lights_help: "Tukšs: visas klātbūtnes gaismas.",
    slot_off: "Neieslēgt",
    slot_brightness: "Spilgtums",
    slot_off_after: "Izslēgt pēc prombūtnes",
    slot_color: "Krāsa",
    a_empty: "Vēl nekā.",
    a_not_loaded: "Smart Comfort nav ielādēts.",
    a_all: "Visi",
    a_group_devices: "Ierīces",
    a_group_lights: "Gaismas",
    a_group_notifications: "Paziņojumi",
    a_group_manual: "Manuāli",
    a_today: "Šodien",
    a_yesterday: "Vakar",
    a_t_cool: "Dzesē",
    a_t_cool_night: "Dzesē, klusā nakts",
    a_t_off: "Izslēgts",
    a_t_off_open: "Izslēgts: logs paliek atvērts",
    a_t_on: "Ieslēgts: ir silts",
    a_t_on_night: "Ieslēgts, klusā nakts",
    a_t_boost: "Loga pastiprinājums",
    a_t_purify: "Pastiprinājums: piesārņots gaiss",
    a_t_normal: "Atpakaļ uz normālu",
    a_t_night: "Nakts režīms",
    a_t_keep_on: "Atkal ieslēgts",
    a_lighting: "Brīža spilgtums",
    a_presence_on: "Ieslēgts: kāds ienāca",
    a_presence_off: "Izslēgts: neviena vairs nav",
    a_display_off: "Indikators izslēgts",
    a_display_on: "Indikators atkal ieslēgts",
    a_notified: "Paziņojums",
    a_cleared: "Paziņojums notīrīts: viss atkal ir normāli",
    a_manual: "Mainīts manuāli: atstāts mierā",
    a_manual_until: "Mainīts manuāli: atstāts mierā līdz {time}",
    a_reset: "Atpakaļ uz normālu (noteikts laiks)",
    a_failed: "Nevarēja nosūtīt",
    a_all_rooms: "Visas telpas",
  },
  el: {
    annex_alerts: "Προεπιλογές για βοηθητικούς χώρους",
    annex_alerts_help: "Προεπιλεγμένα όρια ειδοποιήσεων για βοηθητικούς χώρους — κελάρι, γκαράζ, εργαστήριο, πλυσταριό, σοφίτα. Ορίστε τον τύπο ενός δωματίου σε Βοηθητικός στην καρτέλα Δωμάτια· κάθε δωμάτιο μπορεί να τα παρακάμψει.",
    outdoor_noise: "Εξωτερικός θόρυβος",
    quiet_night: "Ήσυχη νύχτα",
    to_handle: "Προς χειρισμό",
    all_rooms: "Όλοι οι χώροι",
    n_ok_rooms: "+ {n} εντάξει",
    n_handled: "{n} σε χειρισμό",
    discovered_new: "νέο",
    discovered_updated: "συμπληρώθηκε",
    discovered_new_outdoor: "νέος",
    discovered_updated_outdoor: "συμπληρώθηκε",
    discover: "Ανακάλυψη",
    discover_help: "Προσθέτει ένα δωμάτιο για κάθε περιοχή του Home Assistant με κάτι προς παρακολούθηση (αισθητήρας άνεσης, κλιματιστικό, ανεμιστήρας, καθαριστής ή φως με ρύθμιση φωτεινότητας) και το ρυθμίζει: αισθητήρες θερμοκρασίας, CO₂, υγρασίας και θορύβου, αισθητήρες PM2.5, PM10 και δείκτη ποιότητας αέρα (και των καθαριστών), παράθυρα και πόρτες, κλιματιστικό, ανεμιστήρες και καθαριστές με τις προεπιλογές και τις λειτουργίες τους. Οι εξωτερικές περιοχές (κήπος, βεράντα…) πηγαίνουν στους Εξωτερικούς χώρους, με τους αισθητήρες θερμοκρασίας, ποιότητας αέρα και θορύβου τους· ένας δείκτης ποιότητας αέρα της πόλης (Atmo France…) και η οντότητα καιρού, ελλείψει εξωτερικού αισθητήρα, πηγαίνουν στην καρτέλα Ειδοποιήσεις. Οι αθόρυβες προεπιλογές και λειτουργίες ανεμιστήρα γίνονται οι νυχτερινές ρυθμίσεις. Ό,τι έχει ήδη οριστεί διατηρείται. Ελέγξτε το αποτέλεσμα και μετά αποθηκεύστε.",
    discover_running: "Ανακάλυψη…",
    discover_result: "Ανακάλυψη: δωμάτια που προστέθηκαν: {added}, συμπληρώθηκαν: {updated}, εξωτερικοί χώροι: {outdoors}{outdoor}. Ελέγξτε τα και μετά αποθηκεύστε.",
    discover_outdoor: ", οι εξωτερικοί αισθητήρες ορίστηκαν",
    discover_none: "Η ανακάλυψη δεν βρήκε τίποτα νέο.",
    fan: "Ανεμιστήρας",
    purifier: "Καθαριστής αέρα",
    overview: "Επισκόπηση",
    sc_score: "άνεση",
    sc_all_good: "Όλα είναι άνετα",
    sc_point: "{n} σημείο προς παρακολούθηση",
    sc_points: "{n} σημεία προς παρακολούθηση",
    n_rooms_ok: "{n} δωμάτια OK",
    rooms: "Δωμάτια",
    alerts: "Προειδοποιήσεις",
    notifications: "Ειδοποιήσεις",
    dashboards: "Πίνακες ελέγχου",
    control: "Έλεγχος συσκευών",
    save: "Αποθήκευση",
    discard: "Απόρριψη",
    saved: "Αποθηκεύτηκε",
    saving: "Αποθήκευση…",
    unsaved: "Μη αποθηκευμένες αλλαγές",
    yaml: "Αυτή η διαμόρφωση προέρχεται από YAML και μπορεί να επεξεργαστεί εδώ. Όταν αλλάζει το YAML (σε επανεκκίνηση ή με Επαναφόρτωση YAML), εφαρμόζεται μόνο ό,τι άλλαξε: οι αλλαγές σας στις άλλες ρυθμίσεις παραμένουν.",
    yaml_reload: "Επαναφόρτωση YAML",
    yaml_reloaded: "Το YAML εφαρμόστηκε: ενημερώθηκε μόνο ό,τι άλλαξε.",
    yaml_unchanged: "Το YAML δεν άλλαξε: τίποτα προς εφαρμογή.",
    yaml_conflicts: "Το YAML εφαρμόστηκε. Αντικατέστησε ό,τι είχε αλλάξει εδώ για: {paths}",
    yaml_file: "Αυτή η διαμόρφωση φυλάσσεται στο {file} στον φάκελο διαμόρφωσης: ό,τι αποθηκεύετε εδώ γράφεται σε αυτό, και οι αλλαγές του αρχείου εφαρμόζονται σε λίγα δευτερόλεπτα.",
    yaml_help_file: "Το περιεχόμενο του {file} στον φάκελο διαμόρφωσης (οι προεπιλεγμένες τιμές δεν επαναλαμβάνονται).",
    src_title: "Πηγή διαμόρφωσης",
    src_status: "Τροποποιήθηκε στις {time} · {rooms} χώροι · συγχρονισμένο",
    src_status_invalid: "Τροποποιήθηκε στις {time} · μη έγκυρο, δεν εφαρμόστηκε: {error}",
    src_reload: "Επαναφόρτωση",
    src_write: "Επεξεργασία στον πίνακα",
    src_write_help: "Κάθε αποθήκευση ξαναγράφει στο αρχείο μόνο ό,τι άλλαξε, με τα σχόλια και τη μορφή να διατηρούνται · αντίγραφο .bak.",
    src_watch: "Παρακολούθηση αρχείου",
    src_watch_help: "Διαβάζεται ξανά σε κάθε αλλαγή (και τα ενσωματωμένα αρχεία) · εφαρμόζεται μόνο ό,τι άλλαξε.",
    src_included: "Ενσωματωμένα αρχεία",
    src_included_help: "{files} · ένας χώρος ξαναγράφεται στο δικό του αρχείο.",
    src_create: "Δημιουργία {file}",
    src_create_help: "Γράφει την τρέχουσα διαμόρφωση στο {file} στον φάκελο διαμόρφωσης· στη συνέχεια αρχείο και πίνακας μένουν συγχρονισμένα.",
    src_none: "Δεν υπάρχει {file}: τη διαμόρφωση κρατά μόνο το Home Assistant.",
    conflict_title: "Το αρχείο άλλαξε κατά την επεξεργασία",
    conflict_sub: "{n} ρυθμίσεις άλλαξαν στο {file} στις {time}",
    conflict_sub_other: "{n} ρυθμίσεις άλλαξαν αλλού (YAML ή άλλο παράθυρο)",
    conflict_file: "Αρχείο",
    conflict_panel: "Πίνακας",
    conflict_keep_file: "Κράτηση αρχείου",
    conflict_keep_panel: "Κράτηση πίνακα",
    not_loaded: "Το Smart Comfort δεν έχει φορτωθεί. Ελέγξτε τα αρχεία καταγραφής.",
    not_setup: "Το Smart Comfort δεν έχει ρυθμιστεί ακόμα: προσθέστε το στις Ρυθμίσεις → Συσκευές και υπηρεσίες.",
    retry: "Δοκιμή ξανά",
    active_alerts: "Ενεργές προειδοποιήσεις",
    no_alerts: "Όλα είναι εντάξει.",
    outdoor: "Έξω",
    notifications_on: "Ειδοποιήσεις ενεργές",
    notifications_off: "Ειδοποιήσεις ανενεργές",
    control_on: "Έλεγχος συσκευών ενεργός",
    control_off: "Έλεγχος συσκευών ανενεργός",
    notify_now: "Ειδοποίηση τώρα",
    unsnooze: "Ακύρωση αναβολών",
    snooze: "Αναβολή",
    acknowledge: "Το είδα",
    snoozed: "σε αναβολή",
    acknowledged: "επιβεβαιώθηκε",
    handled: "αντιμετωπίζεται",
    notified: "ειδοποιήθηκε",
    pending: "δεν έχει ειδοποιηθεί ακόμα",
    since: "από",
    ok: "OK",
    open: "Ανοιχτά",
    devices: "Συσκευές",
    target: "στόχος",
    manual: "χειροκίνητα έως",
    last_notification: "Τελευταία ειδοποίηση",
    add_room: "Προσθήκη δωματίου",
    new_room: "Νέο δωμάτιο",
    remove: "Αφαίρεση",
    move_up: "Μετακίνηση πάνω",
    move_down: "Μετακίνηση κάτω",
    room_alerts: "Προειδοποιήσεις αυτού του δωματίου",
    inherit: "Προεπιλογή",
    enabled: "Ενεργό",
    disabled: "Ανενεργό",
    climate: "Κλιματιστικό",
    fans: "Ανεμιστήρες",
    purifiers: "Καθαριστές αέρα",
    device_settings: "Ρυθμίσεις συσκευής",
    default_value: "Προεπιλογή: {value}",
    no_rooms: "Κανένα δωμάτιο ακόμα.",
    outdoor_air: "Εξωτερικός αέρας",
    outdoors: "Εξωτερικοί χώροι",
    add_outdoor: "Προσθήκη εξωτερικού χώρου",
    new_outdoor: "Εξωτερικός χώρος",
    no_outdoors: "Κανένας εξωτερικός χώρος ακόμα.",
    start: "Ας ξεκινήσουμε",
    start_help: "Τίποτα δεν έχει ρυθμιστεί ακόμα. Η Ανακάλυψη βρίσκει τα δωμάτια και τους εξωτερικούς χώρους από τις περιοχές του Home Assistant με τους αισθητήρες και τις συσκευές τους, και τα ρυθμίζει· ελέγχετε το αποτέλεσμα στην καρτέλα Δωμάτια πριν την αποθήκευση.",
    no_sensor: "χωρίς αισθητήρα",
    lighting: "Προσαρμοστικός φωτισμός",
    lights: "Φώτα",
    light: "Φως",
    lighting_on: "Προσαρμοστικός φωτισμός ενεργός",
    lighting_off: "Προσαρμοστικός φωτισμός ανενεργός",
    nap_start: "Υπνάκος από",
    nap_end: "Έως",
    nap_days: "Ημέρες",
    nap_days_help: "Καμία: κάθε μέρα.",
    nap_entity: "Πρόγραμμα μεσημεριανού ύπνου",
    nap_entity_help: "Ενεργό: μεσημεριανός ύπνος (πρόγραμμα κοινό με το House Rules, εικονικός διακόπτης…).",
    day_mon: "Δευ",
    day_tue: "Τρί",
    day_wed: "Τετ",
    day_thu: "Πέμ",
    day_fri: "Παρ",
    day_sat: "Σάβ",
    day_sun: "Κυρ",
    advanced: "Για προχωρημένους",
    alerts_help: "Προεπιλογές για όλα τα δωμάτια· κάθε δωμάτιο μπορεί να προσαρμόσει τις δικές του.",
    schedule: "Πρόγραμμα",
    settings: "Ρυθμίσεις",
    activity: "Δραστηριότητα",
    activity_help: "Τι έκανε το Smart Comfort και γιατί, ζωντανά: συσκευές, φώτα, ειδοποιήσεις, χειροκίνητες αλλαγές. Μια γραμμή ανοίγει την οντότητά της.",
    yaml_tab: "YAML",
    yaml_help: "Μόνο η διαμόρφωση του Smart Comfort, όπως μπαίνει κάτω από το smart_comfort: στο configuration.yaml (οι προεπιλογές δεν επαναλαμβάνονται).",
    yaml_help_unsaved: "Μόνο η διαμόρφωση του Smart Comfort, όπως μπαίνει κάτω από το smart_comfort: στο configuration.yaml (οι προεπιλογές δεν επαναλαμβάνονται). Περιλαμβάνει τις αλλαγές που δεν έχουν αποθηκευτεί ακόμα.",
    yaml_copy: "Αντιγραφή",
    yaml_copied: "Αντιγράφηκε",
    sched_title: "Η μέρα σας",
    sched_help: "Πότε ισχύει κάθε χρονικό παράθυρο, με την τρέχουσα ώρα.",
    sched_edit: "Ώρες",
    sched_quiet: "Ώρες ησυχίας",
    sched_quiet_help: "Αποστέλλονται μόνο κρίσιμες προειδοποιήσεις· οι υπόλοιπες περιμένουν το τέλος.",
    sched_night: "Ήσυχη νύχτα",
    sched_night_help: "Οι συσκευές λειτουργούν πιο αθόρυβα, χωρίς ενίσχυση παραθύρου, τα φώτα στο νυχτερινό τους επίπεδο.",
    sched_morning: "Ήσυχο πρωινό",
    sched_morning_help: "Από το τέλος της νύχτας: τα φώτα των υπνοδωματίων μένουν πιο χαμηλά.",
    sched_boost: "Ενίσχυση παραθύρου",
    sched_boost_help: "Ανεμιστήρες και καθαριστές σε πλήρη ταχύτητα όσο ένα παράθυρο είναι ανοιχτό. Και τα δύο κενά: όλη μέρα.",
    sched_displays: "Οθόνες σβηστές",
    sched_displays_help: "Ενδεικτικές λυχνίες και οθόνες των συσκευών σβηστές (και κατά τους μεσημεριανούς ύπνους του δωματίου τους). Κενό: η ήσυχη νύχτα.",
    sched_from: "Από",
    sched_to: "Έως",
    sched_morning_end: "Έως",
    discover_short: "Βρίσκει τα δωμάτια από τις περιοχές του Home Assistant, με τους αισθητήρες, τις συσκευές και τα φώτα τους. Τίποτα δεν αποθηκεύεται πριν ελέγξετε.",
    how: "Πώς λειτουργεί",
    less: "Λιγότερα",
    other_outdoor: "Άλλοι εξωτερικοί αισθητήρες",
    other_outdoor_help: "Αισθητήρες εκτός εξωτερικών χώρων: μια οντότητα καιρού, ένας δείκτης ποιότητας αέρα της πόλης…",
    outdoors_help: "Κήπος, βεράντα, μπαλκόνι…: οι αισθητήρες τους δίνουν την εξωτερική θερμοκρασία, την ποιότητα αέρα και τον θόρυβο.",
    section_sensors: "Αισθητήρες",
    section_openings: "Παράθυρα και πόρτες",
    section_devices: "Συσκευές",
    section_lighting: "Φωτισμός",
    section_alerts: "Προειδοποιήσεις",
    none: "Κανένα",
    openings_help: "Η κατάστασή τους συγκρατεί ή ενεργοποιεί τις προειδοποιήσεις και τις ενισχύσεις παραθύρου.",
    naps: "Μεσημεριανοί ύπνοι",
    nap: "Μεσημεριανός ύπνος",
    no_naps: "Κανένας μεσημεριανός ύπνος: προσθέστε έναν για να χαμηλώνουν τα φώτα σε συγκεκριμένες ώρες.",
    alerts_default: "Προεπιλεγμένες ρυθμίσεις",
    customize_alert: "Προσαρμογή προειδοποίησης",
    room_alerts_help: "Μόνο οι προειδοποιήσεις που έχουν προσαρμοστεί για αυτό το δωμάτιο· οι υπόλοιπες ακολουθούν την καρτέλα Προειδοποιήσεις.",
    lighting_help: "Τα αναμμένα φώτα ακολουθούν την ώρα της ημέρας· το Smart Comfort δεν τα ανάβει ούτε τα σβήνει ποτέ. Οι ώρες βρίσκονται στην καρτέλα Πρόγραμμα.",
    presence_title: "Φώτα με παρουσία",
    presence_help: "Ανάβει τα φώτα όταν μπαίνει κάποιος και τα σβήνει όταν δεν μένει κανείς, όπως ένας αυτοματισμός παρουσίας.",
    presence_add: "Φώτα με παρουσία",
    presence_remove: "Διακοπή φώτων με παρουσία",
    presence_short: "Παρουσία",
    presence_sensors: "Αισθητήρες παρουσίας",
    presence_lights: "Φώτα",
    presence_lights_help: "Κενό: τα φώτα του δωματίου. Μπορεί να προστεθεί οποιοδήποτε φως (του διαδρόμου από την είσοδο…).",
    presence_lux: "Αισθητήρας φωτεινότητας",
    presence_max_lux: "Κάτω από",
    presence_max_lux_help: "Κανένα φως δεν ανάβει όταν το δωμάτιο είναι πιο φωτεινό από αυτό.",
    presence_off_after: "Σβήσιμο μετά από απουσία",
    presence_on_after: "Άναμμα μετά από παρουσία",
    presence_transition: "Μετάβαση",
    presence_on_after_help: "Κάποιος που απλώς περνάει από τον αισθητήρα δεν ανάβει τα φώτα.",
    presence_not_during_naps: "Σβηστά κατά τους μεσημεριανούς ύπνους",
    presence_not_during_naps_help: "Αυτά τα φώτα δεν ανάβουν όσο ένα δωμάτιο του σπιτιού έχει μεσημεριανό ύπνο.",
    slots_help: "Διαστήματα, με σειρά: το πρώτο που ισχύει για ένα φως αποφασίζει — μένει σβηστό ή ανάβει στη φωτεινότητά του.",
    slot_add: "Διάστημα",
    slot_lights: "Για τα φώτα",
    slot_lights_help: "Κενό: όλα τα φώτα παρουσίας.",
    slot_off: "Να μην ανάβει",
    slot_brightness: "Φωτεινότητα",
    slot_off_after: "Σβήσιμο μετά από απουσία",
    slot_color: "Χρώμα",
    a_empty: "Τίποτα ακόμα.",
    a_not_loaded: "Το Smart Comfort δεν έχει φορτωθεί.",
    a_all: "Όλα",
    a_group_devices: "Συσκευές",
    a_group_lights: "Φώτα",
    a_group_notifications: "Ειδοποιήσεις",
    a_group_manual: "Χειροκίνητα",
    a_today: "Σήμερα",
    a_yesterday: "Χθες",
    a_t_cool: "Ψύξη",
    a_t_cool_night: "Ψύξη, ήσυχη νύχτα",
    a_t_off: "Σβηστό",
    a_t_off_open: "Σβηστό: ένα παράθυρο μένει ανοιχτό",
    a_t_on: "Αναμμένο: κάνει ζέστη",
    a_t_on_night: "Αναμμένο, ήσυχη νύχτα",
    a_t_boost: "Ενίσχυση παραθύρου",
    a_t_purify: "Ενίσχυση: μολυσμένος αέρας",
    a_t_normal: "Επιστροφή στο κανονικό",
    a_t_night: "Νυχτερινή λειτουργία",
    a_t_keep_on: "Άναψε ξανά",
    a_lighting: "Φωτεινότητα της στιγμής",
    a_presence_on: "Αναμμένο: μπήκε κάποιος",
    a_presence_off: "Σβηστό: δεν έμεινε κανείς",
    a_display_off: "Ενδεικτική λυχνία σβηστή",
    a_display_on: "Ενδεικτική λυχνία αναμμένη ξανά",
    a_notified: "Ειδοποίηση",
    a_cleared: "Η ειδοποίηση διαγράφηκε: όλα επανήλθαν στο κανονικό",
    a_manual: "Άλλαξε χειροκίνητα: μένει ανέγγιχτο",
    a_manual_until: "Άλλαξε χειροκίνητα: μένει ανέγγιχτο έως τις {time}",
    a_reset: "Επιστροφή στο κανονικό (ορισμένη ώρα)",
    a_failed: "Δεν ήταν δυνατή η αποστολή",
    a_all_rooms: "Όλοι οι χώροι",
  },
};

// Strings of a Home Assistant language: the full tag when translated (sr-Latn), else its base (fr-FR: fr), else English.
const stringsFor = (language) => STRINGS[language] || STRINGS[String(language || "").split("-")[0]] || STRINGS.en;

// Language whose STRINGS are shown: the full tag when translated (sr-Latn), else its base, else English.
const resolvedLanguage = (language) => {
  const base = String(language || "").split("-")[0];
  return STRINGS[language] ? language : STRINGS[base] ? base : "en";
};

// Locale of numbers and dates: Home Assistant's full one when it is the language of the texts (pt-BR keeps its
// formats), else the language of the texts; pt alone is European Portuguese for Home Assistant, pt-PT for Intl.
const intlLocale = (hass) => {
  const full = hass?.locale?.language || hass?.language || "";
  const resolved = resolvedLanguage(hass?.language);
  const locale = full.split("-")[0] === resolved.split("-")[0] ? full : resolved;
  return locale === "pt" ? "pt-PT" : locale;
};

const TABS = ["overview", "activity", "rooms", "outdoors", "alerts", "schedule", "settings", "yaml_tab"];
// Activity tab: its filters (a failed command goes with what it was sent to), the icons of its lines, the lines kept.
const ACTIVITY_GROUPS = {
  devices: new Set(["device", "display", "reset"]),
  lights: new Set(["lighting", "presence_on", "presence_off"]),
  notifications: new Set(["notified", "cleared"]),
  manual: new Set(["manual"]),
};
const ACTIVITY_ICONS = {
  device: "mdi:fan",
  lighting: "mdi:lightbulb-auto-outline",
  presence_on: "mdi:motion-sensor",
  presence_off: "mdi:motion-sensor-off",
  display: "mdi:led-off",
  notified: "mdi:bell-ring-outline",
  cleared: "mdi:bell-check-outline",
  manual: "mdi:hand-back-right-outline",
  reset: "mdi:clock-check-outline",
  failed: "mdi:alert-circle-outline",
};
const ACTIVITY_MAX = 300;

/** The filter of an activity line. A failed command counts as what it was sent to: a light's with the lights. */
const activityGroup = (entry) => {
  if (entry.kind === "failed") {
    if (String(entry.target || "").startsWith("display_")) return "devices";
    return String(entry.action || entry.entity_id || "").startsWith("light.") ? "lights" : "devices";
  }
  return Object.entries(ACTIVITY_GROUPS).find(([, kinds]) => kinds.has(entry.kind))?.[0];
};
// Addresses of the tabs of earlier versions.
const OLD_TABS = { notifications: "settings", control: "settings" };

const clone = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));
/** YAML of the options (what goes under `smart_comfort:`), keys in their order. */
const YAML_PLAIN = /^[A-Za-z_][\w.\-/ ]*$/;
const YAML_WORDS = new Set(["true", "false", "yes", "no", "on", "off", "null", "y", "n", "~"]);
function yamlScalar(v) {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean" || typeof v === "number") return String(v);
  const text = String(v);
  return YAML_PLAIN.test(text) && !YAML_WORDS.has(text.toLowerCase()) && !text.endsWith(" ") ? text : JSON.stringify(text);
}
/** The paths (key lists) where `a` and `b` differ; lists are compared whole. */
function changedPaths(a, b, path = []) {
  const plain = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  if (plain(a) && plain(b)) {
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap((key) => changedPaths(a[key], b[key], [...path, key]));
  }
  return JSON.stringify(a) === JSON.stringify(b) ? [] : [path];
}

function pathValue(value, path) {
  return path.reduce((v, key) => (v === null || v === undefined ? undefined : v[key]), value);
}

function toYaml(value, indent = "") {
  const lines = [];
  const block = (v) => v !== null && typeof v === "object" && Object.keys(v).length > 0;
  if (Array.isArray(value)) {
    for (const item of value) {
      if (!block(item)) {
        lines.push(`${indent}- ${Array.isArray(item) ? "[]" : item !== null && typeof item === "object" ? "{}" : yamlScalar(item)}`);
        continue;
      }
      const inner = toYaml(item, `${indent}  `).split("\n");
      lines.push(`${indent}- ${inner[0].trimStart()}`, ...inner.slice(1));
    }
  } else {
    for (const [key, v] of Object.entries(value)) {
      if (block(v)) lines.push(`${indent}${yamlScalar(key)}:`, toYaml(v, `${indent}  `));
      else lines.push(`${indent}${yamlScalar(key)}: ${Array.isArray(v) ? "[]" : v !== null && typeof v === "object" ? "{}" : yamlScalar(v)}`);
    }
  }
  return lines.join("\n");
}
const isEmpty = (v) => v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);
// Sensors of a room, in the order of its form.
const SENSOR_KEYS = ["temperature", "co2", "humidity", "noise", "pm25", "pm10", "air_quality"];

/** Drop empty values, recursively; empty objects go too. */
function prune(value) {
  if (Array.isArray(value)) return value.map(prune);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, v] of Object.entries(value)) {
      const p = prune(v);
      if (isEmpty(p) || (p && typeof p === "object" && !Array.isArray(p) && Object.keys(p).length === 0)) continue;
      out[key] = p;
    }
    return out;
  }
  return value;
}

/** Indexes of a set once the item at `index` was removed from its list. */
function shifted(indexes, index) {
  return new Set([...indexes].filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)));
}

const TIME = /^\d{1,2}:\d{2}(:\d{2})?$/;
/** Same value for the options: "09:00" and "09:00:00" are the same time. */
function same(a, b) {
  if (typeof a === "string" && typeof b === "string" && TIME.test(a) && TIME.test(b)) {
    const norm = (t) => t.split(":").map((x) => x.padStart(2, "0")).concat(["00"]).slice(0, 3).join(":");
    return norm(a) === norm(b);
  }
  return JSON.stringify(a) === JSON.stringify(b);
}

/** The keys of value that differ from defaults (defaults are what a missing key means). */
function diff(value, defaults) {
  const out = {};
  for (const [key, v] of Object.entries(value || {})) {
    const d = defaults ? defaults[key] : undefined;
    if (v && typeof v === "object" && !Array.isArray(v) && d && typeof d === "object") {
      const sub = diff(v, d);
      if (Object.keys(sub).length) out[key] = sub;
    } else if (!isEmpty(v) && !same(v, d)) {
      out[key] = v;
    }
  }
  return out;
}

/** Defaults with the values set on top, nested one level for the device sections. */
function merged(defaults, values) {
  const out = { ...clone(defaults) };
  for (const [key, v] of Object.entries(values || {})) {
    if (v && typeof v === "object" && !Array.isArray(v) && out[key] && typeof out[key] === "object") {
      out[key] = { ...out[key], ...v };
    } else {
      out[key] = v;
    }
  }
  return out;
}

const num = (unit, opts = {}) => ({
  number: { mode: "box", step: opts.step ?? 0.1, min: opts.min ?? -50, max: opts.max ?? 5000, unit_of_measurement: unit },
});
const minutes = (min = 0) => ({ number: { mode: "box", step: 1, min, max: 1440, unit_of_measurement: "min" } });
const percent = { number: { mode: "slider", step: 1, min: 0, max: 100, unit_of_measurement: "%" } };
const text = { text: {} };
const bool = { boolean: {} };
const time = { time: {} };
const entity = (domain, extra = {}) => ({ entity: { domain, ...extra } });
// Every device: its indicator light or display, and a time to go back to its normal state.
const EQUIPMENT = [
  { name: "display", selector: entity(["light", "switch", "number", "select"]) },
  { name: "reset_at", selector: time },
];
const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const kelvin = { number: { mode: "box", step: 100, min: 1500, max: 10000, unit_of_measurement: "K" } };
const level = { number: { mode: "box", step: 1, min: 1, max: 100, unit_of_measurement: "%" } };
const MOMENTS = ["day", "evening", "night", "morning", "nap"];
const grid = (schema) => ({ type: "grid", name: "", column_min_width: "110px", schema });
/** Brightness by time of day on one row, then the warmth (its values only when it is on): global, and per light. */
const lightingLevels = (warm) => [
  grid(MOMENTS.map((m) => ({ name: m, selector: level }))),
  { name: "warmth", selector: bool },
  ...(warm ? [grid(MOMENTS.map((m) => ({ name: `${m}_kelvin`, selector: kelvin })))] : []),
];
const LEVEL_KEYS = MOMENTS.flatMap((m) => [m, `${m}_kelvin`]);
/** The field names of a schema, through its grids and expandables. */
const schemaKeys = (schema) => schema.flatMap((f) => (f.schema ? schemaKeys(f.schema) : [f.name]));
/** Instants of a day as minutes, from "HH:MM[:SS]". */
const minutesOf = (t) => {
  if (typeof t !== "string" || !TIME.test(t)) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

let haFormLoading;
/** ha-form and the entity pickers are lazy-loaded by Home Assistant: load them through a card editor. */
function loadHaForm() {
  if (customElements.get("ha-form")) return Promise.resolve();
  if (!haFormLoading) {
    haFormLoading = (async () => {
      if (window.loadCardHelpers) {
        const helpers = await window.loadCardHelpers();
        const card = await helpers.createCardElement({ type: "entities", entities: [] });
        if (card?.constructor?.getConfigElement) await card.constructor.getConfigElement();
      }
      await customElements.whenDefined("ha-form");
    })().catch((err) => {
      // Tried again next time rather than failing for good.
      haFormLoading = null;
      throw err;
    });
  }
  return haFormLoading;
}

class SmartComfortPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._tab = "overview";
    this._config = null; // smart_comfort/config result
    this._draft = null; // options being edited
    this._status = undefined; // undefined: not received yet, null: not loaded
    this._labels = {};
    this._selector = {};
    this._forms = [];
    this._message = null;
    this._saving = false;
    this._expanded = new Set();
    this._expandedOutdoors = new Set();
    // Open sections ("room index:section", "alert:kind") and fields shown before they have a value.
    this._openSections = new Set();
    this._shown = new Set();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    for (const form of this._forms) form.hass = hass;
    if (first) this._init();
  }

  get hass() {
    return this._hass;
  }

  /** /smart-comfort/<tab> opens that tab. */
  set route(route) {
    const path = (route?.path || "").split("/").filter(Boolean)[0];
    const tab = OLD_TABS[path] || path;
    if (TABS.includes(tab) && tab !== this._tab) {
      this._tab = tab;
      if (this._config !== null || this._error) this._render();
    }
  }

  set narrow(narrow) {
    this._narrow = narrow;
    if (this._menu) this._menu.narrow = narrow;
  }

  connectedCallback() {
    this._upgradeProperties();
    if (this._hass && !this._unsub) this._subscribe();
    this._watchConnection(true);
    // Back on the panel after a failed load: try again now.
    if (this._hass && this._failed) this._reload();
  }

  // Home Assistant creates the panel as soon as its file has run and sets narrow, route and hass right away. In the
  // release, the element is only defined once the page's language file is in (scripts/i18n-split.mjs): the values
  // set before land as plain properties on the not-yet-defined element and hide the setters, so the panel stayed
  // empty on its first opening. They are passed through the setters now (narrow and route before hass, which draws).
  _upgradeProperties() {
    for (const name of ["narrow", "route", "hass"]) {
      if (!Object.hasOwn(this, name)) continue;
      const value = this[name];
      delete this[name];
      this[name] = value;
    }
  }

  disconnectedCallback() {
    this._watchConnection(false);
    clearTimeout(this._retryTimer);
    this._stopActivity();
    if (this._unsub) {
      this._unsub.then((unsub) => unsub()).catch(() => {});
      this._unsub = null;
    }
  }

  // The connection back (Home Assistant restarted, the app resumed): load again, the data may have changed meanwhile.
  _watchConnection(on) {
    const connection = this._hass?.connection;
    if (!connection?.addEventListener) return;
    // Unsaved edits are kept: only a failed load is redone then.
    this._onReady ||= () => {
      if (this._failed || !this._dirty) this._reload();
    };
    connection.removeEventListener("ready", this._onReady);
    if (on) connection.addEventListener("ready", this._onReady);
  }

  // A load that failed (Home Assistant still starting, the connection dropped) is tried again after 2 s, 5 s, 15 s,
  // then every 30 s while the panel is shown, instead of leaving it empty.
  _retry(failed) {
    clearTimeout(this._retryTimer);
    this._failed = failed;
    if (!failed) {
      this._retries = 0;
      return;
    }
    const delay = [2000, 5000, 15000, 30000][Math.min(this._retries || 0, 3)];
    this._retries = (this._retries || 0) + 1;
    this._retryTimer = setTimeout(() => {
      if (this.isConnected) this._reload();
    }, delay);
  }

  _reload() {
    this._load().then(() => this._subscribe());
  }

  // Strings.

  _t(key, values = {}) {
    let s = stringsFor(this._hass?.language)[key] ?? STRINGS.en[key] ?? key;
    for (const [k, v] of Object.entries(values)) s = s.replace(`{${k}}`, v);
    return s;
  }

  _label(step, name, section) {
    const base = `component.${DOMAIN}.options.step.${step}`;
    const r = this._labels || {};
    return (
      (section && r[`${base}.sections.${section}.data.${name}`]) || r[`${base}.data.${name}`] || name
    );
  }

  _helper(step, name, section) {
    const base = `component.${DOMAIN}.options.step.${step}`;
    const r = this._labels || {};
    return (section && r[`${base}.sections.${section}.data_description.${name}`]) || r[`${base}.data_description.${name}`];
  }

  _sectionTitle(step, section) {
    return this._labels?.[`component.${DOMAIN}.options.step.${step}.sections.${section}.name`] || section;
  }

  _kindName(kind) {
    return this._selector?.[`component.${DOMAIN}.selector.kind.options.${kind}`] || kind;
  }

  _options(selector, values) {
    return values.map((value) => ({
      value,
      label: this._selector?.[`component.${DOMAIN}.selector.${selector}.options.${value}`] || value,
    }));
  }

  // Data.

  async _init() {
    // The toolbar and tabs right away, whatever answers next.
    this._render();
    this._watchConnection(this.isConnected);
    const language = this._hass.language || "en";
    const get = (category) =>
      this._hass
        .callWS({ type: "frontend/get_translations", language, category, integration: [DOMAIN] })
        .then((r) => r?.resources || {})
        .catch(() => ({}));
    // ha-form (lazy-loaded by Home Assistant) only draws the settings forms: no waiting for it, they are drawn
    // again once it is there. Waiting held the whole panel empty until another page had loaded it.
    if (!customElements.get("ha-form")) {
      loadHaForm().catch(() => {});
      customElements.whenDefined("ha-form").then(() => {
        if (this._config) this._renderTab();
      });
    }
    // The settings are requested alongside the translations, not after them: labels fall back to the field
    // names until the translations are in, then the panel is drawn again.
    const translations = Promise.all([get("options"), get("selector")]).then(([labels, selector]) => {
      this._labels = labels;
      this._selector = selector;
      if (this._config) this._render();
    });
    await Promise.all([this._load().then(() => this._subscribe()), translations]);
  }

  async _load() {
    try {
      this._config = await this._hass.callWS({ type: `${DOMAIN}/config` });
      this._draft = clone(this._config.options);
      this._error = null;
      this._retry(false);
    } catch (err) {
      this._config = null;
      this._error = err.code === "not_found" ? this._t("not_setup") : err.message;
      // Not set up stays so; anything else (still starting, connection lost) is tried again.
      this._retry(err.code !== "not_found");
    }
    this._render();
  }

  _subscribe() {
    if (this._unsub || !this._hass) return;
    this._unsub = this._hass.connection.subscribeMessage(
      (msg) => {
        this._status = msg.status;
        // The options changed elsewhere (the file, the YAML, another window): load them, unless edits are pending.
        if (msg.revision && this._config && msg.revision !== this._config.revision && !this._dirty && !this._saving) {
          this._reload();
          return;
        }
        if (this._tab === "overview") this._renderTab();
        else this._renderHead();
      },
      { type: `${DOMAIN}/subscribe` }
    );
    this._unsub.catch(() => {
      this._unsub = null;
    });
  }

  get _dirty() {
    if (!this._config) return false;
    return JSON.stringify(prune(this._draft)) !== JSON.stringify(prune(this._config.options));
  }

  async _save(force = false) {
    this._saving = true;
    this._message = null;
    this._renderToolbar();
    try {
      const result = await this._hass.callWS({
        type: `${DOMAIN}/config/save`,
        options: prune(this._draft),
        revision: this._config.revision,
        force,
      });
      if (result.conflict) {
        // Changed meanwhile (the file, the YAML, another window): both shown, the user chooses.
        this._conflict = { ...result.conflict, base: this._config.options };
        this._saving = false;
        this._render();
        return;
      }
      this._conflict = null;
      this._config.options = result.options;
      this._config.revision = result.revision;
      this._draft = clone(result.options);
      window.dispatchEvent(new CustomEvent("smart-comfort-header", { detail: { hide_header: result.options.hide_header || "off" } }));
      this._message = { type: "success", text: this._t("saved") };
      this._discovered = null;
    } catch (err) {
      this._message = { type: "error", text: err.message };
    }
    this._saving = false;
    this._render();
  }

  _discard() {
    this._draft = clone(this._config.options);
    this._discovered = null;
    this._message = null;
    this._render();
  }

  _changed() {
    this._renderToolbar();
  }

  // Rendering.

  _render() {
    const root = this.shadowRoot;
    // The top bar is the living room across the page (as on the ENT ONE panel); the tabs under it, with the
    // unsaved-changes actions at their right so they stay in reach while scrolling.
    root.innerHTML = `<style>${STYLE}</style>
      <div class="topbar"></div>
      <div class="tabs"><span class="tabmenu"></span><div class="tablist" role="tablist"></div><div class="actions"></div></div>
      <div class="content"></div>`;
    const menu = document.createElement("ha-menu-button");
    menu.hass = this._hass;
    menu.narrow = this._narrow;
    this._menu = menu;
    const tabs = root.querySelector(".tablist");
    for (const tab of TABS) {
      const b = document.createElement("button");
      b.className = `tab${tab === this._tab ? " active" : ""}`;
      b.dataset.tab = tab;
      b.setAttribute("role", "tab");
      b.textContent = this._t(tab);
      b.addEventListener("click", () => this._goTab(tab));
      tabs.append(b);
    }
    this._renderHead();
    this._renderToolbar();
    this._renderTab();
  }

  /** Whether the panel's top bar is hidden for this user: the dashboards' "Hide the top bar" option applies here too. */
  _bare() {
    const mode = this._config?.options?.hide_header || "off";
    return mode === "everyone" || (mode === "non_admins" && this._hass?.user?.is_admin === false);
  }

  /**
   * The top bar: Smart Comfort, the points to watch as a pill, the comfort score, the outdoor temperature and the
   * quiet night under it, the living room picturing the worst state; Notify now and the integration as round buttons.
   * Hidden (option): the tabs alone, the menu button in front of them. The menu button is kept across redraws.
   */
  _renderHead() {
    const root = this.shadowRoot;
    const bar = root?.querySelector?.(".topbar");
    if (!bar) return;
    const bare = this._bare();
    this.toggleAttribute("bare", bare);
    const menu = this._menu;
    if (bare) {
      bar.replaceChildren();
      if (menu) root.querySelector(".tabmenu")?.append(menu);
    } else {
      const banner = scbBanner(this, "overview", { head: true });
      const slot = banner.querySelector(".shhead");
      const hmenu = this._el("span", "hmenu");
      if (menu) hmenu.append(menu);
      slot?.prepend(hmenu);
      const acts = this._el("div", "hacts");
      if (this._status) {
        const notify = this._iconButton("mdi:bell-ring-outline", this._t("notify_now"), () => this._service("notify_now"));
        acts.append(notify);
      }
      const cog = document.createElement("a");
      cog.href = `/config/integrations/integration/${DOMAIN}`;
      cog.className = "icon-btn";
      cog.title = this._t("settings");
      cog.setAttribute("aria-label", this._t("settings"));
      const ci = document.createElement("ha-icon");
      ci.icon = "mdi:cog";
      cog.append(ci);
      acts.append(cog);
      banner.append(acts);
      bar.replaceChildren(banner);
    }
    // The active alerts on the Alerts tab, like the sidebar badge
    const points = this._status ? this._comfort(this._status).points : 0;
    const alertsTab = root.querySelector('.tab[data-tab="alerts"]');
    if (alertsTab) alertsTab.innerHTML = `${this._t("alerts").replace(/[&<>"]/g, (ch) => `&#${ch.charCodeAt(0)};`)}${points ? `<span class="cnt">${points}</span>` : ""}`;
  }

  _renderToolbar() {
    const actions = this.shadowRoot.querySelector(".actions");
    if (!actions) return;
    actions.innerHTML = "";
    if (this._dirty) {
      const note = document.createElement("span");
      note.className = "dirty";
      note.textContent = this._t("unsaved");
      actions.append(note, this._button(this._t("discard"), () => this._discard()));
      const save = this._button(this._saving ? this._t("saving") : this._t("save"), () => this._save(), "primary");
      save.disabled = this._saving;
      actions.append(save);
    }
  }

  _button(label, onClick, kind = "") {
    const b = document.createElement("button");
    b.className = `btn ${kind}`;
    b.textContent = label;
    b.addEventListener("click", onClick);
    return b;
  }

  _iconButton(icon, label, onClick) {
    const b = document.createElement("button");
    b.className = "icon-btn";
    b.title = label;
    b.setAttribute("aria-label", label);
    const i = document.createElement("ha-icon");
    i.icon = icon;
    b.append(i);
    b.addEventListener("click", onClick);
    return b;
  }

  _el(tag, cls, content) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (content !== undefined) e.textContent = content;
    return e;
  }

  _card(title, icon) {
    const card = this._el("div", "card");
    if (title) {
      const h = this._el("div", "card-header");
      if (icon) {
        const i = document.createElement("ha-icon");
        i.icon = icon;
        h.append(i);
      }
      h.append(this._el("span", "", title));
      card.append(h);
    }
    return card;
  }

  _form(schema, data, onChange, label, helper) {
    const form = document.createElement("ha-form");
    form.hass = this._hass;
    form.schema = schema;
    form.data = data;
    form.computeLabel = label;
    if (helper) form.computeHelper = helper;
    form.addEventListener("value-changed", (ev) => {
      ev.stopPropagation();
      const value = ev.detail.value;
      form.data = value;
      onChange(value);
      this._changed();
    });
    this._forms.push(form);
    return form;
  }

  _renderTab() {
    const content = this.shadowRoot.querySelector(".content");
    if (!content) return;
    content.innerHTML = "";
    this._forms = [];
    this._activityList = null;
    if (this._message) {
      content.append(this._el("div", `banner ${this._message.type}`, this._message.text));
    }
    if (!this._config) {
      // Loading: a quiet "…"; a failed load (not "not set up"): its error and Retry, tried again on its own meanwhile.
      const banner = this._el("div", this._error ? "banner error" : "banner", this._error || "…");
      if (this._error && this._failed) {
        const retry = this._el("button", "retry", this._t("retry"));
        retry.addEventListener("click", () => this._reload());
        banner.append(" ", retry);
      }
      content.append(banner);
      return;
    }
    const render = {
      overview: () => this._renderOverview(content),
      rooms: () => this._renderRooms(content),
      outdoors: () => this._renderOutdoors(content),
      alerts: () => this._renderAlerts(content),
      schedule: () => this._renderSchedule(content),
      settings: () => this._renderSettings(content),
      yaml_tab: () => this._renderYaml(content),
      activity: () => this._renderActivity(content),
    }[this._tab];
    this._renderHead();
    // The tab's header card: a compact header (the picture is the panel's top bar), then the blocks that open the tab
    // (summary tiles, help, discover); the overview has no header of its own, the top bar is its header.
    const top = this._el("div", "card shtop");
    if (this._tab !== "overview") top.append(scbBanner(this, this._tab, { compact: true }));
    content.append(top);
    if (this._conflict) content.append(this._conflictCard());
    // Settings shows the file in its Source card.
    const banner = this._config.file ? !["overview", "settings"].includes(this._tab) : this._config.yaml && this._tab !== "overview";
    if (banner) content.append(this._yamlBanner());
    render();
    const body = this._el("div", "shbody");
    while (top.nextElementSibling?.matches(".banner.info, .summary, .section-help, .discover, .start")) body.append(top.nextElementSibling);
    if (body.childElementCount) top.append(body);
    if (!top.childElementCount) top.remove();
  }

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
      if (this._t(`a_t_${t}`) !== `a_t_${t}`) return this._t(`a_t_${t}`);
      if (t === "presence") return this._t("a_presence_on");
      if (t === "display_off" || t === "display_on") return this._t(`a_${t}`);
      return `${this._t("a_lighting")} · ${t}`;
    };
    let icon = ACTIVITY_ICONS[entry.kind] || "mdi:information-outline";
    let text;
    if (entry.kind === "device") {
      text = target(entry.target);
      icon = { climate: "mdi:air-conditioner", fan: "mdi:fan" }[String(entry.entity_id).split(".")[0]] || icon;
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

  // YAML: the configuration of the integration, as it goes under `smart_comfort:` in configuration.yaml.

  _renderYaml(content) {
    const card = this._card(this._t("yaml_tab"), "mdi:code-braces");
    // Kept in smart_comfort.yaml: the file as it is (or will be once saved), without the `smart_comfort:` key.
    const file = this._config.file;
    const text = file ? `${toYaml(this._draft || {}, "")}\n` : `smart_comfort:\n${toYaml(this._draft || {}, "  ")}\n`;
    let help = file ? this._t("yaml_help_file", { file: file.name }) : this._t(this._dirty ? "yaml_help_unsaved" : "yaml_help");
    if (file && this._dirty) help += ` · ${this._t("unsaved")}`;
    card.append(this._el("div", "help", help));
    const pre = this._el("pre", "yaml", text);
    const copy = this._button(this._t("yaml_copy"), async () => {
      try {
        await navigator.clipboard.writeText(text);
        copy.textContent = this._t("yaml_copied");
      } catch (_err) {
        const range = document.createRange();
        range.selectNodeContents(pre);
        const selection = this.shadowRoot.getSelection?.() || window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });
    card.append(copy, pre);
    content.append(card);
  }

  // Overview.

  _format(value, digits = 1) {
    if (typeof value !== "number") return "–";
    return value.toLocaleString(intlLocale(this._hass), { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  }

  _time(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const today = new Date().toDateString() === d.toDateString();
    return today
      ? d.toLocaleTimeString(intlLocale(this._hass), { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleString(intlLocale(this._hass), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  /** Settings: smart_comfort.yaml, kept in sync both ways (or how to start it). */
  _sourceCard() {
    const card = this._card(this._t("src_title"), "mdi:file-sync-outline");
    card.classList.add("source");
    const file = this._config.file;
    const name = file?.name || "smart_comfort.yaml";
    if (!file) {
      const row = this._el("div", "srow");
      const text = this._el("div", "stext");
      text.append(this._el("div", "sname", this._t("src_none", { file: name })), this._el("div", "shelp", this._t("src_create_help", { file: name })));
      const create = this._button(this._t("src_create", { file: name }), () => this._createFile(), "primary");
      row.append(text, create);
      card.append(row);
      return card;
    }
    const head = this._el("div", "sfile");
    head.append(this._el("span", "pill info", "YAML"), this._el("code", "", `/config/${name}`));
    const time = file.mtime ? new Date(file.mtime * 1000).toLocaleTimeString(this._hass.language, { hour: "2-digit", minute: "2-digit" }) : "—";
    const rooms = (this._config.options.rooms || []).length;
    const status = file.invalid ? this._t("src_status_invalid", { time, error: file.invalid }) : this._t("src_status", { time, rooms });
    head.append(this._el("span", `sstatus${file.invalid ? " bad" : ""}`, status));
    const reload = this._button(this._t("src_reload"), () => this._reloadYaml());
    reload.disabled = !!this._reloadingYaml;
    head.append(reload);
    card.append(head);
    if (this._yamlNote) card.append(this._el("div", "shelp note", this._yamlNote));
    const toggle = (key, label, help) => {
      const row = this._el("div", "srow");
      const text = this._el("div", "stext");
      text.append(this._el("div", "sname", label), this._el("div", "shelp", help));
      const sw = this._el("label", "sw");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = this._draft[key] !== false;
      input.setAttribute("aria-label", label);
      input.addEventListener("change", () => {
        if (input.checked) delete this._draft[key];
        else this._draft[key] = false;
        this._changed();
      });
      sw.append(input, this._el("span"));
      row.append(text, sw);
      card.append(row);
    };
    toggle("file_write", this._t("src_write"), this._t("src_write_help"));
    toggle("file_watch", this._t("src_watch"), this._t("src_watch_help"));
    if (file.included?.length) {
      const row = this._el("div", "srow");
      const text = this._el("div", "stext");
      text.append(this._el("div", "sname", this._t("src_included")), this._el("div", "shelp", this._t("src_included_help", { files: file.included.join(", ") })));
      row.append(text, this._el("span", "pill", String(file.included.length)));
      card.append(row);
    }
    return card;
  }

  async _createFile() {
    try {
      await this._hass.callWS({ type: `${DOMAIN}/file/create` });
      this._yamlNote = null;
    } catch (err) {
      this._message = { type: "error", text: err.message };
    }
    this._reload();
  }

  /** Saving found options changed elsewhere: what changed there, the file's value against the panel's. */
  _conflictCard() {
    const c = this._conflict;
    const card = this._card(this._t("conflict_title"), "mdi:file-alert-outline");
    card.classList.add("conflict");
    const paths = changedPaths(c.base, c.options);
    const time = c.file?.mtime ? new Date(c.file.mtime * 1000).toLocaleTimeString(this._hass.language, { hour: "2-digit", minute: "2-digit" }) : "";
    card.append(
      this._el("div", "shelp", c.file ? this._t("conflict_sub", { n: paths.length, file: c.file.name, time }) : this._t("conflict_sub_other", { n: paths.length }))
    );
    const show = (source) =>
      paths
        .slice(0, 8)
        .map((path) => `${path.join(".")}: ${JSON.stringify(pathValue(source, path)) ?? "—"}`)
        .join("\n");
    const grid = this._el("div", "cgrid");
    const side = (cls, title, text) => {
      const box = this._el("div", `cbox ${cls}`);
      box.append(this._el("div", "ctitle", title), this._el("pre", "", text));
      return box;
    };
    grid.append(side("file", this._t("conflict_file"), show(c.options)), side("panel", this._t("conflict_panel"), show(this._draft)));
    const actions = this._el("div", "cactions");
    actions.append(
      this._button(this._t("conflict_keep_file"), () => {
        this._conflict = null;
        this._reload();
      }),
      this._button(this._t("conflict_keep_panel"), () => this._save(true), "primary")
    );
    card.append(grid, actions);
    return card;
  }

  /** The configuration comes from YAML: what that means, and Reload the YAML (the result stays shown until the next one). */
  _yamlBanner() {
    const file = this._config.file;
    const text = file ? this._t("yaml_file", { file: file.name }) : this._t("yaml");
    const banner = this._el("div", "banner info", text);
    const reload = this._el("button", "retry", this._t("yaml_reload"));
    reload.type = "button";
    reload.disabled = !!this._reloadingYaml;
    reload.addEventListener("click", () => this._reloadYaml());
    banner.append(reload);
    if (this._yamlNote) banner.append(this._el("div", "note", this._yamlNote));
    return banner;
  }

  async _reloadYaml() {
    this._reloadingYaml = true;
    this._render();
    let applied = false;
    try {
      const { response } = await this._hass.callService(DOMAIN, "reload", {}, undefined, true, true);
      applied = response.applied;
      if (!applied) this._yamlNote = this._t("yaml_unchanged");
      else if (response.conflicts.length) this._yamlNote = this._t("yaml_conflicts", { paths: response.conflicts.join(", ") });
      else this._yamlNote = this._t("yaml_reloaded");
    } catch (err) {
      this._yamlNote = err.message;
    }
    this._reloadingYaml = false;
    // Applied: the options changed, load them again; otherwise the unsaved edits stay.
    if (applied) this._reload();
    else this._render();
  }

  _service(service, data = {}) {
    return this._hass.callService(DOMAIN, service, data);
  }

  _goTab(tab) {
    this._tab = tab;
    const base = (this.panel?.url_path || "smart-comfort").replace(/^\//, "");
    history.replaceState(history.state, "", `/${base}${tab === "overview" ? "" : `/${tab}`}`);
    this._render();
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

  /** The type chosen in a room's form: stored when the user changes it, living space included, since discovery
   *  suggests a type only to the rooms without one (a room set back to living space stays so); unchanged, left as is. */
  _setRoomType(room, type) {
    const chosen = type || "living_space";
    if (chosen !== (room.type || "living_space")) room.type = chosen;
  }

  /** The comfort score shown in the overview hero: 100 minus a penalty per active alert, weighted by severity like the
   *  per-room comfort sensors (SCORE_PENALTY), the tone from it, the active alerts grouped by kind, and how many rooms
   *  have nothing active. Annex rooms (cellar, garage…) stay out of it, so a cold cellar never pulls the home down. */
  _comfort(s) {
    const annex = new Set((s.rooms || []).filter((r) => r.is_annex).map((r) => r.room_id));
    const rooms = (s.rooms || []).filter((r) => !r.is_annex);
    const alerts = (s.alerts || []).filter((a) => !annex.has(a.room));
    const points = alerts.length;
    const penalty = alerts.reduce((sum, a) => sum + (SCORE_PENALTY[a.severity] ?? SCORE_PENALTY.info), 0);
    const score = Math.max(0, 100 - penalty);
    const tone = !points ? "good" : alerts.some((a) => a.severity === "critical") ? "bad" : "warn";
    const byKind = {};
    for (const a of alerts) byKind[a.kind] = (byKind[a.kind] || 0) + 1;
    const okRooms = rooms.filter((r) => !(r.alerts || []).length).length;
    return { score, tone, points, byKind, okRooms };
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
      toggle(s.control_enabled, "mdi:air-conditioner", "mdi:hand-back-right-off", "control_on", "control_off", "control"),
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

  _switch(key) {
    const entries = Object.values(this._hass.entities || {}).filter(
      (e) => e.platform === DOMAIN && e.entity_id.startsWith("switch.")
    );
    const found = entries.find((e) => e.translation_key === key);
    if (found) return found.entity_id;
    return {
      control: "switch.smart_comfort_device_control",
      lighting: "switch.smart_comfort_adaptive_lighting",
    }[key] || "switch.smart_comfort_notifications";
  }

  // Notifications (general options).

  // Shared form helpers.

  _advanced(schema) {
    return { type: "expandable", name: "", flatten: true, title: this._t("advanced"), icon: "mdi:tune-variant", schema };
  }

  /** A form of top-level options: only what differs from the defaults is stored. */
  _topForm(schema) {
    const defaults = this._config.defaults.general;
    const keys = schemaKeys(schema);
    const own = Object.fromEntries(keys.filter((k) => k in this._draft).map((k) => [k, this._draft[k]]));
    return this._form(
      schema,
      merged(defaults, own),
      (value) => {
        const changed = diff(Object.fromEntries(keys.map((k) => [k, value[k]])), defaults);
        for (const key of keys) delete this._draft[key];
        Object.assign(this._draft, changed);
      },
      (f) => (f.type === "expandable" ? f.title : this._label("general", f.name)),
      (f) => this._helper("general", f.name)
    );
  }

  /** Writes values into a section of the options (control, lighting), keeping only what differs from its defaults. */
  _setSection(section, values) {
    const defaults = this._config.defaults[section];
    const changed = diff({ ...merged(defaults, this._draft[section] || {}), ...values }, defaults);
    if (Object.keys(changed).length) this._draft[section] = changed;
    else delete this._draft[section];
  }

  _sectionForm(section, schemaFor, label, helper) {
    const data = merged(this._config.defaults[section], this._draft[section] || {});
    const form = this._form(
      schemaFor(data),
      data,
      (value) => {
        this._setSection(section, value);
        form.schema = schemaFor(value);
      },
      label,
      helper
    );
    return form;
  }

  /** A row that opens and closes its content (sections of a room, alert kinds). */
  _section(parent, key, icon, title, summary, build) {
    const open = this._openSections.has(key);
    const wrap = this._el("div", `section${open ? " open" : ""}`);
    const head = this._el("button", "section-head");
    head.setAttribute("aria-expanded", String(open));
    const i = document.createElement("ha-icon");
    i.icon = icon;
    const chevron = document.createElement("ha-icon");
    chevron.className = "chevron";
    chevron.icon = open ? "mdi:chevron-up" : "mdi:chevron-down";
    head.append(i, this._el("span", "section-name", title), this._el("span", "section-summary", summary), chevron);
    head.addEventListener("click", () => {
      if (open) this._openSections.delete(key);
      else this._openSections.add(key);
      this._renderTab();
    });
    wrap.append(head);
    if (open) {
      const body = this._el("div", "section-body");
      build(body);
      wrap.append(body);
    }
    parent.append(wrap);
  }

  /** "+ Something" buttons, for what isn't set yet. */
  _addChips(parent, items) {
    if (!items.length) return;
    const row = this._el("div", "add-chips");
    for (const [label, onClick] of items) {
      const b = this._el("button", "add-chip");
      const i = document.createElement("ha-icon");
      i.icon = "mdi:plus";
      b.append(i, document.createTextNode(label));
      b.addEventListener("click", onClick);
      row.append(b);
    }
    parent.append(row);
  }

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
        { name: "presence", selector: entity(["zone", "person", "group", "binary_sensor", "input_boolean", "device_tracker"]) },
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

  // Alerts.

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

  // Device control.

  _controlSchema() {
    const sec = (name, schema) => ({ type: "expandable", name, title: this._sectionTitle("control", name), schema });
    return [
      { name: "enabled", selector: bool },
      { name: "suppress_when_handled", selector: bool },
      { name: "manual_override", selector: minutes() },
      sec("climate", [
        { name: "cool_above", selector: num("°C") },
        { name: "off_below", selector: num("°C") },
        { name: "setpoint", selector: num("°C", { step: 0.5 }) },
        { name: "closed_for", selector: minutes() },
        { name: "off_on_open", selector: minutes() },
      ]),
      sec("fans", [
        { name: "on_above", selector: num("°C") },
        { name: "off_below", selector: num("°C") },
        { name: "percentage", selector: percent },
        { name: "open_percentage", selector: percent },
        { name: "night_percentage", selector: percent },
      ]),
      sec("purifiers", [
        { name: "open_percentage", selector: percent },
        { name: "keep_on", selector: bool },
        { name: "night_percentage", selector: percent },
      ]),
    ];
  }

  _controlLabel(schema) {
    if (schema.type === "expandable") return this._sectionTitle("control", schema.name);
    for (const section of [null, "climate", "fans", "purifiers"]) {
      const label = this._label("control", schema.name, section);
      if (label !== schema.name) return label;
    }
    return schema.name;
  }

  _controlHelper(schema) {
    for (const section of [null, "climate", "fans", "purifiers"]) {
      const help = this._helper("control", schema.name, section);
      if (help) return help;
    }
    return undefined;
  }

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

  // Rooms.

  _attr(entityId, attribute) {
    const value = this._hass.states[entityId]?.attributes?.[attribute];
    return Array.isArray(value) ? value : [];
  }

  _choice(values, current) {
    const options = [...new Set([...values, ...(current ? [current] : [])])];
    return { select: { mode: "dropdown", custom_value: true, options } };
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

  async _discover() {
    this._discovering = true;
    this._renderTab();
    try {
      const result = await this._hass.callWS({ type: `${DOMAIN}/discover`, options: prune(this._draft) });
      const r = result.report;
      this._draft = result.options;
      // Marked in the list (collapsed, with a summary of what was found) until saved.
      this._discovered = {
        added: new Set(r.added),
        updated: new Set(r.updated),
        outdoorsAdded: new Set(r.outdoors_added),
        outdoorsUpdated: new Set(r.outdoors_updated),
      };
      const outdoors = r.outdoors_added.length + r.outdoors_updated.length;
      const sensors = r.outdoor.length + r.outdoor_noise.length + r.outdoor_air.length;
      this._message =
        r.added.length || r.updated.length || outdoors || sensors
          ? {
              type: "info",
              text: this._t("discover_result", {
                added: r.added.length,
                updated: r.updated.length,
                outdoors,
                outdoor: sensors ? this._t("discover_outdoor") : "",
              }),
            }
          : { type: "info", text: this._t("discover_none") };
    } catch (err) {
      this._message = { type: "error", text: err.message };
    }
    this._discovering = false;
    this._renderToolbar();
    this._renderTab();
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

  /** Outdoor places and the outdoor sensors in no place, together. */
  _renderOutdoors(content) {
    content.append(this._el("div", "help section-help", this._t("outdoors_help")));
    const places = (this._draft.outdoors = this._draft.outdoors || []);
    if (!places.length) content.append(this._el("div", "empty card", this._t("no_outdoors")));
    places.forEach((place, index) => {
      content.append(this._outdoorCard(place, index, places));
    });
    const add = this._button(this._t("add_outdoor"), () => {
      let name = this._t("new_outdoor");
      let n = 2;
      while (places.some((p) => p.name === name)) name = `${this._t("new_outdoor")} ${n++}`;
      places.push({ name });
      this._expandedOutdoors.add(places.length - 1);
      this._changed();
      this._renderTab();
    });
    add.classList.add("add");
    content.append(add);
    const other = this._card(this._t("other_outdoor"), "mdi:weather-partly-cloudy");
    other.append(this._el("div", "help", this._t("other_outdoor_help")));
    other.append(
      this._topForm([
        { name: "outdoor_temperature", selector: entity(["sensor", "weather"], { multiple: true }) },
        { name: "outdoor_air_quality", selector: entity("sensor", { multiple: true }) },
        { name: "outdoor_noise", selector: entity("sensor", { device_class: "sound_pressure", multiple: true }) },
        { name: "outdoor_aggregate", selector: { select: { mode: "dropdown", options: this._options("outdoor_aggregate", this._config.aggregates) } } },
      ])
    );
    content.append(other);
  }

  _outdoorCard(place, index, places) {
    const card = this._el("div", "card room");
    const header = this._el("div", "card-header room-header");
    const open = this._expandedOutdoors.has(index);
    const toggle = this._el("button", "room-toggle");
    const chevron = document.createElement("ha-icon");
    chevron.icon = open ? "mdi:chevron-down" : "mdi:chevron-right";
    toggle.append(chevron, this._iconOf(this._roomIcon(place, true)), this._el("span", "", place.name || "—"));
    toggle.addEventListener("click", () => {
      if (open) this._expandedOutdoors.delete(index);
      else this._expandedOutdoors.add(index);
      this._renderTab();
    });
    const summary = this._summary(
      [
        ["mdi:thermometer", place.temperature],
        ["mdi:weather-hazy", place.air_quality],
        ["mdi:volume-medium", place.noise],
      ],
      this._discovered?.outdoorsAdded?.has(place.name),
      this._discovered?.outdoorsUpdated?.has(place.name),
      true
    );
    const tools = this._el("div", "row-actions");
    tools.append(
      this._iconButton("mdi:delete-outline", this._t("remove"), () => {
        places.splice(index, 1);
        this._expandedOutdoors = shifted(this._expandedOutdoors, index);
        this._changed();
        this._renderTab();
      })
    );
    header.append(toggle, summary, tools);
    card.append(header);
    if (!open) return card;
    const keys = ["name", "temperature", "air_quality", "noise"];
    card.append(
      this._form(
        [
          { name: "name", required: true, selector: text },
          { name: "temperature", selector: entity(["sensor", "weather"], { multiple: true }) },
          { name: "air_quality", selector: entity("sensor", { multiple: true }) },
          { name: "noise", selector: entity("sensor", { device_class: "sound_pressure", multiple: true }) },
        ],
        Object.fromEntries(keys.filter((k) => k in place).map((k) => [k, place[k]])),
        (value) => {
          for (const key of keys) {
            if (isEmpty(value[key])) delete place[key];
            else place[key] = value[key];
          }
          toggle.lastChild.textContent = place.name || "—";
        },
        (f) => this._label("outdoor", f.name)
      )
    );
    return card;
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
          [{ name: "openings", selector: entity("binary_sensor", { multiple: true }) }],
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

  /** The icon of a room or outdoor place: its area's, else one guessed from its name. */
  _roomIcon(item, outdoor = false) {
    const area = item?.area ? this._hass.areas?.[item.area] : undefined;
    if (area?.icon) return area.icon;
    const name = (item?.name || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    const found = ROOM_ICONS.find(([words]) => words.some((w) => name.includes(w)));
    return found ? found[1] : outdoor ? "mdi:tree-outline" : "mdi:home-outline";
  }

  _iconOf(icon) {
    const i = document.createElement("ha-icon");
    i.className = "room-icon";
    i.icon = icon;
    return i;
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
    ]
      .filter(([n]) => n)
      .map(([n, key]) => (n > 1 ? `${this._t(key)} (${n})` : this._t(key === "climate" ? key : key.slice(0, -1))));
    return parts.length ? parts.join(", ") : this._t("none");
  }

  _lightingSummary(room) {
    const lights = Array.isArray(room.lights) ? room.lights : [];
    const naps = Array.isArray(room.naps) ? room.naps : [];
    const parts = [];
    if (lights.length) parts.push(`${this._t("lights")} (${lights.length})`);
    if (room.lighting?.quiet_morning) parts.push(this._label("lighting", "quiet_morning"));
    if (naps.length) parts.push(`${this._t("naps")} (${naps.length})`);
    if (room.presence?.sensors?.length) parts.push(this._t("presence_short"));
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
      ["co2", "carbon_dioxide"],
      ["humidity", "humidity"],
      ["noise", "sound_pressure"],
      // Indoor air: lists (the worst counts), the purifiers' sensors too.
      ["pm25", "pm25", true],
      ["pm10", "pm10", true],
      ["air_quality", null, true],
    ];
    const shown = all.filter(([key]) => !isEmpty(room[key]) || this._shown.has(`${index}:${key}`));
    if (shown.length) {
      body.append(
        this._form(
          shown.map(([key, deviceClass, multiple]) => ({
            name: key,
            selector: entity("sensor", { ...(deviceClass ? { device_class: deviceClass } : {}), ...(multiple ? { multiple } : {}) }),
          })),
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

  _addItem(room, key) {
    const items = Array.isArray(room[key]) ? room[key] : room[key] ? [room[key]] : [];
    room[key] = [...items, { entity_id: "" }];
    this._renderTab();
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
            [{ name: "entity", required: true, selector: entity(["schedule", "input_boolean", "binary_sensor", "switch"]) }],
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
    this._roomPresence(body, room, index);
  }

  /** Lights on presence: sensors, lights, light level, delay, naps, and slots that keep lights off or dim them. */
  _roomPresence(body, room, index) {
    body.append(this._el("div", "subheader", this._t("presence_title")));
    const key = `${index}:presence`;
    if (!room.presence && !this._shown.has(key)) {
      body.append(this._el("div", "help", this._t("presence_help")));
      this._addChips(body, [
        [
          this._t("presence_add"),
          () => {
            this._shown.add(key);
            room.presence = { sensors: [] };
            this._renderTab();
          },
        ],
      ]);
      return;
    }
    const presence = (room.presence = room.presence || { sensors: [] });
    const fields = ["sensors", "lights", "lux", "max_lux", "on_after", "off_after", "transition", "not_during_naps"];
    const line = this._el("div", "device-item");
    line.append(
      this._form(
        [
          { name: "sensors", required: true, selector: entity("binary_sensor", { multiple: true }) },
          { name: "lights", selector: entity("light", { multiple: true }) },
          grid([
            { name: "lux", selector: entity("sensor", { device_class: "illuminance" }) },
            { name: "max_lux", selector: num("lx", { min: 0, step: 1 }) },
          ]),
          grid([
            { name: "on_after", selector: { number: { mode: "box", step: 1, min: 0, max: 600, unit_of_measurement: "s" } } },
            { name: "off_after", selector: { number: { mode: "box", step: 0.5, min: 0, max: 1440, unit_of_measurement: "min" } } },
            { name: "transition", selector: { number: { mode: "box", step: 1, min: 0, max: 300, unit_of_measurement: "s" } } },
          ]),
          { name: "not_during_naps", selector: entity("light", { multiple: true }) },
        ],
        { off_after: 2, ...Object.fromEntries(fields.filter((f) => f in presence).map((f) => [f, presence[f]])) },
        (value) => {
          for (const f of fields) {
            if (isEmpty(value[f]) || (f === "off_after" && value[f] === 2)) delete presence[f];
            else presence[f] = value[f];
          }
        },
        (f) => this._t(`presence_${f.name}`),
        (f) => (["lights", "not_during_naps", "max_lux", "on_after"].includes(f.name) ? this._t(`presence_${f.name}_help`) : undefined)
      ),
      this._iconButton("mdi:delete-outline", this._t("presence_remove"), () => {
        delete room.presence;
        this._shown.delete(key);
        this._changed();
        this._renderTab();
      })
    );
    body.append(line);
    const slots = Array.isArray(presence.slots) ? presence.slots : [];
    const days = { select: { multiple: true, mode: "list", options: WEEKDAYS.map((d) => ({ value: d, label: this._t(`day_${d}`) })) } };
    const slotSchema = (slot) => [
      grid([
        { name: "start", required: true, selector: time },
        { name: "end", required: true, selector: time },
      ]),
      { name: "days", selector: days },
      { name: "lights", selector: entity("light", { multiple: true }) },
      { name: "off", selector: bool },
      ...(slot.off ? [] : [{ name: "brightness", selector: level }, { name: "color", selector: { color_rgb: {} } }]),
      { name: "off_after", selector: { number: { mode: "box", step: 0.5, min: 0, max: 1440, unit_of_measurement: "min" } } },
    ];
    if (slots.length) body.append(this._el("div", "help", this._t("slots_help")));
    slots.forEach((slot, i) => {
      const row = this._el("div", "device-item slot");
      const form = this._form(
        slotSchema(slot),
        slot,
        (value) => {
          slots[i] = prune(value);
          if (!slots[i].off) delete slots[i].off;
          presence.slots = slots;
          form.schema = slotSchema(value);
        },
        (f) => this._t({ start: "sched_from", end: "sched_to", days: "nap_days" }[f.name] || `slot_${f.name}`),
        (f) => (f.name === "lights" ? this._t("slot_lights_help") : f.name === "days" ? this._t("nap_days_help") : undefined)
      );
      row.append(
        form,
        this._iconButton("mdi:delete-outline", this._t("remove"), () => {
          slots.splice(i, 1);
          if (slots.length) presence.slots = slots;
          else delete presence.slots;
          this._changed();
          this._renderTab();
        })
      );
      body.append(row);
    });
    this._addChips(body, [
      [
        this._t("slot_add"),
        () => {
          presence.slots = [...slots, { start: "13:30:00", end: "17:00:00", off: true }];
          this._changed();
          this._renderTab();
        },
      ],
    ]);
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
        ["mdi:lightbulb-outline", room.lights],
      ],
      found?.added.has(room.name),
      found?.updated.has(room.name)
    );
  }

  /** Icons with how many of each, and a badge after a discovery (an outdoor place has its own wording). */
  _summary(entries, added, updated, outdoor = false) {
    const box = this._el("div", "room-summary");
    const count = (v) => (Array.isArray(v) ? v.length : v ? 1 : 0);
    for (const [icon, value] of entries) {
      const n = count(value);
      if (!n) continue;
      const chip = this._el("span", "summary-item");
      const i = document.createElement("ha-icon");
      i.icon = icon;
      chip.append(i);
      if (n > 1) chip.append(document.createTextNode(String(n)));
      box.append(chip);
    }
    const suffix = outdoor ? "_outdoor" : "";
    if (added) box.append(this._el("span", "badge new", this._t(`discovered_new${suffix}`)));
    else if (updated) box.append(this._el("span", "badge new", this._t(`discovered_updated${suffix}`)));
    return box;
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


// ── Illustrated header ─────────────────────────────────────────────────────────────────────────────────────────────
// Each tab opens on a 90 px header drawn like the ha-* cards' (and System Hub's panel): its icon in a frosted badge,
// its title and status pill on a wall, a 360 × 80 scene at the right (some furniture, then the tab's own piece, which
// follows the status) and a 10 px floor. Night with Home Assistant's dark theme. No id in the scenes, and no motion
// with prefers-reduced-motion.
const SCB_TONES = { good: "#43a047", warn: "#f5b400", bad: "#e5484d", info: "#2f80ed", idle: "#8a96a6" };
// The wall [day, night], the floor and the furniture of each tab
const SCB_ROOMS = {
  overview: ["#eef1f6", "#262c3a", "parquet", "A"],
  activity: ["#f2efe9", "#2a2b33", "parquet", "C"],
  rooms: ["#f4ede3", "#2a2f3d", "parquet", "B"],
  outdoors: ["#dcebf7", "#1c2a44", "grass", "E"],
  alerts: ["#f3ede4", "#2b2a33", "parquet", "B"],
  schedule: ["#eef1f6", "#262c3a", "parquet", "C"],
  settings: ["#e4e6ea", "#22262e", "concrete", "D"],
  yaml_tab: ["#eef2f5", "#262c36", "tiles", "C"],
};
const SCB_ICONS = {
  overview: "mdi:home-thermometer",
  activity: "mdi:history",
  rooms: "mdi:floor-plan",
  outdoors: "mdi:tree-outline",
  alerts: "mdi:bell-ring-outline",
  schedule: "mdi:calendar-clock",
  settings: "mdi:cog-outline",
  yaml_tab: "mdi:code-braces",
};
const SCB_FAN = "M12 11a1 1 0 0 0-1 1 1 1 0 0 0 1 1 1 1 0 0 0 1-1 1 1 0 0 0-1-1m.5-9C17 2 17.11 5.57 14.75 6.75c-.99.49-1.43 1.54-1.62 2.47.48.2.9.51 1.22.91 3.7-2 7.68-1.21 7.68 2.37 0 4.5-3.57 4.6-4.75 2.23-.5-.99-1.56-1.43-2.49-1.62-.2.48-.51.89-.91 1.23 1.99 3.69 1.2 7.66-2.38 7.66-4.5 0-4.59-3.58-2.23-4.76.98-.49 1.42-1.53 1.62-2.45-.49-.2-.92-.52-1.24-.92C5.96 15.85 2 15.07 2 11.5 2 7 5.56 6.89 6.74 9.26c.5.99 1.55 1.42 2.48 1.61.19-.48.51-.9.92-1.22C8.15 5.96 8.94 2 12.5 2Z";

// The lawn, a tree and a fence: the furniture of the outdoors
function scbGarden(n) {
  const p = (day, night) => (n ? night : day);
  const sky = n
    ? '<circle cx="34" cy="20" r="4" fill="#f3eed2"/><g fill="#fff" opacity=".85"><circle cx="70" cy="12" r=".8"/><circle cx="96" cy="26" r=".6"/><circle cx="128" cy="10" r=".7"/></g>'
    : `<circle cx="34" cy="22" r="7" fill="#ffd65a"/>${scbCloud(92, 20, 1)}`;
  const posts = Array.from({ length: 9 }, (_, i) => `<rect x="${84 + i * 9}" y="62" width="4" height="18" rx="1"/>`).join("");
  return `${sky}<path d="M0 66 C30 52 60 58 90 54 C120 50 140 60 160 56 V80 H0Z" fill="${p("#b9dba4", "#1d3a34")}"/>
    <g transform="translate(58 80)"><rect x="-2" y="-22" width="4" height="22" fill="${p("#8a5a3a", "#4a3a30")}"/><g class="sh-leaf"><circle cy="-30" r="12" fill="${p("#5aa83d", "#2f5e3a")}"/><circle cx="-8" cy="-24" r="8" fill="${p("#4e9a36", "#2a5434")}"/><circle cx="8" cy="-24" r="8" fill="${p("#4e9a36", "#2a5434")}"/></g></g>
    <g fill="${p("#e8dcc8", "#5a5448")}">${posts}<rect x="82" y="66" width="80" height="2.5"/><rect x="82" y="73" width="80" height="2.5"/></g>`;
}

// The thermometer and the air conditioner of the cards (their comfortScene), placed in a 104 × 80 box: the mercury,
// the breeze, then the sun, the heat, the snowflake or the alert sign of the state
function scbComfort(mood, n) {
  const scene = mood.scene;
  const [col, top, h] = scene === "hot" ? ["#e5484d", 6, 30] : scene === "cool" ? ["#2f80ed", 18, 18] : scene === "cold" ? ["#2f80ed", 26, 10] : ["#43a047", 14, 22];
  const cool = scene === "cool";
  const breeze = cool
    ? '<g class="sh-fade" fill="none" stroke="#86b9de" stroke-width="1.4" stroke-linecap="round"><path d="M-20 20 q4 8 0 16"/><path d="M0 20 q4 8 0 16"/><path d="M20 20 q4 8 0 16"/></g>'
    : "";
  let mark = "";
  if (scene === "hot" && !n) {
    const rays = [0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => {
        const a = (i * Math.PI) / 4;
        return `<line x1="${(Math.cos(a) * 6).toFixed(1)}" y1="${(Math.sin(a) * 6).toFixed(1)}" x2="${(Math.cos(a) * 10).toFixed(1)}" y2="${(Math.sin(a) * 10).toFixed(1)}"/>`;
      })
      .join("");
    mark = `<g transform="translate(90 44)"><g class="sh-rot" stroke="#f5b400" stroke-width="1.6" stroke-linecap="round">${rays}</g><circle r="4" fill="#ffc83a"/></g>`;
  } else if (scene === "hot") {
    mark = '<g class="sh-fade" transform="translate(90 50)" fill="none" stroke="#e5484d" stroke-width="1.4" stroke-linecap="round"><path d="M-6 6 q-2 -4 0 -8 t0 -8"/><path d="M0 6 q-2 -4 0 -8 t0 -8"/><path d="M6 6 q-2 -4 0 -8 t0 -8"/></g>';
  } else if (scene === "cold") {
    const arms = [0, 60, 120].map((d) => `<path transform="rotate(${d})" d="M0 -8 V8 M-2.5 -6 L0 -4 L2.5 -6 M-2.5 6 L0 4 L2.5 6"/>`).join("");
    mark = `<g transform="translate(90 44)"><g class="sh-rot" fill="none" stroke="${n ? "#a9d2f5" : "#5aa9e6"}" stroke-width="1.3" stroke-linecap="round">${arms}</g></g>`;
  } else if (scene === "warn") {
    mark = `<g transform="translate(90 44)"><g class="sh-blink"><circle r="7" fill="${mood.level === "critical" ? "#e5484d" : "#ffa600"}"/><rect x="-1" y="-4.5" width="2" height="5.5" rx="1" fill="#fff"/><circle cy="3.4" r="1.1" fill="#fff"/></g></g>`;
  }
  return `<g transform="translate(44 12)"><rect x="-30" width="60" height="16" rx="5" fill="${n ? "#d8dce2" : "#fff"}" stroke="#c9ced6"/><rect x="-24" y="12" width="48" height="2" rx="1" fill="#9aa3ae"/>
      <circle class="${cool ? "sh-blink" : ""}" cx="22" cy="5" r="1.2" fill="${cool ? "#2f80ed" : "#9aa3ae"}"/>${breeze}</g>
    <g transform="translate(8 22)"><rect x="-4" width="8" height="40" rx="4" fill="#fff" stroke="#9aa3ae"/>
      <g stroke="#9aa3ae" stroke-width=".6"><line x1="5" y1="8" x2="7" y2="8"/><line x1="5" y1="16" x2="7" y2="16"/><line x1="5" y1="24" x2="7" y2="24"/><line x1="5" y1="32" x2="7" y2="32"/></g>
      <rect x="-1.6" y="${top}" width="3.2" height="${h}" rx="1.6" fill="${col}"/><circle cy="42" r="5" fill="${col}"/></g>${mark}`;
}

// The tab's own piece (0–200, drawn at x 160). `x`: the overview's score, lines and mood; the rooms' tones; the
// outdoor air and noise; the alerts' count
function scbScene(tab, tone, n, x = {}) {
  const p = (day, night) => (n ? night : day);
  const c = SCB_TONES[tone] || SCB_TONES.good;
  const ok = tone === "good" || tone === "info" || tone === "idle";
  const blink = ok ? "" : "sh-blink";
  const face = p("#fff", "#3d475c");
  const edge = p("#c9ced6", "#55617a");
  const ink = p("#5f6b7a", "#a9b4c2");
  const dark = p("#3a414c", "#20252e");
  const wood = p("#b98a5c", "#5c4836");
  const woodd = p("#a2744a", "#4a3a2c");
  const desk = (x0, w) =>
    `<rect x="${x0}" y="63" width="${w}" height="4" rx="1" fill="${wood}"/><rect x="${x0 + 4}" y="67" width="4" height="13" fill="${woodd}"/><rect x="${x0 + w - 8}" y="67" width="4" height="13" fill="${woodd}"/>`;
  if (tab === "overview") {
    const score = Math.max(0, Math.min(100, Number(x.score ?? 100)));
    const lines = (x.lines || ["good", "good", "good"])
      .slice(0, 3)
      .map((t, i) => `<circle cx="42" cy="${12 + i * 9}" r="2" fill="${SCB_TONES[t]}"/><rect x="47" y="${10.3 + i * 9}" width="${[22, 16, 20][i]}" height="3.4" rx="1.7" fill="${SCB_TONES[t]}"/>`)
      .join("");
    return `<rect class="sh-glow" x="0" y="2" width="92" height="56" rx="12" fill="${c}" opacity="${ok ? ".10" : ".16"}"/>
      <g transform="translate(6 8)"><rect width="80" height="44" rx="5" fill="${p("#2a3038", "#14181f")}"/><rect x="3" y="3" width="74" height="38" rx="3" fill="${p("#1b2129", "#0d1117")}"/>
        <circle cx="20" cy="22" r="12" fill="none" stroke="#2e3a4e" stroke-width="4.2"/><circle cx="20" cy="22" r="12" fill="none" stroke="${c}" stroke-width="4.2" stroke-dasharray="${((2 * Math.PI * 12 * score) / 100).toFixed(1)} 100" transform="rotate(-90 20 22)" stroke-linecap="round"/>
        <text x="20" y="25.4" text-anchor="middle" font-size="9.5" font-weight="700" font-family="Roboto,sans-serif" fill="#fff">${score}</text>${lines}</g>
      <rect x="42" y="52" width="10" height="4" fill="${p("#2a3038", "#14181f")}"/><g transform="translate(96 0)">${scbComfort(x.mood || { scene: "ok" }, n)}</g>`;
  }
  if (tab === "activity") {
    const log = [["#2f80ed", 34], ["#2f80ed", 26], ["#8a96a6", 30], ["#f5b400", 22]]
      .map(([col, w], i) => `<circle cx="10" cy="${12 + i * 9}" r="2.4" fill="${col}"/><rect x="16" y="${10.5 + i * 9}" width="${w}" height="3" rx="1.5" fill="${edge}"/>`)
      .join("");
    const grille = [12, 16, 20, 24, 28, 32, 36].map((y) => `<line x1="4" y1="${y}" x2="18" y2="${y}"/>`).join("");
    return `<g transform="translate(14 6)"><rect width="58" height="44" rx="3" fill="${face}" stroke="${edge}"/>${log}<rect x="22" y="-3" width="14" height="5" rx="1.5" fill="${ink}"/></g>
      <g transform="translate(108 80)"><rect x="-1.5" y="-30" width="3" height="30" fill="${ink}"/><ellipse cy="-1" rx="9" ry="2" fill="${ink}"/></g>
      <g transform="translate(108 44)"><circle r="13" fill="none" stroke="${edge}" stroke-width="1.4"/><g class="sh-rot-fast"><path transform="translate(-10 -10) scale(.84)" d="${SCB_FAN}" fill="${p("#9cc3e6", "#5a7a9a")}"/></g></g>
      <g transform="translate(150 30)"><rect width="22" height="50" rx="5" fill="${face}" stroke="${edge}"/><g stroke="${edge}" stroke-width="1">${grille}</g><circle class="sh-blink" cx="11" cy="6" r="1.6" fill="#2f80ed"/></g>
      <g class="sh-fade" fill="none" stroke="#86b9de" stroke-width="1.3" stroke-linecap="round"><path d="M152 24 q3 -6 0 -12"/><path d="M161 24 q3 -6 0 -12"/><path d="M170 24 q3 -6 0 -12"/></g>`;
  }
  if (tab === "rooms") {
    const tones = x.rooms || ["good", "good", "good", "good"];
    const cell = (cx, cy, t) =>
      `<rect x="${cx}" y="${cy}" width="34" height="24" fill="${face}"/><rect x="${cx}" y="${cy}" width="34" height="24" fill="${SCB_TONES[t] || SCB_TONES.good}" opacity=".22"/><circle cx="${cx + 29}" cy="${cy + 5}" r="2.6" fill="${SCB_TONES[t] || SCB_TONES.good}"${t === "bad" ? ' class="sh-blink"' : ""}/>`;
    const beam = p("#8a5a3a", "#6a5040");
    return `<g transform="translate(40 0)"><path d="M18 26 L60 4 L102 26" fill="none" stroke="${beam}" stroke-width="3" stroke-linejoin="round"/>
        ${cell(24, 28, tones[2])}${cell(61, 28, tones[3])}${cell(24, 54, tones[0])}${cell(61, 54, tones[1])}
        <rect x="30" y="66" width="18" height="6" rx="2" fill="${p("#d9826a", "#8a5a4a")}"/><rect x="68" y="67" width="22" height="5" rx="1" fill="${p("#9cc3e6", "#3a5a7a")}"/>
        <path d="M30 42 h18 v3 a5 5 0 0 1 -5 5 h-8 a5 5 0 0 1 -5 -5z" fill="${p("#e8f0fd", "#5a6a84")}"/><rect x="66" y="42" width="26" height="3" fill="${wood}"/><rect x="74" y="35" width="10" height="7" rx="1" fill="${dark}"/>
        <rect x="22" y="26" width="76" height="54" fill="none" stroke="${beam}" stroke-width="2.4"/><line x1="60" y1="26" x2="60" y2="80" stroke="${beam}" stroke-width="2"/><line x1="22" y1="52" x2="98" y2="52" stroke="${beam}" stroke-width="2"/></g>
      ${scbPlant(176, 1.35, n)}`;
  }
  if (tab === "outdoors") {
    const air = SCB_TONES[x.air || "good"];
    const noise = SCB_TONES[x.noise || "good"];
    return `<g transform="translate(96 80)"><path d="M0 -44 v44" stroke="${ink}" stroke-width="1.6"/><path d="M-22 -40 Q0 -54 22 -40Z" fill="${p("#e5484d", "#8a3a3a")}"/><rect x="-14" y="-16" width="28" height="3" rx="1" fill="${wood}"/><path d="M-10 -13 v13 M10 -13 v13" stroke="${woodd}" stroke-width="2"/></g>
      <g transform="translate(140 30)"><rect x="-1.5" width="3" height="50" fill="${ink}"/><rect x="-8" y="-10" width="16" height="12" rx="3" fill="${face}" stroke="${edge}"/><g class="sh-blink" fill="${air}"><circle cx="-3" cy="-4" r="1.2"/><circle cx="3" cy="-4" r="1.2"/></g></g>
      ${x.aq != null ? `<g transform="translate(160 14)"><g class="sh-float"><circle r="9" fill="${air}"/><text y="3.4" text-anchor="middle" font-size="9" font-weight="700" font-family="Roboto,sans-serif" fill="#fff">${x.aq}</text></g></g>` : ""}
      <g transform="translate(184 46)"><path d="M-4 -6 l4 -3 v18 l-4 -3 h-4 v-12z" fill="${ink}"/><g class="sh-fade" fill="none" stroke="${noise}" stroke-width="1.4" stroke-linecap="round"><path d="M4 -4 a6 6 0 0 1 0 8"/><path d="M7 -7 a10 10 0 0 1 0 14"/></g></g>`;
  }
  if (tab === "alerts") {
    const cards = [["#f5b400", 28], ["#e5484d", 22], ["#2f80ed", 26]]
      .map(([col, w], i) => `<g transform="translate(16 ${10 + i * 16})"><rect width="46" height="12" rx="3" fill="${face}" stroke="${edge}"/><circle cx="6" cy="6" r="2.6" fill="${col}"/><rect x="12" y="4.5" width="${w}" height="3" rx="1.5" fill="${edge}"/></g>`)
      .join("");
    return `${cards}<g transform="translate(92 36)"><g class="${ok ? "" : "sh-ring"}"><path d="M-14 10 h28 l-3 -4 v-10 a11 11 0 0 0 -22 0 v10z" fill="${ok ? p("#f5b400", "#c9922a") : c}"/><circle cy="13" r="3.4" fill="${p("#a2744a", "#6a5240")}"/><rect x="-1.5" y="-18" width="3" height="4" rx="1.5" fill="${ink}"/></g>
        ${ok ? "" : `<g class="sh-fade" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round"><path d="M-20 -10 a20 20 0 0 0 0 16"/><path d="M20 -10 a20 20 0 0 1 0 16"/></g>`}</g>
      <g transform="translate(150 30)"><rect width="22" height="40" rx="4" fill="${dark}"/><rect x="2" y="4" width="18" height="30" rx="2" fill="${p("#cfe8f8", "#1b2f52")}"/><rect x="5" y="9" width="12" height="5" rx="1.5" fill="${c}"/><rect x="5" y="17" width="9" height="3" rx="1.5" fill="${edge}"/>
        ${x.count ? `<g class="${blink}"><circle cx="21" cy="2" r="5" fill="${c}"/><text x="21" y="4.3" text-anchor="middle" font-size="6.5" font-weight="700" font-family="Roboto,sans-serif" fill="#fff">${x.count > 9 ? "9+" : x.count}</text></g>` : ""}</g>
      <rect x="146" y="70" width="30" height="4" rx="1" fill="${wood}"/><rect x="159" y="74" width="4" height="6" fill="${woodd}"/>${scbPlant(188, 1.1, n)}`;
  }
  if (tab === "schedule") {
    const ticks = Array.from({ length: 12 }, (_, a) => `<circle cx="${(Math.cos((a * Math.PI) / 6) * 13.5).toFixed(1)}" cy="${(Math.sin((a * Math.PI) / 6) * 13.5).toFixed(1)}" r=".9"/>`).join("");
    const frame = p("#fff", "#4a5568");
    return `<g transform="translate(44 30)"><circle r="17" fill="${face}" stroke="${ink}" stroke-width="2.4"/><g fill="${ink}">${ticks}</g><g class="sh-rot"><path d="M0 0 V-12" stroke="#2f80ed" stroke-width="1.4" stroke-linecap="round"/></g><path d="M0 0 L7 4" stroke="${dark}" stroke-width="2" stroke-linecap="round"/><circle r="1.6" fill="${dark}"/></g>
      <g transform="translate(88 10)"><rect width="44" height="40" rx="1.5" fill="${p("#cfe8f8", "#1b2f52")}" stroke="${frame}" stroke-width="2"/><rect x="22" width="22" height="40" fill="${p("#2a3b5c", "#0f1a2e")}"/><circle cx="11" cy="14" r="5" fill="#ffd65a"/>
        <path d="M36 10 a6 6 0 1 0 4 10 a5 5 0 1 1 -4 -10z" fill="#f3eed2"/><line x1="22" y1="0" x2="22" y2="40" stroke="${frame}" stroke-width="1.6"/></g><rect x="84" y="50" width="52" height="3" rx="1" fill="${frame}"/>
      <g transform="translate(150 80)"><rect y="-14" width="46" height="8" rx="2" fill="${wood}"/><rect y="-26" width="5" height="26" rx="1.5" fill="${woodd}"/><rect x="41" y="-18" width="5" height="18" rx="1.5" fill="${woodd}"/><rect x="6" y="-19" width="12" height="5" rx="2" fill="#fff"/><rect x="16" y="-18" width="25" height="5" rx="2" fill="${p("#9cc3e6", "#3a5a7a")}"/></g>
      <g class="sh-fade" font-family="Roboto,sans-serif" font-weight="700" fill="${p("#7f77dd", "#a9a3f0")}"><text x="168" y="48" font-size="8">z</text><text x="176" y="40" font-size="10">Z</text></g>`;
  }
  if (tab === "settings") {
    const holes = [];
    for (let i = 0; i < 13; i++) for (let j = 0; j < 6; j++) holes.push(`<circle cx="${6 + i * 8}" cy="${6 + j * 8}" r=".9"/>`);
    const sw = (x0, on) =>
      `<g transform="translate(${x0} 34)"><rect x="-10" y="-14" width="20" height="28" rx="3" fill="${face}" stroke="${edge}"/><rect x="-7" y="3" width="14" height="7" rx="3.5" fill="${on ? "#2f80ed" : edge}"/><circle cx="${on ? 3.5 : -3.5}" cy="6.5" r="2.6" fill="#fff"/><circle cy="-5" r="4" fill="${on ? "#2f80ed" : edge}" opacity=".5"/></g>`;
    return `<g transform="translate(40 8)"><rect width="104" height="50" rx="2" fill="${p("#d6c3a3", "#5a4c3a")}"/><g fill="${p("#b49e7c", "#463b2e")}">${holes.join("")}</g></g>
      ${sw(58, true)}${sw(82, true)}${sw(106, false)}<g transform="translate(132 34)"><circle r="10" fill="${face}" stroke="${ink}" stroke-width="1.6"/><g class="sh-rot"><path d="M0 -7 V-3" stroke="#e5484d" stroke-width="2" stroke-linecap="round"/></g></g>
      ${desk(36, 112)}${scbPlant(184, 1.2, n)}`;
  }
  // yaml_tab
  const code = [[0, 26, "#7fb4ff"], [1, 14, "#7fb4ff"], [2, 30, "#8fdc8f"], [2, 24, "#8fdc8f"], [1, 18, "#7fb4ff"], [2, 34, "#8fdc8f"]]
    .map(([ind, w, col], i) => `<rect x="${8 + ind * 6}" y="${8 + i * 5}" width="${w}" height="2.6" rx="1.3" fill="${col}"/>`)
    .join("");
  return `<g transform="translate(50 10)"><rect width="74" height="44" rx="3" fill="${dark}"/><rect x="3" y="3" width="68" height="38" rx="2" fill="${p("#1f262f", "#0f131a")}"/>${code}<rect class="sh-blink" x="45" y="33" width="1.6" height="4" fill="#fff"/></g>
    <rect x="82" y="54" width="10" height="6" fill="${dark}"/><rect x="72" y="60" width="30" height="3" rx="1.5" fill="${ink}"/>${desk(40, 116)}
    <g transform="translate(130 53)"><rect width="10" height="10" rx="2" fill="${p("#e8f0fd", "#4a5568")}"/><path d="M10 3 h2 a2 2 0 0 1 0 4 h-2" stroke="${p("#9aa3ae", "#55617a")}" fill="none"/><path class="sh-fade" d="M3 -2 q-2 -3 0 -6 M7 -2 q-2 -3 0 -6" stroke="${edge}" stroke-width="1" fill="none"/></g>${scbPlant(184, 1.2, n)}`;
}

function scbPlant(x, k, n) {
  return `<g transform="translate(${x} 80) scale(${k})"><path d="M-7 0 l-2 -11 h18 l-2 11z" fill="#c0603a"/><path class="sh-leaf" d="M0 -11 q-10 -6 -11 -20 q8 4 11 15 q2 -14 10 -18 q1 12 -10 23z" fill="${n ? '#3e7a4a' : '#5aa83d'}"/></g>`;
}
function scbCloud(x, y, k, fill) {
  return `<g transform="translate(${x} ${y}) scale(${k})"><path class="sh-cloud" d="M-14,4 C-17,4 -18,0 -14.5,-1 C-14,-5 -8,-6 -6,-3 C-4,-8 4,-8 5,-2 C9,-3 12,0 10,4 Z" fill="${fill || '#fff'}"/></g>`;
}

// The furniture of the left part (0–160)
function scbDecor(kind, n) {
  var p = (day, night) => (n ? night : day);
  var frame = p('#fff', '#4a5568');
  var glass = p('#cfe8f8', '#1b2f52');
  var wood = p('#b98a5c', '#5c4836');
  var woodd = p('#a2744a', '#4a3a2c');
  var ink = p('#8a8478', '#4a4f60');
  if (kind === 'A') {
    var sky = n
      ? '<circle cx="66" cy="22" r="3" fill="#f3eed2"/><g fill="#fff" opacity=".8"><circle cx="40" cy="18" r=".7"/><circle cx="52" cy="40" r=".6"/><circle cx="72" cy="38" r=".6"/></g>'
      : `<circle cx="68" cy="22" r="5" fill="#ffd65a"/>${scbCloud(44, 28, 0.8)}`;
    return `<rect x="28" y="10" width="52" height="46" rx="1.5" fill="${glass}" stroke="${frame}" stroke-width="2"/>${sky}<path d="M28 44 C40 38 60 40 80 36 V56 H28Z" fill="${p('#a7d39f', '#1d3a4a')}"/>
      <line x1="54" y1="10" x2="54" y2="56" stroke="${frame}" stroke-width="1.6"/><line x1="28" y1="33" x2="80" y2="33" stroke="${frame}" stroke-width="1.6"/><rect x="24" y="56" width="60" height="3" rx="1" fill="${frame}"/>
      <path d="M122 80 V30" stroke="${ink}" stroke-width="1.6"/><path d="M113 30 h18 l-4 -12 h-10z" fill="${p('#efe3c8', '#ffd27a')}"/><ellipse cx="122" cy="79" rx="7" ry="1.6" fill="${ink}"/>${n ? '<path d="M114 30 L100 80 H144 L130 30Z" fill="#ffd27a" opacity=".14"/>' : ''}`;
  }
  if (kind === 'B') {
    return `<rect x="26" y="14" width="40" height="28" rx="1" fill="${glass}" stroke="${p('#3a414c', '#20252e')}" stroke-width="2.4"/><path d="M28 38 L40 26 L48 33 L54 28 L64 38Z" fill="${p('#86c27f', '#2a5a3a')}"/><circle cx="56" cy="21" r="3" fill="#ffd65a"/>
      <rect x="74" y="20" width="22" height="30" rx="1" fill="${p('#fff', '#3d475c')}" stroke="${p('#3a414c', '#20252e')}" stroke-width="2.4"/><circle cx="85" cy="32" r="6" fill="${p('#f2b8a2', '#8a5a4a')}"/><rect x="79" y="40" width="12" height="3" rx="1" fill="${p('#9cc3e6', '#3a5a7a')}"/>
      <rect x="20" y="60" width="96" height="20" rx="2" fill="${p('#c9bfae', '#6b7586')}"/><rect x="24" y="64" width="42" height="12" rx="1" fill="${p('#d8cfc0', '#7a8496')}"/><rect x="70" y="64" width="42" height="12" rx="1" fill="${p('#d8cfc0', '#7a8496')}"/>
      <circle cx="62" cy="70" r="1" fill="${woodd}"/><circle cx="74" cy="70" r="1" fill="${woodd}"/><path d="M40 60 v-6 h8 v6" fill="${p('#e8f0fd', '#4a5568')}"/><path d="M44 54 q-4 -8 0 -12 q4 4 0 12z" fill="${p('#5aa83d', '#3e7a4a')}"/>`;
  }
  if (kind === 'C') {
    var books = [[34, 5, 16, '#2f80ed'], [40, 4, 13, '#e5484d'], [45, 6, 18, '#43a047'], [52, 4, 14, '#f5b400'], [57, 5, 16, '#7f77dd']]
      .map(([x, w, h, c]) => `<rect x="${x}" y="${34 - h}" width="${w}" height="${h}" rx=".8" fill="${c}"/>`)
      .join('');
    return `<rect x="28" y="34" width="74" height="3" rx="1" fill="${wood}"/><path d="M36 37 v5 h3 M94 37 v5 h-3" stroke="${woodd}" stroke-width="1.2" fill="none"/>${books}
      <path d="M76 34 l-2 -10 h10 l-2 10z" fill="${p('#9cc3e6', '#3a5a7a')}"/><path d="M79 24 q-6 -8 -2 -14 M79 24 q4 -10 8 -12" stroke="${p('#5aa83d', '#3e7a4a')}" stroke-width="1.4" fill="none"/>
      <g fill="${p('#c08a5a', '#5c4836')}"><rect x="104" y="60" width="26" height="5" rx="2"/><rect x="104" y="40" width="5" height="22" rx="2"/><rect x="106" y="65" width="3" height="15"/><rect x="125" y="65" width="3" height="15"/></g>`;
  }
  return `<path d="M0 12 H150" stroke="${p('#b5bbc2', '#3a414c')}" stroke-width="5"/><path d="M30 12 V40" stroke="${p('#b5bbc2', '#3a414c')}" stroke-width="5"/><rect x="26" y="40" width="8" height="5" fill="${p('#9aa1a9', '#2c323b')}"/><circle cx="90" cy="12" r="5" fill="${p('#e5484d', '#8a3a3a')}"/>
    <rect x="52" y="22" width="22" height="28" rx="2" fill="${p('#fff', '#3d475c')}" stroke="${p('#c9ced6', '#55617a')}"/><path d="M60 30 l-3 6 h4 l-2 6 l6 -8 h-4 l2 -4z" fill="#f5b400"/>
    <g fill="${p('#c9a06a', '#6a5236')}"><rect x="94" y="72" width="40" height="3"/><rect x="94" y="77" width="40" height="3"/><rect x="96" y="75" width="4" height="2"/><rect x="112" y="75" width="4" height="2"/><rect x="128" y="75" width="4" height="2"/></g>
    <rect x="98" y="54" width="32" height="18" rx="1" fill="${p('#c9a06a', '#7a6040')}"/><rect x="111" y="54" width="6" height="18" fill="${p('#e5c48f', '#9a8058')}"/>
    <path d="M140 80 l6 -20 h4 l6 20z" fill="#f57c00"/><rect x="143" y="68" width="10" height="3" fill="#fff"/><rect x="136" y="78" width="24" height="2" rx="1" fill="#e06a00"/>`;
}

// The module's own piece (0–200, drawn at x 160): its look follows the tone. `extra`: the Status tab's score and
// group tones, the failing backup locations, the installs running

// The status the header shows (as the cards' comfortMood): an alert to deal with first (heat, cold, else a warning
// sign), then a device cooling a room, then the alerts only snoozed or handled
function scbMood(alerts, rooms) {
  const open = alerts.filter((a) => !a.snoozed && !a.handled);
  if (open.length) {
    const level = open.some((a) => a.severity === "critical") ? "critical" : "warning";
    if (open.some((a) => a.kind === "too_hot")) return { scene: "hot", level };
    if (open.some((a) => a.kind === "too_cold" || a.kind === "window_open_cold")) return { scene: "cold", level };
    return { scene: "warn", level };
  }
  const cooling = rooms.some((r) => Object.values(r.devices || {}).some((d) => ["cool", "cool_night", "on", "on_night"].includes(d?.target)));
  return { scene: cooling ? "cool" : "ok", level: "ok" };
}

// A room's tone from its alerts: critical, to watch, else fine
function scbRoomTone(room) {
  const alerts = room.alerts || [];
  return alerts.some((a) => a.severity === "critical") ? "bad" : alerts.length ? "warn" : "good";
}

/** The tab's header: its banner (title, pill, subtitle, scene), in a card the tab's first blocks are moved into. */
function scbBanner(panel, tab = panel._tab, opts = {}) {
  const s = panel._status || null;
  const night = Boolean(panel._hass?.themes?.darkMode);
  let tone = "idle";
  let title = panel._t(tab);
  let pill = "";
  let sub = "";
  let extra = {};
  if (s && tab === "overview" && (panel._config?.options?.rooms?.length || panel._config?.options?.outdoors?.length)) {
    const c = panel._comfort(s);
    const label = panel._t("sc_score");
    tone = c.tone;
    title = c.points ? panel._t(c.points === 1 ? "sc_point" : "sc_points", { n: c.points }) : panel._t("sc_all_good");
    pill = `${label.charAt(0).toUpperCase()}${label.slice(1)} ${c.score} / 100`;
    sub = [`${panel._t("outdoor")} ${panel._format(s.outdoor_temperature)} °C`, ...(s.night ? [panel._t("quiet_night")] : [])].join(" · ");
    const tones = (s.rooms || []).filter((r) => !r.is_annex).map(scbRoomTone);
    const worst = (list) => (list.includes("bad") ? "bad" : list.includes("warn") ? "warn" : "good");
    extra = { score: c.score, lines: [worst(tones.slice(0, 2)), worst(tones.slice(2, 4)), worst(tones.slice(4))], mood: scbMood(s.alerts || [], s.rooms || []) };
    // The panel's top bar: Smart Comfort, the points to watch as its pill, the comfort score first on the line under it
    if (opts.head) {
      sub = `${pill} · ${sub}`;
      pill = title;
      title = "Smart Comfort";
    }
  } else if (opts.head) {
    title = "Smart Comfort";
  } else if (s && tab === "alerts") {
    const c = panel._comfort(s);
    tone = c.tone;
    pill = `${panel._t("active_alerts")} · ${(s.alerts || []).length}`;
    extra = { count: (s.alerts || []).length };
  } else if (tab === "rooms") {
    const rooms = (s?.rooms || []).filter((r) => !r.is_annex);
    const tones = rooms.map(scbRoomTone);
    tone = tones.includes("bad") ? "bad" : tones.includes("warn") ? "warn" : "good";
    if (rooms.length) pill = panel._t("n_rooms_ok", { n: tones.filter((t) => t === "good").length });
    extra = { rooms: [0, 1, 2, 3].map((i) => tones[i] || "good") };
  } else if (tab === "outdoors") {
    const air = typeof s?.outdoor_air === "number" ? s.outdoor_air : null;
    const noise = typeof s?.outdoor_noise === "number" ? s.outdoor_noise : null;
    tone = air !== null && air >= 4 ? "warn" : "good";
    pill = [air !== null ? `${panel._t("outdoor_air")} ${panel._format(air, 0)}/6` : "", noise !== null ? `${panel._format(noise, 0)} dB` : ""].filter(Boolean).join(" · ");
    extra = { aq: air !== null ? Math.round(air) : null, air: tone, noise: noise !== null && noise >= 65 ? "warn" : "good" };
  } else if (tab === "activity") {
    tone = "info";
  } else if (tab === "schedule") {
    tone = s?.night ? "info" : "idle";
    if (s?.night) pill = panel._t("quiet_night");
  }
  const [day, dark, floor, decor] = SCB_ROOMS[tab] || SCB_ROOMS.overview;
  let wall = night ? dark : day;
  if (tab === "overview" && tone !== "good" && tone !== "idle") wall = `color-mix(in srgb, ${SCB_TONES[tone]} ${night ? 14 : 9}%, ${wall})`;
  const furniture = decor === "E" ? scbGarden(night) : scbDecor(decor, night);
  const el = document.createElement("div");
  el.className = `shbanner ${tone}${night ? " night" : ""}${opts.compact ? " compact" : ""}${opts.head ? " head" : ""}`;
  el.style.setProperty("--sh-wall", wall);
  // The state's colour, for the round badge and the status pill
  el.style.setProperty("--tone", SCB_TONES[tone] || SCB_TONES.idle);
  const esc = (v) => String(v).replace(/[&<>"]/g, (ch) => `&#${ch.charCodeAt(0)};`);
  const scene = opts.compact
    ? ""
    : `<svg class="shscene" viewBox="0 0 360 80" preserveAspectRatio="xMaxYMax slice" aria-hidden="true" focusable="false">${furniture}<g transform="translate(160 0)">${scbScene(tab, tone, night, extra)}</g></svg>
    <div class="shground g-${floor}"></div>`;
  el.innerHTML = `${scene}<div class="shhead"><span class="shbadge" aria-hidden="true"><ha-icon icon="${SCB_ICONS[tab] || SCB_ICONS.overview}"></ha-icon></span>
      <div class="shtitles"><div class="shtrow"><span class="shtitle">${esc(title)}</span>${pill ? `<span class="shpill">${esc(pill)}</span>` : ""}</div>
        ${sub ? `<span class="shsub" title="${esc(sub)}">${esc(sub)}</span>` : ""}</div></div>`;
  return el;
}

const STYLE = `
  :host {
    display: block;
    min-height: 100vh;
    background: var(--primary-background-color);
    color: var(--primary-text-color);
    font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
  }
  /* The top bar: the living room across the page (as on the ENT ONE panel); the tabs under it on the page background,
     sticky, with the unsaved-changes actions at their right */
  :host { --sc-accent: #21b7b6; }
  .topbar .shbanner { height: 90px; }
  .topbar .shhead { padding-left: 4px; right: calc(min(360px, 46%) + 96px); }
  .topbar .shscene { right: 96px; }
  .topbar .shtitle { font-size: 20px; }
  .hmenu { flex: none; color: inherit; }
  .hacts { position: absolute; z-index: 2; top: calc((100% - 10px) / 2 - 17px); right: 12px; display: flex; gap: 6px; }
  .hacts .icon-btn { width: 34px; height: 34px; padding: 0; border-radius: 50%; display: grid; place-items: center; box-sizing: border-box; text-decoration: none;
    color: #33506b; background: rgba(255, 255, 255, 0.55); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7); --mdc-icon-size: 20px; }
  .hacts .icon-btn:hover { background: rgba(255, 255, 255, 0.82); }
  .night .hacts .icon-btn { color: #fff; background: rgba(255, 255, 255, 0.12); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2); }
  :host([bare]) .topbar { display: none; }
  .tabs {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 12px;
    overflow-x: auto;
    background: var(--primary-background-color);
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    position: sticky;
    top: 0;
    z-index: 2;
  }
  .tablist { display: flex; gap: 4px; flex: 1; min-width: 0; }
  .tabmenu { display: none; color: var(--primary-text-color); }
  :host([bare]) .tabmenu { display: flex; }
  .tab {
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--secondary-text-color);
    padding: 12px 12px 10px;
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
  }
  .tab:hover { color: var(--primary-text-color); }
  .tab.active { color: var(--primary-text-color); border-bottom-color: var(--sc-accent); }
  .tab .cnt { display: inline-block; min-width: 18px; padding: 1px 5px; margin-left: 5px; border-radius: 9px; font-size: 11px; text-align: center; box-sizing: border-box;
    color: color-mix(in srgb, #f5a623 60%, var(--primary-text-color)); background: color-mix(in srgb, #f5a623 18%, transparent); }
  .actions { display: flex; align-items: center; gap: 8px; flex: none; }
  .dirty { font-size: 13px; color: var(--secondary-text-color); margin-right: 4px; }
  /* A tab's compact header (the picture is in the top bar) */
  .shbanner.compact { height: auto; background: none; color: inherit; --sh-sub: var(--secondary-text-color); }
  .shbanner.compact .shhead { position: static; padding: 12px 16px 0; }
  .shbanner.compact.night { color: inherit; }
  /* Overview: room filter, switches, tiles of the chart */
  .summary.ov { display: flex; flex-direction: column; gap: 12px; }
  .filters { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
  .filters .grow { flex: 1; }
  .fchip, .pill { display: inline-flex; align-items: center; gap: 6px; min-height: 30px; padding: 0 12px; border-radius: 16px; font: inherit; font-size: 13px; box-sizing: border-box; cursor: pointer;
    color: var(--secondary-text-color); background: var(--card-background-color, #fff); border: 1px solid var(--divider-color, #e0e0e0); }
  .fchip.on { color: var(--primary-text-color); border: 1.5px solid var(--sc-accent); }
  .fchip .dot { width: 7px; height: 7px; border-radius: 50%; }
  .fchip .dot.warn { background: #f5a623; } .fchip .dot.bad { background: var(--error-color, #db4437); } .fchip .dot.good { background: var(--success-color, #43a047); }
  .fchip .cnt { font-size: 11px; padding: 0 6px; border-radius: 8px; background: color-mix(in srgb, var(--sc-accent) 16%, transparent); color: color-mix(in srgb, var(--sc-accent) 55%, var(--primary-text-color)); }
  .more { position: relative; }
  .more > summary { list-style: none; border-style: dashed; } .more > summary::-webkit-details-marker { display: none; }
  .more .pop { position: absolute; z-index: 3; top: calc(100% + 6px); left: 0; min-width: 200px; max-height: 300px; overflow: auto; padding: 8px; box-sizing: border-box;
    display: flex; flex-direction: column; gap: 4px; background: var(--card-background-color, #fff); border: 1px solid var(--divider-color, rgba(127,127,127,.3));
    border-radius: 12px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14); }
  .pill { --mdc-icon-size: 16px; }
  .pill.on { color: color-mix(in srgb, var(--success-color, #43a047) 60%, var(--primary-text-color)); background: color-mix(in srgb, var(--success-color, #43a047) 14%, transparent); border-color: transparent; }
  .otiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; }
  .otile { display: flex; align-items: center; gap: 12px; min-width: 0; padding: 12px 14px; border-radius: 12px; box-sizing: border-box;
    background: var(--secondary-background-color, rgba(127,127,127,.08)); --c: #8a96a3; }
  .otile.warn { --c: #f5a623; } .otile.bad { --c: var(--error-color, #db4437); } .otile.good { --c: var(--success-color, #43a047); }
  .otile.info { --c: #2f80ed; } .otile.night { --c: #7f77dd; }
  .otile .pastille { position: relative; flex: none; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; --mdc-icon-size: 22px;
    color: var(--c); background: color-mix(in srgb, var(--c) 16%, transparent); }
  .otile .pbadge { position: absolute; top: -3px; right: -5px; min-width: 18px; height: 18px; padding: 0 4px; box-sizing: border-box; border-radius: 9px; font-size: 11px; font-weight: 600;
    line-height: 18px; text-align: center; color: #fff; background: var(--c); box-shadow: 0 0 0 2px var(--card-background-color, #fff); }
  .otile .tl { display: flex; flex-direction: column; min-width: 0; }
  .otile .tn { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .otile .ts { font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: color-mix(in srgb, var(--c) 65%, var(--primary-text-color)); }
  .otile.rest .ts { color: var(--secondary-text-color); }
  @media (max-width: 600px) { .topbar .shscene { display: none; } .topbar .shhead { right: 96px; } .topbar .shbadge { display: none; } }
  .content { max-width: 1040px; margin: 0 auto; padding: 16px; display: flex; flex-direction: column; gap: 16px; }
  .card {
    background: var(--ha-card-background, var(--card-background-color, #fff));
    border-radius: var(--ha-card-border-radius, 12px);
    border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color));
    box-shadow: var(--ha-card-box-shadow, none);
    padding: 16px;
  }
  .card-header { display: flex; align-items: center; gap: 10px; font-size: 18px; margin-bottom: 12px; }
  .card-header > ha-icon { color: var(--primary-color); }
  /* Activity tab: the filters, then the lines by day, a time column on the right */
  .act-tools { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; margin: 12px 0 4px; }
  .seg { display: inline-flex; max-width: 100%; overflow-x: auto; scrollbar-width: none; padding: 3px; gap: 2px; border-radius: 10px; background: var(--secondary-background-color, rgba(127,127,127,.12)); }
  .seg button { border: 0; background: none; color: var(--secondary-text-color); font: inherit; font-size: 13px; padding: 6px 12px;
                border-radius: 8px; cursor: pointer; white-space: nowrap; }
  .seg button[aria-checked="true"] { background: var(--card-background-color, #fff); color: var(--primary-text-color); font-weight: 500;
                                     box-shadow: 0 1px 2px rgba(0,0,0,.15); }
  .seg button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 1px; }
  .act-room { font: inherit; font-size: 13px; color: inherit; padding: 6px 10px; border-radius: 8px; max-width: 100%;
              border: 1px solid var(--divider-color, rgba(127,127,127,.3)); background: var(--secondary-background-color, transparent); }
  .act-room option { color: initial; }
  .act-day { margin-top: 12px; }
  .act-date { padding: 6px 0; font-size: 12px; font-weight: 500; color: var(--secondary-text-color);
              border-bottom: 1px solid var(--divider-color, rgba(127,127,127,.2)); margin-bottom: 4px; }
  .act-row { display: flex; align-items: flex-start; gap: 12px; padding: 8px 6px; border-radius: 8px; }
  .act-row[data-entity] { cursor: pointer; }
  .act-row[data-entity]:hover { background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .act-row:focus-visible { outline: 2px solid var(--primary-color); outline-offset: -2px; }
  .act-icon { flex: none; width: 32px; height: 32px; overflow: hidden; border-radius: 50%; display: grid; place-items: center; --mdc-icon-size: 18px;
              color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 12%, transparent); }
  .act-row.failed .act-icon, .act-row.critical .act-icon { color: var(--error-color, #db4437); background: color-mix(in srgb, var(--error-color, #db4437) 12%, transparent); }
  .act-row.warning .act-icon { color: var(--warning-color, #ffa600); background: color-mix(in srgb, var(--warning-color, #ffa600) 14%, transparent); }
  .act-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .act-what { font-size: 14px; overflow-wrap: anywhere; }
  .act-detail { font-size: 13px; color: var(--secondary-text-color); white-space: pre-line; overflow-wrap: anywhere; }
  .act-room-name { font-size: 12px; color: var(--secondary-text-color); }
  .act-time { flex: none; font-size: 12px; color: var(--secondary-text-color); font-variant-numeric: tabular-nums; padding-top: 2px; }
  .act-empty { padding: 20px 4px; color: var(--secondary-text-color); }
  .card-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--divider-color); }
  .btn {
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    padding: 8px 14px;
    border-radius: 18px;
    border: 1px solid var(--divider-color);
    background: transparent;
    color: var(--primary-color);
    cursor: pointer;
  }
  .btn:hover { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08); }
  .btn:disabled { opacity: 0.6; cursor: default; }
  .btn.add { align-self: flex-start; }
  .btn.small { margin-top: 4px; padding: 6px 12px; font-size: 13px; }
  .icon-btn {
    background: none;
    border: none;
    color: var(--secondary-text-color);
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    display: inline-flex;
  }
  .icon-btn:hover { background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.06); color: var(--primary-color); }
  .banner { padding: 12px 16px; border-radius: 10px; font-size: 14px; line-height: 1.4; }
  .banner.info { background: rgba(var(--rgb-info-color, 3, 155, 229), 0.12); }
  .banner.error { background: rgba(var(--rgb-error-color, 219, 68, 55), 0.14); color: var(--error-color); }
  .banner.success { background: rgba(var(--rgb-success-color, 67, 160, 71), 0.14); }
  .banner .note { margin-top: 6px; font-weight: 500; }
  .source .sfile { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; background: var(--secondary-background-color, rgba(0, 0, 0, 0.04)); margin: 4px 0; }
  .source .sfile code { flex: 1 1 200px; font-size: 13px; }
  .source .sstatus { font-size: 12px; color: var(--secondary-text-color); }
  .source .sstatus.bad { color: var(--error-color); }
  .srow { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08)); }
  .srow:last-child { border-bottom: 0; }
  .stext { flex: 1 1 300px; min-width: 0; }
  .sname { font-size: 14px; font-weight: 600; }
  .shelp { font-size: 12px; color: var(--secondary-text-color); line-height: 1.4; }
  .shelp.note { margin: 4px 0 0; font-weight: 500; color: var(--primary-text-color); }
  .pill.info { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.14); color: var(--primary-color); }
  .sw { position: relative; display: inline-block; width: 40px; height: 24px; flex: none; }
  .sw input { position: absolute; inset: 0; opacity: 0; margin: 0; cursor: pointer; }
  .sw span { position: absolute; inset: 0; border-radius: 12px; background: var(--disabled-color, #bdbdbd); pointer-events: none; }
  .sw span::after { content: ""; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); transition: left 0.15s; }
  .sw input:checked + span { background: var(--primary-color); }
  .sw input:checked + span::after { left: 19px; }
  .sw input:focus-visible + span { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  .btn.primary { border-color: var(--primary-color); color: var(--primary-color); }
  .card.conflict { box-shadow: 0 0 0 2px var(--warning-color, #f59e0b); }
  .cgrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 10px; }
  .cbox { padding: 10px 12px; border-radius: 10px; min-width: 0; }
  .cbox.file { background: rgba(var(--rgb-warning-color, 245, 158, 11), 0.14); }
  .cbox.panel { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12); }
  .cbox .ctitle { font-size: 12px; font-weight: 600; margin-bottom: 4px; }
  .cbox pre { margin: 0; font: 13px/1.5 var(--code-font-family, monospace); white-space: pre-wrap; word-break: break-word; }
  .cactions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; margin-top: 12px; }
  .banner .retry { margin-left: 8px; font: inherit; font-weight: 500; color: var(--primary-color); background: none; border: 1px solid currentColor; border-radius: 16px; padding: 2px 12px; cursor: pointer; }
  .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; }
  .tile {
    font: inherit;
    text-align: left;
    color: inherit;
    background: var(--ha-card-background, var(--card-background-color, #fff));
    border: 1px solid var(--divider-color);
    border-radius: 12px;
    padding: 14px;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    column-gap: 12px;
    align-items: center;
  }
  button.tile { cursor: pointer; }
  .tile ha-icon { grid-row: span 2; color: var(--primary-color); --mdc-icon-size: 28px; }
  .tile.off ha-icon { color: var(--disabled-text-color, var(--secondary-text-color)); }
  .tile-value { font-size: 22px; font-weight: 500; }
  .tile-value:empty { display: none; }
  .tile-label { font-size: 13px; color: var(--secondary-text-color); }
  .alert { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-top: 1px solid var(--divider-color); }
  .alert:first-of-type { border-top: none; }
  .alert .kind { color: var(--warning-color, #ffa600); margin-top: 2px; }
  .alert .kind.too_cold, .alert .kind.window_open_cold { color: var(--info-color, #039be5); }
  .alert .kind.co2_high, .alert .kind.humidity_high, .alert .kind.ventilate,
  .alert .kind.noise_high, .alert .kind.noisy_outside, .alert .kind.bad_air_outside { color: var(--primary-color); }
  .alert .kind.close_windows { color: var(--error-color); }
  .alert-body { flex: 1; min-width: 0; }
  .alert-title { font-weight: 500; }
  .alert-meta { font-size: 13px; color: var(--secondary-text-color); margin-top: 2px; }
  .badges { display: flex; gap: 6px; margin-top: 4px; flex-wrap: wrap; }
  .badge { font-size: 12px; padding: 1px 8px; border-radius: 10px; border: 1px solid var(--divider-color); color: var(--secondary-text-color); }
  .row-actions { display: flex; gap: 2px; }
  .empty { color: var(--secondary-text-color); padding: 8px 0; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
  .grid .card { padding: 14px; }
  .grid .card.has-alert .card-header ha-icon { color: var(--warning-color, #ffa600); }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip {
    display: inline-flex; align-items: center; gap: 4px; font-size: 13px;
    padding: 3px 10px 3px 6px; border-radius: 14px; background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.05);
  }
  .chip ha-icon { --mdc-icon-size: 16px; color: var(--secondary-text-color); }
  .room-status { margin-top: 10px; font-size: 14px; }
  .is-ok .room-status { color: var(--success-color, #43a047); }
  .has-alert .room-status { color: var(--warning-color, #ffa600); }
  .devices { margin-top: 10px; border-top: 1px solid var(--divider-color); padding-top: 8px; display: flex; flex-direction: column; gap: 4px; }
  .device { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; }
  .device-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .device-state { color: var(--secondary-text-color); white-space: nowrap; }
  .last-title { font-weight: 500; }
  .last-message { white-space: pre-line; margin-top: 4px; }
  .room-header { justify-content: space-between; margin-bottom: 0; gap: 12px; }
  .room-summary { flex: 1; display: flex; flex-wrap: wrap; align-items: center; gap: 10px; color: var(--secondary-text-color); font-size: 13px; }
  .summary-item { display: inline-flex; align-items: center; gap: 2px; }
  .summary-item ha-icon { --mdc-icon-size: 18px; }
  .badge.new { color: var(--primary-color); border-color: var(--primary-color); }
  .room-toggle { display: flex; align-items: center; gap: 6px; background: none; border: none; color: inherit; font: inherit; font-size: 18px; cursor: pointer; padding: 0; }
  .room-toggle ha-icon { color: var(--secondary-text-color); }
  .room-toggle .room-icon { color: var(--primary-color); margin: 0 2px 0 -2px; }
  .subheader { font-size: 14px; font-weight: 500; color: var(--secondary-text-color); margin: 18px 0 8px; text-transform: uppercase; letter-spacing: 0.04em; }
  pre.yaml { margin: 12px 0 0; padding: 12px; overflow-x: auto; border-radius: 8px; font: 13px/1.5 var(--code-font-family, monospace); background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.05); white-space: pre; user-select: text; }
  .help { font-size: 13px; color: var(--secondary-text-color); margin: -4px 0 8px; }
  .section-title { display: flex; align-items: center; gap: 8px; font-size: 20px; margin: 28px 0 8px; }
  .section-title ha-icon { color: var(--secondary-text-color); }
  .section-help { margin: 0 0 12px; }
  .discover { display: flex; align-items: center; gap: 16px; }
  .discover-text { flex: 1; font-size: 14px; color: var(--secondary-text-color); line-height: 1.4; }
  @media (max-width: 600px) { .discover { flex-direction: column; align-items: flex-start; } }
  .device-item { display: flex; align-items: flex-start; gap: 4px; margin-bottom: 8px; }
  .device-item ha-form { flex: 1; }
  .device-item.slot { border: 1px solid var(--divider-color); border-radius: 12px; padding: 12px 4px 12px 12px; }
  .link { background: none; border: none; padding: 0; font: inherit; color: var(--primary-color); cursor: pointer; }
  .discover-more { margin-top: 8px; }
  /* Sections of a room and alert kinds: a line that opens, with a summary of what it holds */
  .sections { display: flex; flex-direction: column; margin-top: 12px; border-top: 1px solid var(--divider-color); }
  .section { border-bottom: 1px solid var(--divider-color); }
  .card > .section:last-child { border-bottom: none; }
  .section-head {
    width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 4px; background: none; border: none;
    font: inherit; color: inherit; cursor: pointer; text-align: left;
  }
  .section-head:hover { background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.03); }
  .section-head > ha-icon { color: var(--secondary-text-color); --mdc-icon-size: 22px; }
  .section.open .section-head > ha-icon:first-child { color: var(--primary-color); }
  .section-name { font-size: 15px; font-weight: 500; white-space: nowrap; }
  .section-summary {
    flex: 1; min-width: 0; text-align: right; font-size: 13px; color: var(--secondary-text-color);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .section-head .chevron { color: var(--secondary-text-color); }
  .section-body { padding: 4px 4px 16px 38px; display: flex; flex-direction: column; gap: 12px; }
  .section-body .help { margin: 0; }
  .section-body .subheader { margin: 8px 0 0; }
  .device-item { margin-bottom: 0; }
  /* "+ Something" for what isn't set yet */
  .add-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .add-chip {
    display: inline-flex; align-items: center; gap: 4px; padding: 5px 12px 5px 8px; border-radius: 16px;
    border: 1px dashed var(--divider-color); background: none; font: inherit; font-size: 13px;
    color: var(--primary-color); cursor: pointer;
  }
  .add-chip ha-icon { --mdc-icon-size: 18px; }
  .add-chip:hover { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08); border-style: solid; }
  /* Schedule */
  .timeline { display: grid; grid-template-columns: minmax(120px, max-content) 1fr; gap: 10px 14px; align-items: center; margin-top: 8px; }
  .tl-scale { position: relative; height: 16px; font-size: 11px; color: var(--secondary-text-color); }
  .tl-tick { position: absolute; transform: translateX(-50%); }
  .tl-tick:first-child { transform: none; }
  .tl-tick:last-child { transform: translateX(-100%); }
  .tl-label { display: flex; align-items: center; gap: 8px; font-size: 14px; }
  .tl-label ha-icon { --mdc-icon-size: 20px; color: var(--secondary-text-color); }
  .tl-bar { position: relative; height: 22px; border-radius: 11px; background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.06); overflow: hidden; }
  .tl-bar.unset::after { content: "–"; position: absolute; left: 10px; top: 1px; font-size: 13px; color: var(--secondary-text-color); }
  .tl-seg { position: absolute; top: 0; bottom: 0; background: var(--primary-color); opacity: 0.85; }
  .tl-bar.quiet .tl-seg { background: var(--info-color, #039be5); }
  .tl-bar.night .tl-seg { background: #5c6bc0; }
  .tl-bar.morning .tl-seg { background: var(--warning-color, #ffa600); }
  .tl-bar.boost .tl-seg { background: var(--success-color, #43a047); }
  .tl-bar.displays .tl-seg { background: #78909c; }
  .tl-now { position: absolute; top: -2px; bottom: -2px; width: 2px; background: var(--error-color, #db4437); }
  .sched-row { padding: 12px 0; border-top: 1px solid var(--divider-color); }
  .card-header + .sched-row { border-top: none; padding-top: 0; }
  .sched-head { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 500; margin-bottom: 4px; }
  .sched-head ha-icon { color: var(--primary-color); }
  .sched-row .help { margin: 0 0 8px; }
  @media (max-width: 600px) {
    .content { padding: 12px; }
    /* A room's or outdoor place's name and its actions on the first line, what it holds on the next one. */
    .room-header { flex-wrap: wrap; row-gap: 6px; }
    .room-summary { order: 3; flex-basis: 100%; }
    .dirty { display: none; }
    .section-body { padding-left: 4px; }
    .section-summary { display: none; }
    .section-name { flex: 1; }
    .timeline { grid-template-columns: 1fr; gap: 4px; }
    .tl-scale { display: none; }
    .tl-bar { margin-bottom: 8px; }
  }
    .shtop { padding:0; overflow:hidden; }
    .shbanner { position:relative; height:90px; overflow:hidden; color:#1d2733; background:var(--sh-wall); --sh-sub:#4a5a6c; container-type:inline-size; }
    .shbanner.night { color:#fff; --sh-sub:rgba(255,255,255,.78); }
    .shscene { position:absolute; right:0; bottom:10px; height:80px; width:min(360px, 46%); }
    .shground { position:absolute; left:0; right:0; bottom:0; height:10px; }
    .g-parquet { background:repeating-linear-gradient(90deg, #c99a6b 0 38px, #b98a5c 38px 40px); box-shadow:inset 0 2px 0 #a97c50; }
    .night .g-parquet { background:repeating-linear-gradient(90deg, #4a3a2c 0 38px, #3e3024 38px 40px); box-shadow:inset 0 2px 0 #5c4836; }
    .g-tiles { background:repeating-linear-gradient(90deg, #d9dfe3 0 18px, #c6cdd2 18px 19px); box-shadow:inset 0 2px 0 #b8c0c6; }
    .night .g-tiles { background:repeating-linear-gradient(90deg, #3a4250 0 18px, #2e3542 18px 19px); box-shadow:inset 0 2px 0 #4a5262; }
    .g-concrete { background:#9aa1a9; box-shadow:inset 0 2px 0 #b5bbc2; }
    .night .g-concrete { background:#2c323b; box-shadow:inset 0 2px 0 #3a414c; }
    .shhead { position:absolute; z-index:1; left:0; top:0; bottom:10px; right:calc(min(360px, 46%) + 4px); padding:6px 12px; box-sizing:border-box;
              display:flex; align-items:center; gap:10px; min-width:0; }
    .shbadge { width:40px; height:40px; flex:none; border-radius:50%; display:grid; place-items:center; --mdc-icon-size:24px; color:var(--tone);
               background:rgba(255,255,255,.62); box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--tone) 24%, transparent); }
    .night .shbadge { background:rgba(255,255,255,.12); color:color-mix(in srgb, var(--tone) 78%, #fff); box-shadow:inset 0 0 0 1px rgba(255,255,255,.14); }
    .shtitles { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
    .shtrow { display:flex; align-items:center; gap:8px; min-width:0; }
    .shtitle { flex:0 1 auto; min-width:0; font-size:16px; font-weight:500; line-height:1.25; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .shpill { flex:none; display:inline-flex; align-items:center; gap:5px; padding:1px 8px; border-radius:10px; font-size:12px; font-weight:500; line-height:16px;
              white-space:nowrap; max-width:60%; overflow:hidden; text-overflow:ellipsis;
              background:color-mix(in srgb, var(--tone) 16%, transparent); color:color-mix(in srgb, var(--tone) 60%, var(--primary-text-color, #1f2328)); }
    .shpill::before { content:""; flex:none; width:7px; height:7px; border-radius:50%; background:var(--tone); }
    .night .shpill { background:color-mix(in srgb, var(--tone) 22%, rgba(255,255,255,.12)); color:color-mix(in srgb, var(--tone) 55%, #fff); }
    .shsub { font-size:13px; line-height:18px; color:var(--sh-sub); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .idle { --tone:#8a96a6; }
    @container (max-width:560px) { .shscene { display:none; } .shhead { right:0; } }
    .shtop .subtabs { gap:4px; padding:0 12px; border-bottom:1px solid var(--divider-color, rgba(127,127,127,.2)); overflow-x:auto; flex-wrap:nowrap; }
    .shtop .subtab { min-height:0; padding:8px 10px; border:0; border-bottom:2px solid transparent; border-radius:6px 6px 0 0; margin-bottom:-1px;
                     background:none; color:var(--secondary-text-color); font-size:13px; font-weight:500; white-space:nowrap; gap:6px; --mdc-icon-size:16px; }
    .shtop .subtab:hover { color:var(--primary-text-color); border-color:transparent; }
    .shtop .subtab.active { color:var(--primary-text-color); background:none; border-bottom-color:var(--primary-color); }
    .shtop .subtab.active ha-icon { color:var(--primary-color); }
    .shtop .subdot { width:6px; height:6px; }
    .shscene .sh-blink { animation:sh-bl 1.2s steps(2) infinite; }
    .shscene .sh-fade { animation:sh-bl 1.6s ease-in-out infinite; }
    .shscene .sh-leaf { transform-box:fill-box; transform-origin:50% 100%; animation:sh-sway 4s ease-in-out infinite; }
    .shscene .sh-up { animation:sh-up 1.4s ease-in-out infinite; }
    .shscene .sh-cloud { animation:sh-drift 4s ease-in-out infinite alternate; }
    .shscene .sh-pir { opacity:.14; animation:sh-pir 2s ease-in-out infinite; }
    .shscene .sh-glow { animation:sh-glow 3s ease-in-out infinite; }
    .shscene .sh-float, .shscene .sh-dust { animation:sh-float 3s ease-in-out infinite; }
    .shscene :is(.sh-spin, .sh-rot, .sh-rot-rev, .sh-rot-fast, .sh-ping) { transform-box:fill-box; transform-origin:center; }
    .shscene .sh-spin { animation:sh-spin 1.6s linear infinite; }
    .shscene .sh-rot { animation:sh-spin 9s linear infinite; }
    .shscene .sh-rot-rev { animation:sh-spin 6s linear infinite reverse; }
    .shscene .sh-rot-fast { animation:sh-spin 1.4s linear infinite; }
    .shscene .sh-ping { animation:sh-ping 2s ease-out infinite; }
    @keyframes sh-bl { 50% { opacity:.2; } }
    @keyframes sh-sway { 0%, 100% { transform:rotate(-4deg); } 50% { transform:rotate(4deg); } }
    @keyframes sh-up { 50% { transform:translateY(-2px); } }
    @keyframes sh-drift { to { transform:translateX(4px); } }
    @keyframes sh-pir { 0%, 100% { opacity:.06; } 50% { opacity:.18; } }
    @keyframes sh-glow { 50% { opacity:.06; } }
    @keyframes sh-float { 50% { transform:translateY(-3px); } }
    @keyframes sh-ping { from { transform:scale(1); opacity:.9; } to { transform:scale(2.6); opacity:0; } }
    @media (prefers-reduced-motion: reduce) { .shscene * { animation:none !important; } }

    /* Charter: the header card's body, filled tiles with a round tinted icon, centred icons */
    ha-icon { display:inline-flex; align-items:center; justify-content:center; flex:none; line-height:0; }
    .shbody { display:flex; flex-direction:column; gap:12px; padding:12px 16px 16px; }
    .shbody > .card { border:0; padding:0; background:none; box-shadow:none; }
    .summary { gap:10px; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr)); }
    .tile { background:color-mix(in srgb, var(--primary-text-color) 5%, transparent); border:0; border-radius:14px; padding:10px 12px; min-height:56px; box-sizing:border-box; }
    button.tile:hover { background:color-mix(in srgb, var(--primary-color) 10%, transparent); }
    .tile > ha-icon { width:36px; height:36px; border-radius:50%; --mdc-icon-size:20px;
                      background:color-mix(in srgb, var(--primary-color) 14%, transparent); }
    .tile.off > ha-icon { background:color-mix(in srgb, var(--disabled-text-color, #9e9e9e) 16%, transparent); }
    .tile-value { font-size:18px; line-height:1.2; }
    .tile-label { font-size:12px; line-height:1.3; }
    .tile-value:empty + .tile-label { grid-row:span 2; font-size:13px; color:var(--primary-text-color); }
    .card-header { font-size:13px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:var(--secondary-text-color); }
    .card-header > ha-icon { --mdc-icon-size:20px; }
`;

if (!customElements.get("smart-comfort-panel")) customElements.define("smart-comfort-panel", SmartComfortPanel);
