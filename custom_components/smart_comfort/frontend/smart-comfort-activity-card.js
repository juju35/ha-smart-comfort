/**
 * Smart Comfort activity card: what Smart Comfort did and why, live.
 * Also used by the Activity tab of the Smart Comfort panel (with filters and days).
 *
 * type: custom:smart-comfort-activity-card
 * title: Smart Comfort      # optional
 * limit: 10                 # entries shown
 * kinds: [device, lighting] # optional: only these (device, lighting, presence, display, notified, manual, reset, failed)
 * room: Séjour              # optional: only this room
 */

const STRINGS = {
  en: {
    title: "Smart Comfort activity",
    empty: "Nothing yet.",
    not_loaded: "Smart Comfort is not loaded.",
    all: "All",
    group_devices: "Devices",
    group_lights: "Lights",
    group_notifications: "Notifications",
    group_manual: "By hand",
    today: "Today",
    yesterday: "Yesterday",
    t_cool: "Cooling",
    t_cool_night: "Cooling, quiet night",
    t_off: "Off",
    t_off_open: "Off: a window stays open",
    t_on: "On: warm",
    t_on_night: "On, quiet night",
    t_boost: "Window boost",
    t_purify: "Boost: polluted air",
    t_normal: "Back to normal",
    t_night: "Night mode",
    t_keep_on: "Turned back on",
    lighting: "Brightness of the moment",
    presence_on: "On: someone came in",
    presence_off: "Off: nobody left",
    display_off: "Indicator off",
    display_on: "Indicator back on",
    notified: "Notification",
    cleared: "Notification cleared: everything is back to normal",
    manual: "Changed by hand: left alone",
    manual_until: "Changed by hand: left alone until {time}",
    reset: "Back to normal (set time)",
    failed: "Could not be sent",
    f_title: "Title",
    f_show_title: "Show title",
    f_limit: "Entries",
    f_kinds: "Only",
    f_room: "Room",
    k_device: "Devices",
    k_lighting: "Light brightness",
    k_presence: "Presence lights",
    k_display: "Indicators",
    k_notified: "Notifications",
    k_manual: "Changes by hand",
    k_reset: "Back to normal",
    k_failed: "Failed commands",
    h_room: "Name of a Smart Comfort room, as shown in the panel (empty: all rooms)",
    f_illustration: "Illustration",
    f_illustration_theme: "Illustration theme",
    theme_auto: "Automatic (follows the theme)",
    theme_day: "Day",
    theme_night: "Night",
  },
  fr: {
    title: "Activité Smart Comfort",
    empty: "Rien pour l'instant.",
    not_loaded: "Smart Comfort n'est pas chargé.",
    all: "Tout",
    group_devices: "Appareils",
    group_lights: "Lumières",
    group_notifications: "Notifications",
    group_manual: "À la main",
    today: "Aujourd'hui",
    yesterday: "Hier",
    t_cool: "Refroidit",
    t_cool_night: "Refroidit, nuit calme",
    t_off: "Éteint",
    t_off_open: "Éteint : une fenêtre reste ouverte",
    t_on: "Allumé : il fait chaud",
    t_on_night: "Allumé, nuit calme",
    t_boost: "Boost fenêtre",
    t_purify: "Boost : air pollué",
    t_normal: "Retour à la normale",
    t_night: "Mode nuit",
    t_keep_on: "Rallumé",
    lighting: "Intensité du moment",
    presence_on: "Allumée : quelqu'un est entré",
    presence_off: "Éteinte : plus personne",
    display_off: "Voyant éteint",
    display_on: "Voyant rallumé",
    notified: "Notification",
    cleared: "Notification effacée : tout est revenu à la normale",
    manual: "Changé à la main : laissé tel quel",
    manual_until: "Changé à la main : laissé tel quel jusqu'à {time}",
    reset: "Retour à la normale (heure fixe)",
    failed: "Commande non envoyée",
    f_title: "Titre",
    f_show_title: "Afficher le titre",
    f_limit: "Entrées",
    f_kinds: "Seulement",
    f_room: "Pièce",
    k_device: "Appareils",
    k_lighting: "Intensité des lumières",
    k_presence: "Lumières de présence",
    k_display: "Voyants",
    k_notified: "Notifications",
    k_manual: "Changements à la main",
    k_reset: "Retour à la normale",
    k_failed: "Échecs d'envoi",
    h_room: "Nom d'une pièce Smart Comfort, tel qu'affiché dans le panneau (vide : toutes les pièces)",
    f_illustration: "Illustration",
    f_illustration_theme: "Thème de l'illustration",
    theme_auto: "Automatique (suit le thème)",
    theme_day: "Jour",
    theme_night: "Nuit",
  },
  de: {
    title: "Smart Comfort Aktivität",
    empty: "Noch nichts.",
    not_loaded: "Smart Comfort ist nicht geladen.",
    all: "Alle",
    group_devices: "Geräte",
    group_lights: "Lichter",
    group_notifications: "Benachrichtigungen",
    group_manual: "Von Hand",
    today: "Heute",
    yesterday: "Gestern",
    t_cool: "Kühlt",
    t_cool_night: "Kühlt, Nachtruhe",
    t_off: "Aus",
    t_off_open: "Aus: ein Fenster bleibt offen",
    t_on: "An: warm",
    t_on_night: "An, Nachtruhe",
    t_boost: "Fenster-Boost",
    t_purify: "Boost: verschmutzte Luft",
    t_normal: "Zurück zum Normalzustand",
    t_night: "Nachtmodus",
    t_keep_on: "Wieder eingeschaltet",
    lighting: "Helligkeit des Moments",
    presence_on: "An: jemand ist gekommen",
    presence_off: "Aus: niemand mehr da",
    display_off: "Anzeige aus",
    display_on: "Anzeige wieder an",
    notified: "Benachrichtigung",
    cleared: "Benachrichtigung gelöscht: alles wieder normal",
    manual: "Von Hand geändert: in Ruhe gelassen",
    manual_until: "Von Hand geändert: in Ruhe gelassen bis {time}",
    reset: "Zurück zum Normalzustand (feste Uhrzeit)",
    failed: "Konnte nicht gesendet werden",
    f_title: "Titel",
    f_show_title: "Titel anzeigen",
    f_limit: "Einträge",
    f_kinds: "Nur",
    f_room: "Raum",
    k_device: "Geräte",
    k_lighting: "Helligkeit der Lichter",
    k_presence: "Präsenzlichter",
    k_display: "Anzeigen",
    k_notified: "Benachrichtigungen",
    k_manual: "Änderungen von Hand",
    k_reset: "Zurück zum Normalzustand",
    k_failed: "Fehlgeschlagene Befehle",
    h_room: "Name eines Smart-Comfort-Raums, wie im Panel angezeigt (leer: alle Räume)",
    f_illustration: "Illustration",
    f_illustration_theme: "Thema der Illustration",
    theme_auto: "Automatisch (folgt dem Design)",
    theme_day: "Tag",
    theme_night: "Nacht",
  },
  es: {
    title: "Actividad de Smart Comfort",
    empty: "Nada por ahora.",
    not_loaded: "Smart Comfort no está cargado.",
    all: "Todo",
    group_devices: "Aparatos",
    group_lights: "Luces",
    group_notifications: "Notificaciones",
    group_manual: "A mano",
    today: "Hoy",
    yesterday: "Ayer",
    t_cool: "Enfriando",
    t_cool_night: "Enfriando, noche tranquila",
    t_off: "Apagado",
    t_off_open: "Apagado: una ventana sigue abierta",
    t_on: "Encendido: hace calor",
    t_on_night: "Encendido, noche tranquila",
    t_boost: "Refuerzo por ventana",
    t_purify: "Refuerzo: aire contaminado",
    t_normal: "Vuelta a lo normal",
    t_night: "Modo noche",
    t_keep_on: "Encendido de nuevo",
    lighting: "Brillo del momento",
    presence_on: "Encendida: alguien ha entrado",
    presence_off: "Apagada: ya no hay nadie",
    display_off: "Indicador apagado",
    display_on: "Indicador encendido",
    notified: "Notificación",
    cleared: "Notificación borrada: todo ha vuelto a la normalidad",
    manual: "Cambiado a mano: se deja así",
    manual_until: "Cambiado a mano: se deja así hasta las {time}",
    reset: "Vuelta a lo normal (hora fija)",
    failed: "No se pudo enviar",
    f_title: "Título",
    f_show_title: "Mostrar el título",
    f_limit: "Entradas",
    f_kinds: "Solo",
    f_room: "Habitación",
    k_device: "Aparatos",
    k_lighting: "Brillo de las luces",
    k_presence: "Luces de presencia",
    k_display: "Indicadores",
    k_notified: "Notificaciones",
    k_manual: "Cambios a mano",
    k_reset: "Vuelta a lo normal",
    k_failed: "Envíos fallidos",
    h_room: "Nombre de una habitación de Smart Comfort, tal como aparece en el panel (vacío: todas)",
    f_illustration: "Ilustración",
    f_illustration_theme: "Tema de la ilustración",
    theme_auto: "Automático (sigue el tema)",
    theme_day: "Día",
    theme_night: "Noche",
  },
  sr: {
    title: "Smart Comfort активност",
    empty: "Још ништа.",
    not_loaded: "Smart Comfort није учитан.",
    all: "Све",
    group_devices: "Уређаји",
    group_lights: "Светла",
    group_notifications: "Обавештења",
    group_manual: "Ручно",
    today: "Данас",
    yesterday: "Јуче",
    t_cool: "Хлађење",
    t_cool_night: "Хлађење, мирна ноћ",
    t_off: "Искључено",
    t_off_open: "Искључено: прозор остаје отворен",
    t_on: "Укључено: топло је",
    t_on_night: "Укључено, мирна ноћ",
    t_boost: "Појачање због прозора",
    t_purify: "Појачање: загађен ваздух",
    t_normal: "Повратак на нормално",
    t_night: "Ноћни режим",
    t_keep_on: "Поново укључено",
    lighting: "Јачина светла за ово доба дана",
    presence_on: "Укључено: неко је ушао",
    presence_off: "Искључено: нема никога",
    display_off: "Индикатор искључен",
    display_on: "Индикатор поново укључен",
    notified: "Обавештење",
    cleared: "Обавештење уклоњено: све је поново у реду",
    manual: "Ручно промењено: не дира се",
    manual_until: "Ручно промењено: не дира се до {time}",
    reset: "Повратак на нормално (задато време)",
    failed: "Није могло да се пошаље",
    f_title: "Наслов",
    f_show_title: "Прикажи наслов",
    f_limit: "Ставке",
    f_kinds: "Само",
    f_room: "Соба",
    k_device: "Уређаји",
    k_lighting: "Јачина светла",
    k_presence: "Светла присуства",
    k_display: "Индикатори",
    k_notified: "Обавештења",
    k_manual: "Ручне измене",
    k_reset: "Повратак на нормално",
    k_failed: "Неуспела слања",
    h_room: "Назив собе у Smart Comfort-у, као у панелу (празно: све собе)",
    f_illustration: "Илустрација",
    f_illustration_theme: "Тема илустрације",
    theme_auto: "Аутоматски (прати тему)",
    theme_day: "Дан",
    theme_night: "Ноћ",
  },
  "sr-Latn": {
    title: "Smart Comfort aktivnost",
    empty: "Još ništa.",
    not_loaded: "Smart Comfort nije učitan.",
    all: "Sve",
    group_devices: "Uređaji",
    group_lights: "Svetla",
    group_notifications: "Obaveštenja",
    group_manual: "Ručno",
    today: "Danas",
    yesterday: "Juče",
    t_cool: "Hlađenje",
    t_cool_night: "Hlađenje, mirna noć",
    t_off: "Isključeno",
    t_off_open: "Isključeno: prozor ostaje otvoren",
    t_on: "Uključeno: toplo je",
    t_on_night: "Uključeno, mirna noć",
    t_boost: "Pojačanje zbog prozora",
    t_purify: "Pojačanje: zagađen vazduh",
    t_normal: "Povratak na normalno",
    t_night: "Noćni režim",
    t_keep_on: "Ponovo uključeno",
    lighting: "Jačina svetla za ovo doba dana",
    presence_on: "Uključeno: neko je ušao",
    presence_off: "Isključeno: nema nikoga",
    display_off: "Indikator isključen",
    display_on: "Indikator ponovo uključen",
    notified: "Obaveštenje",
    cleared: "Obaveštenje uklonjeno: sve je ponovo u redu",
    manual: "Ručno promenjeno: ne dira se",
    manual_until: "Ručno promenjeno: ne dira se do {time}",
    reset: "Povratak na normalno (zadato vreme)",
    failed: "Nije moglo da se pošalje",
    f_title: "Naslov",
    f_show_title: "Prikaži naslov",
    f_limit: "Stavke",
    f_kinds: "Samo",
    f_room: "Soba",
    k_device: "Uređaji",
    k_lighting: "Jačina svetla",
    k_presence: "Svetla prisustva",
    k_display: "Indikatori",
    k_notified: "Obaveštenja",
    k_manual: "Ručne izmene",
    k_reset: "Povratak na normalno",
    k_failed: "Neuspela slanja",
    h_room: "Naziv sobe u Smart Comfort-u, kao u panelu (prazno: sve sobe)",
    f_illustration: "Ilustracija",
    f_illustration_theme: "Tema ilustracije",
    theme_auto: "Automatski (prati temu)",
    theme_day: "Dan",
    theme_night: "Noć",
  },
  it: {
    title: "Attività Smart Comfort",
    empty: "Ancora niente.",
    not_loaded: "Smart Comfort non è caricato.",
    all: "Tutto",
    group_devices: "Dispositivi",
    group_lights: "Luci",
    group_notifications: "Notifiche",
    group_manual: "A mano",
    today: "Oggi",
    yesterday: "Ieri",
    t_cool: "Raffreddamento",
    t_cool_night: "Raffreddamento, notte silenziosa",
    t_off: "Spento",
    t_off_open: "Spento: una finestra resta aperta",
    t_on: "Acceso: fa caldo",
    t_on_night: "Acceso, notte silenziosa",
    t_boost: "Boost finestra",
    t_purify: "Boost: aria inquinata",
    t_normal: "Ritorno alla normalità",
    t_night: "Modalità notte",
    t_keep_on: "Riacceso",
    lighting: "Luminosità del momento",
    presence_on: "Accesa: è entrato qualcuno",
    presence_off: "Spenta: non c'è più nessuno",
    display_off: "Spia spenta",
    display_on: "Spia riaccesa",
    notified: "Notifica",
    cleared: "Notifica cancellata: è tutto tornato alla normalità",
    manual: "Cambiato a mano: lasciato così",
    manual_until: "Cambiato a mano: lasciato così fino alle {time}",
    reset: "Ritorno alla normalità (orario fisso)",
    failed: "Impossibile inviare",
    f_title: "Titolo",
    f_show_title: "Mostra il titolo",
    f_limit: "Voci",
    f_kinds: "Solo",
    f_room: "Stanza",
    k_device: "Dispositivi",
    k_lighting: "Luminosità delle luci",
    k_presence: "Luci di presenza",
    k_display: "Spie",
    k_notified: "Notifiche",
    k_manual: "Modifiche a mano",
    k_reset: "Ritorno alla normalità",
    k_failed: "Invii non riusciti",
    h_room: "Nome di una stanza Smart Comfort, come appare nel pannello (vuoto: tutte le stanze)",
    f_illustration: "Illustrazione",
    f_illustration_theme: "Tema dell'illustrazione",
    theme_auto: "Automatico (segue il tema)",
    theme_day: "Giorno",
    theme_night: "Notte",
  },
  nl: {
    title: "Smart Comfort-activiteit",
    empty: "Nog niets.",
    not_loaded: "Smart Comfort is niet geladen.",
    all: "Alles",
    group_devices: "Apparaten",
    group_lights: "Lampen",
    group_notifications: "Meldingen",
    group_manual: "Handmatig",
    today: "Vandaag",
    yesterday: "Gisteren",
    t_cool: "Koelen",
    t_cool_night: "Koelen, stille nacht",
    t_off: "Uit",
    t_off_open: "Uit: een raam blijft open",
    t_on: "Aan: het is warm",
    t_on_night: "Aan, stille nacht",
    t_boost: "Raamboost",
    t_purify: "Boost: vervuilde lucht",
    t_normal: "Terug naar normaal",
    t_night: "Nachtmodus",
    t_keep_on: "Weer aangezet",
    lighting: "Helderheid van het moment",
    presence_on: "Aan: er kwam iemand binnen",
    presence_off: "Uit: niemand meer",
    display_off: "Indicatielampje uit",
    display_on: "Indicatielampje weer aan",
    notified: "Melding",
    cleared: "Melding gewist: alles is weer normaal",
    manual: "Handmatig gewijzigd: met rust gelaten",
    manual_until: "Handmatig gewijzigd: met rust gelaten tot {time}",
    reset: "Terug naar normaal (vaste tijd)",
    failed: "Kon niet worden verzonden",
    f_title: "Titel",
    f_show_title: "Titel tonen",
    f_limit: "Items",
    f_kinds: "Alleen",
    f_room: "Kamer",
    k_device: "Apparaten",
    k_lighting: "Helderheid van de lampen",
    k_presence: "Aanwezigheidslampen",
    k_display: "Indicatielampjes",
    k_notified: "Meldingen",
    k_manual: "Handmatige wijzigingen",
    k_reset: "Terug naar normaal",
    k_failed: "Mislukte opdrachten",
    h_room: "Naam van een Smart Comfort-kamer, zoals in het paneel (leeg: alle kamers)",
    f_illustration: "Illustratie",
    f_illustration_theme: "Thema van de illustratie",
    theme_auto: "Automatisch (volgt het thema)",
    theme_day: "Dag",
    theme_night: "Nacht",
  },
  pt: {
    title: "Atividade do Smart Comfort",
    empty: "Ainda nada.",
    not_loaded: "O Smart Comfort não está carregado.",
    all: "Tudo",
    group_devices: "Dispositivos",
    group_lights: "Luzes",
    group_notifications: "Notificações",
    group_manual: "À mão",
    today: "Hoje",
    yesterday: "Ontem",
    t_cool: "A arrefecer",
    t_cool_night: "A arrefecer, noite silenciosa",
    t_off: "Desligado",
    t_off_open: "Desligado: uma janela continua aberta",
    t_on: "Ligado: está calor",
    t_on_night: "Ligado, noite silenciosa",
    t_boost: "Reforço de janela",
    t_purify: "Reforço: ar poluído",
    t_normal: "De volta ao normal",
    t_night: "Modo noturno",
    t_keep_on: "Ligado de novo",
    lighting: "Brilho do momento",
    presence_on: "Ligada: alguém entrou",
    presence_off: "Desligada: já não está ninguém",
    display_off: "Indicador desligado",
    display_on: "Indicador ligado de novo",
    notified: "Notificação",
    cleared: "Notificação apagada: tudo voltou ao normal",
    manual: "Alterado à mão: deixado como está",
    manual_until: "Alterado à mão: deixado como está até às {time}",
    reset: "De volta ao normal (hora fixa)",
    failed: "Não foi possível enviar",
    f_title: "Título",
    f_show_title: "Mostrar o título",
    f_limit: "Entradas",
    f_kinds: "Apenas",
    f_room: "Divisão",
    k_device: "Dispositivos",
    k_lighting: "Brilho das luzes",
    k_presence: "Luzes de presença",
    k_display: "Indicadores",
    k_notified: "Notificações",
    k_manual: "Alterações à mão",
    k_reset: "De volta ao normal",
    k_failed: "Envios falhados",
    h_room: "Nome de uma divisão do Smart Comfort, tal como aparece no painel (vazio: todas as divisões)",
    f_illustration: "Ilustração",
    f_illustration_theme: "Tema da ilustração",
    theme_auto: "Automático (segue o tema)",
    theme_day: "Dia",
    theme_night: "Noite",
  },
  pl: {
    title: "Aktywność Smart Comfort",
    empty: "Jeszcze nic.",
    not_loaded: "Smart Comfort nie jest załadowany.",
    all: "Wszystko",
    group_devices: "Urządzenia",
    group_lights: "Światła",
    group_notifications: "Powiadomienia",
    group_manual: "Ręcznie",
    today: "Dzisiaj",
    yesterday: "Wczoraj",
    t_cool: "Chłodzenie",
    t_cool_night: "Chłodzenie, cicha noc",
    t_off: "Wyłączone",
    t_off_open: "Wyłączone: okno pozostaje otwarte",
    t_on: "Włączone: jest ciepło",
    t_on_night: "Włączone, cicha noc",
    t_boost: "Wzmocnienie przy oknie",
    t_purify: "Wzmocnienie: zanieczyszczone powietrze",
    t_normal: "Powrót do normy",
    t_night: "Tryb nocny",
    t_keep_on: "Ponownie włączone",
    lighting: "Jasność dla pory dnia",
    presence_on: "Włączone: ktoś wszedł",
    presence_off: "Wyłączone: nikogo nie ma",
    display_off: "Kontrolka wyłączona",
    display_on: "Kontrolka ponownie włączona",
    notified: "Powiadomienie",
    cleared: "Powiadomienie usunięte: wszystko wróciło do normy",
    manual: "Zmienione ręcznie: pozostawione bez zmian",
    manual_until: "Zmienione ręcznie: pozostawione bez zmian do {time}",
    reset: "Powrót do normy (stała godzina)",
    failed: "Nie udało się wysłać",
    f_title: "Tytuł",
    f_show_title: "Pokaż tytuł",
    f_limit: "Wpisy",
    f_kinds: "Tylko",
    f_room: "Pomieszczenie",
    k_device: "Urządzenia",
    k_lighting: "Jasność świateł",
    k_presence: "Światła obecności",
    k_display: "Kontrolki",
    k_notified: "Powiadomienia",
    k_manual: "Zmiany ręczne",
    k_reset: "Powrót do normy",
    k_failed: "Nieudane polecenia",
    h_room: "Nazwa pomieszczenia Smart Comfort, jak w panelu (puste: wszystkie pomieszczenia)",
    f_illustration: "Ilustracja",
    f_illustration_theme: "Motyw ilustracji",
    theme_auto: "Automatycznie (według motywu)",
    theme_day: "Dzień",
    theme_night: "Noc",
  },
  ro: {
    title: "Activitate Smart Comfort",
    empty: "Încă nimic.",
    not_loaded: "Smart Comfort nu este încărcat.",
    all: "Toate",
    group_devices: "Aparate",
    group_lights: "Lumini",
    group_notifications: "Notificări",
    group_manual: "Manual",
    today: "Azi",
    yesterday: "Ieri",
    t_cool: "Răcire",
    t_cool_night: "Răcire, noapte liniștită",
    t_off: "Oprit",
    t_off_open: "Oprit: o fereastră rămâne deschisă",
    t_on: "Pornit: e cald",
    t_on_night: "Pornit, noapte liniștită",
    t_boost: "Impuls la fereastră",
    t_purify: "Impuls: aer poluat",
    t_normal: "Revenire la normal",
    t_night: "Mod noapte",
    t_keep_on: "Repornit",
    lighting: "Luminozitatea momentului",
    presence_on: "Aprinsă: a intrat cineva",
    presence_off: "Stinsă: nu mai e nimeni",
    display_off: "Indicator stins",
    display_on: "Indicator reaprins",
    notified: "Notificare",
    cleared: "Notificare ștearsă: totul a revenit la normal",
    manual: "Modificat manual: lăsat în pace",
    manual_until: "Modificat manual: lăsat în pace până la {time}",
    reset: "Revenire la normal (oră fixă)",
    failed: "Nu a putut fi trimisă",
    f_title: "Titlu",
    f_show_title: "Afișează titlul",
    f_limit: "Intrări",
    f_kinds: "Doar",
    f_room: "Cameră",
    k_device: "Aparate",
    k_lighting: "Luminozitatea luminilor",
    k_presence: "Lumini la prezență",
    k_display: "Indicatoare",
    k_notified: "Notificări",
    k_manual: "Modificări manuale",
    k_reset: "Revenire la normal",
    k_failed: "Comenzi eșuate",
    h_room: "Numele unei camere Smart Comfort, așa cum apare în panou (gol: toate camerele)",
    f_illustration: "Ilustrație",
    f_illustration_theme: "Tema ilustrației",
    theme_auto: "Automat (urmează tema)",
    theme_day: "Zi",
    theme_night: "Noapte",
  },
  da: {
    title: "Smart Comfort-aktivitet",
    empty: "Intet endnu.",
    not_loaded: "Smart Comfort er ikke indlæst.",
    all: "Alle",
    group_devices: "Enheder",
    group_lights: "Lys",
    group_notifications: "Notifikationer",
    group_manual: "Manuelt",
    today: "I dag",
    yesterday: "I går",
    t_cool: "Køler",
    t_cool_night: "Køler, stille nat",
    t_off: "Slukket",
    t_off_open: "Slukket: et vindue står åbent",
    t_on: "Tændt: det er varmt",
    t_on_night: "Tændt, stille nat",
    t_boost: "Vinduesboost",
    t_purify: "Boost: forurenet luft",
    t_normal: "Tilbage til normal",
    t_night: "Nattilstand",
    t_keep_on: "Tændt igen",
    lighting: "Øjeblikkets lysstyrke",
    presence_on: "Tændt: nogen kom ind",
    presence_off: "Slukket: ingen tilbage",
    display_off: "Indikator slukket",
    display_on: "Indikator tændt igen",
    notified: "Notifikation",
    cleared: "Notifikation ryddet: alt er normalt igen",
    manual: "Ændret manuelt: ladet i fred",
    manual_until: "Ændret manuelt: ladet i fred indtil {time}",
    reset: "Tilbage til normal (fast tidspunkt)",
    failed: "Kunne ikke sendes",
    f_title: "Titel",
    f_show_title: "Vis titel",
    f_limit: "Poster",
    f_kinds: "Kun",
    f_room: "Rum",
    k_device: "Enheder",
    k_lighting: "Lysstyrke",
    k_presence: "Lys ved tilstedeværelse",
    k_display: "Indikatorer",
    k_notified: "Notifikationer",
    k_manual: "Manuelle ændringer",
    k_reset: "Tilbage til normal",
    k_failed: "Mislykkede kommandoer",
    h_room: "Navnet på et Smart Comfort-rum, som det vises i panelet (tomt: alle rum)",
    f_illustration: "Illustration",
    f_illustration_theme: "Illustrationstema",
    theme_auto: "Automatisk (følger temaet)",
    theme_day: "Dag",
    theme_night: "Nat",
  },
  sv: {
    title: "Smart Comfort-aktivitet",
    empty: "Inget än.",
    not_loaded: "Smart Comfort är inte inläst.",
    all: "Alla",
    group_devices: "Enheter",
    group_lights: "Lampor",
    group_notifications: "Aviseringar",
    group_manual: "Manuellt",
    today: "Idag",
    yesterday: "Igår",
    t_cool: "Kyler",
    t_cool_night: "Kyler, tyst natt",
    t_off: "Av",
    t_off_open: "Av: ett fönster står öppet",
    t_on: "På: det är varmt",
    t_on_night: "På, tyst natt",
    t_boost: "Fönsterboost",
    t_purify: "Boost: förorenad luft",
    t_normal: "Tillbaka till normalt",
    t_night: "Nattläge",
    t_keep_on: "Påslagen igen",
    lighting: "Stundens ljusstyrka",
    presence_on: "Tänd: någon kom in",
    presence_off: "Släckt: ingen kvar",
    display_off: "Indikator av",
    display_on: "Indikator på igen",
    notified: "Avisering",
    cleared: "Avisering rensad: allt är normalt igen",
    manual: "Ändrad manuellt: lämnad ifred",
    manual_until: "Ändrad manuellt: lämnad ifred till {time}",
    reset: "Tillbaka till normalt (fast tid)",
    failed: "Kunde inte skickas",
    f_title: "Titel",
    f_show_title: "Visa rubrik",
    f_limit: "Poster",
    f_kinds: "Bara",
    f_room: "Rum",
    k_device: "Enheter",
    k_lighting: "Ljusstyrka",
    k_presence: "Lampor vid närvaro",
    k_display: "Indikatorer",
    k_notified: "Aviseringar",
    k_manual: "Manuella ändringar",
    k_reset: "Tillbaka till normalt",
    k_failed: "Misslyckade kommandon",
    h_room: "Namnet på ett Smart Comfort-rum, som det visas i panelen (tomt: alla rum)",
    f_illustration: "Illustration",
    f_illustration_theme: "Illustrationstema",
    theme_auto: "Automatiskt (följer temat)",
    theme_day: "Dag",
    theme_night: "Natt",
  },
  bg: {
    title: "Дейност на Smart Comfort",
    empty: "Все още нищо.",
    not_loaded: "Smart Comfort не е зареден.",
    all: "Всички",
    group_devices: "Устройства",
    group_lights: "Осветление",
    group_notifications: "Известия",
    group_manual: "Ръчно",
    today: "Днес",
    yesterday: "Вчера",
    t_cool: "Охлаждане",
    t_cool_night: "Охлаждане, тиха нощ",
    t_off: "Изключено",
    t_off_open: "Изключено: прозорец остава отворен",
    t_on: "Включено: топло е",
    t_on_night: "Включено, тиха нощ",
    t_boost: "Усилване при прозорец",
    t_purify: "Усилване: замърсен въздух",
    t_normal: "Връщане към нормалното",
    t_night: "Нощен режим",
    t_keep_on: "Включено отново",
    lighting: "Яркост за момента",
    presence_on: "Включено: някой влезе",
    presence_off: "Изключено: няма никой",
    display_off: "Индикаторът е изключен",
    display_on: "Индикаторът е включен отново",
    notified: "Известие",
    cleared: "Известието е изчистено: всичко е нормално отново",
    manual: "Променено ръчно: оставено на мира",
    manual_until: "Променено ръчно: оставено на мира до {time}",
    reset: "Връщане към нормалното (фиксиран час)",
    failed: "Не можа да бъде изпратено",
    f_title: "Заглавие",
    f_show_title: "Показване на заглавието",
    f_limit: "Записи",
    f_kinds: "Само",
    f_room: "Стая",
    k_device: "Устройства",
    k_lighting: "Яркост на осветлението",
    k_presence: "Осветление при присъствие",
    k_display: "Индикатори",
    k_notified: "Известия",
    k_manual: "Ръчни промени",
    k_reset: "Връщане към нормалното",
    k_failed: "Неуспешни команди",
    h_room: "Име на стая в Smart Comfort, както се показва в панела (празно: всички стаи)",
    f_illustration: "Илюстрация",
    f_illustration_theme: "Тема на илюстрацията",
    theme_auto: "Автоматично (следва темата)",
    theme_day: "Ден",
    theme_night: "Нощ",
  },
  ru: {
    title: "Активность Smart Comfort",
    empty: "Пока ничего.",
    not_loaded: "Smart Comfort не загружен.",
    all: "Всё",
    group_devices: "Устройства",
    group_lights: "Освещение",
    group_notifications: "Уведомления",
    group_manual: "Вручную",
    today: "Сегодня",
    yesterday: "Вчера",
    t_cool: "Охлаждение",
    t_cool_night: "Охлаждение, тихая ночь",
    t_off: "Выключено",
    t_off_open: "Выключено: окно остаётся открытым",
    t_on: "Включено: жарко",
    t_on_night: "Включено, тихая ночь",
    t_boost: "Усиление при открытом окне",
    t_purify: "Усиление: загрязнённый воздух",
    t_normal: "Возврат к обычному",
    t_night: "Ночной режим",
    t_keep_on: "Снова включено",
    lighting: "Яркость для текущего времени",
    presence_on: "Включено: кто-то вошёл",
    presence_off: "Выключено: никого не осталось",
    display_off: "Индикатор выключен",
    display_on: "Индикатор снова включён",
    notified: "Уведомление",
    cleared: "Уведомление удалено: всё снова в норме",
    manual: "Изменено вручную: не трогаем",
    manual_until: "Изменено вручную: не трогаем до {time}",
    reset: "Возврат к обычному (заданное время)",
    failed: "Не удалось отправить",
    f_title: "Заголовок",
    f_show_title: "Показывать заголовок",
    f_limit: "Записи",
    f_kinds: "Только",
    f_room: "Комната",
    k_device: "Устройства",
    k_lighting: "Яркость света",
    k_presence: "Свет по присутствию",
    k_display: "Индикаторы",
    k_notified: "Уведомления",
    k_manual: "Ручные изменения",
    k_reset: "Возврат к обычному",
    k_failed: "Неудачные команды",
    h_room: "Название комнаты Smart Comfort, как на панели (пусто: все комнаты)",
    f_illustration: "Иллюстрация",
    f_illustration_theme: "Тема иллюстрации",
    theme_auto: "Автоматически (следует теме)",
    theme_day: "День",
    theme_night: "Ночь",
  },
  uk: {
    title: "Активність Smart Comfort",
    empty: "Поки нічого.",
    not_loaded: "Smart Comfort не завантажено.",
    all: "Усе",
    group_devices: "Пристрої",
    group_lights: "Освітлення",
    group_notifications: "Сповіщення",
    group_manual: "Вручну",
    today: "Сьогодні",
    yesterday: "Учора",
    t_cool: "Охолодження",
    t_cool_night: "Охолодження, тиха ніч",
    t_off: "Вимкнено",
    t_off_open: "Вимкнено: вікно лишається відчиненим",
    t_on: "Увімкнено: спекотно",
    t_on_night: "Увімкнено, тиха ніч",
    t_boost: "Посилення при відчиненому вікні",
    t_purify: "Посилення: забруднене повітря",
    t_normal: "Повернення до звичайного",
    t_night: "Нічний режим",
    t_keep_on: "Знову увімкнено",
    lighting: "Яскравість для поточного часу",
    presence_on: "Увімкнено: хтось зайшов",
    presence_off: "Вимкнено: нікого не лишилося",
    display_off: "Індикатор вимкнено",
    display_on: "Індикатор знову увімкнено",
    notified: "Сповіщення",
    cleared: "Сповіщення прибрано: усе знову гаразд",
    manual: "Змінено вручну: не чіпаємо",
    manual_until: "Змінено вручну: не чіпаємо до {time}",
    reset: "Повернення до звичайного (заданий час)",
    failed: "Не вдалося надіслати",
    f_title: "Заголовок",
    f_show_title: "Показувати заголовок",
    f_limit: "Записи",
    f_kinds: "Лише",
    f_room: "Кімната",
    k_device: "Пристрої",
    k_lighting: "Яскравість світла",
    k_presence: "Світло за присутністю",
    k_display: "Індикатори",
    k_notified: "Сповіщення",
    k_manual: "Ручні зміни",
    k_reset: "Повернення до звичайного",
    k_failed: "Невдалі команди",
    h_room: "Назва кімнати Smart Comfort, як на панелі (порожньо: усі кімнати)",
    f_illustration: "Ілюстрація",
    f_illustration_theme: "Тема ілюстрації",
    theme_auto: "Автоматично (за темою)",
    theme_day: "День",
    theme_night: "Ніч",
  },
  hu: {
    title: "Smart Comfort tevékenység",
    empty: "Még semmi.",
    not_loaded: "A Smart Comfort nincs betöltve.",
    all: "Mind",
    group_devices: "Eszközök",
    group_lights: "Lámpák",
    group_notifications: "Értesítések",
    group_manual: "Kézzel",
    today: "Ma",
    yesterday: "Tegnap",
    t_cool: "Hűtés",
    t_cool_night: "Hűtés, csendes éjszaka",
    t_off: "Ki",
    t_off_open: "Ki: egy ablak nyitva marad",
    t_on: "Be: meleg van",
    t_on_night: "Be, csendes éjszaka",
    t_boost: "Ablakos rásegítés",
    t_purify: "Rásegítés: szennyezett levegő",
    t_normal: "Vissza a normálra",
    t_night: "Éjszakai mód",
    t_keep_on: "Újra bekapcsolva",
    lighting: "A pillanatnyi fényerő",
    presence_on: "Be: valaki belépett",
    presence_off: "Ki: senki sincs bent",
    display_off: "Jelzőfény ki",
    display_on: "Jelzőfény újra be",
    notified: "Értesítés",
    cleared: "Értesítés törölve: minden újra rendben",
    manual: "Kézzel módosítva: békén hagyva",
    manual_until: "Kézzel módosítva: békén hagyva eddig: {time}",
    reset: "Vissza a normálra (rögzített idő)",
    failed: "Nem sikerült elküldeni",
    f_title: "Cím",
    f_show_title: "Cím megjelenítése",
    f_limit: "Bejegyzések",
    f_kinds: "Csak",
    f_room: "Helyiség",
    k_device: "Eszközök",
    k_lighting: "Lámpák fényereje",
    k_presence: "Jelenlét-alapú világítás",
    k_display: "Jelzőfények",
    k_notified: "Értesítések",
    k_manual: "Kézi módosítások",
    k_reset: "Vissza a normálra",
    k_failed: "Sikertelen parancsok",
    h_room: "Egy Smart Comfort helyiség neve, ahogy a panelen látszik (üres: minden helyiség)",
    f_illustration: "Illusztráció",
    f_illustration_theme: "Az illusztráció témája",
    theme_auto: "Automatikus (a témát követi)",
    theme_day: "Nappal",
    theme_night: "Éjszaka",
  },
  sk: {
    title: "Aktivita Smart Comfort",
    empty: "Zatiaľ nič.",
    not_loaded: "Smart Comfort nie je načítaný.",
    all: "Všetko",
    group_devices: "Zariadenia",
    group_lights: "Svetlá",
    group_notifications: "Oznámenia",
    group_manual: "Ručne",
    today: "Dnes",
    yesterday: "Včera",
    t_cool: "Chladenie",
    t_cool_night: "Chladenie, tichá noc",
    t_off: "Vypnuté",
    t_off_open: "Vypnuté: okno zostáva otvorené",
    t_on: "Zapnuté: je teplo",
    t_on_night: "Zapnuté, tichá noc",
    t_boost: "Posilnenie pri okne",
    t_purify: "Posilnenie: znečistený vzduch",
    t_normal: "Návrat do normálu",
    t_night: "Nočný režim",
    t_keep_on: "Znova zapnuté",
    lighting: "Jas pre danú chvíľu",
    presence_on: "Rozsvietené: niekto vošiel",
    presence_off: "Zhasnuté: nikto nezostal",
    display_off: "Kontrolka vypnutá",
    display_on: "Kontrolka znova zapnutá",
    notified: "Oznámenie",
    cleared: "Oznámenie vymazané: všetko je opäť v norme",
    manual: "Zmenené ručne: ponechané tak",
    manual_until: "Zmenené ručne: ponechané tak do {time}",
    reset: "Návrat do normálu (pevný čas)",
    failed: "Nepodarilo sa odoslať",
    f_title: "Názov",
    f_show_title: "Zobraziť názov",
    f_limit: "Záznamy",
    f_kinds: "Len",
    f_room: "Miestnosť",
    k_device: "Zariadenia",
    k_lighting: "Jas svetiel",
    k_presence: "Svetlá podľa prítomnosti",
    k_display: "Kontrolky",
    k_notified: "Oznámenia",
    k_manual: "Ručné zmeny",
    k_reset: "Návrat do normálu",
    k_failed: "Neúspešné príkazy",
    h_room: "Názov miestnosti Smart Comfort, ako sa zobrazuje na paneli (prázdne: všetky miestnosti)",
    f_illustration: "Ilustrácia",
    f_illustration_theme: "Téma ilustrácie",
    theme_auto: "Automaticky (podľa témy)",
    theme_day: "Deň",
    theme_night: "Noc",
  },
  cs: {
    title: "Aktivita Smart Comfort",
    empty: "Zatím nic.",
    not_loaded: "Smart Comfort není načten.",
    all: "Vše",
    group_devices: "Zařízení",
    group_lights: "Světla",
    group_notifications: "Oznámení",
    group_manual: "Ručně",
    today: "Dnes",
    yesterday: "Včera",
    t_cool: "Chlazení",
    t_cool_night: "Chlazení, tichá noc",
    t_off: "Vypnuto",
    t_off_open: "Vypnuto: okno zůstává otevřené",
    t_on: "Zapnuto: je teplo",
    t_on_night: "Zapnuto, tichá noc",
    t_boost: "Posílení u okna",
    t_purify: "Posílení: znečištěný vzduch",
    t_normal: "Návrat do normálu",
    t_night: "Noční režim",
    t_keep_on: "Znovu zapnuto",
    lighting: "Jas pro danou chvíli",
    presence_on: "Rozsvíceno: někdo vešel",
    presence_off: "Zhasnuto: nikdo nezůstal",
    display_off: "Kontrolka vypnuta",
    display_on: "Kontrolka znovu zapnuta",
    notified: "Oznámení",
    cleared: "Oznámení smazáno: vše je opět v normálu",
    manual: "Změněno ručně: ponecháno být",
    manual_until: "Změněno ručně: ponecháno být do {time}",
    reset: "Návrat do normálu (pevný čas)",
    failed: "Nepodařilo se odeslat",
    f_title: "Název",
    f_show_title: "Zobrazit název",
    f_limit: "Záznamy",
    f_kinds: "Jen",
    f_room: "Místnost",
    k_device: "Zařízení",
    k_lighting: "Jas světel",
    k_presence: "Světla podle přítomnosti",
    k_display: "Kontrolky",
    k_notified: "Oznámení",
    k_manual: "Ruční změny",
    k_reset: "Návrat do normálu",
    k_failed: "Neúspěšné příkazy",
    h_room: "Název místnosti Smart Comfort, jak se zobrazuje na panelu (prázdné: všechny místnosti)",
    f_illustration: "Ilustrace",
    f_illustration_theme: "Motiv ilustrace",
    theme_auto: "Automaticky (podle motivu)",
    theme_day: "Den",
    theme_night: "Noc",
  },
  sl: {
    title: "Dejavnost Smart Comfort",
    empty: "Še nič.",
    not_loaded: "Smart Comfort ni naložen.",
    all: "Vse",
    group_devices: "Naprave",
    group_lights: "Luči",
    group_notifications: "Obvestila",
    group_manual: "Ročno",
    today: "Danes",
    yesterday: "Včeraj",
    t_cool: "Hlajenje",
    t_cool_night: "Hlajenje, tiha noč",
    t_off: "Izklopljeno",
    t_off_open: "Izklopljeno: okno ostaja odprto",
    t_on: "Vklopljeno: toplo je",
    t_on_night: "Vklopljeno, tiha noč",
    t_boost: "Okenska okrepitev",
    t_purify: "Okrepitev: onesnažen zrak",
    t_normal: "Nazaj na običajno",
    t_night: "Nočni način",
    t_keep_on: "Znova vklopljeno",
    lighting: "Svetlost trenutka",
    presence_on: "Prižgano: nekdo je vstopil",
    presence_off: "Ugasnjeno: nikogar ni več",
    display_off: "Indikator izklopljen",
    display_on: "Indikator znova vklopljen",
    notified: "Obvestilo",
    cleared: "Obvestilo počiščeno: vse je spet normalno",
    manual: "Ročno spremenjeno: puščeno pri miru",
    manual_until: "Ročno spremenjeno: puščeno pri miru do {time}",
    reset: "Nazaj na običajno (določena ura)",
    failed: "Ni bilo mogoče poslati",
    f_title: "Naslov",
    f_show_title: "Prikaži naslov",
    f_limit: "Vnosi",
    f_kinds: "Le",
    f_room: "Prostor",
    k_device: "Naprave",
    k_lighting: "Svetlost luči",
    k_presence: "Luči ob prisotnosti",
    k_display: "Indikatorji",
    k_notified: "Obvestila",
    k_manual: "Ročne spremembe",
    k_reset: "Nazaj na običajno",
    k_failed: "Neuspeli ukazi",
    h_room: "Ime prostora Smart Comfort, kot je prikazano na plošči (prazno: vsi prostori)",
    f_illustration: "Ilustracija",
    f_illustration_theme: "Tema ilustracije",
    theme_auto: "Samodejno (sledi temi)",
    theme_day: "Dan",
    theme_night: "Noč",
  },
  lv: {
    title: "Smart Comfort aktivitāte",
    empty: "Vēl nekā.",
    not_loaded: "Smart Comfort nav ielādēts.",
    all: "Visi",
    group_devices: "Ierīces",
    group_lights: "Gaismas",
    group_notifications: "Paziņojumi",
    group_manual: "Manuāli",
    today: "Šodien",
    yesterday: "Vakar",
    t_cool: "Dzesē",
    t_cool_night: "Dzesē, klusā nakts",
    t_off: "Izslēgts",
    t_off_open: "Izslēgts: logs paliek atvērts",
    t_on: "Ieslēgts: ir silts",
    t_on_night: "Ieslēgts, klusā nakts",
    t_boost: "Loga pastiprinājums",
    t_purify: "Pastiprinājums: piesārņots gaiss",
    t_normal: "Atpakaļ uz normālu",
    t_night: "Nakts režīms",
    t_keep_on: "Atkal ieslēgts",
    lighting: "Brīža spilgtums",
    presence_on: "Ieslēgts: kāds ienāca",
    presence_off: "Izslēgts: neviena vairs nav",
    display_off: "Indikators izslēgts",
    display_on: "Indikators atkal ieslēgts",
    notified: "Paziņojums",
    cleared: "Paziņojums notīrīts: viss atkal ir normāli",
    manual: "Mainīts manuāli: atstāts mierā",
    manual_until: "Mainīts manuāli: atstāts mierā līdz {time}",
    reset: "Atpakaļ uz normālu (noteikts laiks)",
    failed: "Nevarēja nosūtīt",
    f_title: "Virsraksts",
    f_show_title: "Rādīt virsrakstu",
    f_limit: "Ieraksti",
    f_kinds: "Tikai",
    f_room: "Telpa",
    k_device: "Ierīces",
    k_lighting: "Gaismu spilgtums",
    k_presence: "Gaismas pēc klātbūtnes",
    k_display: "Indikatori",
    k_notified: "Paziņojumi",
    k_manual: "Manuālas izmaiņas",
    k_reset: "Atpakaļ uz normālu",
    k_failed: "Neizdevušās komandas",
    h_room: "Smart Comfort telpas nosaukums, kā tas redzams panelī (tukšs: visas telpas)",
    f_illustration: "Ilustrācija",
    f_illustration_theme: "Ilustrācijas tēma",
    theme_auto: "Automātiski (pēc tēmas)",
    theme_day: "Diena",
    theme_night: "Nakts",
  },
  el: {
    title: "Δραστηριότητα Smart Comfort",
    empty: "Τίποτα ακόμα.",
    not_loaded: "Το Smart Comfort δεν έχει φορτωθεί.",
    all: "Όλα",
    group_devices: "Συσκευές",
    group_lights: "Φώτα",
    group_notifications: "Ειδοποιήσεις",
    group_manual: "Χειροκίνητα",
    today: "Σήμερα",
    yesterday: "Χθες",
    t_cool: "Ψύξη",
    t_cool_night: "Ψύξη, ήσυχη νύχτα",
    t_off: "Σβηστό",
    t_off_open: "Σβηστό: ένα παράθυρο μένει ανοιχτό",
    t_on: "Αναμμένο: κάνει ζέστη",
    t_on_night: "Αναμμένο, ήσυχη νύχτα",
    t_boost: "Ενίσχυση παραθύρου",
    t_purify: "Ενίσχυση: μολυσμένος αέρας",
    t_normal: "Επιστροφή στο κανονικό",
    t_night: "Νυχτερινή λειτουργία",
    t_keep_on: "Άναψε ξανά",
    lighting: "Φωτεινότητα της στιγμής",
    presence_on: "Αναμμένο: μπήκε κάποιος",
    presence_off: "Σβηστό: δεν έμεινε κανείς",
    display_off: "Ενδεικτική λυχνία σβηστή",
    display_on: "Ενδεικτική λυχνία αναμμένη ξανά",
    notified: "Ειδοποίηση",
    cleared: "Η ειδοποίηση διαγράφηκε: όλα επανήλθαν στο κανονικό",
    manual: "Άλλαξε χειροκίνητα: μένει ανέγγιχτο",
    manual_until: "Άλλαξε χειροκίνητα: μένει ανέγγιχτο έως τις {time}",
    reset: "Επιστροφή στο κανονικό (ορισμένη ώρα)",
    failed: "Δεν ήταν δυνατή η αποστολή",
    f_title: "Τίτλος",
    f_show_title: "Εμφάνιση τίτλου",
    f_limit: "Εγγραφές",
    f_kinds: "Μόνο",
    f_room: "Δωμάτιο",
    k_device: "Συσκευές",
    k_lighting: "Φωτεινότητα φώτων",
    k_presence: "Φώτα με παρουσία",
    k_display: "Ενδεικτικές λυχνίες",
    k_notified: "Ειδοποιήσεις",
    k_manual: "Χειροκίνητες αλλαγές",
    k_reset: "Επιστροφή στο κανονικό",
    k_failed: "Αποτυχημένες εντολές",
    h_room: "Όνομα ενός δωματίου του Smart Comfort, όπως εμφανίζεται στον πίνακα (κενό: όλα τα δωμάτια)",
    f_illustration: "Εικονογράφηση",
    f_illustration_theme: "Θέμα εικονογράφησης",
    theme_auto: "Αυτόματο (ακολουθεί το θέμα)",
    theme_day: "Ημέρα",
    theme_night: "Νύχτα",
  },
};

