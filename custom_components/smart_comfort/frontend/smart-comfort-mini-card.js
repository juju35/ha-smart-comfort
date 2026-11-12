/**
 * Smart Comfort mini card: the alerts of the moment and the switches of Smart Comfort, at a glance.
 * Its button at the top right switches it to the full card (every alert, the rooms, the latest activity) and back;
 * a click anywhere outside the card brings it back to the compact view. It reads the entities of the integration,
 * so it works for any user.
 *
 * type: custom:smart-comfort-mini-card
 * title: Smart Comfort      # optional ("" for the default)
 * rooms: [Séjour, Chambre]  # optional: only these rooms, by their name in the panel
 * alerts: 3                 # alerts listed in the compact view
 * activity: 5               # activity entries in the full card (0: none)
 * zoom: false               # optional: no full card button
 */

const STRINGS = {
  en: {
    title: "Smart Comfort",
    not_loaded: "Smart Comfort is not loaded.",
    all_good: "All good",
    alerts_one: "{n} alert",
    alerts_other: "{n} alerts",
    no_alerts: "No alerts",
    outside: "Outside {value}",
    ext: "outside",
    level: "index {value}",
    since: "since {time}",
    snoozed: "Snoozed",
    handled: "Handled by a device",
    acknowledged: "Seen",
    alerts_title: "Alerts",
    rooms: "Rooms",
    activity: "Activity",
    sw_notifications: "Notifications",
    sw_control: "Devices",
    sw_lighting: "Lighting",
    on: "on",
    off: "off",
    zoom_in: "Full card",
    zoom_out: "Compact view",
    f_title: "Title",
    f_show_title: "Show title",
    f_show_subtitle: "Show subtitle",
    f_rooms: "Rooms",
    f_alerts: "Alerts in the compact view",
    f_activity: "Activity entries in the full card",
    h_rooms: "Only these rooms, by their name in the panel (empty: all rooms)",
    h_activity: "0: no activity",
  },
  fr: {
    title: "Smart Comfort",
    not_loaded: "Smart Comfort n'est pas chargé.",
    all_good: "Tout va bien",
    alerts_one: "{n} alerte",
    alerts_other: "{n} alertes",
    no_alerts: "Aucune alerte",
    outside: "Dehors {value}",
    ext: "ext.",
    level: "indice {value}",
    since: "depuis {time}",
    snoozed: "En sourdine",
    handled: "Pris en charge par un appareil",
    acknowledged: "Vu",
    alerts_title: "Alertes",
    rooms: "Pièces",
    activity: "Activité",
    sw_notifications: "Notifications",
    sw_control: "Appareils",
    sw_lighting: "Éclairage",
    on: "activé",
    off: "désactivé",
    zoom_in: "Carte complète",
    zoom_out: "Vue compacte",
    f_title: "Titre",
    f_show_title: "Afficher le titre",
    f_show_subtitle: "Afficher le sous-titre",
    f_rooms: "Pièces",
    f_alerts: "Alertes en vue compacte",
    f_activity: "Entrées d'activité dans la carte complète",
    h_rooms: "Seulement ces pièces, par leur nom dans le panneau (vide : toutes les pièces)",
    h_activity: "0 : pas d'activité",
  },
  de: {
    title: "Smart Comfort",
    not_loaded: "Smart Comfort ist nicht geladen.",
    all_good: "Alles in Ordnung",
    alerts_one: "{n} Warnung",
    alerts_other: "{n} Warnungen",
    no_alerts: "Keine Warnungen",
    outside: "Draußen {value}",
    ext: "außen",
    level: "Index {value}",
    since: "seit {time}",
    snoozed: "Stummgeschaltet",
    handled: "Von einem Gerät übernommen",
    acknowledged: "Gesehen",
    alerts_title: "Warnungen",
    rooms: "Räume",
    activity: "Aktivität",
    sw_notifications: "Benachrichtigungen",
    sw_control: "Geräte",
    sw_lighting: "Beleuchtung",
    on: "an",
    off: "aus",
    zoom_in: "Vollständige Karte",
    zoom_out: "Kompakte Ansicht",
    f_title: "Titel",
    f_show_title: "Titel anzeigen",
    f_show_subtitle: "Untertitel anzeigen",
    f_rooms: "Räume",
    f_alerts: "Warnungen in der kompakten Ansicht",
    f_activity: "Aktivitätseinträge in der vollständigen Karte",
    h_rooms: "Nur diese Räume, mit ihrem Namen im Panel (leer: alle Räume)",
    h_activity: "0: keine Aktivität",
  },
  es: {
    title: "Smart Comfort",
    not_loaded: "Smart Comfort no está cargado.",
    all_good: "Todo bien",
    alerts_one: "{n} alerta",
    alerts_other: "{n} alertas",
    no_alerts: "Ninguna alerta",
    outside: "Fuera {value}",
    ext: "ext.",
    level: "índice {value}",
    since: "desde las {time}",
    snoozed: "Silenciada",
    handled: "Lo gestiona un aparato",
    acknowledged: "Vista",
    alerts_title: "Alertas",
    rooms: "Habitaciones",
    activity: "Actividad",
    sw_notifications: "Notificaciones",
    sw_control: "Aparatos",
    sw_lighting: "Iluminación",
    on: "activado",
    off: "desactivado",
    zoom_in: "Tarjeta completa",
    zoom_out: "Vista compacta",
    f_title: "Título",
    f_show_title: "Mostrar el título",
    f_show_subtitle: "Mostrar el subtítulo",
    f_rooms: "Habitaciones",
    f_alerts: "Alertas en la vista compacta",
    f_activity: "Entradas de actividad en la tarjeta completa",
    h_rooms: "Solo estas habitaciones, por su nombre en el panel (vacío: todas)",
    h_activity: "0: sin actividad",
  },
  sr: {
    title: "Smart Comfort",
    not_loaded: "Smart Comfort није учитан.",
    all_good: "Све је у реду",
    alerts_one: "{n} упозорење",
    alerts_few: "{n} упозорења",
    alerts_other: "{n} упозорења",
    no_alerts: "Нема упозорења",
    outside: "Напољу {value}",
    ext: "напољу",
    level: "индекс {value}",
    since: "од {time}",
    snoozed: "Утишано",
    handled: "Уређај се стара о томе",
    acknowledged: "Виђено",
    alerts_title: "Упозорења",
    rooms: "Собе",
    activity: "Активност",
    sw_notifications: "Обавештења",
    sw_control: "Уређаји",
    sw_lighting: "Осветљење",
    on: "укључено",
    off: "искључено",
    zoom_in: "Пуна картица",
    zoom_out: "Сажети приказ",
    f_title: "Наслов",
    f_show_title: "Прикажи наслов",
    f_show_subtitle: "Прикажи поднаслов",
    f_rooms: "Собе",
    f_alerts: "Упозорења у сажетом приказу",
    f_activity: "Ставке активности у пуној картици",
    h_rooms: "Само ове собе, по називу у панелу (празно: све собе)",
    h_activity: "0: без активности",
  },
  "sr-Latn": {
    title: "Smart Comfort",
    not_loaded: "Smart Comfort nije učitan.",
    all_good: "Sve je u redu",
    alerts_one: "{n} upozorenje",
    alerts_few: "{n} upozorenja",
    alerts_other: "{n} upozorenja",
    no_alerts: "Nema upozorenja",
    outside: "Napolju {value}",
    ext: "napolju",
    level: "indeks {value}",
    since: "od {time}",
    snoozed: "Utišano",
    handled: "Uređaj se stara o tome",
    acknowledged: "Viđeno",
    alerts_title: "Upozorenja",
    rooms: "Sobe",
    activity: "Aktivnost",
    sw_notifications: "Obaveštenja",
    sw_control: "Uređaji",
    sw_lighting: "Osvetljenje",
    on: "uključeno",
    off: "isključeno",
    zoom_in: "Puna kartica",
    zoom_out: "Sažeti prikaz",
    f_title: "Naslov",
    f_show_title: "Prikaži naslov",
    f_show_subtitle: "Prikaži podnaslov",
    f_rooms: "Sobe",
    f_alerts: "Upozorenja u sažetom prikazu",
    f_activity: "Stavke aktivnosti u punoj kartici",
    h_rooms: "Samo ove sobe, po nazivu u panelu (prazno: sve sobe)",
    h_activity: "0: bez aktivnosti",
  },
  it: {
    title: "Smart Comfort",
    not_loaded: "Smart Comfort non è caricato.",
    all_good: "Tutto a posto",
    alerts_one: "{n} avviso",
    alerts_other: "{n} avvisi",
    no_alerts: "Nessun avviso",
    outside: "Fuori {value}",
    ext: "est.",
    level: "indice {value}",
    since: "dalle {time}",
    snoozed: "Silenziato",
    handled: "Gestito da un dispositivo",
    acknowledged: "Visto",
    alerts_title: "Avvisi",
    rooms: "Stanze",
    activity: "Attività",
    sw_notifications: "Notifiche",
    sw_control: "Dispositivi",
    sw_lighting: "Illuminazione",
    on: "attivo",
    off: "disattivo",
    zoom_in: "Scheda completa",
    zoom_out: "Vista compatta",
    f_title: "Titolo",
    f_show_title: "Mostra il titolo",
    f_show_subtitle: "Mostra il sottotitolo",
    f_rooms: "Stanze",
    f_alerts: "Avvisi nella vista compatta",
    f_activity: "Voci di attività nella scheda completa",
    h_rooms: "Solo queste stanze, con il loro nome nel pannello (vuoto: tutte le stanze)",
    h_activity: "0: nessuna attività",
  },
  nl: {
    title: "Smart Comfort",
    not_loaded: "Smart Comfort is niet geladen.",
    all_good: "Alles in orde",
    alerts_one: "{n} waarschuwing",
    alerts_other: "{n} waarschuwingen",
    no_alerts: "Geen waarschuwingen",
    outside: "Buiten {value}",
    ext: "buiten",
    level: "index {value}",
    since: "sinds {time}",
    snoozed: "Gedempt",
    handled: "Door een apparaat afgehandeld",
    acknowledged: "Gezien",
    alerts_title: "Waarschuwingen",
    rooms: "Kamers",
    activity: "Activiteit",
    sw_notifications: "Meldingen",
    sw_control: "Apparaten",
    sw_lighting: "Verlichting",
    on: "aan",
    off: "uit",
    zoom_in: "Volledige kaart",
    zoom_out: "Compacte weergave",
    f_title: "Titel",
    f_show_title: "Titel tonen",
    f_show_subtitle: "Ondertitel tonen",
    f_rooms: "Kamers",
    f_alerts: "Waarschuwingen in de compacte weergave",
    f_activity: "Activiteitsitems in de volledige kaart",
    h_rooms: "Alleen deze kamers, met hun naam in het paneel (leeg: alle kamers)",
    h_activity: "0: geen activiteit",
  },
  pt: {
    title: "Smart Comfort",
    not_loaded: "O Smart Comfort não está carregado.",
    all_good: "Tudo bem",
    alerts_one: "{n} alerta",
    alerts_other: "{n} alertas",
    no_alerts: "Nenhum alerta",
    outside: "Lá fora {value}",
    ext: "ext.",
    level: "índice {value}",
    since: "desde as {time}",
    snoozed: "Silenciado",
    handled: "Tratado por um dispositivo",
    acknowledged: "Visto",
    alerts_title: "Alertas",
    rooms: "Divisões",
    activity: "Atividade",
    sw_notifications: "Notificações",
    sw_control: "Dispositivos",
    sw_lighting: "Iluminação",
    on: "ligado",
    off: "desligado",
    zoom_in: "Cartão completo",
    zoom_out: "Vista compacta",
    f_title: "Título",
    f_show_title: "Mostrar o título",
    f_show_subtitle: "Mostrar o subtítulo",
    f_rooms: "Divisões",
    f_alerts: "Alertas na vista compacta",
    f_activity: "Entradas de atividade no cartão completo",
    h_rooms: "Apenas estas divisões, pelo nome no painel (vazio: todas as divisões)",
    h_activity: "0: sem atividade",
  },
  pl: {
    title: "Smart Comfort",
    not_loaded: "Smart Comfort nie jest załadowany.",
    all_good: "Wszystko w porządku",
    alerts_one: "{n} alert",
    alerts_few: "{n} alerty",
    alerts_many: "{n} alertów",
    alerts_other: "{n} alertu",
    no_alerts: "Brak alertów",
    outside: "Na zewnątrz {value}",
    ext: "zewn.",
    level: "indeks {value}",
    since: "od {time}",
    snoozed: "Wyciszone",
    handled: "Obsługiwane przez urządzenie",
    acknowledged: "Widziane",
    alerts_title: "Alerty",
    rooms: "Pomieszczenia",
    activity: "Aktywność",
    sw_notifications: "Powiadomienia",
    sw_control: "Urządzenia",
    sw_lighting: "Oświetlenie",
    on: "włączone",
    off: "wyłączone",
    zoom_in: "Pełna karta",
    zoom_out: "Widok kompaktowy",
    f_title: "Tytuł",
    f_show_title: "Pokaż tytuł",
    f_show_subtitle: "Pokaż podtytuł",
    f_rooms: "Pomieszczenia",
    f_alerts: "Alerty w widoku kompaktowym",
    f_activity: "Wpisy aktywności w pełnej karcie",
    h_rooms: "Tylko te pomieszczenia, według nazwy w panelu (puste: wszystkie)",
    h_activity: "0: bez aktywności",
  },
  ro: {
    title: "Smart Comfort",
    not_loaded: "Smart Comfort nu este încărcat.",
    all_good: "Totul e bine",
    alerts_one: "{n} alertă",
    alerts_few: "{n} alerte",
    alerts_other: "{n} de alerte",
    no_alerts: "Nicio alertă",
    outside: "Afară {value}",
    ext: "afară",
    level: "indice {value}",
    since: "din {time}",
    snoozed: "Amânată",
    handled: "Gestionată de un aparat",
    acknowledged: "Văzută",
    alerts_title: "Alerte",
    rooms: "Camere",
    activity: "Activitate",
    sw_notifications: "Notificări",
    sw_control: "Aparate",
    sw_lighting: "Iluminare",
    on: "activat",
    off: "dezactivat",
    zoom_in: "Card complet",
    zoom_out: "Vizualizare compactă",
    f_title: "Titlu",
    f_show_title: "Afișează titlul",
    f_show_subtitle: "Afișează subtitlul",
    f_rooms: "Camere",
    f_alerts: "Alerte în vizualizarea compactă",
    f_activity: "Intrări de activitate în cardul complet",
    h_rooms: "Doar aceste camere, după numele lor din panou (gol: toate camerele)",
    h_activity: "0: fără activitate",
  },
  da: {
    title: "Smart Comfort",
    not_loaded: "Smart Comfort er ikke indlæst.",
    all_good: "Alt er i orden",
    alerts_one: "{n} advarsel",
    alerts_other: "{n} advarsler",
    no_alerts: "Ingen advarsler",
    outside: "Ude {value}",
    ext: "ude",
    level: "indeks {value}",
    since: "siden {time}",
    snoozed: "Udsat",
    handled: "Håndteres af en enhed",
    acknowledged: "Set",
    alerts_title: "Advarsler",
    rooms: "Rum",
    activity: "Aktivitet",
    sw_notifications: "Notifikationer",
    sw_control: "Enheder",
    sw_lighting: "Belysning",
    on: "til",
    off: "fra",
    zoom_in: "Fuldt kort",
    zoom_out: "Kompakt visning",
    f_title: "Titel",
    f_show_title: "Vis titel",
    f_show_subtitle: "Vis undertitel",
    f_rooms: "Rum",
    f_alerts: "Advarsler i kompakt visning",
    f_activity: "Aktivitetsposter i det fulde kort",
    h_rooms: "Kun disse rum, efter deres navn i panelet (tomt: alle rum)",
    h_activity: "0: ingen aktivitet",
  },
  sv: {
    title: "Smart Comfort",
    not_loaded: "Smart Comfort är inte inläst.",
    all_good: "Allt är bra",
    alerts_one: "{n} varning",
    alerts_other: "{n} varningar",
    no_alerts: "Inga varningar",
    outside: "Ute {value}",
    ext: "ute",
    level: "index {value}",
    since: "sedan {time}",
    snoozed: "Snoozad",
    handled: "Hanteras av en enhet",
    acknowledged: "Sedd",
    alerts_title: "Varningar",
    rooms: "Rum",
    activity: "Aktivitet",
    sw_notifications: "Aviseringar",
    sw_control: "Enheter",
    sw_lighting: "Belysning",
    on: "på",
    off: "av",
    zoom_in: "Fullständigt kort",
    zoom_out: "Kompakt vy",
    f_title: "Titel",
    f_show_title: "Visa rubrik",
    f_show_subtitle: "Visa underrubrik",
    f_rooms: "Rum",
    f_alerts: "Varningar i kompakt vy",
    f_activity: "Aktivitetsposter i det fullständiga kortet",
    h_rooms: "Bara dessa rum, efter sitt namn i panelen (tomt: alla rum)",
    h_activity: "0: ingen aktivitet",
  },
  bg: {
    title: "Smart Comfort",
    not_loaded: "Smart Comfort не е зареден.",
    all_good: "Всичко наред",
    alerts_one: "{n} сигнал",
    alerts_other: "{n} сигнала",
    no_alerts: "Няма сигнали",
    outside: "Навън {value}",
    ext: "навън",
    level: "индекс {value}",
    since: "от {time}",
    snoozed: "Отложено",
    handled: "Овладяно от устройство",
    acknowledged: "Видяно",
    alerts_title: "Сигнали",
    rooms: "Стаи",
    activity: "Дейност",
    sw_notifications: "Известия",
    sw_control: "Устройства",
    sw_lighting: "Осветление",
    on: "вкл.",
    off: "изкл.",
    zoom_in: "Пълна карта",
    zoom_out: "Компактен изглед",
    f_title: "Заглавие",
    f_show_title: "Показване на заглавието",
    f_show_subtitle: "Показване на подзаглавието",
    f_rooms: "Стаи",
    f_alerts: "Сигнали в компактния изглед",
    f_activity: "Записи за дейност в пълната карта",
    h_rooms: "Само тези стаи, по името им в панела (празно: всички стаи)",
    h_activity: "0: без дейност",
  },
  ru: {
    title: "Smart Comfort",
    not_loaded: "Smart Comfort не загружен.",
    all_good: "Всё в порядке",
    alerts_one: "{n} оповещение",
    alerts_few: "{n} оповещения",
    alerts_many: "{n} оповещений",
    alerts_other: "{n} оповещения",
    no_alerts: "Нет оповещений",
    outside: "На улице {value}",
    ext: "улица",
    level: "индекс {value}",
    since: "с {time}",
    snoozed: "Отложено",
    handled: "Устройство справляется",
    acknowledged: "Просмотрено",
    alerts_title: "Оповещения",
    rooms: "Комнаты",
    activity: "Активность",
    sw_notifications: "Уведомления",
    sw_control: "Устройства",
    sw_lighting: "Освещение",
    on: "вкл.",
    off: "выкл.",
    zoom_in: "Полная карточка",
    zoom_out: "Компактный вид",
    f_title: "Заголовок",
    f_show_title: "Показывать заголовок",
    f_show_subtitle: "Показывать подзаголовок",
    f_rooms: "Комнаты",
    f_alerts: "Оповещения в компактном виде",
    f_activity: "Записи активности в полной карточке",
    h_rooms: "Только эти комнаты, по их названию на панели (пусто: все комнаты)",
    h_activity: "0: без активности",
  },
  uk: {
    title: "Smart Comfort",
    not_loaded: "Smart Comfort не завантажено.",
    all_good: "Усе гаразд",
    alerts_one: "{n} попередження",
    alerts_few: "{n} попередження",
    alerts_many: "{n} попереджень",
    alerts_other: "{n} попередження",
    no_alerts: "Немає попереджень",
    outside: "Надворі {value}",
    ext: "надворі",
    level: "індекс {value}",
    since: "з {time}",
    snoozed: "Відкладено",
    handled: "Пристрій дає раду",
    acknowledged: "Переглянуто",
    alerts_title: "Попередження",
    rooms: "Кімнати",
    activity: "Активність",
    sw_notifications: "Сповіщення",
    sw_control: "Пристрої",
    sw_lighting: "Освітлення",
    on: "увімк.",
    off: "вимк.",
    zoom_in: "Повна картка",
    zoom_out: "Компактний вигляд",
    f_title: "Заголовок",
    f_show_title: "Показувати заголовок",
    f_show_subtitle: "Показувати підзаголовок",
    f_rooms: "Кімнати",
    f_alerts: "Попередження в компактному вигляді",
    f_activity: "Записи активності в повній картці",
    h_rooms: "Лише ці кімнати, за їхньою назвою на панелі (порожньо: усі кімнати)",
    h_activity: "0: без активності",
  },
  hu: {
    title: "Smart Comfort",
    not_loaded: "A Smart Comfort nincs betöltve.",
    all_good: "Rendben",
    alerts_one: "{n} riasztás",
    alerts_other: "{n} riasztás",
    no_alerts: "Nincs riasztás",
    outside: "Kint {value}",
    ext: "kint",
    level: "index {value}",
    since: "{time} óta",
    snoozed: "Szundizva",
    handled: "Egy eszköz kezeli",
    acknowledged: "Látta",
    alerts_title: "Riasztások",
    rooms: "Helyiségek",
    activity: "Tevékenység",
    sw_notifications: "Értesítések",
    sw_control: "Eszközök",
    sw_lighting: "Világítás",
    on: "be",
    off: "ki",
    zoom_in: "Teljes kártya",
    zoom_out: "Kompakt nézet",
    f_title: "Cím",
    f_show_title: "Cím megjelenítése",
    f_show_subtitle: "Alcím megjelenítése",
    f_rooms: "Helyiségek",
    f_alerts: "Riasztások a kompakt nézetben",
    f_activity: "Tevékenység-bejegyzések a teljes kártyán",
    h_rooms: "Csak ezek a helyiségek, a panelen látható nevük szerint (üres: minden helyiség)",
    h_activity: "0: nincs tevékenység",
  },
  sk: {
    title: "Smart Comfort",
    not_loaded: "Smart Comfort nie je načítaný.",
    all_good: "V poriadku",
    alerts_one: "{n} upozornenie",
    alerts_few: "{n} upozornenia",
    alerts_many: "{n} upozornenia",
    alerts_other: "{n} upozornení",
    no_alerts: "Žiadne upozornenia",
    outside: "Vonku {value}",
    ext: "vonku",
    level: "index {value}",
    since: "od {time}",
    snoozed: "Odložené",
    handled: "Rieši to zariadenie",
    acknowledged: "Videné",
    alerts_title: "Upozornenia",
    rooms: "Miestnosti",
    activity: "Aktivita",
    sw_notifications: "Oznámenia",
    sw_control: "Zariadenia",
    sw_lighting: "Osvetlenie",
    on: "zap.",
    off: "vyp.",
    zoom_in: "Celá karta",
    zoom_out: "Kompaktné zobrazenie",
    f_title: "Názov",
    f_show_title: "Zobraziť názov",
    f_show_subtitle: "Zobraziť podnázov",
    f_rooms: "Miestnosti",
    f_alerts: "Upozornenia v kompaktnom zobrazení",
    f_activity: "Záznamy aktivity v celej karte",
    h_rooms: "Len tieto miestnosti, podľa názvu na paneli (prázdne: všetky miestnosti)",
    h_activity: "0: bez aktivity",
  },
  cs: {
    title: "Smart Comfort",
    not_loaded: "Smart Comfort není načten.",
    all_good: "Vše v pořádku",
    alerts_one: "{n} upozornění",
    alerts_other: "{n} upozornění",
    no_alerts: "Žádná upozornění",
    outside: "Venku {value}",
    ext: "venku",
    level: "index {value}",
    since: "od {time}",
    snoozed: "Odloženo",
    handled: "Řeší to zařízení",
    acknowledged: "Viděno",
    alerts_title: "Upozornění",
    rooms: "Místnosti",
    activity: "Aktivita",
    sw_notifications: "Oznámení",
    sw_control: "Zařízení",
    sw_lighting: "Osvětlení",
    on: "zap.",
    off: "vyp.",
    zoom_in: "Celá karta",
    zoom_out: "Kompaktní zobrazení",
    f_title: "Název",
    f_show_title: "Zobrazit název",
    f_show_subtitle: "Zobrazit podnázev",
    f_rooms: "Místnosti",
    f_alerts: "Upozornění v kompaktním zobrazení",
    f_activity: "Záznamy aktivity v celé kartě",
    h_rooms: "Jen tyto místnosti, podle názvu na panelu (prázdné: všechny místnosti)",
    h_activity: "0: bez aktivity",
  },
  sl: {
    title: "Smart Comfort",
    not_loaded: "Smart Comfort ni naložen.",
    all_good: "Vse v redu",
    alerts_one: "{n} opozorilo",
    alerts_two: "{n} opozorili",
    alerts_few: "{n} opozorila",
    alerts_other: "{n} opozoril",
    no_alerts: "Ni opozoril",
    outside: "Zunaj {value}",
    ext: "zunaj",
    level: "indeks {value}",
    since: "od {time}",
    snoozed: "Odloženo",
    handled: "Za to skrbi naprava",
    acknowledged: "Videno",
    alerts_title: "Opozorila",
    rooms: "Prostori",
    activity: "Dejavnost",
    sw_notifications: "Obvestila",
    sw_control: "Naprave",
    sw_lighting: "Razsvetljava",
    on: "vklop",
    off: "izklop",
    zoom_in: "Polna kartica",
    zoom_out: "Strnjen pogled",
    f_title: "Naslov",
    f_show_title: "Prikaži naslov",
    f_show_subtitle: "Prikaži podnaslov",
    f_rooms: "Prostori",
    f_alerts: "Opozorila v strnjenem pogledu",
    f_activity: "Vnosi dejavnosti v polni kartici",
    h_rooms: "Le ti prostori, po imenu na plošči (prazno: vsi prostori)",
    h_activity: "0: brez dejavnosti",
  },
  lv: {
    title: "Smart Comfort",
    not_loaded: "Smart Comfort nav ielādēts.",
    all_good: "Viss kārtībā",
    alerts_one: "{n} brīdinājums",
    alerts_zero: "{n} brīdinājumu",
    alerts_other: "{n} brīdinājumi",
    no_alerts: "Nav brīdinājumu",
    outside: "Ārā {value}",
    ext: "ārā",
    level: "indekss {value}",
    since: "kopš {time}",
    snoozed: "Atlikts",
    handled: "Risina ierīce",
    acknowledged: "Redzēts",
    alerts_title: "Brīdinājumi",
    rooms: "Telpas",
    activity: "Aktivitāte",
    sw_notifications: "Paziņojumi",
    sw_control: "Ierīces",
    sw_lighting: "Apgaismojums",
    on: "ieslēgts",
    off: "izslēgts",
    zoom_in: "Pilna kartīte",
    zoom_out: "Kompakts skats",
    f_title: "Virsraksts",
    f_show_title: "Rādīt virsrakstu",
    f_show_subtitle: "Rādīt apakšvirsrakstu",
    f_rooms: "Telpas",
    f_alerts: "Brīdinājumi kompaktajā skatā",
    f_activity: "Aktivitātes ieraksti pilnajā kartītē",
    h_rooms: "Tikai šīs telpas, pēc to nosaukuma panelī (tukšs: visas telpas)",
    h_activity: "0: bez aktivitātes",
  },
  el: {
    title: "Smart Comfort",
    not_loaded: "Το Smart Comfort δεν έχει φορτωθεί.",
    all_good: "Όλα καλά",
    alerts_one: "{n} προειδοποίηση",
    alerts_other: "{n} προειδοποιήσεις",
    no_alerts: "Καμία προειδοποίηση",
    outside: "Έξω {value}",
    ext: "έξω",
    level: "δείκτης {value}",
    since: "από {time}",
    snoozed: "Σε αναβολή",
    handled: "Το αντιμετωπίζει μια συσκευή",
    acknowledged: "Το είδατε",
    alerts_title: "Προειδοποιήσεις",
    rooms: "Δωμάτια",
    activity: "Δραστηριότητα",
    sw_notifications: "Ειδοποιήσεις",
    sw_control: "Συσκευές",
    sw_lighting: "Φωτισμός",
    on: "ενεργό",
    off: "ανενεργό",
    zoom_in: "Πλήρης κάρτα",
    zoom_out: "Συμπαγής προβολή",
    f_title: "Τίτλος",
    f_show_title: "Εμφάνιση τίτλου",
    f_show_subtitle: "Εμφάνιση υπότιτλου",
    f_rooms: "Δωμάτια",
    f_alerts: "Προειδοποιήσεις στη συμπαγή προβολή",
    f_activity: "Εγγραφές δραστηριότητας στην πλήρη κάρτα",
    h_rooms: "Μόνο αυτά τα δωμάτια, με το όνομά τους στον πίνακα (κενό: όλα τα δωμάτια)",
    h_activity: "0: χωρίς δραστηριότητα",
  },
};

