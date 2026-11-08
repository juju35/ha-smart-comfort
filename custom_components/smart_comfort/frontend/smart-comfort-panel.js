/**
 * Smart Comfort — configuration panel.
 *
 * A plain web component (no build step) that Home Assistant loads in the sidebar. It reads and saves
 * the integration options over the WebSocket API (smart_comfort/config, smart_comfort/config/save),
 * follows the status (smart_comfort/subscribe) and renders the forms with Home Assistant's ha-form,
 * whose labels come from the integration's own translations (options flow strings).
 */

const DOMAIN = "smart_comfort";

const KIND_ICONS = {
  too_hot: "mdi:thermometer-high",
  close_windows: "mdi:window-closed-variant",
  ventilate: "mdi:window-open-variant",
  too_cold: "mdi:thermometer-low",
  window_open_cold: "mdi:snowflake-alert",
  co2_high: "mdi:molecule-co2",
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

const UNITS = { co2_high: "ppm", humidity_high: "%", noise_high: "dB", noisy_outside: "dB", bad_air_outside: "/6" };

// Strings of the panel itself; field labels come from the integration translations.
const STRINGS = {
  en: {
    outdoor_noise: "Outdoor noise",
    quiet_night: "Quiet night",
    discovered_new: "new",
    discovered_updated: "completed",
    discovered_new_outdoor: "new",
    discovered_updated_outdoor: "completed",
    discover: "Discover",
    discover_help: "Adds a room for each Home Assistant area with something to follow (a comfort sensor, an air conditioner, a fan, a purifier or a dimmable light) and sets it up: temperature, CO₂, humidity and noise sensors, windows and doors, air conditioner, fans and purifiers with their presets and modes. The outdoor areas (garden, terrace…) go to the Outdoors, with their temperature, air quality and noise sensors; a city air quality index (Atmo France…) and the weather entity, for want of an outdoor sensor, go to the Notifications tab. Quiet presets and fan modes become the night settings. What is already set is kept. Check the result, then save.",
    discover_running: "Discovering…",
    discover_result: "Discovery: {added} room(s) added, {updated} completed, {outdoors} outdoor place(s){outdoor}. Check them, then save.",
    discover_outdoor: ", outdoor sensors set",
    discover_none: "Discovery found nothing new.",
    fan: "Fan",
    purifier: "Air purifier",
    overview: "Overview",
    rooms: "Rooms",
    alerts: "Alerts",
    notifications: "Notifications",
    control: "Device control",
    save: "Save",
    discard: "Discard",
    saved: "Saved",
    saving: "Saving…",
    unsaved: "Unsaved changes",
    yaml: "This configuration comes from YAML. Changes saved here stay until the YAML changes: then the YAML replaces them at the next restart.",
    not_loaded: "Smart Comfort is not loaded. Check the logs.",
    not_setup: "Smart Comfort is not set up yet: add it in Settings → Devices & services.",
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
  },
  fr: {
    outdoor_noise: "Bruit extérieur",
    quiet_night: "Nuit calme",
    discovered_new: "nouvelle",
    discovered_updated: "complétée",
    discovered_new_outdoor: "nouvelle",
    discovered_updated_outdoor: "complétée",
    discover: "Découvrir",
    discover_help: "Ajoute chaque pièce de Home Assistant où il y a quelque chose à suivre (un capteur de confort, un climatiseur, un ventilateur, un purificateur ou une lumière variable) et la règle : capteurs de température, CO₂, humidité et bruit, fenêtres et portes, climatiseur, ventilateurs et purificateurs avec leurs modes. Les pièces extérieures (jardin, terrasse…) vont dans Extérieurs, avec leurs capteurs de température, qualité de l'air et bruit ; un indice de qualité de l'air de la ville (Atmo France…) et l'entité météo, à défaut de capteur extérieur, vont dans l'onglet Notifications. Les modes silencieux deviennent les réglages de nuit. Ce qui est déjà réglé est conservé. Vérifiez le résultat, puis enregistrez.",
    discover_running: "Découverte…",
    discover_result: "Découverte : {added} pièce(s) ajoutée(s), {updated} complétée(s), {outdoors} extérieur(s){outdoor}. Vérifiez-les, puis enregistrez.",
    discover_outdoor: ", capteurs extérieurs renseignés",
    discover_none: "La découverte n'a rien trouvé de nouveau.",
    fan: "Ventilateur",
    purifier: "Purificateur",
    overview: "Vue d'ensemble",
    rooms: "Pièces",
    alerts: "Alertes",
    notifications: "Notifications",
    control: "Pilotage des appareils",
    save: "Enregistrer",
    discard: "Annuler",
    saved: "Enregistré",
    saving: "Enregistrement…",
    unsaved: "Modifications non enregistrées",
    yaml: "Cette configuration vient du YAML. Ce qui est enregistré ici reste jusqu'à ce que le YAML change : il le remplace alors au prochain redémarrage.",
    not_loaded: "Smart Comfort n'est pas chargé. Consultez les journaux.",
    not_setup: "Smart Comfort n'est pas encore configuré : ajoutez-le dans Paramètres → Appareils et services.",
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
  },
  de: {
    outdoor_noise: "Außenlärm",
    quiet_night: "Ruhige Nacht",
    discovered_new: "neu",
    discovered_updated: "ergänzt",
    discovered_new_outdoor: "neu",
    discovered_updated_outdoor: "ergänzt",
    discover: "Erkennen",
    discover_help: "Legt für jeden Home-Assistant-Bereich mit etwas zu überwachen (Komfortsensor, Klimaanlage, Lüfter, Luftreiniger oder dimmbares Licht) einen Raum an und richtet ihn ein: Temperatur-, CO₂-, Feuchte- und Lärmsensoren, Fenster und Türen, Klimaanlage, Lüfter und Luftreiniger mit ihren Modi. Die Außenbereiche (Garten, Terrasse…) kommen zu „Außen“, mit ihren Temperatur-, Luftqualitäts- und Lärmsensoren; ein städtischer Luftqualitätsindex (Atmo France…) und die Wetter-Entität, mangels Außensensor, in den Reiter Benachrichtigungen. Leise Voreinstellungen und Lüftermodi werden zu den Nachteinstellungen. Bereits Eingestelltes bleibt erhalten. Ergebnis prüfen, dann speichern.",
    discover_running: "Erkennung…",
    discover_result: "Erkennung: {added} Raum/Räume hinzugefügt, {updated} ergänzt, {outdoors} Außenbereich(e){outdoor}. Prüfen, dann speichern.",
    discover_outdoor: ", Außensensoren gesetzt",
    discover_none: "Die Erkennung hat nichts Neues gefunden.",
    fan: "Lüfter",
    purifier: "Luftreiniger",
    overview: "Übersicht",
    rooms: "Räume",
    alerts: "Meldungen",
    notifications: "Benachrichtigungen",
    control: "Gerätesteuerung",
    save: "Speichern",
    discard: "Verwerfen",
    saved: "Gespeichert",
    saving: "Speichern…",
    unsaved: "Ungespeicherte Änderungen",
    yaml: "Diese Konfiguration stammt aus YAML. Hier gespeicherte Änderungen bleiben, bis sich das YAML ändert: dann ersetzt es sie beim nächsten Neustart.",
    not_loaded: "Smart Comfort ist nicht geladen. Prüfen Sie die Protokolle.",
    not_setup: "Smart Comfort ist noch nicht eingerichtet: unter Einstellungen → Geräte & Dienste hinzufügen.",
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
  },
  es: {
    outdoor_noise: "Ruido exterior",
    quiet_night: "Noche tranquila",
    discovered_new: "nueva",
    discovered_updated: "completada",
    discovered_new_outdoor: "nueva",
    discovered_updated_outdoor: "completada",
    discover: "Descubrir",
    discover_help: "Añade una estancia por cada área de Home Assistant con algo que vigilar (un sensor de confort, un aire acondicionado, un ventilador, un purificador o una luz regulable) y la configura: sensores de temperatura, CO₂, humedad y ruido, ventanas y puertas, aire acondicionado, ventiladores y purificadores con sus modos. Las áreas exteriores (jardín, terraza…) van a Exteriores, con sus sensores de temperatura, calidad del aire y ruido; un índice de calidad del aire de la ciudad (Atmo France…) y la entidad meteorológica, a falta de sensor exterior, van a la pestaña Notificaciones. Los modos silenciosos pasan a ser los ajustes de noche. Lo ya configurado se conserva. Revise el resultado y guarde.",
    discover_running: "Descubriendo…",
    discover_result: "Descubrimiento: {added} estancia(s) añadida(s), {updated} completada(s), {outdoors} exterior(es){outdoor}. Revíselas y guarde.",
    discover_outdoor: ", sensores exteriores configurados",
    discover_none: "El descubrimiento no encontró nada nuevo.",
    fan: "Ventilador",
    purifier: "Purificador",
    overview: "Resumen",
    rooms: "Estancias",
    alerts: "Alertas",
    notifications: "Notificaciones",
    control: "Control de aparatos",
    save: "Guardar",
    discard: "Descartar",
    saved: "Guardado",
    saving: "Guardando…",
    unsaved: "Cambios sin guardar",
    yaml: "Esta configuración viene de YAML. Lo guardado aquí se mantiene hasta que cambie el YAML: entonces lo sustituye en el próximo reinicio.",
    not_loaded: "Smart Comfort no está cargado. Revise los registros.",
    not_setup: "Smart Comfort aún no está configurado: añádalo en Ajustes → Dispositivos y servicios.",
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
  },
  sr: {
    outdoor_noise: "Спољашња бука",
    quiet_night: "Мирна ноћ",
    discovered_new: "ново",
    discovered_updated: "допуњено",
    discovered_new_outdoor: "ново",
    discovered_updated_outdoor: "допуњено",
    discover: "Откриј",
    discover_help: "Додаје собу за сваку Home Assistant зону у којој има нешто за праћење (сензор комфора, клима уређај, вентилатор, пречишћавач или светло са подесивом јачином) и подешава је: сензоре температуре, CO₂, влажности ваздуха и буке, прозоре и врата, клима уређај, вентилаторе и пречишћаваче са њиховим предефинисаним режимима и опцијама. Спољашње зоне (башта, тераса…) иду у „Спољашњи простор“ са својим сензорима температуре, квалитета ваздуха и буке; индекс квалитета ваздуха у граду (Atmo France…) и ентитет временске прогнозе, у недостатку спољашњег сензора, иду у картицу „Обавештења“. Тихи предефинисани режими и режими вентилатора постају ноћна подешавања. Оно што је већ подешено се задржава. Проверите резултат, а затим сачувајте.",
    discover_running: "Откривање…",
    discover_result: "Откривање: додато соба: {added}, допуњено: {updated}, спољашњих простора: {outdoors}{outdoor}. Проверите их, а затим сачувајте.",
    discover_outdoor: ", спољашњи сензори су подешени",
    discover_none: "Откривањем није пронађено ништа ново.",
    fan: "Вентилатор",
    purifier: "Пречишћавач ваздуха",
    overview: "Преглед",
    rooms: "Собе",
    alerts: "Упозорења",
    notifications: "Обавештења",
    control: "Контрола уређаја",
    save: "Сачувај",
    discard: "Одбаци",
    saved: "Сачувано",
    saving: "Чување…",
    unsaved: "Несачуване измене",
    yaml: "Ова конфигурација долази из YAML-а. Измене сачуване овде остају док се YAML не промени: тада их YAML замењује при следећем поновном покретању.",
    not_loaded: "Smart Comfort није учитан. Проверите дневнике логова.",
    not_setup: "Smart Comfort још увек није подешен: додајте га у Подешавања → Уређаји и услуге.",
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
  },
  "sr-Latn": {
    outdoor_noise: "Spoljašnja buka",
    quiet_night: "Mirna noć",
    discovered_new: "novo",
    discovered_updated: "dopunjeno",
    discovered_new_outdoor: "novo",
    discovered_updated_outdoor: "dopunjeno",
    discover: "Otkrij",
    discover_help: "Dodaje sobu za svaku Home Assistant zonu u kojoj ima nešto za praćenje (senzor komfora, klima uređaj, ventilator, prečišćivač ili svetlo sa podesivom jačinom) i podešava je: senzore temperature, CO₂, vlažnosti vazduha i buke, prozore i vrata, klima uređaj, ventilatore i prečišćivače sa njihovim predefinisanim režimima i opcijama. Spoljašnje zone (bašta, terasa…) idu u „Spoljašnji prostor“ sa svojim senzorima temperature, kvaliteta vazduha i buke; indeks kvaliteta vazduha u gradu (Atmo France…) i entitet vremenske prognoze, u nedostatku spoljašnjeg senzora, idu u karticu „Obaveštenja“. Tihi predefinisani režimi i režimi ventilatora postaju noćna podešavanja. Ono što je već podešeno se zadržava. Proverite rezultat, a zatim sačuvajte.",
    discover_running: "Otkrivanje…",
    discover_result: "Otkrivanje: dodato soba: {added}, dopunjeno: {updated}, spoljašnjih prostora: {outdoors}{outdoor}. Proverite ih, a zatim sačuvajte.",
    discover_outdoor: ", spoljašnji senzori su podešeni",
    discover_none: "Otkrivanjem nije pronađeno ništa novo.",
    fan: "Ventilator",
    purifier: "Prečišćivač vazduha",
    overview: "Pregled",
    rooms: "Sobe",
    alerts: "Upozorenja",
    notifications: "Obaveštenja",
    control: "Kontrola uređaja",
    save: "Sačuvaj",
    discard: "Odbaci",
    saved: "Sačuvano",
    saving: "Čuvanje…",
    unsaved: "Nesačuvane izmene",
    yaml: "Ova konfiguracija dolazi iz YAML-a. Izmene sačuvane ovde ostaju dok se YAML ne promeni: tada ih YAML zamenjuje pri sledećem ponovnom pokretanju.",
    not_loaded: "Smart Comfort nije učitan. Proverite dnevnike logova.",
    not_setup: "Smart Comfort još uvek nije podešen: dodajte ga u Podešavanja → Uređaji i usluge.",
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
  },
  it: {
    outdoor_noise: "Rumore esterno",
    quiet_night: "Notte silenziosa",
    discovered_new: "nuova",
    discovered_updated: "completata",
    discovered_new_outdoor: "nuovo",
    discovered_updated_outdoor: "completato",
    discover: "Scopri",
    discover_help: "Aggiunge una stanza per ogni area di Home Assistant con qualcosa da seguire (un sensore di comfort, un condizionatore, un ventilatore, un purificatore o una luce dimmerabile) e la configura: sensori di temperatura, CO₂, umidità e rumore, finestre e porte, condizionatore, ventilatori e purificatori con le loro preimpostazioni e modalità. Le aree esterne (giardino, terrazza…) vanno negli Esterni, con i loro sensori di temperatura, qualità dell'aria e rumore; un indice di qualità dell'aria della città (Atmo France…) e l'entità meteo, in mancanza di un sensore esterno, vanno nella scheda Notifiche. Le preimpostazioni e le modalità ventola silenziose diventano le impostazioni notturne. Ciò che è già impostato viene mantenuto. Controlla il risultato, poi salva.",
    discover_running: "Scoperta in corso…",
    discover_result: "Scoperta: stanze aggiunte: {added}, completate: {updated}, luoghi esterni: {outdoors}{outdoor}. Controllale, poi salva.",
    discover_outdoor: ", sensori esterni impostati",
    discover_none: "La scoperta non ha trovato nulla di nuovo.",
    fan: "Ventilatore",
    purifier: "Purificatore d'aria",
    overview: "Panoramica",
    rooms: "Stanze",
    alerts: "Avvisi",
    notifications: "Notifiche",
    control: "Controllo dei dispositivi",
    save: "Salva",
    discard: "Annulla",
    saved: "Salvato",
    saving: "Salvataggio…",
    unsaved: "Modifiche non salvate",
    yaml: "Questa configurazione proviene dal YAML. Le modifiche salvate qui restano finché il YAML non cambia: allora il YAML le sostituisce al riavvio successivo.",
    not_loaded: "Smart Comfort non è caricato. Controlla i log.",
    not_setup: "Smart Comfort non è ancora configurato: aggiungilo in Impostazioni → Dispositivi e servizi.",
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
  },
  nl: {
    outdoor_noise: "Buitengeluid",
    quiet_night: "Stille nacht",
    discovered_new: "nieuw",
    discovered_updated: "aangevuld",
    discovered_new_outdoor: "nieuw",
    discovered_updated_outdoor: "aangevuld",
    discover: "Ontdekken",
    discover_help: "Voegt een kamer toe voor elke Home Assistant-ruimte met iets om te volgen (een comfortsensor, een airco, een ventilator, een luchtreiniger of een dimbare lamp) en stelt die in: sensoren voor temperatuur, CO₂, luchtvochtigheid en geluid, ramen en deuren, airco, ventilatoren en luchtreinigers met hun voorinstellingen en modi. De buitenruimtes (tuin, terras…) gaan naar Buiten, met hun sensoren voor temperatuur, luchtkwaliteit en geluid; een luchtkwaliteitsindex van de stad (Atmo France…) en de weerentiteit, bij gebrek aan een buitensensor, gaan naar het tabblad Meldingen. Stille voorinstellingen en ventilatormodi worden de nachtinstellingen. Wat al is ingesteld, blijft behouden. Controleer het resultaat en sla daarna op.",
    discover_running: "Bezig met ontdekken…",
    discover_result: "Ontdekking: kamers toegevoegd: {added}, aangevuld: {updated}, buitenplekken: {outdoors}{outdoor}. Controleer ze en sla daarna op.",
    discover_outdoor: ", buitensensoren ingesteld",
    discover_none: "De ontdekking heeft niets nieuws gevonden.",
    fan: "Ventilator",
    purifier: "Luchtreiniger",
    overview: "Overzicht",
    rooms: "Kamers",
    alerts: "Waarschuwingen",
    notifications: "Meldingen",
    control: "Apparaatbediening",
    save: "Opslaan",
    discard: "Verwerpen",
    saved: "Opgeslagen",
    saving: "Opslaan…",
    unsaved: "Niet-opgeslagen wijzigingen",
    yaml: "Deze configuratie komt uit YAML. Wijzigingen die hier worden opgeslagen, blijven tot de YAML verandert: dan vervangt de YAML ze bij de volgende herstart.",
    not_loaded: "Smart Comfort is niet geladen. Controleer de logboeken.",
    not_setup: "Smart Comfort is nog niet ingesteld: voeg het toe via Instellingen → Apparaten & diensten.",
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
  },
  pt: {
    outdoor_noise: "Ruído exterior",
    quiet_night: "Noite silenciosa",
    discovered_new: "nova",
    discovered_updated: "completada",
    discovered_new_outdoor: "novo",
    discovered_updated_outdoor: "completado",
    discover: "Descobrir",
    discover_help: "Adiciona uma divisão por cada área do Home Assistant com algo a seguir (um sensor de conforto, um ar condicionado, uma ventoinha, um purificador ou uma luz regulável) e configura-a: sensores de temperatura, CO₂, humidade e ruído, janelas e portas, ar condicionado, ventoinhas e purificadores com as suas predefinições e modos. As áreas exteriores (jardim, terraço…) vão para Exteriores, com os seus sensores de temperatura, qualidade do ar e ruído; um índice de qualidade do ar da cidade (Atmo France…) e a entidade meteorológica, na falta de um sensor exterior, vão para o separador Notificações. As predefinições e os modos de ventoinha silenciosos tornam-se as definições noturnas. O que já está definido é mantido. Verifique o resultado e depois guarde.",
    discover_running: "A descobrir…",
    discover_result: "Descoberta: divisões adicionadas: {added}, completadas: {updated}, espaços exteriores: {outdoors}{outdoor}. Verifique-as e depois guarde.",
    discover_outdoor: ", sensores exteriores definidos",
    discover_none: "A descoberta não encontrou nada de novo.",
    fan: "Ventoinha",
    purifier: "Purificador de ar",
    overview: "Visão geral",
    rooms: "Divisões",
    alerts: "Alertas",
    notifications: "Notificações",
    control: "Controlo dos dispositivos",
    save: "Guardar",
    discard: "Descartar",
    saved: "Guardado",
    saving: "A guardar…",
    unsaved: "Alterações não guardadas",
    yaml: "Esta configuração vem do YAML. As alterações guardadas aqui mantêm-se até o YAML mudar: nessa altura o YAML substitui-as no próximo reinício.",
    not_loaded: "O Smart Comfort não está carregado. Consulte os registos.",
    not_setup: "O Smart Comfort ainda não está configurado: adicione-o em Definições → Dispositivos e serviços.",
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
  },
  pl: {
    outdoor_noise: "Hałas na zewnątrz",
    quiet_night: "Cicha noc",
    discovered_new: "nowe",
    discovered_updated: "uzupełnione",
    discovered_new_outdoor: "nowe",
    discovered_updated_outdoor: "uzupełnione",
    discover: "Wykryj",
    discover_help: "Dodaje pomieszczenie dla każdego obszaru Home Assistant, w którym jest coś do śledzenia (czujnik komfortu, klimatyzator, wentylator, oczyszczacz lub ściemniane światło), i je konfiguruje: czujniki temperatury, CO₂, wilgotności i hałasu, okna i drzwi, klimatyzator, wentylatory i oczyszczacze z ich ustawieniami wstępnymi i trybami. Obszary zewnętrzne (ogród, taras…) trafiają do zakładki Na zewnątrz, z ich czujnikami temperatury, jakości powietrza i hałasu; miejski indeks jakości powietrza (Atmo France…) i encja pogody, w braku czujnika zewnętrznego, trafiają do zakładki Powiadomienia. Ciche ustawienia wstępne i tryby wentylatora stają się ustawieniami nocnymi. To, co jest już ustawione, zostaje zachowane. Sprawdź wynik, a następnie zapisz.",
    discover_running: "Wykrywanie…",
    discover_result: "Wykrywanie: dodane pomieszczenia: {added}, uzupełnione: {updated}, miejsca na zewnątrz: {outdoors}{outdoor}. Sprawdź je, a następnie zapisz.",
    discover_outdoor: ", czujniki zewnętrzne ustawione",
    discover_none: "Wykrywanie nie znalazło niczego nowego.",
    fan: "Wentylator",
    purifier: "Oczyszczacz powietrza",
    overview: "Przegląd",
    rooms: "Pomieszczenia",
    alerts: "Alerty",
    notifications: "Powiadomienia",
    control: "Sterowanie urządzeniami",
    save: "Zapisz",
    discard: "Odrzuć",
    saved: "Zapisano",
    saving: "Zapisywanie…",
    unsaved: "Niezapisane zmiany",
    yaml: "Ta konfiguracja pochodzi z YAML. Zmiany zapisane tutaj obowiązują do czasu zmiany YAML: wtedy YAML zastępuje je przy następnym ponownym uruchomieniu.",
    not_loaded: "Smart Comfort nie jest załadowany. Sprawdź logi.",
    not_setup: "Smart Comfort nie jest jeszcze skonfigurowany: dodaj go w Ustawienia → Urządzenia oraz usługi.",
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
  },
  ro: {
    outdoor_noise: "Zgomot exterior",
    quiet_night: "Noapte liniștită",
    discovered_new: "nouă",
    discovered_updated: "completată",
    discovered_new_outdoor: "nou",
    discovered_updated_outdoor: "completat",
    discover: "Descoperă",
    discover_help: "Adaugă o cameră pentru fiecare zonă Home Assistant cu ceva de urmărit (un senzor de confort, un aparat de aer condiționat, un ventilator, un purificator sau o lumină reglabilă) și o configurează: senzori de temperatură, CO₂, umiditate și zgomot, ferestre și uși, aer condiționat, ventilatoare și purificatoare cu presetările și modurile lor. Zonele exterioare (grădină, terasă…) merg la Exterior, cu senzorii lor de temperatură, calitatea aerului și zgomot; un indice al calității aerului din oraș (Atmo France…) și entitatea meteo, în lipsa unui senzor exterior, merg în fila Notificări. Presetările și modurile de ventilator silențioase devin setările de noapte. Ce e deja setat se păstrează. Verificați rezultatul, apoi salvați.",
    discover_running: "Descoperire…",
    discover_result: "Descoperire: camere adăugate: {added}, completate: {updated}, locuri exterioare: {outdoors}{outdoor}. Verificați-le, apoi salvați.",
    discover_outdoor: ", senzori exteriori setați",
    discover_none: "Descoperirea nu a găsit nimic nou.",
    fan: "Ventilator",
    purifier: "Purificator de aer",
    overview: "Prezentare generală",
    rooms: "Camere",
    alerts: "Alerte",
    notifications: "Notificări",
    control: "Controlul aparatelor",
    save: "Salvează",
    discard: "Renunță",
    saved: "Salvat",
    saving: "Se salvează…",
    unsaved: "Modificări nesalvate",
    yaml: "Această configurație provine din YAML. Modificările salvate aici rămân până se schimbă YAML-ul: atunci YAML-ul le înlocuiește la următoarea repornire.",
    not_loaded: "Smart Comfort nu este încărcat. Verificați jurnalele.",
    not_setup: "Smart Comfort nu este încă configurat: adăugați-l din Setări → Dispozitive și servicii.",
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
  },
  da: {
    outdoor_noise: "Udendørs støj",
    quiet_night: "Stille nat",
    discovered_new: "nyt",
    discovered_updated: "udfyldt",
    discovered_new_outdoor: "nyt",
    discovered_updated_outdoor: "udfyldt",
    discover: "Find",
    discover_help: "Tilføjer et rum for hvert Home Assistant-område med noget at følge (en komfortsensor, et klimaanlæg, en ventilator, en luftrenser eller et dæmpbart lys) og sætter det op: temperatur-, CO₂-, luftfugtigheds- og støjsensorer, vinduer og døre, klimaanlæg, ventilatorer og luftrensere med deres forudindstillinger og tilstande. De udendørs områder (have, terrasse…) kommer under Udendørs med deres sensorer for temperatur, luftkvalitet og støj; et luftkvalitetsindeks for byen (Atmo France…) og vejrentiteten, i mangel af en udendørs sensor, kommer på fanen Notifikationer. Stille forudindstillinger og ventilatortilstande bliver natindstillingerne. Det, der allerede er sat, bevares. Kontrollér resultatet, og gem derefter.",
    discover_running: "Søger…",
    discover_result: "Fundet: tilføjede rum: {added}, udfyldte: {updated}, udendørs steder: {outdoors}{outdoor}. Kontrollér dem, og gem derefter.",
    discover_outdoor: ", udendørs sensorer sat",
    discover_none: "Søgningen fandt intet nyt.",
    fan: "Ventilator",
    purifier: "Luftrenser",
    overview: "Oversigt",
    rooms: "Rum",
    alerts: "Advarsler",
    notifications: "Notifikationer",
    control: "Styring af enheder",
    save: "Gem",
    discard: "Kassér",
    saved: "Gemt",
    saving: "Gemmer…",
    unsaved: "Ikke-gemte ændringer",
    yaml: "Denne konfiguration kommer fra YAML. Ændringer gemt her bliver, indtil YAML ændres: så erstatter YAML dem ved næste genstart.",
    not_loaded: "Smart Comfort er ikke indlæst. Tjek logfilerne.",
    not_setup: "Smart Comfort er ikke sat op endnu: tilføj det under Indstillinger → Enheder og tjenester.",
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
  },
  sv: {
    outdoor_noise: "Buller utomhus",
    quiet_night: "Tyst natt",
    discovered_new: "nytt",
    discovered_updated: "kompletterat",
    discovered_new_outdoor: "ny",
    discovered_updated_outdoor: "kompletterad",
    discover: "Upptäck",
    discover_help: "Lägger till ett rum för varje Home Assistant-område med något att följa (en komfortsensor, en luftkonditionering, en fläkt, en luftrenare eller en dimbar lampa) och ställer in det: temperatur-, CO₂-, luftfuktighets- och bullersensorer, fönster och dörrar, luftkonditionering, fläktar och luftrenare med deras förinställningar och lägen. Utomhusområdena (trädgård, terrass…) hamnar under Utomhus med sina sensorer för temperatur, luftkvalitet och buller; ett luftkvalitetsindex för staden (Atmo France…) och väderentiteten, i brist på en utomhussensor, hamnar på fliken Aviseringar. Tysta förinställningar och fläktlägen blir nattinställningarna. Det som redan är inställt behålls. Kontrollera resultatet och spara sedan.",
    discover_running: "Söker…",
    discover_result: "Upptäckt: tillagda rum: {added}, kompletterade: {updated}, utomhusplatser: {outdoors}{outdoor}. Kontrollera dem och spara sedan.",
    discover_outdoor: ", utomhussensorer inställda",
    discover_none: "Upptäckten hittade inget nytt.",
    fan: "Fläkt",
    purifier: "Luftrenare",
    overview: "Översikt",
    rooms: "Rum",
    alerts: "Varningar",
    notifications: "Aviseringar",
    control: "Styrning av enheter",
    save: "Spara",
    discard: "Förkasta",
    saved: "Sparat",
    saving: "Sparar…",
    unsaved: "Osparade ändringar",
    yaml: "Denna konfiguration kommer från YAML. Ändringar som sparas här gäller tills YAML ändras: då ersätter YAML dem vid nästa omstart.",
    not_loaded: "Smart Comfort är inte inläst. Kontrollera loggarna.",
    not_setup: "Smart Comfort är inte konfigurerat än: lägg till det under Inställningar → Enheter och tjänster.",
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
  },
  bg: {
    outdoor_noise: "Външен шум",
    quiet_night: "Тиха нощ",
    discovered_new: "нова",
    discovered_updated: "допълнена",
    discovered_new_outdoor: "ново",
    discovered_updated_outdoor: "допълнено",
    discover: "Откриване",
    discover_help: "Добавя стая за всяка зона на Home Assistant с нещо за следене (сензор за комфорт, климатик, вентилатор, пречиствател или лампа с регулиране) и я настройва: сензори за температура, CO₂, влажност и шум, прозорци и врати, климатик, вентилатори и пречистватели с техните предварителни настройки и режими. Външните зони (градина, тераса…) отиват във Външни, със сензорите си за температура, качество на въздуха и шум; градски индекс за качество на въздуха (Atmo France…) и метеорологичният обект, при липса на външен сензор, отиват в раздела Известия. Тихите предварителни настройки и режими на вентилатора стават нощните настройки. Вече зададеното се запазва. Проверете резултата, след това запазете.",
    discover_running: "Откриване…",
    discover_result: "Откриване: добавени стаи: {added}, допълнени: {updated}, външни места: {outdoors}{outdoor}. Проверете ги, след това запазете.",
    discover_outdoor: ", външните сензори са зададени",
    discover_none: "Откриването не намери нищо ново.",
    fan: "Вентилатор",
    purifier: "Пречиствател на въздух",
    overview: "Общ преглед",
    rooms: "Стаи",
    alerts: "Сигнали",
    notifications: "Известия",
    control: "Управление на устройствата",
    save: "Запази",
    discard: "Отказ",
    saved: "Запазено",
    saving: "Запазване…",
    unsaved: "Незапазени промени",
    yaml: "Тази конфигурация идва от YAML. Промените, запазени тук, остават, докато YAML не се промени: тогава YAML ги замества при следващото рестартиране.",
    not_loaded: "Smart Comfort не е зареден. Проверете журналите.",
    not_setup: "Smart Comfort все още не е настроен: добавете го от Настройки → Устройства и услуги.",
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
  },
  ru: {
    outdoor_noise: "Шум на улице",
    quiet_night: "Тихая ночь",
    discovered_new: "новая",
    discovered_updated: "дополнена",
    discovered_new_outdoor: "новое",
    discovered_updated_outdoor: "дополнено",
    discover: "Обнаружить",
    discover_help: "Добавляет комнату для каждого пространства Home Assistant, где есть что отслеживать (датчик комфорта, кондиционер, вентилятор, очиститель или диммируемый светильник), и настраивает её: датчики температуры, CO₂, влажности и шума, окна и двери, кондиционер, вентиляторы и очистители с их предустановками и режимами. Уличные пространства (сад, терраса…) попадают в раздел «Улица» со своими датчиками температуры, качества воздуха и шума; городской индекс качества воздуха (Atmo France…) и объект погоды, при отсутствии уличного датчика, попадают на вкладку «Уведомления». Тихие предустановки и режимы вентилятора становятся ночными настройками. Уже заданное сохраняется. Проверьте результат, затем сохраните.",
    discover_running: "Обнаружение…",
    discover_result: "Обнаружение: добавлено комнат: {added}, дополнено: {updated}, уличных мест: {outdoors}{outdoor}. Проверьте их, затем сохраните.",
    discover_outdoor: ", уличные датчики заданы",
    discover_none: "Обнаружение не нашло ничего нового.",
    fan: "Вентилятор",
    purifier: "Очиститель воздуха",
    overview: "Обзор",
    rooms: "Комнаты",
    alerts: "Оповещения",
    notifications: "Уведомления",
    control: "Управление устройствами",
    save: "Сохранить",
    discard: "Отменить",
    saved: "Сохранено",
    saving: "Сохранение…",
    unsaved: "Несохранённые изменения",
    yaml: "Эта конфигурация взята из YAML. Изменения, сохранённые здесь, действуют, пока не изменится YAML: тогда YAML заменит их при следующем перезапуске.",
    not_loaded: "Smart Comfort не загружен. Проверьте журналы.",
    not_setup: "Smart Comfort ещё не настроен: добавьте его в Настройки → Устройства и службы.",
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
  },
  uk: {
    outdoor_noise: "Шум надворі",
    quiet_night: "Тиха ніч",
    discovered_new: "нова",
    discovered_updated: "доповнено",
    discovered_new_outdoor: "нове",
    discovered_updated_outdoor: "доповнено",
    discover: "Виявити",
    discover_help: "Додає кімнату для кожного простору Home Assistant, де є що відстежувати (датчик комфорту, кондиціонер, вентилятор, очищувач або світильник із регулюванням яскравості), і налаштовує її: датчики температури, CO₂, вологості та шуму, вікна й двері, кондиціонер, вентилятори й очищувачі з їхніми передустановками та режимами. Вуличні простори (сад, тераса…) потрапляють до розділу «Надворі» зі своїми датчиками температури, якості повітря й шуму; міський індекс якості повітря (Atmo France…) і об'єкт погоди, за відсутності вуличного датчика, потрапляють на вкладку «Сповіщення». Тихі передустановки й режими вентилятора стають нічними налаштуваннями. Уже задане зберігається. Перевірте результат, потім збережіть.",
    discover_running: "Виявлення…",
    discover_result: "Виявлення: додано кімнат: {added}, доповнено: {updated}, вуличних місць: {outdoors}{outdoor}. Перевірте їх, потім збережіть.",
    discover_outdoor: ", вуличні датчики задано",
    discover_none: "Виявлення не знайшло нічого нового.",
    fan: "Вентилятор",
    purifier: "Очищувач повітря",
    overview: "Огляд",
    rooms: "Кімнати",
    alerts: "Попередження",
    notifications: "Сповіщення",
    control: "Керування пристроями",
    save: "Зберегти",
    discard: "Відхилити",
    saved: "Збережено",
    saving: "Збереження…",
    unsaved: "Незбережені зміни",
    yaml: "Ця конфігурація походить з YAML. Зміни, збережені тут, діють, доки не зміниться YAML: тоді YAML замінить їх під час наступного перезапуску.",
    not_loaded: "Smart Comfort не завантажено. Перевірте журнали.",
    not_setup: "Smart Comfort ще не налаштовано: додайте його в Налаштування → Пристрої та служби.",
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
  },
  hu: {
    outdoor_noise: "Kültéri zaj",
    quiet_night: "Csendes éjszaka",
    discovered_new: "új",
    discovered_updated: "kiegészítve",
    discovered_new_outdoor: "új",
    discovered_updated_outdoor: "kiegészítve",
    discover: "Felderítés",
    discover_help: "Minden olyan Home Assistant területhez, ahol van mit követni (komfortérzékelő, klíma, ventilátor, légtisztító vagy szabályozható fényerejű lámpa), hozzáad egy helyiséget, és beállítja: hőmérséklet-, CO₂-, páratartalom- és zajérzékelők, ablakok és ajtók, klíma, ventilátorok és légtisztítók az előbeállításaikkal és módjaikkal. A kültéri területek (kert, terasz…) a Kültér alá kerülnek a hőmérséklet-, levegőminőség- és zajérzékelőikkel; egy városi levegőminőségi index (Atmo France…) és az időjárás-entitás, kültéri érzékelő hiányában, az Értesítések lapra kerül. A csendes előbeállítások és ventilátormódok lesznek az éjszakai beállítások. Ami már be van állítva, az megmarad. Ellenőrizze az eredményt, majd mentsen.",
    discover_running: "Felderítés…",
    discover_result: "Felderítés: hozzáadott helyiségek: {added}, kiegészítve: {updated}, kültéri helyek: {outdoors}{outdoor}. Ellenőrizze őket, majd mentsen.",
    discover_outdoor: ", kültéri érzékelők beállítva",
    discover_none: "A felderítés nem talált semmi újat.",
    fan: "Ventilátor",
    purifier: "Légtisztító",
    overview: "Áttekintés",
    rooms: "Helyiségek",
    alerts: "Riasztások",
    notifications: "Értesítések",
    control: "Eszközvezérlés",
    save: "Mentés",
    discard: "Elvetés",
    saved: "Mentve",
    saving: "Mentés…",
    unsaved: "Nem mentett módosítások",
    yaml: "Ez a konfiguráció YAML-ből származik. Az itt mentett módosítások addig maradnak, amíg a YAML nem változik: akkor a YAML a következő újraindításkor felülírja őket.",
    not_loaded: "A Smart Comfort nincs betöltve. Nézze meg a naplókat.",
    not_setup: "A Smart Comfort még nincs beállítva: adja hozzá a Beállítások → Eszközök és szolgáltatások menüben.",
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
  },
  sk: {
    outdoor_noise: "Vonkajší hluk",
    quiet_night: "Tichá noc",
    discovered_new: "nová",
    discovered_updated: "doplnená",
    discovered_new_outdoor: "nové",
    discovered_updated_outdoor: "doplnené",
    discover: "Objaviť",
    discover_help: "Pridá miestnosť pre každú oblasť Home Assistant, kde je čo sledovať (senzor komfortu, klimatizácia, ventilátor, čistička alebo stmievateľné svetlo), a nastaví ju: senzory teploty, CO₂, vlhkosti a hluku, okná a dvere, klimatizáciu, ventilátory a čističky s ich predvoľbami a režimami. Vonkajšie oblasti (záhrada, terasa…) idú do časti Vonku so svojimi senzormi teploty, kvality vzduchu a hluku; mestský index kvality vzduchu (Atmo France…) a entita počasia, ak chýba vonkajší senzor, idú na kartu Oznámenia. Tiché predvoľby a režimy ventilátora sa stanú nočnými nastaveniami. Čo je už nastavené, sa zachová. Skontrolujte výsledok a potom uložte.",
    discover_running: "Objavovanie…",
    discover_result: "Objavovanie: pridané miestnosti: {added}, doplnené: {updated}, vonkajšie miesta: {outdoors}{outdoor}. Skontrolujte ich a potom uložte.",
    discover_outdoor: ", vonkajšie senzory nastavené",
    discover_none: "Objavovanie nenašlo nič nové.",
    fan: "Ventilátor",
    purifier: "Čistička vzduchu",
    overview: "Prehľad",
    rooms: "Miestnosti",
    alerts: "Upozornenia",
    notifications: "Oznámenia",
    control: "Ovládanie zariadení",
    save: "Uložiť",
    discard: "Zahodiť",
    saved: "Uložené",
    saving: "Ukladá sa…",
    unsaved: "Neuložené zmeny",
    yaml: "Táto konfigurácia pochádza z YAML. Zmeny uložené tu platia, kým sa YAML nezmení: potom ich YAML pri ďalšom reštarte nahradí.",
    not_loaded: "Smart Comfort nie je načítaný. Skontrolujte záznamy.",
    not_setup: "Smart Comfort ešte nie je nastavený: pridajte ho v Nastavenia → Zariadenia a služby.",
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
  },
  cs: {
    outdoor_noise: "Venkovní hluk",
    quiet_night: "Tichá noc",
    discovered_new: "nová",
    discovered_updated: "doplněná",
    discovered_new_outdoor: "nové",
    discovered_updated_outdoor: "doplněné",
    discover: "Objevit",
    discover_help: "Přidá místnost pro každou oblast Home Assistant, kde je co sledovat (senzor komfortu, klimatizace, ventilátor, čistička nebo stmívatelné světlo), a nastaví ji: senzory teploty, CO₂, vlhkosti a hluku, okna a dveře, klimatizaci, ventilátory a čističky s jejich předvolbami a režimy. Venkovní oblasti (zahrada, terasa…) jdou do části Venku se svými senzory teploty, kvality vzduchu a hluku; městský index kvality vzduchu (Atmo France…) a entita počasí, pokud chybí venkovní senzor, jdou na kartu Oznámení. Tiché předvolby a režimy ventilátoru se stanou nočním nastavením. Co je už nastaveno, zůstane zachováno. Zkontrolujte výsledek a pak uložte.",
    discover_running: "Objevování…",
    discover_result: "Objevování: přidané místnosti: {added}, doplněné: {updated}, venkovní místa: {outdoors}{outdoor}. Zkontrolujte je a pak uložte.",
    discover_outdoor: ", venkovní senzory nastaveny",
    discover_none: "Objevování nenašlo nic nového.",
    fan: "Ventilátor",
    purifier: "Čistička vzduchu",
    overview: "Přehled",
    rooms: "Místnosti",
    alerts: "Upozornění",
    notifications: "Oznámení",
    control: "Ovládání zařízení",
    save: "Uložit",
    discard: "Zahodit",
    saved: "Uloženo",
    saving: "Ukládání…",
    unsaved: "Neuložené změny",
    yaml: "Tato konfigurace pochází z YAML. Změny uložené zde platí, dokud se YAML nezmění: pak je YAML při příštím restartu nahradí.",
    not_loaded: "Smart Comfort není načten. Zkontrolujte protokoly.",
    not_setup: "Smart Comfort zatím není nastaven: přidejte ho v Nastavení → Zařízení a služby.",
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
  },
  sl: {
    outdoor_noise: "Zunanji hrup",
    quiet_night: "Tiha noč",
    discovered_new: "nov",
    discovered_updated: "dopolnjen",
    discovered_new_outdoor: "novo",
    discovered_updated_outdoor: "dopolnjeno",
    discover: "Odkrij",
    discover_help: "Doda prostor za vsako območje Home Assistant, kjer je kaj spremljati (tipalo udobja, klimatska naprava, ventilator, čistilnik ali zatemnilna luč), in ga nastavi: tipala temperature, CO₂, vlažnosti in hrupa, okna in vrata, klimatsko napravo, ventilatorje in čistilnike z njihovimi prednastavitvami in načini. Zunanja območja (vrt, terasa…) gredo v Zunaj, s svojimi tipali temperature, kakovosti zraka in hrupa; mestni indeks kakovosti zraka (Atmo France…) in entiteta vremena, če ni zunanjega tipala, gresta na zavihek Obvestila. Tihe prednastavitve in načini ventilatorja postanejo nočne nastavitve. Kar je že nastavljeno, se ohrani. Preverite rezultat, nato shranite.",
    discover_running: "Odkrivanje…",
    discover_result: "Odkrivanje: dodani prostori: {added}, dopolnjeni: {updated}, zunanja mesta: {outdoors}{outdoor}. Preverite jih, nato shranite.",
    discover_outdoor: ", zunanja tipala nastavljena",
    discover_none: "Odkrivanje ni našlo nič novega.",
    fan: "Ventilator",
    purifier: "Čistilnik zraka",
    overview: "Pregled",
    rooms: "Prostori",
    alerts: "Opozorila",
    notifications: "Obvestila",
    control: "Upravljanje naprav",
    save: "Shrani",
    discard: "Zavrzi",
    saved: "Shranjeno",
    saving: "Shranjevanje…",
    unsaved: "Neshranjene spremembe",
    yaml: "Ta konfiguracija prihaja iz YAML. Spremembe, shranjene tukaj, veljajo, dokler se YAML ne spremeni: takrat jih YAML ob naslednjem ponovnem zagonu nadomesti.",
    not_loaded: "Smart Comfort ni naložen. Preverite dnevnike.",
    not_setup: "Smart Comfort še ni nastavljen: dodajte ga v Nastavitve → Naprave in storitve.",
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
  },
  lv: {
    outdoor_noise: "Āra troksnis",
    quiet_night: "Klusā nakts",
    discovered_new: "jauna",
    discovered_updated: "papildināta",
    discovered_new_outdoor: "jauna",
    discovered_updated_outdoor: "papildināta",
    discover: "Atklāt",
    discover_help: "Pievieno telpu katram Home Assistant apgabalam, kurā ir kas sekojams (komforta sensors, gaisa kondicionieris, ventilators, attīrītājs vai regulējama gaisma), un iestata to: temperatūras, CO₂, mitruma un trokšņa sensori, logi un durvis, gaisa kondicionieris, ventilatori un attīrītāji ar to iepriekšējiem iestatījumiem un režīmiem. Āra apgabali (dārzs, terase…) nonāk sadaļā Ārā ar saviem temperatūras, gaisa kvalitātes un trokšņa sensoriem; pilsētas gaisa kvalitātes indekss (Atmo France…) un laikapstākļu entītija, ja nav āra sensora, nonāk cilnē Paziņojumi. Klusie iepriekšējie iestatījumi un ventilatora režīmi kļūst par nakts iestatījumiem. Jau iestatītais tiek saglabāts. Pārbaudiet rezultātu, pēc tam saglabājiet.",
    discover_running: "Notiek atklāšana…",
    discover_result: "Atklāšana: pievienotas telpas: {added}, papildinātas: {updated}, āra vietas: {outdoors}{outdoor}. Pārbaudiet tās, pēc tam saglabājiet.",
    discover_outdoor: ", āra sensori iestatīti",
    discover_none: "Atklāšana neatrada neko jaunu.",
    fan: "Ventilators",
    purifier: "Gaisa attīrītājs",
    overview: "Pārskats",
    rooms: "Telpas",
    alerts: "Brīdinājumi",
    notifications: "Paziņojumi",
    control: "Ierīču vadība",
    save: "Saglabāt",
    discard: "Atmest",
    saved: "Saglabāts",
    saving: "Saglabā…",
    unsaved: "Nesaglabātas izmaiņas",
    yaml: "Šī konfigurācija nāk no YAML. Šeit saglabātās izmaiņas paliek spēkā, līdz mainās YAML: tad YAML tās aizstāj nākamajā restartēšanā.",
    not_loaded: "Smart Comfort nav ielādēts. Pārbaudiet žurnālus.",
    not_setup: "Smart Comfort vēl nav iestatīts: pievienojiet to sadaļā Iestatījumi → Ierīces un pakalpojumi.",
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
  },
  el: {
    outdoor_noise: "Εξωτερικός θόρυβος",
    quiet_night: "Ήσυχη νύχτα",
    discovered_new: "νέο",
    discovered_updated: "συμπληρώθηκε",
    discovered_new_outdoor: "νέος",
    discovered_updated_outdoor: "συμπληρώθηκε",
    discover: "Ανακάλυψη",
    discover_help: "Προσθέτει ένα δωμάτιο για κάθε περιοχή του Home Assistant με κάτι προς παρακολούθηση (αισθητήρας άνεσης, κλιματιστικό, ανεμιστήρας, καθαριστής ή φως με ρύθμιση φωτεινότητας) και το ρυθμίζει: αισθητήρες θερμοκρασίας, CO₂, υγρασίας και θορύβου, παράθυρα και πόρτες, κλιματιστικό, ανεμιστήρες και καθαριστές με τις προεπιλογές και τις λειτουργίες τους. Οι εξωτερικές περιοχές (κήπος, βεράντα…) πηγαίνουν στους Εξωτερικούς χώρους, με τους αισθητήρες θερμοκρασίας, ποιότητας αέρα και θορύβου τους· ένας δείκτης ποιότητας αέρα της πόλης (Atmo France…) και η οντότητα καιρού, ελλείψει εξωτερικού αισθητήρα, πηγαίνουν στην καρτέλα Ειδοποιήσεις. Οι αθόρυβες προεπιλογές και λειτουργίες ανεμιστήρα γίνονται οι νυχτερινές ρυθμίσεις. Ό,τι έχει ήδη οριστεί διατηρείται. Ελέγξτε το αποτέλεσμα και μετά αποθηκεύστε.",
    discover_running: "Ανακάλυψη…",
    discover_result: "Ανακάλυψη: δωμάτια που προστέθηκαν: {added}, συμπληρώθηκαν: {updated}, εξωτερικοί χώροι: {outdoors}{outdoor}. Ελέγξτε τα και μετά αποθηκεύστε.",
    discover_outdoor: ", οι εξωτερικοί αισθητήρες ορίστηκαν",
    discover_none: "Η ανακάλυψη δεν βρήκε τίποτα νέο.",
    fan: "Ανεμιστήρας",
    purifier: "Καθαριστής αέρα",
    overview: "Επισκόπηση",
    rooms: "Δωμάτια",
    alerts: "Προειδοποιήσεις",
    notifications: "Ειδοποιήσεις",
    control: "Έλεγχος συσκευών",
    save: "Αποθήκευση",
    discard: "Απόρριψη",
    saved: "Αποθηκεύτηκε",
    saving: "Αποθήκευση…",
    unsaved: "Μη αποθηκευμένες αλλαγές",
    yaml: "Αυτή η διαμόρφωση προέρχεται από YAML. Οι αλλαγές που αποθηκεύονται εδώ ισχύουν μέχρι να αλλάξει το YAML: τότε το YAML τις αντικαθιστά στην επόμενη επανεκκίνηση.",
    not_loaded: "Το Smart Comfort δεν έχει φορτωθεί. Ελέγξτε τα αρχεία καταγραφής.",
    not_setup: "Το Smart Comfort δεν έχει ρυθμιστεί ακόμα: προσθέστε το στις Ρυθμίσεις → Συσκευές και υπηρεσίες.",
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
    })();
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
    if (this._activity) this._activity.hass = hass;
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
    if (this._hass && !this._unsub) this._subscribe();
  }

  disconnectedCallback() {
    if (this._unsub) {
      this._unsub.then((unsub) => unsub()).catch(() => {});
      this._unsub = null;
    }
  }

  // Strings.

  _t(key, values = {}) {
    let s = stringsFor(this._hass?.language)[key] ?? STRINGS.en[key] ?? key;
    for (const [k, v] of Object.entries(values)) s = s.replace(`{${k}}`, v);
    return s;
  }

  _label(step, name, section) {
    const base = `component.${DOMAIN}.options.step.${step}`;
    const r = this._labels;
    return (
      (section && r[`${base}.sections.${section}.data.${name}`]) || r[`${base}.data.${name}`] || name
    );
  }

  _helper(step, name, section) {
    const base = `component.${DOMAIN}.options.step.${step}`;
    const r = this._labels;
    return (section && r[`${base}.sections.${section}.data_description.${name}`]) || r[`${base}.data_description.${name}`];
  }

  _sectionTitle(step, section) {
    return this._labels[`component.${DOMAIN}.options.step.${step}.sections.${section}.name`] || section;
  }

  _kindName(kind) {
    return this._selector[`component.${DOMAIN}.selector.kind.options.${kind}`] || kind;
  }

  _options(selector, values) {
    return values.map((value) => ({
      value,
      label: this._selector[`component.${DOMAIN}.selector.${selector}.options.${value}`] || value,
    }));
  }

  // Data.

  async _init() {
    const language = this._hass.language || "en";
    const get = (category) =>
      this._hass
        .callWS({ type: "frontend/get_translations", language, category, integration: [DOMAIN] })
        .then((r) => r.resources)
        .catch(() => ({}));
    const [labels, selector] = await Promise.all([get("options"), get("selector"), loadHaForm()]);
    this._labels = labels;
    this._selector = selector;
    await this._load();
    this._subscribe();
  }

  async _load() {
    try {
      this._config = await this._hass.callWS({ type: `${DOMAIN}/config` });
      this._draft = clone(this._config.options);
      this._error = null;
    } catch (err) {
      this._config = null;
      this._error = err.code === "not_found" ? this._t("not_setup") : err.message;
    }
    this._render();
  }

  _subscribe() {
    if (this._unsub || !this._hass) return;
    this._unsub = this._hass.connection.subscribeMessage(
      (msg) => {
        this._status = msg.status;
        if (this._tab === "overview") this._renderTab();
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

  async _save() {
    this._saving = true;
    this._message = null;
    this._renderToolbar();
    try {
      const result = await this._hass.callWS({ type: `${DOMAIN}/config/save`, options: prune(this._draft) });
      this._config.options = result.options;
      this._draft = clone(result.options);
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
    root.innerHTML = `<style>${STYLE}</style>
      <div class="toolbar">
        <span class="menu"></span>
        <div class="title">Smart Comfort</div>
        <div class="actions"></div>
      </div>
      <div class="tabs" role="tablist"></div>
      <div class="content"></div>`;
    const menu = document.createElement("ha-menu-button");
    menu.hass = this._hass;
    menu.narrow = this._narrow;
    this._menu = menu;
    root.querySelector(".menu").append(menu);
    const tabs = root.querySelector(".tabs");
    for (const tab of TABS) {
      const b = document.createElement("button");
      b.className = `tab${tab === this._tab ? " active" : ""}`;
      b.setAttribute("role", "tab");
      b.textContent = this._t(tab);
      b.addEventListener("click", () => this._goTab(tab));
      tabs.append(b);
    }
    this._renderToolbar();
    this._renderTab();
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
    this._activity = null;
    if (this._message) {
      content.append(this._el("div", `banner ${this._message.type}`, this._message.text));
    }
    if (!this._config) {
      content.append(this._el("div", "banner error", this._error || "…"));
      return;
    }
    if (this._config.yaml && this._tab !== "overview") {
      content.append(this._el("div", "banner info", this._t("yaml")));
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
    render();
  }

  /** Everything Smart Comfort did and why, live, by day, with filters. */
  _renderActivity(content) {
    const card = this._card(this._t("activity"), "mdi:history");
    card.append(this._el("div", "help", this._t("activity_help")));
    // The activity card, loaded on every page of Home Assistant by the integration.
    const list = document.createElement("smart-comfort-activity-card");
    card.append(list);
    content.append(card);
    customElements.whenDefined("smart-comfort-activity-card").then(() => {
      if (!list.isConnected) return;
      list.setConfig({ panel: true });
      list.hass = this._hass;
      this._activity = list;
    });
  }

  // YAML: the configuration of the integration, as it goes under `smart_comfort:` in configuration.yaml.

  _renderYaml(content) {
    const card = this._card(this._t("yaml_tab"), "mdi:code-braces");
    const text = `smart_comfort:\n${toYaml(this._draft || {}, "  ")}\n`;
    card.append(this._el("div", "help", this._t(this._dirty ? "yaml_help_unsaved" : "yaml_help")));
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
    const body = this._el("div", "discover");
    const button = this._button(this._t("discover"), () => {
      this._goTab("rooms");
      this._discover();
    });
    body.append(this._el("div", "discover-text", this._t("start_help")), button);
    card.append(body);
    content.append(card);
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
    const summary = this._el("div", "summary");
    const tile = (icon, label, value, onClick, active) => {
      const t = this._el(onClick ? "button" : "div", `tile${active === false ? " off" : ""}`);
      const i = document.createElement("ha-icon");
      i.icon = icon;
      t.append(i, this._el("div", "tile-value", value), this._el("div", "tile-label", label));
      if (onClick) t.addEventListener("click", onClick);
      return t;
    };
    summary.append(
      tile("mdi:alert-circle-outline", this._t("active_alerts"), String(s.alerts.length)),
      tile("mdi:home-thermometer-outline", this._t("outdoor"), `${this._format(s.outdoor_temperature)} °C`),
      ...(typeof s.outdoor_noise === "number"
        ? [tile("mdi:volume-medium", this._t("outdoor_noise"), `${this._format(s.outdoor_noise, 0)} dB`)]
        : []),
      ...(typeof s.outdoor_air === "number"
        ? [tile("mdi:weather-hazy", this._t("outdoor_air"), `${this._format(s.outdoor_air, 0)}/6`)]
        : []),
      ...(s.night ? [tile("mdi:weather-night", this._t("quiet_night"), "")] : []),
      tile(
        s.notifications_enabled ? "mdi:bell" : "mdi:bell-off",
        this._t(s.notifications_enabled ? "notifications_on" : "notifications_off"),
        "",
        () =>
          this._hass.callService("switch", s.notifications_enabled ? "turn_off" : "turn_on", {
            entity_id: this._switch("notifications"),
          }),
        s.notifications_enabled
      ),
      tile(
        s.control_enabled ? "mdi:air-conditioner" : "mdi:hand-back-right-off",
        this._t(s.control_enabled ? "control_on" : "control_off"),
        "",
        () =>
          this._hass.callService("switch", s.control_enabled ? "turn_off" : "turn_on", {
            entity_id: this._switch("control"),
          }),
        s.control_enabled
      ),
      ...(s.rooms.some((r) => Object.keys(r.lights || {}).length)
        ? [
            tile(
              s.lighting_enabled ? "mdi:lightbulb-auto" : "mdi:lightbulb-off-outline",
              this._t(s.lighting_enabled ? "lighting_on" : "lighting_off"),
              "",
              () =>
                this._hass.callService("switch", s.lighting_enabled ? "turn_off" : "turn_on", {
                  entity_id: this._switch("lighting"),
                }),
              s.lighting_enabled
            ),
          ]
        : [])
    );
    content.append(summary);

    const alerts = this._card(this._t("active_alerts"), "mdi:bell-ring-outline");
    if (!s.alerts.length) {
      alerts.append(this._el("div", "empty", this._t("no_alerts")));
    }
    for (const a of s.alerts) {
      const row = this._el("div", "alert");
      const i = document.createElement("ha-icon");
      i.icon = KIND_ICONS[a.kind] || "mdi:alert";
      i.className = `kind ${a.kind}`;
      const body = this._el("div", "alert-body");
      body.append(this._el("div", "alert-title", `${a.room_name} · ${this._kindName(a.kind)}`));
      const unit = UNITS[a.kind] || "°C";
      const value = a.kind === "ventilate" || a.kind === "close_windows" ? a.temperature : a.value;
      const digits = ["co2_high", "bad_air_outside"].includes(a.kind) ? 0 : 1;
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
    for (const room of s.rooms) {
      const conf = (this._config.options.rooms || []).find((r) => r.name === room.name);
      const card = this._card(room.name, this._roomIcon(conf || room));
      card.classList.add(room.alerts.length ? "has-alert" : "is-ok");
      card.append(
        this._chips([
          ["mdi:thermometer", room.temperature, (v) => `${this._format(v)} °C`],
          ["mdi:molecule-co2", room.co2, (v) => `${this._format(v, 0)} ppm`],
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
    for (const place of s.outdoors || []) grid.append(this._outdoorStatus(place));
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
    fields.push(
      { name: "severity", selector: choice(this._options("severity", this._config.severities)) },
      this._advanced([
        { name: "hysteresis", selector: num(unit, { min: 0 }) },
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
    const defaults = this._config.defaults.alerts;
    const card = this._card(this._t("alerts"), "mdi:bell-alert-outline");
    card.append(this._el("div", "help", this._t("alerts_help")));
    for (const kind of this._config.kinds) {
      const own = this._draft.alerts?.[kind] || {};
      const settings = merged(defaults[kind], own);
      this._section(card, `alert:${kind}`, KIND_ICONS[kind], this._kindName(kind), this._alertSummary(kind, settings), (body) =>
        body.append(
          this._form(
            this._alertSchema(kind, defaults[kind]),
            settings,
            (value) => {
              const alerts = (this._draft.alerts = this._draft.alerts || {});
              alerts[kind] = diff(value, defaults[kind]);
              if (!Object.keys(alerts[kind]).length) delete alerts[kind];
            },
            (f) => (f.type === "expandable" ? f.title : this._label("alert", f.name)),
            (f) => this._helper("alert", f.name)
          )
        )
      );
    }
    content.append(card);
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

    card.append(
      this._form(
        [{ name: "name", required: true, selector: text }],
        { name: room.name },
        (value) => {
          room.name = value.name;
          toggle.lastChild.textContent = room.name || "—";
        },
        (f) => this._label("room", f.name)
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
    const names = ["temperature", "co2", "humidity", "noise"].filter((k) => room[k]).map((k) => this._label("room", k));
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
    ];
    const shown = all.filter(([key]) => room[key] || this._shown.has(`${index}:${key}`));
    if (shown.length) {
      body.append(
        this._form(
          shown.map(([key, deviceClass]) => ({ name: key, selector: entity("sensor", { device_class: deviceClass }) })),
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
    const globals = this._config.defaults.alerts;
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
    naps.forEach((nap, i) => {
      const line = this._el("div", "device-item");
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
        this._iconButton("mdi:delete-outline", this._t("remove"), () => {
          naps.splice(i, 1);
          if (naps.length) room.naps = naps;
          else delete room.naps;
          this._changed();
          this._renderTab();
        })
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

const STYLE = `
  :host {
    display: block;
    min-height: 100vh;
    background: var(--primary-background-color);
    color: var(--primary-text-color);
    font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
  }
  .toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    height: var(--header-height, 56px);
    padding: 0 12px;
    background: var(--app-header-background-color, var(--primary-color));
    color: var(--app-header-text-color, #fff);
    border-bottom: var(--app-header-border-bottom, none);
    box-sizing: border-box;
    position: sticky;
    top: 0;
    z-index: 2;
  }
  .title { flex: 1; font-size: 20px; font-weight: 400; margin-left: 8px; }
  .actions { display: flex; align-items: center; gap: 8px; }
  .dirty { font-size: 13px; opacity: 0.85; margin-right: 4px; }
  .tabs {
    display: flex;
    gap: 4px;
    padding: 0 12px;
    overflow-x: auto;
    background: var(--app-header-background-color, var(--primary-color));
    position: sticky;
    top: var(--header-height, 56px);
    z-index: 2;
  }
  .tab {
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--app-header-text-color, #fff);
    opacity: 0.75;
    padding: 12px 14px;
    font: inherit;
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;
  }
  .tab.active { opacity: 1; border-bottom-color: var(--app-header-text-color, #fff); }
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
  .toolbar .btn { color: var(--app-header-text-color, #fff); border-color: currentColor; }
  .toolbar .btn.primary { background: rgba(255, 255, 255, 0.15); }
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
`;

if (!customElements.get("smart-comfort-panel")) customElements.define("smart-comfort-panel", SmartComfortPanel);