/** The language helpers over a table of texts by language (this card's, the mini card's). */
export function languageOf(strings) {
  // Language of the texts: the full tag when translated (sr-Latn), else its base (fr-FR: fr), else English.
  const resolve = (language) => [language, String(language || "").split("-")[0]].find((l) => strings[l]) || "en";
  // Locale of numbers and dates: Home Assistant's own (pt-BR keeps its formats) when it speaks the language of the
  // texts, else that language; pt alone is European Portuguese for Home Assistant, pt-PT for Intl.
  const intlLocale = (hass) => {
    const resolved = resolve(hass?.language);
    const full = hass?.locale?.language || hass?.language || "";
    if (full.split("-")[0] !== resolved.split("-")[0]) return resolved === "pt" ? "pt-PT" : resolved;
    return full === "pt" ? "pt-PT" : full;
  };
  // A text in that language, else in English, else its key; {name} placeholders filled from `values`.
  const translate = (language, key, values = {}) => {
    const text = strings[resolve(language)][key] ?? strings.en[key] ?? key;
    return text.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? "");
  };
  return { resolve, stringsFor: (language) => strings[resolve(language)], intlLocale, translate };
}

const { stringsFor, intlLocale, translate } = languageOf(STRINGS);

/** An element with a class and a text. */
export function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