// The activity card's module, the very one of the dashboard resource (same version): its helpers, and the
// activity card shown in the full card.
const { languageOf, el, HEADER_STYLE } = await import(
  new URL(`smart-comfort-activity-card.js${new URL(import.meta.url).search}`, import.meta.url).href
);
const { resolve: resolvedLanguage, stringsFor, intlLocale, translate } = languageOf(STRINGS);

const DOMAIN = "smart_comfort";
const KIND_ICONS = {
  too_hot: "mdi:thermometer-high",
  too_cold: "mdi:thermometer-low",
  ventilate: "mdi:window-open-variant",
  close_windows: "mdi:window-closed-variant",
  window_open_cold: "mdi:snowflake",
  co2_high: "mdi:molecule-co2",
  polluted_air: "mdi:blur",
  humidity_high: "mdi:water-percent",
  noise_high: "mdi:volume-high",
  noisy_outside: "mdi:ear-hearing",
  bad_air_outside: "mdi:air-filter",
};
// The switches of the integration, by translation key, in the order shown.
const SWITCHES = [
  ["notifications", "mdi:bell-outline", "mdi:bell-off-outline"],
  ["control", "mdi:fan", "mdi:fan"],
  ["lighting", "mdi:lightbulb-auto-outline", "mdi:lightbulb-auto-outline"],
];
const NBSP = " ";