const ICONS = {
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
const DEVICE_ICONS = { climate: "mdi:air-conditioner", fan: "mdi:fan" };
// Filter groups of the Activity tab (a failed command goes with what it was sent to: see groupOf),
// and the kinds of the card option.
const GROUPS = {
  devices: ["device", "display", "reset"],
  lights: ["lighting", "presence_on", "presence_off"],
  notifications: ["notified", "cleared"],
  manual: ["manual"],
};
const KIND_OPTIONS = ["device", "lighting", "presence", "display", "notified", "manual", "reset", "failed"];

function matches(entry, config) {
  if (config.room && entry.room !== config.room) return false;
  const kinds = config.kinds;
  if (!kinds?.length) return true;
  return kinds.some((k) => k === entry.kind || (k === "presence" && entry.kind.startsWith("presence")) || (k === "notified" && entry.kind === "cleared"));
}

/** Filter group of an entry. A failed command is sorted as it would have been (activity.py kind_of):
 * an indicator's is a device's, a light's is a light's, the others a device's. */
function groupOf(entry) {
  if (entry.kind !== "failed") return Object.keys(GROUPS).find((group) => GROUPS[group].includes(entry.kind));
  if (entry.target === "display_off" || entry.target === "display_on") return "devices";
  const domain = (entry.action || entry.entity_id || "").split(".")[0];
  return domain === "light" ? "lights" : "devices";
}

/** What keeps the keyboard focus across a render: the same line, or the same filter. */
const entryKey = (entry) => `${entry.at}|${entry.kind}|${entry.entity_id || ""}|${entry.target || ""}`;

class SmartComfortActivityCard extends HTMLElement {
  static getStubConfig() {
    return { limit: 10 };
  }

  static getConfigForm() {
    // Home Assistant's language when the label is asked for (the editor keeps the form).
    const t = (key) => stringsFor(document.querySelector("home-assistant")?.hass?.language)[key] ?? STRINGS.en[key];
    return {
      schema: [
        { name: "title", selector: { text: {} } },
        { name: "show_title", default: true, selector: { boolean: {} } },
        { name: "illustration", default: true, selector: { boolean: {} } },
        {
          name: "illustration_theme",
          selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((value) => ({ value, label: t(`theme_${value}`) })) } },
        },
        { name: "limit", selector: { number: { min: 1, max: 100, mode: "box" } } },
        {
          name: "kinds",
          selector: { select: { multiple: true, mode: "list", options: KIND_OPTIONS.map((value) => ({ value, label: t(`k_${value}`) })) } },
        },
        { name: "room", selector: { text: {} } },
      ],
      computeLabel: (schema) => t(`f_${schema.name}`) || schema.name,
      computeHelper: (schema) => t(`h_${schema.name}`),
    };
  }

  // In a Sections view: narrower, the lines would hold one word each.
  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._entries = [];
    this._group = "all";
    this._loaded = true;
  }

  setConfig(config) {
    this._config = { limit: 10, ...config };
    // show_title: the header's title, hidden by the stylesheet
    this.toggleAttribute?.("hide-title", config.show_title === false);
    this._render();
  }

  // Subscribed only while attached: Lovelace sets hass before attaching the card, the panel after.
  // Rendered again only when what it shows changes: the language, the names shown, the day.
  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first && this.isConnected) this._subscribe();
    else if (!this._rendered || this._signature() !== this._shown) this._render();
  }

  connectedCallback() {
    if (this._hass && !this._subscription) this._subscribe();
  }

  disconnectedCallback() {
    this._unsubscribe();
    this._pillResize?.disconnect();
    this._pillResize = null;
  }

  getCardSize() {
    return Math.min(8, 1 + (this._config?.limit || 10));
  }

  _t(key, values = {}) {
    return translate(this._hass?.language, key, values);
  }

  /** One subscription at a time: `_subscription` is set from the request on, not only once it is ready. */
  async _subscribe() {
    this._unsubscribe();
    const subscription = {};
    this._subscription = subscription;
    const current = () => this._subscription === subscription;
    const limit = this._config?.panel ? 300 : Math.max(50, (this._config?.limit || 10) * 5);
    try {
      const unsub = await this._hass.connection.subscribeMessage(
        (msg) => {
          if (!current()) return;
          if (msg.entries) this._entries = msg.entries;
          if (msg.added) this._entries = [...[...msg.added].reverse(), ...this._entries].slice(0, 300);
          this._loaded = true;
          this._render();
        },
        { type: "smart_comfort/activity", limit }
      );
      // Detached (or subscribed again) while it was on its way: not needed any more.
      if (current()) this._unsub = unsub;
      else unsub();
    } catch (_err) {
      if (!current()) return;
      this._subscription = undefined;
      this._loaded = false;
      this._render();
    }
  }

  _unsubscribe() {
    this._subscription = undefined;
    if (this._unsub) {
      this._unsub();
      this._unsub = undefined;
    }
  }

  _name(entityId) {
    return this._hass?.states[entityId]?.attributes.friendly_name || entityId;
  }

  _time(iso, withDay = false) {
    const date = new Date(iso);
    const options = { hour: "2-digit", minute: "2-digit" };
    if (withDay) Object.assign(options, { day: "numeric", month: "short" });
    return date.toLocaleString(intlLocale(this._hass), options);
  }

  _day(iso) {
    const date = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return this._t("today");
    if (date.toDateString() === yesterday.toDateString()) return this._t("yesterday");
    return date.toLocaleDateString(intlLocale(this._hass), { weekday: "long", day: "numeric", month: "long" });
  }

  /** What happened, in a few words, and the icon. */
  _describe(entry) {
    const data = entry.data || {};
    const pct = data.brightness_pct ?? data.value;
    let text;
    let icon = ICONS[entry.kind] || "mdi:information-outline";
    switch (entry.kind) {
      case "device":
        text = this._t(`t_${entry.target}`);
        icon = DEVICE_ICONS[(entry.entity_id || "").split(".")[0]] || icon;
        if (data.preset_mode) text += ` · ${data.preset_mode}`;
        else if (data.option) text += ` · ${data.option}`;
        else if (data.fan_mode) text += ` · ${data.fan_mode}`;
        break;
      case "lighting":
      case "presence_on":
        text = this._t(entry.kind) + (pct !== undefined ? ` · ${pct} %` : "");
        break;
      case "display":
        text = this._t(entry.target === "display_on" ? "display_on" : "display_off");
        if (entry.target === "display_on") icon = "mdi:led-on";
        break;
      case "notified":
        return { icon, text: entry.title || this._t("notified"), detail: entry.message, severity: entry.severity };
      case "manual":
        text = entry.until ? this._t("manual_until", { time: this._time(entry.until) }) : this._t("manual");
        break;
      case "failed":
        text = this._t("failed") + (entry.target ? ` · ${this._target(entry.target)}` : "");
        break;
      default:
        text = this._t(entry.kind);
    }
    return { icon, text };
  }

  /** The target of a command: a device's, a presence light's, an indicator's or the brightness of a light. */
  _target(target) {
    if (`t_${target}` in STRINGS.en) return this._t(`t_${target}`);
    if (target === "presence") return this._t("presence_on");
    if (target === "display_off" || target === "display_on") return this._t(target);
    return `${this._t("lighting")} · ${target}`;
  }

  _visible() {
    const config = this._config || {};
    let entries = this._entries.filter((e) => matches(e, config));
    if (config.panel && this._group !== "all") entries = entries.filter((e) => groupOf(e) === this._group);
    return config.panel ? entries : entries.slice(0, config.limit || 10);
  }

  /** What the lines depend on besides the entries: the language, the names shown, today's date, the header's picture. */
  _signature() {
    const names = this._loaded ? this._visible().map((e) => (e.entity_id ? this._name(e.entity_id) : "")) : [];
    return JSON.stringify([this._hass?.language, new Date().toDateString(), names, this._illustrated() ? [this._mood(), this._night()] : null]);
  }

  // The illustrated header is on unless `illustration: false`; never in the panel (no header there).
  _illustrated() {
    return this._config?.illustration !== false && !this._config?.panel;
  }

  // Night picture: forced by illustration_theme, else Home Assistant's dark theme alone.
  _night() {
    const mode = this._config?.illustration_theme;
    if (mode === "night") return true;
    if (mode === "day") return false;
    return !!this._hass?.themes?.darkMode;
  }

  // The state of the home, as on the Smart Comfort card: its picture (scene) and the icon's colour (level).
  _mood() {
    const found = findEntities(this._hass);
    const alerts = this._hass?.states?.[found.alerts]?.attributes?.alerts;
    return comfortMood(Array.isArray(alerts) ? alerts : null, found.rooms.map((id) => this._hass.states[id]));
  }

  _render() {
    if (!this._config) return;
    this._rendered = Boolean(this._hass);
    this._shown = this._signature();
    const root = this.shadowRoot;
    // Rendered again on each new entry: the line or filter that has the focus gets it back.
    const focusKey = root.activeElement?.dataset?.key;
    root.innerHTML = `<style>${STYLE}</style>`;
    const card = document.createElement(this._config.panel ? "div" : "ha-card");
    root.append(card);
    const title = this._config.title ?? this._t("title");
    if (!this._config.panel && title) card.append(this._header(title));
    if (this._illustrated()) this._watchPill();
    const body = document.createElement("div");
    body.className = this._config.panel ? "body flat" : "body";
    card.append(body);
    if (this._config.panel) body.append(this._chips());
    if (!this._loaded) {
      body.append(this._el("div", "empty", this._t("not_loaded")));
      this._restoreFocus(body, focusKey);
      return;
    }
    const entries = this._visible();
    if (!entries.length) {
      body.append(this._el("div", "empty", this._t("empty")));
      this._restoreFocus(body, focusKey);
      return;
    }
    let day = null;
    for (const entry of entries) {
      const thisDay = this._day(entry.at);
      if (this._config.panel && thisDay !== day) {
        body.append(this._el("div", "day", thisDay));
        day = thisDay;
      }
      body.append(this._row(entry));
    }
    this._restoreFocus(body, focusKey);
  }

  /**
   * Header like the other cards: a tinted round badge and the title. Illustrated (the default): the Smart Comfort
   * card's room for the state of the home, the badge in its colour, the title with a pill counting today's entries and
   * the latest entry under it, over the parquet floor.
   */
  _header(title) {
    const icon = document.createElement("ha-icon");
    icon.icon = "mdi:history";
    if (!this._illustrated()) {
      const header = this._el("div", "header");
      const badge = this._el("span", "hbadge");
      badge.append(icon);
      const titles = this._el("div", "titles");
      titles.append(this._el("div", "hname", title));
      header.append(badge, titles);
      return header;
    }
    const mood = this._mood();
    const night = this._night();
    const badge = this._el("span", `hbadge ${mood.level}`);
    badge.append(icon);
    const titles = this._el("div", "titles");
    const row = this._el("div", "trow");
    row.append(this._el("div", "hname", title));
    titles.append(row);
    const entries = this._loaded ? this._visible() : [];
    if (entries.length) {
      const today = entries.filter((e) => this._day(e.at) === this._t("today")).length;
      const status = `${this._t("today")} · ${today}`;
      row.append(statusPill(mood.level, status));
      const { text } = this._describe(entries[0]);
      const who = entries[0].entity_id ? this._name(entries[0].entity_id) : null;
      const sub = this._el("div", "hsub", `${this._time(entries[0].at)} · ${who ? `${who} — ${text}` : text}`);
      sub.title = sub.textContent;
      titles.append(sub);
    }
    const header = this._el("div", `header banner ${mood.scene}${night ? " night" : ""}`);
    const scene = this._el("div", "scene");
    scene.innerHTML = comfortScene(mood.scene, mood.level, night);
    const head = this._el("div", "head");
    head.append(badge, titles);
    header.append(scene, this._el("div", "ground"), head);
    return header;
  }

  // The pill's place is measured (fitPill): after each render, on every new width and once the web font is loaded.
  _watchPill() {
    if (typeof requestAnimationFrame !== "function") return;
    const fit = () => {
      cancelAnimationFrame(this._pillFrame);
      this._pillFrame = requestAnimationFrame(() => fitPill(this.shadowRoot));
    };
    if (!this._pillResize && typeof ResizeObserver === "function") {
      this._pillResize = new ResizeObserver(fit);
      this._pillResize.observe(this);
      document.fonts?.ready?.then(fit);
    }
    fit();
  }

  _restoreFocus(body, key) {
    if (!key) return;
    const find = (node) => (node.dataset?.key === key ? node : [...(node.children || [])].map(find).find(Boolean));
    find(body)?.focus({ preventScroll: true });
  }

  _chips() {
    const chips = this._el("div", "chips");
    for (const group of ["all", ...Object.keys(GROUPS)]) {
      const chip = this._el("button", `chip${group === this._group ? " active" : ""}`, this._t(group === "all" ? "all" : `group_${group}`));
      chip.dataset.key = `chip:${group}`;
      chip.setAttribute("aria-pressed", String(group === this._group));
      chip.addEventListener("click", () => {
        this._group = group;
        this._render();
      });
      chips.append(chip);
    }
    return chips;
  }

  _row(entry) {
    const { icon, text, detail, severity } = this._describe(entry);
    const row = this._el("div", `row ${entry.kind}${severity ? ` ${severity}` : ""}`);
    const badge = this._el("div", "badge");
    const i = document.createElement("ha-icon");
    i.icon = icon;
    badge.append(i);
    const main = this._el("div", "main");
    const who = entry.entity_id ? this._name(entry.entity_id) : null;
    main.append(this._el("div", "what", who ? `${who} — ${text}` : text));
    if (detail) main.append(this._el("div", "detail", detail));
    const meta = [entry.room, this._time(entry.at, !this._config.panel && this._day(entry.at) !== this._t("today"))];
    main.append(this._el("div", "meta", meta.filter(Boolean).join(" · ")));
    row.append(badge, main);
    if (entry.entity_id) {
      row.classList.add("clickable");
      row.dataset.key = entryKey(entry);
      row.setAttribute("role", "button");
      row.setAttribute("tabindex", "0");
      const open = () => {
        const event = new Event("hass-more-info", { bubbles: true, composed: true });
        event.detail = { entityId: entry.entity_id };
        this.dispatchEvent(event);
      };
      row.addEventListener("click", open);
      row.addEventListener("keydown", (ev) => {
        if (ev.key !== "Enter" && ev.key !== " ") return;
        ev.preventDefault();
        open();
      });
    }
    return row;
  }

  _el(tag, cls, text) {
    return el(tag, cls, text);
  }
}

// Header like the other cards, shared with the mini card: a tinted round badge, the title block shrinks and truncates.
export const HEADER_STYLE = `
  .hbadge { --c: var(--primary-color, #03a9f4); width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; flex: none;
    background: color-mix(in srgb, var(--c) 16%, transparent); color: var(--c); --mdc-icon-size: 24px; }
  .titles { flex: 1 1 0; min-width: 4ch; }
  .hname { min-width: 4ch; font-size: 16px; font-weight: 500; line-height: 1.25; color: var(--primary-text-color);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  :host([hide-title]) .titles > .hname { display: none; }
`;

// The integration's domain, and its switches by translation key, in the order shown (the mini card's controls).
export const DOMAIN = "smart_comfort";
export const SWITCHES = [
  ["notifications", "mdi:bell-outline", "mdi:bell-off-outline"],
  ["control", "mdi:fan", "mdi:fan"],
  ["lighting", "mdi:lightbulb-auto-outline", "mdi:lightbulb-auto-outline"],
];

/** The integration's entities: its alerts sensor, its room sensors and its switches. */
export function findEntities(hass) {
  const found = { alerts: null, rooms: [], switches: {} };
  for (const entry of Object.values(hass?.entities || {})) {
    if (entry.platform !== DOMAIN) continue;
    const id = entry.entity_id;
    const key = entry.translation_key;
    if (id.startsWith("sensor.") && key === "alerts") found.alerts = id;
    else if (id.startsWith("sensor.") && key === "room") found.rooms.push(id);
    else if (id.startsWith("switch.") && SWITCHES.some(([k]) => k === key)) found.switches[key] = id;
  }
  return found;
}