// A click inside a dialog (more-info opened from the card, say) is not a click outside the card.
const inDialog = (ev) => ev.composedPath().some((n) => ["ha-more-info-dialog", "ha-dialog", "dialog"].includes(n.localName));

/** The entities of Smart Comfort in the entity registry: the alerts sensor, the room sensors, the switches. */
function findEntities(hass) {
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

/** The name of the room of a room sensor: its `room_name` attribute (set by the integration). */
const roomName = (state) => state?.attributes?.room_name ?? state?.attributes?.friendly_name ?? state?.entity_id;

class SmartComfortMiniCard extends HTMLElement {
  // The full card (smart-comfort-card) is this card always switched to its full view.
  static FULL = false;

  static getStubConfig() {
    return {};
  }

  static getConfigForm() {
    // Home Assistant's language when the label is asked for (the editor keeps the form).
    const hass = () => document.querySelector("home-assistant")?.hass;
    const t = (key) => stringsFor(hass()?.language)[key] ?? STRINGS.en[key];
    const rooms = findEntities(hass()).rooms.map((id) => roomName(hass()?.states?.[id]));
    return {
      schema: [
        { name: "title", selector: { text: {} } },
        { name: "show_title", default: true, selector: { boolean: {} } },
        { name: "show_subtitle", default: true, selector: { boolean: {} } },
        { name: "rooms", selector: { select: { multiple: true, custom_value: true, options: rooms } } },
        { name: "alerts", selector: { number: { min: 0, max: 10, mode: "box" } } },
        { name: "activity", selector: { number: { min: 0, max: 20, mode: "box" } } },
      ],
      computeLabel: (schema) => t(`f_${schema.name}`) || schema.name,
      computeHelper: (schema) => t(`h_${schema.name}`),
    };
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._zoomed = false;
    // A click outside the card, and not in a dialog opened from it, brings it back to the compact view.
    this._onOutside = (ev) => {
      if (this._zoomed && !ev.composedPath().includes(this) && !inDialog(ev)) this._setZoom(false);
    };
  }

  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("Invalid configuration");
    this._config = { alerts: 3, activity: 5, ...config };
    // show_title / show_subtitle: the header's title / subtitle, hidden by the stylesheet
    this.toggleAttribute?.("hide-title", config.show_title === false);
    this.toggleAttribute?.("hide-subtitle", config.show_subtitle === false);
    this._shown = undefined;
    if (this._activity) this._activity.setConfig(this._activityConfig());
    this._render();
  }

  // Rendered again only when what it shows changes: the language, the states of the entities of Smart Comfort.
  set hass(hass) {
    this._hass = hass;
    if (this._activity) this._activity.hass = hass;
    if (this._signature() !== this._shown) this._render();
  }

  connectedCallback() {
    document.addEventListener("click", this._onOutside, true);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this._onOutside, true);
  }

  getCardSize() {
    if (this._zoomed) return 8;
    return 2 + Math.min(this._config?.alerts ?? 3, this._alerts().length);
  }

  getGridOptions() {
    return this._zoomed ? { columns: 12, min_columns: 6 } : { columns: 6, min_columns: 6 };
  }

  _t(key, values = {}) {
    return translate(this._hass?.language, key, values);
  }

  /** "{n} alerts", with the plural form of the language (one, few, many, other). */
  _count(n) {
    let form = "other";
    try {
      form = new Intl.PluralRules(resolvedLanguage(this._hass?.language)).select(n);
    } catch (_err) {
      // An unknown locale: other.
    }
    const strings = stringsFor(this._hass?.language);
    const key = `alerts_${form}` in strings ? `alerts_${form}` : "alerts_other";
    return this._t(key, { n: this._number(n, 0) });
  }

  _number(value, digits = 1) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return "–";
    return new Intl.NumberFormat(intlLocale(this._hass), { maximumFractionDigits: digits }).format(Number(value));
  }

  _temp(value) {
    return `${this._number(value)}${NBSP}°C`;
  }

  _time(iso) {
    return new Date(iso).toLocaleTimeString(intlLocale(this._hass), { hour: "2-digit", minute: "2-digit" });
  }

  /** The translated name of an alert kind (the states of the room sensors), else the kind itself. */
  _kind(kind) {
    const text = this._hass?.localize?.(`component.${DOMAIN}.entity.sensor.room.state.${kind}`);
    return text || kind.replace(/_/g, " ");
  }

  _state(id) {
    return id ? this._hass?.states?.[id] : undefined;
  }

  _rooms() {
    const only = this._config?.rooms;
    const ids = findEntities(this._hass).rooms.filter((id) => this._state(id));
    return only?.length ? ids.filter((id) => only.includes(roomName(this._state(id)))) : ids;
  }

  /** The active alerts (of the configured rooms), the ones to deal with first. */
  _alerts() {
    const list = this._state(findEntities(this._hass).alerts)?.attributes?.alerts;
    if (!Array.isArray(list)) return [];
    const only = this._config?.rooms;
    const alerts = only?.length ? list.filter((a) => only.includes(a.room_name)) : list;
    const quiet = (a) => (a.snoozed || a.handled ? 1 : 0);
    return [...alerts].sort((a, b) => quiet(a) - quiet(b));
  }

  /** The reading of an alert, in a few characters, in the unit of its kind. */
  _value(alert) {
    const ext = this._t("ext");
    switch (alert.kind) {
      case "too_hot":
      case "too_cold":
        return this._temp(alert.value);
      case "ventilate":
      case "close_windows":
        return `${this._temp(alert.temperature)} · ${ext} ${this._temp(alert.outdoor)}`;
      case "window_open_cold":
        return `${ext} ${this._temp(alert.outdoor ?? alert.value)}`;
      case "co2_high":
        return `${this._number(alert.value, 0)}${NBSP}ppm`;
      case "polluted_air":
        // Fine particles (PM2.5 or PM10), or the air quality index of the room.
        if (alert.metric === "aqi") return this._t("level", { value: this._number(alert.value, 0) });
        return `${this._number(alert.value, 0)}${NBSP}µg/m³`;
      case "humidity_high":
        return `${this._number(alert.value, 0)}${NBSP}%`;
      case "noise_high":
        return `${this._number(alert.value, 0)}${NBSP}dB`;
      case "noisy_outside":
        return `${ext} ${this._number(alert.outdoor_noise ?? alert.value, 0)}${NBSP}dB`;
      case "bad_air_outside":
        return `${ext} ${this._t("level", { value: this._number(alert.outdoor_air ?? alert.value, 0) })}`;
      default:
        return alert.value === null || alert.value === undefined ? "" : this._number(alert.value);
    }
  }

  /** What the card depends on: the language, the zoom, the states of the entities it shows. */
  _signature() {
    const found = findEntities(this._hass);
    const ids = [found.alerts, ...found.rooms, ...Object.values(found.switches)];
    const states = ids.map((id) => {
      const s = this._state(id);
      return s ? [s.state, s.last_updated, s.attributes] : null;
    });
    return JSON.stringify([this._hass?.language, this._zoomed, ids, states]);
  }

  _setZoom(zoomed) {
    this._zoomed = zoomed;
    this._render();
    // Lovelace sizes the card again.
    this.dispatchEvent(new Event("iron-resize", { bubbles: true, composed: true }));
  }

  _activityConfig() {
    return { title: "", limit: this._config.activity, ...(this._config.rooms?.length === 1 ? { room: this._config.rooms[0] } : {}) };
  }

  _render() {
    if (!this._config) return;
    this._shown = this._signature();
    const root = this.shadowRoot;
    const focusZoom = root.activeElement?.classList?.contains("zoom");
    const focusSwitch = root.activeElement?.dataset?.key;
    if (!this._card) {
      root.innerHTML = `<style>${STYLE}</style>`;
      this._card = document.createElement("ha-card");
      this._top = this._el("div", "top");
      this._extra = this._el("div", "extra");
      this._card.append(this._top, this._extra);
      root.append(this._card);
    }
    this._card.classList.toggle("zoomed", this._zoomed);
    const found = findEntities(this._hass);
    if (this._hass && !found.alerts) {
      this._top.replaceChildren(this._header(null), this._el("div", "empty", this._t("not_loaded")));
      this._showActivity(false);
      return;
    }
    const alerts = this._alerts();
    const children = [this._header(alerts)];
    if (this._zoomed) {
      children.push(this._section("alerts_title", this._alertList(alerts, alerts.length, true)));
      const rooms = this._rooms();
      if (rooms.length) children.push(this._section("rooms", this._roomGrid(rooms)));
      children.push(this._switches(found));
    } else {
      const shown = Math.max(0, this._config.alerts ?? 3);
      if (alerts.length && shown) children.push(this._alertList(alerts, shown, false));
      children.push(this._switches(found));
    }
    this._top.replaceChildren(...children);
    this._showActivity(this._zoomed && this._config.activity > 0);
    if (focusZoom) root.querySelector(".zoom")?.focus({ preventScroll: true });
    else if (focusSwitch) root.querySelector(`[data-key="${focusSwitch}"]`)?.focus({ preventScroll: true });
  }

  /** The latest activity, in the full card: the activity card, kept across renders (one subscription). */
  _showActivity(show) {
    if (!show) {
      this._extra.replaceChildren();
      return;
    }
    if (!this._activity) {
      // Defined by the module imported above.
      this._activity = document.createElement("smart-comfort-activity-card");
      // Its ha-card blends into this one: no second background, border or shadow.
      for (const [name, value] of [["--ha-card-background", "transparent"], ["--ha-card-box-shadow", "none"], ["--ha-card-border-width", "0"]]) {
        this._activity.style.setProperty(name, value);
      }
      this._activity.setConfig(this._activityConfig());
      if (this._hass) this._activity.hass = this._hass;
    }
    if (!this._extra.contains(this._activity)) {
      this._extra.replaceChildren(this._el("div", "section-title", this._t("activity")), this._activity);
    }
  }

  /** Header like the other cards: a tinted round badge, the title and the status, the zoom button at the right. */
  _header(alerts) {
    const header = this._el("div", "header");
    const badge = this._el("span", "hbadge");
    badge.append(this._icon("mdi:home-thermometer"));
    const titles = this._el("div", "titles");
    titles.append(this._el("div", "hname", this._config.title || this._t("title")));
    header.append(badge, titles);
    if (alerts) {
      const pending = alerts.filter((a) => !a.snoozed && !a.handled).length;
      const outdoor = this._state(findEntities(this._hass).alerts)?.attributes?.outdoor_temperature;
      const status = alerts.length ? this._count(alerts.length) : this._t("all_good");
      const parts = [status, outdoor === null || outdoor === undefined ? null : this._t("outside", { value: this._temp(outdoor) })];
      titles.append(this._el("div", "hsub", parts.filter(Boolean).join(" · ")));
      const level = pending ? "warning" : alerts.length ? "quiet" : "ok";
      const pill = this._el("span", `pill ${level}`, alerts.length ? this._number(alerts.length, 0) : "OK");
      pill.setAttribute("aria-hidden", "true");
      header.append(pill);
    }
    if (!this.constructor.FULL && this._config.zoom !== false) header.append(this._zoomButton());
    return header;
  }

  _zoomButton() {
    const label = this._t(this._zoomed ? "zoom_out" : "zoom_in");
    const button = this._el("button", "zoom");
    button.title = label;
    button.setAttribute("aria-label", label);
    button.setAttribute("aria-expanded", String(this._zoomed));
    button.append(this._icon(this._zoomed ? "mdi:arrow-collapse" : "mdi:arrow-expand"));
    button.addEventListener("click", (ev) => {
      ev.stopPropagation();
      this._setZoom(!this._zoomed);
    });
    return button;
  }

  _section(titleKey, content) {
    const section = this._el("div", "section");
    section.append(this._el("div", "section-title", this._t(titleKey)), content);
    return section;
  }

  /** The alerts, the first `max` of them (and how many more); in the full card, with since when and their state. */
  _alertList(alerts, max, full) {
    const list = this._el("div", "alerts");
    if (!alerts.length) {
      list.append(this._el("div", "empty", this._t("no_alerts")));
      return list;
    }
    const rooms = findEntities(this._hass).rooms;
    for (const alert of alerts.slice(0, max)) {
      const quiet = alert.snoozed || alert.handled;
      const row = this._el("div", `alert${quiet ? " quiet" : ""}`);
      const badge = this._el("span", "abadge");
      badge.append(this._icon(KIND_ICONS[alert.kind] || "mdi:alert-circle-outline"));
      const main = this._el("div", "amain");
      main.append(this._el("div", "awhat", `${alert.room_name} — ${this._kind(alert.kind)}`));
      if (full) {
        const meta = [alert.since ? this._t("since", { time: this._time(alert.since) }) : null];
        if (alert.snoozed) meta.push(this._t("snoozed"));
        if (alert.handled) meta.push(this._t("handled"));
        if (alert.acknowledged) meta.push(this._t("acknowledged"));
        main.append(this._el("div", "ameta", meta.filter(Boolean).join(" · ")));
      }
      row.append(badge, main, this._el("span", "avalue", this._value(alert)));
      const sensor = rooms.find((id) => roomName(this._state(id)) === alert.room_name);
      if (sensor) this._clickable(row, sensor);
      list.append(row);
    }
    if (alerts.length > max) list.append(this._el("div", "more", `+${this._number(alerts.length - max, 0)}`));
    return list;
  }

  /** The rooms: their temperature (else humidity, else CO₂, else PM2.5) and their worst alert. */
  _roomGrid(ids) {
    const grid = this._el("div", "rooms");
    for (const id of ids) {
      const state = this._state(id);
      const a = state.attributes || {};
      const alert = state.state !== "ok" && KIND_ICONS[state.state];
      const tile = this._el("div", `room${alert ? " alerting" : ""}`);
      tile.append(this._el("div", "rname", roomName(state)));
      let main = null;
      if (a.temperature !== null && a.temperature !== undefined) main = this._temp(a.temperature);
      const extras = [];
      if (a.humidity !== null && a.humidity !== undefined) extras.push(`${this._number(a.humidity, 0)}${NBSP}%`);
      if (a.co2 !== null && a.co2 !== undefined) extras.push(`${this._number(a.co2, 0)}${NBSP}ppm`);
      if (a.pm25 !== null && a.pm25 !== undefined) extras.push(`${this._number(a.pm25, 0)}${NBSP}µg/m³`);
      if (!main && extras.length) main = extras.shift();
      tile.append(this._el("div", "rvalue", main ?? "–"));
      const line = this._el("div", "rstate");
      if (alert) {
        line.append(this._icon(KIND_ICONS[state.state]), this._el("span", "", this._kind(state.state)));
      } else if (extras.length) {
        line.textContent = extras.join(" · ");
      } else {
        line.append(this._icon("mdi:check-circle-outline"), this._el("span", "", this._t("all_good")));
        line.classList.add("ok");
      }
      tile.append(line);
      this._clickable(tile, id);
      grid.append(tile);
    }
    return grid;
  }

  /** The switches of the integration: tinted when on, a tap turns them on or off. */
  _switches(found) {
    const row = this._el("div", "switches");
    for (const [key, iconOn, iconOff] of SWITCHES) {
      const id = found.switches[key];
      const state = this._state(id);
      if (!state) continue;
      const on = state.state === "on";
      const name = this._t(`sw_${key}`);
      const button = this._el("button", `switch${on ? " on" : ""}`);
      button.dataset.key = `switch:${key}`;
      button.title = `${name} — ${this._t(on ? "on" : "off")}`;
      button.setAttribute("aria-pressed", String(on));
      button.setAttribute("aria-label", name);
      button.disabled = state.state === "unavailable";
      button.append(this._icon(on ? iconOn : iconOff), this._el("span", "slabel", name));
      button.addEventListener("click", (ev) => {
        ev.stopPropagation();
        this._hass.callService("switch", on ? "turn_off" : "turn_on", { entity_id: id });
      });
      row.append(button);
    }
    return row;
  }

  /** Opens the more-info dialog of `entityId` on a click, Enter or Space. */
  _clickable(node, entityId) {
    node.classList.add("clickable");
    node.setAttribute("role", "button");
    node.setAttribute("tabindex", "0");
    const open = () => {
      const event = new Event("hass-more-info", { bubbles: true, composed: true });
      event.detail = { entityId };
      this.dispatchEvent(event);
    };
    node.addEventListener("click", open);
    node.addEventListener("keydown", (ev) => {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      ev.preventDefault();
      open();
    });
  }

  _icon(name) {
    const icon = document.createElement("ha-icon");
    icon.icon = name;
    return icon;
  }

  _el(tag, cls, text) {
    return el(tag, cls, text);
  }
}