// Device targets that mean the room is being cooled: an air conditioner cooling, a fan blowing.
const COOLING_TARGETS = new Set(["cool", "cool_night", "on", "on_night"]);
// Alert kinds drawn as a cold room.
const COLD_KINDS = new Set(["too_cold", "window_open_cold"]);

/**
 * The state the header shows: `scene` picks the illustration (ok, hot, cold, cool, warn) and `level` the colour of
 * the icon (ok green, quiet grey, cool blue, warning amber, critical red). An alert to deal with comes first, then a
 * device cooling a room, then the alerts that are only snoozed or handled.
 */
export function comfortMood(alerts, roomStates) {
  if (!alerts) return { scene: "ok", level: "quiet" };
  const open = alerts.filter((a) => !a.snoozed && !a.handled);
  if (open.length) {
    const level = open.some((a) => a.severity === "critical") ? "critical" : "warning";
    if (open.some((a) => a.kind === "too_hot")) return { scene: "hot", level };
    if (open.some((a) => COLD_KINDS.has(a.kind))) return { scene: "cold", level };
    return { scene: "warn", level };
  }
  const cooling = roomStates.some((s) => Object.values(s?.attributes?.devices || {}).some((d) => COOLING_TARGETS.has(d?.target)));
  if (cooling || alerts.some((a) => a.handled && a.kind === "too_hot")) return { scene: "cool", level: "cool" };
  return { scene: "ok", level: alerts.length ? "quiet" : "ok" };
}

// The illustration, drawn in the right part (x 96–200) of a 200 × 80 room whose floor is the ground strip: an air
// conditioner on the wall and a thermometer, the sun (heat waves at night), a snowflake or an alert sign by state.
// It uses no id, so several cards on one page never clash.
export function comfortScene(scene, level, night) {
  const [mercury, top, height] =
    { hot: ["#e5484d", 6, 30], cool: ["#2f80ed", 18, 18], cold: ["#2f80ed", 26, 10] }[scene] || ["#43a047", 14, 22];
  const cooling = scene === "cool";
  const ticks = [8, 16, 24, 32].map((y) => `<line x1="5" y1="${y}" x2="7" y2="${y}"/>`).join("");
  const ac = `<g transform="translate(140 12)">
      <rect x="-30" y="0" width="60" height="16" rx="5" fill="${night ? "#d8dce2" : "#ffffff"}" stroke="#c9ced6"/>
      <rect x="-24" y="12" width="48" height="2" rx="1" fill="#9aa3ae"/>
      <circle class="${cooling ? "blink" : ""}" cx="22" cy="5" r="1.2" fill="${cooling ? "#2f80ed" : "#9aa3ae"}"/>
      ${
        cooling
          ? `<g class="breeze" fill="none" stroke="#86b9de" stroke-width="1.4" stroke-linecap="round">
        <path d="M-20 20 q4 8 0 16"/><path d="M0 20 q4 8 0 16"/><path d="M20 20 q4 8 0 16"/></g>`
          : ""
      }</g>`;
  const thermometer = `<g transform="translate(104 22)">
      <rect x="-4" y="0" width="8" height="40" rx="4" fill="#ffffff" stroke="#9aa3ae"/>
      <g stroke="#9aa3ae" stroke-width=".6">${ticks}</g>
      <rect class="merc${scene === "hot" ? " rise" : cooling ? " fall" : ""}" x="-1.6" y="${top}" width="3.2" height="${height}" rx="1.6" fill="${mercury}"/>
      <circle cy="42" r="5" fill="${mercury}"/></g>`;
  let extra = "";
  if (scene === "hot" && !night) {
    const rays = Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      const at = (r) => [(Math.cos(a) * r).toFixed(1), (Math.sin(a) * r).toFixed(1)];
      const [[x1, y1], [x2, y2]] = [at(6), at(10)];
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    }).join("");
    extra = `<g transform="translate(186 44)"><g class="rays" stroke="#f5b400" stroke-width="1.6" stroke-linecap="round">${rays}</g><circle r="4" fill="#ffc83a"/></g>`;
  } else if (scene === "hot") {
    extra = `<g class="heat" transform="translate(186 50)" fill="none" stroke="#e5484d" stroke-width="1.4" stroke-linecap="round">
      <path d="M-6 6 q-2 -4 0 -8 t0 -8"/><path d="M0 6 q-2 -4 0 -8 t0 -8"/><path d="M6 6 q-2 -4 0 -8 t0 -8"/></g>`;
  } else if (scene === "cold") {
    const arms = [0, 60, 120].map((d) => `<path transform="rotate(${d})" d="M0 -8 V8 M-2.5 -6 L0 -4 L2.5 -6 M-2.5 6 L0 4 L2.5 6"/>`).join("");
    extra = `<g transform="translate(186 44)"><g class="snow" fill="none" stroke="${night ? "#a9d2f5" : "#5aa9e6"}" stroke-width="1.3" stroke-linecap="round">${arms}</g></g>`;
  } else if (scene === "warn") {
    const color = level === "critical" ? "#e5484d" : "#ffa600";
    extra = `<g class="pulse" transform="translate(186 44)"><circle r="7" fill="${color}"/>
      <rect x="-1" y="-4.5" width="2" height="5.5" rx="1" fill="#ffffff"/><circle cy="3.4" r="1.1" fill="#ffffff"/></g>`;
  }
  return `<svg viewBox="96 0 104 80" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">${ac}${thermometer}${extra}</svg>`;
}