const STYLE = `
  :host { display: block; }
  ha-card { container-type: inline-size; overflow: hidden; }
  .top { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
  .header { display: flex; align-items: center; gap: 10px; }
  ${HEADER_STYLE}
  .hsub { font-size: 12px; line-height: 16px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  :host([hide-title]) .titles > .hname, :host([hide-subtitle]) .titles > .hsub { display: none; }
  /* Status pill, at the right of the header, on the title's line. Its text is the colour toward the text colour. */
  .pill { --c: var(--success-color, #43a047); flex: none; align-self: flex-start; margin-top: 2px; min-width: 12px; text-align: center;
    padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; line-height: 16px;
    background: color-mix(in srgb, var(--c) 16%, transparent); color: color-mix(in srgb, var(--c) 70%, var(--primary-text-color)); }
  .pill.warning { --c: var(--warning-color, #ffa600); }
  .pill.quiet { --c: var(--secondary-text-color); }
  .zoom { all: unset; flex: none; align-self: flex-start; cursor: pointer; width: 24px; height: 24px; margin: -2px -4px 0 0;
    border-radius: 50%; display: grid; place-items: center; color: var(--secondary-text-color); --mdc-icon-size: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--secondary-text-color) 16%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }
  .empty { color: var(--secondary-text-color); font-size: 14px; }
  .section { display: flex; flex-direction: column; gap: 6px; }
  .section-title { font-size: 13px; font-weight: 500; color: var(--secondary-text-color); }
  .alerts { display: flex; flex-direction: column; }
  .alert { display: grid; grid-template-columns: 28px minmax(0, 1fr) auto; align-items: center; column-gap: 10px; padding: 6px 0;
    border-bottom: 1px solid var(--divider-color); }
  .alert:last-child { border-bottom: none; }
  .abadge { --c: var(--warning-color, #ffa600); flex: none; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center;
    background: color-mix(in srgb, var(--c) 16%, transparent); color: var(--c); --mdc-icon-size: 16px; }
  .alert.quiet .abadge { --c: var(--secondary-text-color); }
  .amain { min-width: 0; }
  .awhat { font-size: 14px; line-height: 20px; overflow-wrap: anywhere; }
  .ameta { font-size: 12px; color: var(--secondary-text-color); overflow-wrap: anywhere; }
  .avalue { flex: none; font-size: 13px; color: var(--secondary-text-color); white-space: nowrap; font-variant-numeric: tabular-nums; }
  .more { font-size: 12px; color: var(--secondary-text-color); padding-top: 4px; }
  .rooms { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px; }
  .room { border: 1px solid var(--divider-color); border-radius: 12px; padding: 8px 10px; min-width: 0; }
  .room.alerting { border-color: color-mix(in srgb, var(--warning-color, #ffa600) 60%, transparent);
    background: color-mix(in srgb, var(--warning-color, #ffa600) 8%, transparent); }
  .rname { font-size: 13px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .rvalue { font-size: 18px; font-weight: 500; line-height: 24px; font-variant-numeric: tabular-nums; }
  .rstate { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--secondary-text-color); --mdc-icon-size: 14px;
    min-width: 0; overflow: hidden; }
  .rstate span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .room.alerting .rstate { color: color-mix(in srgb, var(--warning-color, #ffa600) 70%, var(--primary-text-color)); }
  .rstate.ok { color: color-mix(in srgb, var(--success-color, #43a047) 70%, var(--primary-text-color)); }
  .clickable { cursor: pointer; border-radius: 8px; }
  .clickable:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  .switches { display: flex; flex-wrap: wrap; gap: 8px; }
  /* Not filled: tinted with an accent icon when on, outlined when off. */
  .switch { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-radius: 16px; cursor: pointer;
    border: 1px solid var(--divider-color); background: none; color: var(--secondary-text-color); font: inherit; font-size: 13px;
    --mdc-icon-size: 18px; min-width: 0; }
  .switch.on { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12); border-color: var(--primary-color);
    color: color-mix(in srgb, var(--primary-color) 60%, var(--primary-text-color)); }
  .switch.on ha-icon { color: var(--primary-color); }
  .switch:disabled { opacity: 0.5; cursor: default; }
  .switch:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  .slabel { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .extra:empty { display: none; }
  .extra { display: flex; flex-direction: column; border-top: 1px solid var(--divider-color); }
  .extra > .section-title { padding: 12px 16px 0; }
  /* Narrow card: the reading of an alert goes under its text. */
  @container (max-width: 360px) {
    .alert { grid-template-columns: 28px minmax(0, 1fr); }
    .abadge { grid-row: span 2; align-self: start; margin-top: 2px; }
    .avalue { grid-column: 2; white-space: normal; }
  }
  /* Narrow mini card (6 columns on a phone): the switches keep their icon only (their name stays in the tooltip). */
  @container (max-width: 300px) {
    .switch { padding: 0; width: 32px; justify-content: center; }
    .slabel { display: none; }
  }
`;