// The banner's ground strip (the parquet floor), that the title block keeps clear of, and the gap between the title
// and the status pill on its row (.trow).
const PILL_GROUND_PX = 10;
const PILL_GAP_PX = 8;

// The status pill goes on the title row, right after the title, only when the whole title and the pill's whole label
// fit there; otherwise it takes its own line under the subtitle, and in the banner its dot alone when even that does not
// fit above the ground strip. Measured after each render, never by a fixed width (the mini card's and the activity card's).
export function fitPill(root) {
  for (const t of root?.querySelectorAll?.(".titles") || []) {
    const row = t.querySelector?.(".trow");
    const name = row?.querySelector(".hname");
    const chips = row ? [...row.children].filter((n) => n.classList.contains("pill")) : [];
    if (!name?.getBoundingClientRect || !chips.length) continue;
    t.classList.remove("pill-below", "pill-dot");
    // The title's whole width (scrollWidth is rounded: 1 px more, so that a title that fits is never cut).
    const need = chips.reduce((w, c) => w + PILL_GAP_PX + c.getBoundingClientRect().width, name.scrollWidth + 1);
    if (need <= row.getBoundingClientRect().width + 0.5) continue;
    t.classList.add("pill-below");
    const banner = t.closest(".banner");
    if (!banner) continue;
    const box = banner.getBoundingClientRect();
    const ground = box.bottom - PILL_GROUND_PX;
    const right = t.getBoundingClientRect().right;
    const out = [name, ...t.querySelectorAll(".hsub"), ...chips].some((n) => {
      const r = n.getBoundingClientRect();
      return r.height > 0 && (r.top < box.top - 0.5 || r.bottom > ground + 0.5 || r.right > right + 0.5);
    });
    if (out) t.classList.add("pill-dot");
  }
}

/** The status pill after the title, in the colour of the header's icon (`level`), its text in its tooltip too. */
export function statusPill(level, text) {
  const pill = el("span", `pill ${level}`);
  pill.title = text;
  pill.append(el("span", "pdot"), el("span", "ptxt", text));
  return pill;
}

// The title block's stylesheet, shared with the mini card: subtitle, badge colours by status, the title row and its pill.
export const TITLE_STYLE = `
  .hsub { font-size: 12px; line-height: 16px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  :host([hide-title]) .titles .hname, :host([hide-subtitle]) .titles > .hsub { display: none; }
  .top:empty { display: none; }
  /* The icon's colour is the status, in both headers. */
  .hbadge.ok { --c: var(--success-color, #43a047); }
  .hbadge.quiet { --c: var(--secondary-text-color, #727272); }
  .hbadge.cool { --c: var(--state-climate-cool-color, #2b9af9); }
  .hbadge.warning { --c: var(--warning-color, #ffa600); }
  .hbadge.critical { --c: var(--error-color, #db4437); }
  /* Title row: the title, then the status pill 8 px after it, only when the whole title and the pill's whole label fit
     there; otherwise the pill on its own line under the subtitle (then kept to one line), and its dot alone when the
     banner has no room left for its label or at 200 px or less (its text stays in its title and for screen readers).
     Measured after each render (_fitPill), in every language, never by a fixed width. */
  .header .titles { display: flex; flex-direction: column; justify-content: center; }
  .trow { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .trow .hname { flex: 0 1 auto; }
  .titles.pill-below .trow { display: contents; }
  .titles.pill-below .hsub { order: 1; }
  .titles.pill-below .pill { order: 2; align-self: flex-start; margin-top: 3px; }
  .titles.pill-dot .pill { padding: 4px; }
  .titles.pill-dot .ptxt { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  .pill { --c: var(--success-color, #43a047); display: inline-flex; align-items: center; gap: 4px; flex: none;
    box-sizing: border-box; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;
    line-height: 16px; white-space: nowrap;
    background: color-mix(in srgb, var(--c) 16%, transparent); color: color-mix(in srgb, var(--c) 70%, var(--primary-text-color)); }
  .pill .ptxt { white-space: nowrap; }
  .pill .pdot { width: 7px; height: 7px; border-radius: 50%; background: var(--c); flex: none; }
  .pill.ok { --c: var(--success-color, #43a047); }
  .pill.quiet { --c: var(--secondary-text-color, #727272); }
  .pill.cool { --c: var(--state-climate-cool-color, #2b9af9); }
  .pill.warning { --c: var(--warning-color, #ffa600); }
  .pill.critical { --c: var(--error-color, #db4437); }
  @container sc-card (max-width: 200px) {
    .pill { padding: 4px; }
    .pill .ptxt { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  }
`;

// The illustrated header's stylesheet, shared with the mini card: the room's wall, the illustration, the floor strip.
export const BANNER_STYLE = `
  /* ── Illustrated header: the room's wall, the illustration at the right, a parquet floor strip ── */
  .banner { position: relative; height: var(--banner-h, 90px); overflow: hidden; --ground-h: 10px; --scene-w: 104px;
            --sky-text: #2a2f3a; --sky-muted: #5b6270; background: #f2eee8; }
  .banner.night { --sky-text: #ffffff; --sky-muted: rgba(255,255,255,.75); background: #2a2f3d; }
  .banner .scene { position: absolute; right: 0; bottom: var(--ground-h); height: calc(100% - var(--ground-h));
                   width: min(var(--scene-w), 45%); overflow: hidden; }
  .banner .scene svg { display: block; width: 100%; height: 100%; }
  .banner .ground { position: absolute; left: 0; right: 0; bottom: 0; height: var(--ground-h);
                    background: repeating-linear-gradient(90deg, #c99a6b 0 38px, #b98a5c 38px 40px); box-shadow: inset 0 2px 0 #a97c50; }
  .banner.night .ground { background: repeating-linear-gradient(90deg, #4a3a2c 0 38px, #3e3024 38px 40px); box-shadow: inset 0 2px 0 #5c4836; }
  .banner .head { position: absolute; z-index: 1; left: 0; top: 0; bottom: var(--ground-h); right: min(var(--scene-w), 45%);
                  box-sizing: border-box; display: flex; align-items: center; gap: 10px; padding: 8px 8px 8px 14px; min-width: 0; }
  .banner .hname { color: var(--sky-text); }
  .banner .hsub { color: var(--sky-muted); font-size: 13px; line-height: 17px; }
  .banner .hbadge { background: rgba(255,255,255,.62); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 22%, transparent); }
  .banner .hbadge.quiet { --c: #8a929c; }
  .banner.night .hbadge { background: rgba(255,255,255,.12); color: color-mix(in srgb, var(--c) 75%, #ffffff);
                          box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
  .banner.night .hbadge.quiet { --c: #b9c0c9; }
  /* The expand / collapse button: 24 px, round, frosted, in the banner's top right corner. */
  .banner .zoom { position: absolute; z-index: 2; top: 5px; right: 5px; width: 24px; height: 24px; margin: 0; color: #33506b;
                  background: rgba(255,255,255,.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,.7);
                  -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }
  .banner .zoom:hover { background: rgba(255,255,255,.75); color: #33506b; }
  .banner.night .zoom { color: #ffffff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .banner.night .zoom:hover { background: rgba(255,255,255,.22); color: #ffffff; }
  /* The status pill on the sky: a frosted glass under the tint. */
  .banner .pill { background: color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c) 45%, #0d2a45); }
  .banner.night .pill { background: color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c) 35%, #ffffff); }
  .banner .pill.quiet { --c: #8a929c; }
  .banner.night .pill.quiet { --c: #b9c0c9; }
  /* Animations of the illustration. */
  .scene .blink { animation: sc-blink 1.2s steps(2) infinite; }
  .scene .breeze path { animation: sc-breeze 2s ease-in-out infinite; }
  .scene .breeze path:nth-child(2) { animation-delay: -.66s; } .scene .breeze path:nth-child(3) { animation-delay: -1.33s; }
  .scene .rays { animation: sc-spin 12s linear infinite; transform-box: fill-box; transform-origin: center; }
  .scene .merc { transform-box: fill-box; transform-origin: 50% 100%; }
  .scene .merc.rise { animation: sc-rise 4s ease-in-out infinite; }
  .scene .merc.fall { animation: sc-fall 4s ease-in-out infinite; }
  .scene .snow { animation: sc-bob 3s ease-in-out infinite; }
  .scene .heat path { animation: sc-heat 2s ease-out infinite; }
  .scene .heat path:nth-child(2) { animation-delay: -.66s; } .scene .heat path:nth-child(3) { animation-delay: -1.33s; }
  .scene .pulse { animation: sc-pulse 2s ease-in-out infinite; }
  @keyframes sc-blink { 50% { opacity: .2; } }
  @keyframes sc-breeze { 0% { opacity: 0; transform: translateY(-3px); } 40% { opacity: 1; } 100% { opacity: 0; transform: translateY(5px); } }
  @keyframes sc-spin { to { transform: rotate(360deg); } }
  @keyframes sc-rise { 50% { transform: scaleY(1.1); } }
  @keyframes sc-fall { from { transform: scaleY(1.4); } to { transform: scaleY(1); } }
  @keyframes sc-bob { 50% { transform: translateY(2px); } }
  @keyframes sc-heat { from { opacity: .9; transform: translateY(2px); } to { opacity: 0; transform: translateY(-5px); } }
  @keyframes sc-pulse { 50% { opacity: .55; } }
  @media (prefers-reduced-motion: reduce) {
    .scene * { animation: none !important; }
  }
  /* A very narrow card keeps the wall and the floor for its texts: no illustration. */
  @container (max-width: 220px) {
    .banner .scene { display: none; }
    .banner .head { right: 0; padding-right: 34px; }
  }
`;


const STYLE = `
  :host { display: block; }
  ha-card { container: sc-card / inline-size; overflow: hidden; }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 16px 4px; }
  ${HEADER_STYLE}
  ${TITLE_STYLE}
  ${BANNER_STYLE}
  .header.banner { padding: 0; margin-bottom: 4px; }
  .body { padding: 0 16px 12px; }
  .body.flat { padding: 0; }
  .empty { color: var(--secondary-text-color); padding: 12px 0; }
  .day { margin: 14px 0 4px; font-size: 13px; font-weight: 500; color: var(--secondary-text-color); }
  .day::first-letter { text-transform: uppercase; }
  .row { display: flex; gap: 12px; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid var(--divider-color); }
  .row:last-child { border-bottom: none; }
  .row.clickable { cursor: pointer; border-radius: 4px; }
  .row.clickable:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  .badge { flex: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12); color: var(--primary-color); --mdc-icon-size: 20px; }
  .row.lighting .badge, .row.presence_on .badge, .row.presence_off .badge { background: rgba(255, 166, 0, 0.14); color: var(--warning-color, #ffa600); }
  .row.notified .badge, .row.cleared .badge { background: rgba(var(--rgb-info-color, 3, 155, 229), 0.12); color: var(--info-color, #039be5); }
  .row.notified.warning .badge { background: rgba(255, 166, 0, 0.14); color: var(--warning-color, #ffa600); }
  .row.notified.critical .badge, .row.failed .badge { background: rgba(219, 68, 55, 0.12); color: var(--error-color, #db4437); }
  .row.manual .badge, .row.display .badge { background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.06); color: var(--secondary-text-color); }
  .main { min-width: 0; flex: 1; }
  .what { font-size: 14px; line-height: 20px; overflow-wrap: anywhere; }
  .detail { font-size: 13px; color: var(--secondary-text-color); white-space: pre-line; margin-top: 2px; overflow-wrap: anywhere; }
  .meta { font-size: 12px; color: var(--secondary-text-color); margin-top: 2px; overflow-wrap: anywhere; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 4px 0 4px; }
  .chip { border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); border-radius: 16px;
    padding: 6px 12px; font: inherit; font-size: 13px; cursor: pointer; }
  .chip:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  /* Active filter: tinted, not filled, like the other active states of the panel. Its text is the primary
     colour toward the text colour, readable (WCAG AA) on the tint in light and dark themes. */
  .chip.active { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12); border-color: var(--primary-color);
    color: color-mix(in srgb, var(--primary-color) 60%, var(--primary-text-color)); }
`;

if (!customElements.get("smart-comfort-activity-card")) {
  customElements.define("smart-comfort-activity-card", SmartComfortActivityCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "smart-comfort-activity-card",
    name: "Smart Comfort activity",
    description: "What Smart Comfort did and why, live: devices, lights, notifications, changes by hand.",
    preview: false,
  });
}