/**
 * The full card: what the mini card shows once switched to its full view — every alert, a tile per room,
 * the switches, the latest activity — always, with no compact view and no button to fold it.
 *
 * type: custom:smart-comfort-card
 * title: Smart Comfort      # optional
 * rooms: [Living room]      # optional: only these rooms
 * activity: 5               # activity entries (5 by default, 0 for none)
 */
class SmartComfortCard extends SmartComfortMiniCard {
  static FULL = true;

  // The options of the mini card but the compact view's (alerts listed, zoom button).
  static getConfigForm() {
    const form = SmartComfortMiniCard.getConfigForm();
    return { ...form, schema: form.schema.filter((field) => field.name !== "alerts") };
  }

  constructor() {
    super();
    this._zoomed = true;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  // Never folded (the click outside the card does nothing).
  _setZoom() {}
}

if (!customElements.get("smart-comfort-card")) {
  customElements.define("smart-comfort-card", SmartComfortCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "smart-comfort-card",
    name: "Smart Comfort",
    description: "Every alert of Smart Comfort, a tile per room, its switches and its latest activity.",
    preview: true,
  });
}

if (!customElements.get("smart-comfort-mini-card")) {
  customElements.define("smart-comfort-mini-card", SmartComfortMiniCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "smart-comfort-mini-card",
    name: "Smart Comfort mini",
    description: "The alerts of the moment and the switches of Smart Comfort; its button opens the full card.",
    preview: true,
  });
}
