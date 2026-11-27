"""Constants for Smart Comfort."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "smart_comfort"
TITLE: Final = "Smart Comfort"

# Top-level options (same keys in YAML and in the config entry options).
CONF_NOTIFY: Final = "notify"
CONF_OUTDOOR: Final = "outdoor_temperature"
CONF_OUTDOOR_AGGREGATE: Final = "outdoor_aggregate"
CONF_OUTDOOR_NOISE: Final = "outdoor_noise"
CONF_OUTDOOR_AIR: Final = "outdoor_air_quality"
# Outdoor relative humidity (%): with the outdoor temperature, tells whether airing dries a room.
CONF_OUTDOOR_HUMIDITY: Final = "outdoor_humidity"
CONF_DIGEST_WINDOW: Final = "digest_window"
CONF_STARTUP_GRACE: Final = "startup_grace"
CONF_REMINDER: Final = "reminder"
CONF_SNOOZE_DURATION: Final = "snooze_duration"
CONF_QUIET_START: Final = "quiet_start"
CONF_QUIET_END: Final = "quiet_end"
CONF_PRESENCE: Final = "presence"
CONF_CLEAR_WHEN_RESOLVED: Final = "clear_when_resolved"
CONF_CRITICAL_VOLUME: Final = "critical_volume"
CONF_URL: Final = "url"
CONF_TAG: Final = "tag"
CONF_HIDE_HEADER: Final = "hide_header"
# smart_comfort.yaml (yaml_file.py): apply its changes / write the panel's changes into it (both on by default).
CONF_FILE_WATCH: Final = "file_watch"
CONF_FILE_WRITE: Final = "file_write"
CONF_ALERTS: Final = "alerts"
# Alert defaults of the annex rooms (cellar, garage…): same shape as CONF_ALERTS, tuned once for every annex.
CONF_ANNEX_ALERTS: Final = "annex_alerts"
CONF_CONTROL: Final = "control"
CONF_ROOMS: Final = "rooms"
# Outdoor places (garden, terrace…): their sensors give the outdoor temperature, air quality and noise.
CONF_OUTDOORS: Final = "outdoors"
# Adaptive lighting: brightness (and warmth) of the lights that are on, by time of day.
CONF_LIGHTING: Final = "lighting"

# Rooms.
CONF_NAME: Final = "name"
CONF_AREA: Final = "area"
# Room type: a living space (its own alert defaults) or an annex (cellar, garage, workshop…) with its own.
CONF_TYPE: Final = "type"
CONF_TEMPERATURE: Final = "temperature"
CONF_CO2: Final = "co2"
CONF_HUMIDITY: Final = "humidity"
CONF_NOISE: Final = "noise"
CONF_OPENINGS: Final = "openings"
CONF_CLIMATE: Final = "climate"
CONF_FANS: Final = "fans"
CONF_PURIFIERS: Final = "purifiers"
CONF_DEHUMIDIFIERS: Final = "dehumidifiers"
# Heaters: thermostats, pilot wire radiators, pellet stoves (climate entities).
CONF_HEATING: Final = "heating"
# Temperature of the coldest wall or window of a room (condensation risk); estimated from the outdoor one when unset.
CONF_SURFACE_TEMPERATURE: Final = "surface_temperature"
# Device families, each controlled or left alone with its own switch (under the device control one).
FAMILIES: Final = ("climate", "fans", "purifiers", "dehumidifiers", "heating")
CONF_ENTITY_ID: Final = "entity_id"
CONF_AIR_QUALITY: Final = "air_quality"
# Indoor air of a room: fine particles (µg/m³), from an air purifier or a monitor.
CONF_PM25: Final = "pm25"
CONF_PM10: Final = "pm10"
CONF_LIGHTS: Final = "lights"

# Lighting settings.
CONF_DAY: Final = "day"
CONF_EVENING: Final = "evening"
CONF_NIGHT: Final = "night"
CONF_WARMTH: Final = "warmth"
CONF_DAY_KELVIN: Final = "day_kelvin"
CONF_EVENING_KELVIN: Final = "evening_kelvin"
CONF_NIGHT_KELVIN: Final = "night_kelvin"
CONF_TRANSITION: Final = "transition"
CONF_NIGHT_ONLY: Final = "night_only"
CONF_MORNING: Final = "morning"
CONF_MORNING_KELVIN: Final = "morning_kelvin"
CONF_MORNING_END: Final = "morning_end"
CONF_QUIET_MORNING: Final = "quiet_morning"
CONF_NAP: Final = "nap"
CONF_NAP_KELVIN: Final = "nap_kelvin"
# Nap slots of a room: start, end and optionally the days (mon … sun).
CONF_NAPS: Final = "naps"
CONF_DAYS: Final = "days"
WEEKDAYS: Final = ("mon", "tue", "wed", "thu", "fri", "sat", "sun")
# Lights on presence of a room: moved to House Rules in 2.0 (its import reads them); a repair proposes the migration.
CONF_PRESENCE_LIGHTS: Final = "presence"
ISSUE_PRESENCE_MOVED: Final = "presence_moved"
HOUSE_RULES_URL: Final = "https://github.com/juju35/ha-house-rules"

# Alert settings.
CONF_ENABLED: Final = "enabled"
CONF_THRESHOLD: Final = "threshold"
CONF_HYSTERESIS: Final = "hysteresis"
CONF_DELAY: Final = "delay"
CONF_SEVERITY: Final = "severity"
CONF_ESCALATION: Final = "escalation"
CONF_MIN_OUTDOOR: Final = "min_outdoor"
CONF_MAX_OUTDOOR: Final = "max_outdoor"
CONF_MIN_INDOOR: Final = "min_indoor"
CONF_MAX_NOISE: Final = "max_outdoor_noise"
CONF_MAX_AIR: Final = "max_outdoor_air"
# Polluted air: the PM10 and air quality index thresholds (the PM2.5 one is `threshold`).
CONF_PM10_THRESHOLD: Final = "pm10_threshold"
CONF_PM10_HYSTERESIS: Final = "pm10_hysteresis"
CONF_AQI_THRESHOLD: Final = "aqi_threshold"
CONF_AQI_HYSTERESIS: Final = "aqi_hysteresis"

# Control settings.
CONF_START: Final = "start"
CONF_END: Final = "end"
CONF_MANUAL_OVERRIDE: Final = "manual_override"
CONF_SUPPRESS_HANDLED: Final = "suppress_when_handled"
CONF_COOL_ABOVE: Final = "cool_above"
CONF_OFF_BELOW: Final = "off_below"
CONF_ON_ABOVE: Final = "on_above"
CONF_SETPOINT: Final = "setpoint"
CONF_FAN_MODE: Final = "fan_mode"
CONF_CLOSED_FOR: Final = "closed_for"
CONF_OFF_ON_OPEN: Final = "off_on_open"
CONF_PERCENTAGE: Final = "percentage"
CONF_PRESET: Final = "preset"
CONF_OPEN_PERCENTAGE: Final = "open_percentage"
CONF_OPEN_PRESET: Final = "open_preset"
CONF_OFF_PRESET: Final = "off_preset"
CONF_CLOSED_PRESET: Final = "closed_preset"
CONF_MODE_SELECT: Final = "mode_select"
CONF_OPEN_MODE: Final = "open_mode"
CONF_CLOSED_MODE: Final = "closed_mode"
CONF_KEEP_ON: Final = "keep_on"
# Quiet night: devices quieter between night_start and night_end.
CONF_NIGHT_START: Final = "night_start"
CONF_NIGHT_END: Final = "night_end"
CONF_NIGHT_FAN_MODE: Final = "night_fan_mode"
CONF_NIGHT_PERCENTAGE: Final = "night_percentage"
CONF_NIGHT_PRESET: Final = "night_preset"
CONF_NIGHT_MODE: Final = "night_mode"
# Indicator light or display of a device, off in its hours; time a device goes back to its normal state.
CONF_DISPLAY: Final = "display"
CONF_DISPLAY_OFF: Final = "display_off"
CONF_DISPLAY_ON: Final = "display_on"
CONF_RESET_AT: Final = "reset_at"
DISPLAY_DOMAINS: Final = ("light", "switch", "number", "select")
# Dehumidifiers: on from on_above (%), off below off_below, their mode by day / at night / for a boost.
CONF_MODE: Final = "mode"
CONF_BOOST_MODE: Final = "boost_mode"
CONF_NIGHT_OFF: Final = "night_off"
CONF_TARGET_HUMIDITY: Final = "target_humidity"
# Water tank full sensor (binary_sensor): an alert, the device left alone until emptied.
CONF_TANK: Final = "tank"
# Wait this long for the windows to be opened before drying, while airing would dry the room.
CONF_PREFER_AIRING: Final = "prefer_airing"
CONF_AIRING_WAIT: Final = "airing_wait"
# Shower: humidity up by shower_rise points within SHOWER_WINDOW minutes boosts the dehumidifiers (and the fans that
# have a shower speed or preset) for shower_boost minutes.
CONF_SHOWER_RISE: Final = "shower_rise"
CONF_SHOWER_BOOST: Final = "shower_boost"
CONF_SHOWER_PERCENTAGE: Final = "shower_percentage"
CONF_SHOWER_PRESET: Final = "shower_preset"
# Heating: setpoints by mode, the preset that stands for each mode (pilot wire), the schedule (on: comfort, off: eco).
CONF_COMFORT: Final = "comfort"
CONF_ECO: Final = "eco"
CONF_FROST: Final = "frost"
CONF_AWAY: Final = "away"
CONF_COMFORT_PRESET: Final = "comfort_preset"
CONF_ECO_PRESET: Final = "eco_preset"
CONF_FROST_PRESET: Final = "frost_preset"
CONF_AWAY_PRESET: Final = "away_preset"
CONF_SCHEDULE: Final = "schedule"
# The mode outside the schedule's slots: eco, or frost protection (a room unused then, a guest room heated only
# while its boolean is on).
CONF_SCHEDULE_OFF: Final = "schedule_off"
SCHEDULE_OFF_MODES: Final = ("eco", "frost")
# Start comfort early, from the room's learnt warm-up rate, at most preheat_max minutes before the schedule.
CONF_PREHEAT: Final = "preheat"
CONF_PREHEAT_MAX: Final = "preheat_max"
# EDF Tempo: today's and tomorrow's colour sensors; setpoints lowered on red (and white) days, a little higher in the
# off-peak hours before a red day.
CONF_TEMPO: Final = "tempo"
CONF_TEMPO_TOMORROW: Final = "tempo_tomorrow"
CONF_TEMPO_RED: Final = "tempo_red"
CONF_TEMPO_WHITE: Final = "tempo_white"
CONF_TEMPO_PREHEAT: Final = "tempo_preheat"
# Off-peak hours: an on/off entity, else from offpeak_start to offpeak_end.
CONF_OFFPEAK: Final = "offpeak"
CONF_OFFPEAK_START: Final = "offpeak_start"
CONF_OFFPEAK_END: Final = "offpeak_end"
# Pellet stove: the main heat source, its pellet level sensor (%).
CONF_STOVE: Final = "stove"
CONF_PELLETS: Final = "pellets"
# A backup heater: kept at eco while a stove heats (and on red Tempo days), unless the room is backup_margin below
# comfort.
CONF_BACKUP: Final = "backup"
CONF_BACKUP_MARGIN: Final = "backup_margin"
# Heating that doesn't warm the room for fault_after minutes: a fault alert.
CONF_FAULT_AFTER: Final = "fault_after"

# Alert kinds, in display order.
KIND_TOO_HOT: Final = "too_hot"
KIND_TOO_COLD: Final = "too_cold"
KIND_VENTILATE: Final = "ventilate"
KIND_CLOSE_WINDOWS: Final = "close_windows"
KIND_WINDOW_OPEN_COLD: Final = "window_open_cold"
KIND_CO2: Final = "co2_high"
KIND_HUMIDITY: Final = "humidity_high"
KIND_NOISE: Final = "noise_high"
KIND_NOISY_OUTSIDE: Final = "noisy_outside"
KIND_BAD_AIR_OUTSIDE: Final = "bad_air_outside"
KIND_POLLUTED: Final = "polluted_air"
KIND_CONDENSATION: Final = "condensation_risk"
KIND_AIR_TO_DRY: Final = "air_to_dry"
KIND_TANK_FULL: Final = "tank_full"
KIND_HEATING_FAULT: Final = "heating_fault"
KIND_PELLETS_LOW: Final = "pellets_low"
KINDS: Final = (
    KIND_TOO_HOT,
    KIND_CLOSE_WINDOWS,
    KIND_VENTILATE,
    KIND_TOO_COLD,
    KIND_WINDOW_OPEN_COLD,
    KIND_CO2,
    KIND_POLLUTED,
    KIND_HUMIDITY,
    KIND_CONDENSATION,
    KIND_AIR_TO_DRY,
    KIND_TANK_FULL,
    KIND_HEATING_FAULT,
    KIND_PELLETS_LOW,
    KIND_NOISE,
    KIND_NOISY_OUTSIDE,
    KIND_BAD_AIR_OUTSIDE,
)

SEVERITY_INFO: Final = "info"
SEVERITY_WARNING: Final = "warning"
SEVERITY_CRITICAL: Final = "critical"
SEVERITIES: Final = (SEVERITY_INFO, SEVERITY_WARNING, SEVERITY_CRITICAL)

# Room types: a living space (the default), or an annex (cellar, garage, workshop…) with its own alert defaults.
ROOM_TYPE_LIVING: Final = "living_space"
ROOM_TYPE_ANNEX: Final = "annex"
ROOM_TYPES: Final = (ROOM_TYPE_LIVING, ROOM_TYPE_ANNEX)

AGGREGATES: Final = ("min", "max", "mean")
# Who the dashboards' top bar is hidden for (smart-comfort-header.js, loaded on every page).
HIDE_HEADER_MODES: Final = ("off", "everyone", "non_admins")

# Defaults. Durations are minutes.
DEFAULT_DIGEST_WINDOW: Final = 5
DEFAULT_STARTUP_GRACE: Final = 10
DEFAULT_REMINDER: Final = 0
DEFAULT_SNOOZE: Final = 240
DEFAULT_MANUAL_OVERRIDE: Final = 60
DEFAULT_CRITICAL_VOLUME: Final = 0.5
DEFAULT_TAG: Final = "smart_comfort"
MAX_MINUTES: Final = 1440

DEFAULT_ALERTS: Final[dict[str, dict]] = {
    # Room above the threshold.
    KIND_TOO_HOT: {
        CONF_ENABLED: True,
        CONF_THRESHOLD: 27.0,
        CONF_HYSTERESIS: 0.5,
        CONF_DELAY: 15,
        CONF_SEVERITY: SEVERITY_WARNING,
        CONF_ESCALATION: 1.0,
    },
    # Room below the threshold.
    KIND_TOO_COLD: {
        CONF_ENABLED: True,
        CONF_THRESHOLD: 17.0,
        CONF_HYSTERESIS: 0.5,
        CONF_DELAY: 15,
        CONF_SEVERITY: SEVERITY_WARNING,
        CONF_ESCALATION: 1.0,
    },
    # Room warm (threshold) and warmer than outside by the margin, openings closed: open them.
    KIND_VENTILATE: {
        CONF_ENABLED: True,
        CONF_THRESHOLD: 2.0,
        CONF_MIN_INDOOR: 24.0,
        # Not suggested while the outdoor noise is above this (with an outdoor noise sensor).
        CONF_MAX_NOISE: 65.0,
        # Nor while the outdoor air quality is worse than this level (1 good … 6 extremely poor).
        CONF_MAX_AIR: 3.0,
        CONF_HYSTERESIS: 0.5,
        CONF_DELAY: 15,
        CONF_SEVERITY: SEVERITY_INFO,
        CONF_ESCALATION: 2.0,
    },
    # Opening open while outside is warmer than the room by the margin, and at least min_outdoor.
    KIND_CLOSE_WINDOWS: {
        CONF_ENABLED: True,
        CONF_THRESHOLD: 0.5,
        CONF_MIN_OUTDOOR: 25.0,
        CONF_HYSTERESIS: 0.3,
        CONF_DELAY: 5,
        CONF_SEVERITY: SEVERITY_WARNING,
        CONF_ESCALATION: 2.0,
    },
    # Opening open for the delay while outside is at most max_outdoor.
    KIND_WINDOW_OPEN_COLD: {
        CONF_ENABLED: False,
        CONF_MAX_OUTDOOR: 12.0,
        CONF_HYSTERESIS: 0.5,
        CONF_DELAY: 20,
        CONF_SEVERITY: SEVERITY_INFO,
        CONF_ESCALATION: 0,
    },
    KIND_CO2: {
        CONF_ENABLED: True,
        CONF_THRESHOLD: 1200.0,
        CONF_HYSTERESIS: 150.0,
        CONF_DELAY: 10,
        CONF_SEVERITY: SEVERITY_INFO,
        CONF_ESCALATION: 400.0,
    },
    # Polluted indoor air: PM2.5 above the threshold (µg/m³), or PM10 above its own, or the air quality index of
    # the room worse than its level (1 good … 6 extremely poor; US AQI by its bands).
    KIND_POLLUTED: {
        CONF_ENABLED: True,
        CONF_THRESHOLD: 25.0,
        CONF_HYSTERESIS: 10.0,
        CONF_PM10_THRESHOLD: 50.0,
        CONF_PM10_HYSTERESIS: 20.0,
        CONF_AQI_THRESHOLD: 3.0,
        CONF_AQI_HYSTERESIS: 1.0,
        CONF_DELAY: 10,
        CONF_SEVERITY: SEVERITY_WARNING,
        CONF_ESCALATION: 25.0,
    },
    KIND_HUMIDITY: {
        CONF_ENABLED: True,
        CONF_THRESHOLD: 70.0,
        CONF_HYSTERESIS: 5.0,
        CONF_DELAY: 15,
        CONF_SEVERITY: SEVERITY_INFO,
        CONF_ESCALATION: 10.0,
    },
    # Condensation (mould) risk: the coldest surface less than the threshold (°C) above the dew point of the room's air.
    KIND_CONDENSATION: {
        CONF_ENABLED: True,
        CONF_THRESHOLD: 2.0,
        CONF_HYSTERESIS: 0.5,
        CONF_DELAY: 30,
        CONF_SEVERITY: SEVERITY_INFO,
        CONF_ESCALATION: 1.0,
    },
    # A damp room (high humidity or condensation risk) whose windows are closed while the outdoor air holds at least
    # the threshold (g/m³) less water: open them rather than run a dehumidifier. Not when colder than min_outdoor
    # outdoors, nor noisy or polluted outside.
    KIND_AIR_TO_DRY: {
        CONF_ENABLED: True,
        CONF_THRESHOLD: 2.0,
        # Colder air is nearly always drier: below this, opening would mostly cool the room.
        CONF_MIN_OUTDOOR: 5.0,
        CONF_MAX_NOISE: 65.0,
        CONF_MAX_AIR: 3.0,
        CONF_HYSTERESIS: 0.5,
        CONF_DELAY: 0,
        CONF_SEVERITY: SEVERITY_INFO,
        CONF_ESCALATION: 0,
    },
    # A dehumidifier's water tank is full.
    KIND_TANK_FULL: {
        CONF_ENABLED: True,
        CONF_DELAY: 0,
        CONF_SEVERITY: SEVERITY_WARNING,
        CONF_ESCALATION: 0,
    },
    # Heating on (by Smart Comfort) that doesn't warm the room (control heating.fault_after).
    KIND_HEATING_FAULT: {
        CONF_ENABLED: True,
        CONF_DELAY: 0,
        CONF_SEVERITY: SEVERITY_WARNING,
        CONF_ESCALATION: 0,
    },
    # Pellet level of a stove below the threshold (%).
    KIND_PELLETS_LOW: {
        CONF_ENABLED: True,
        CONF_THRESHOLD: 20.0,
        CONF_HYSTERESIS: 5.0,
        CONF_DELAY: 0,
        CONF_SEVERITY: SEVERITY_WARNING,
        CONF_ESCALATION: 10.0,
    },
    # Room noise level above the threshold (sound pressure sensor, dB).
    KIND_NOISE: {
        CONF_ENABLED: True,
        CONF_THRESHOLD: 60.0,
        CONF_HYSTERESIS: 5.0,
        CONF_DELAY: 10,
        CONF_SEVERITY: SEVERITY_INFO,
        CONF_ESCALATION: 10.0,
    },
    # Opening open while the outdoor noise is above the threshold: close it.
    KIND_NOISY_OUTSIDE: {
        CONF_ENABLED: True,
        CONF_THRESHOLD: 65.0,
        CONF_HYSTERESIS: 5.0,
        CONF_DELAY: 5,
        CONF_SEVERITY: SEVERITY_INFO,
        CONF_ESCALATION: 10.0,
    },
    # Opening open while the outdoor air quality is worse than the threshold level (1 good … 6 extremely poor).
    KIND_BAD_AIR_OUTSIDE: {
        CONF_ENABLED: True,
        CONF_THRESHOLD: 3.0,
        CONF_HYSTERESIS: 0.5,
        CONF_DELAY: 5,
        CONF_SEVERITY: SEVERITY_INFO,
        CONF_ESCALATION: 1.0,
    },
}

# Alert defaults of the annex rooms (cellar, garage, workshop, laundry, attic…): the living-space defaults with the
# comfort alerts off and only the ones that matter in an unlived space left on — frost (too cold at 5 °C) and mould
# (high humidity at 80 %), plus polluted air. Each annex can still be tuned once for all of them, or overridden room
# by room. Same fields as DEFAULT_ALERTS, so the form and the merge stay in step.
_ANNEX_OVERRIDES: Final[dict[str, dict]] = {
    KIND_TOO_HOT: {CONF_ENABLED: False},
    KIND_TOO_COLD: {CONF_THRESHOLD: 5.0},
    KIND_VENTILATE: {CONF_ENABLED: False},
    KIND_CLOSE_WINDOWS: {CONF_ENABLED: False},
    KIND_WINDOW_OPEN_COLD: {CONF_ENABLED: False},
    KIND_CO2: {CONF_ENABLED: False},
    KIND_HUMIDITY: {CONF_THRESHOLD: 80.0},
    KIND_NOISE: {CONF_ENABLED: False},
    KIND_NOISY_OUTSIDE: {CONF_ENABLED: False},
    KIND_BAD_AIR_OUTSIDE: {CONF_ENABLED: False},
    # Polluted air stays on with the living-space defaults.
}
DEFAULT_ANNEX_ALERTS: Final[dict[str, dict]] = {
    kind: {**DEFAULT_ALERTS[kind], **_ANNEX_OVERRIDES.get(kind, {})} for kind in KINDS
}

DEFAULT_CONTROL: Final[dict] = {
    CONF_ENABLED: True,
    # Window boosts (fans and purifiers at full speed when an opening is open) only in these hours.
    CONF_START: "09:00",
    CONF_END: "21:00",
    CONF_MANUAL_OVERRIDE: DEFAULT_MANUAL_OVERRIDE,
    CONF_SUPPRESS_HANDLED: True,
    # Quiet night: the night settings of each device apply in these hours, and no window boost.
    CONF_NIGHT_START: "22:00",
    CONF_NIGHT_END: "07:00",
    # Indicator lights and displays of the devices: off in these hours (the quiet night when unset).
    CONF_DISPLAY_OFF: None,
    CONF_DISPLAY_ON: None,
    CONF_CLIMATE: {
        CONF_COOL_ABOVE: 23.0,
        CONF_OFF_BELOW: 21.0,
        CONF_SETPOINT: 22.0,
        CONF_FAN_MODE: None,
        CONF_CLOSED_FOR: 2,
        CONF_OFF_ON_OPEN: 1,
        # No cooling while it is cooler than this outdoors (opening the windows does it): None, always.
        CONF_MIN_OUTDOOR: 18.0,
        CONF_NIGHT_FAN_MODE: None,
        CONF_DISPLAY: None,
        CONF_RESET_AT: None,
    },
    CONF_FANS: {
        CONF_ON_ABOVE: 23.0,
        CONF_OFF_BELOW: 22.0,
        CONF_PERCENTAGE: 50,
        CONF_PRESET: None,
        CONF_OPEN_PERCENTAGE: 100,
        CONF_OPEN_PRESET: None,
        CONF_OFF_PRESET: None,
        CONF_NIGHT_PERCENTAGE: None,
        CONF_NIGHT_PRESET: None,
        CONF_SHOWER_PERCENTAGE: None,
        CONF_SHOWER_PRESET: None,
        CONF_DISPLAY: None,
        CONF_RESET_AT: None,
    },
    # Humidity rise of a shower (points within SHOWER_WINDOW minutes; None: no detection) and the boost it gets.
    CONF_SHOWER_RISE: 10.0,
    CONF_SHOWER_BOOST: 30,
    CONF_PURIFIERS: {
        CONF_OPEN_PERCENTAGE: 100,
        CONF_OPEN_PRESET: None,
        CONF_CLOSED_PRESET: None,
        CONF_MODE_SELECT: None,
        CONF_OPEN_MODE: None,
        CONF_CLOSED_MODE: None,
        CONF_KEEP_ON: False,
        CONF_NIGHT_PERCENTAGE: None,
        CONF_NIGHT_PRESET: None,
        CONF_NIGHT_MODE: None,
        CONF_DISPLAY: None,
        CONF_RESET_AT: None,
    },
    CONF_DEHUMIDIFIERS: {
        CONF_ON_ABOVE: 65.0,
        CONF_OFF_BELOW: 55.0,
        CONF_MODE: None,
        CONF_TARGET_HUMIDITY: None,
        CONF_BOOST_MODE: None,
        CONF_NIGHT_MODE: None,
        CONF_NIGHT_OFF: False,
        CONF_TANK: None,
        CONF_OFF_ON_OPEN: 5,
        CONF_PREFER_AIRING: True,
        CONF_AIRING_WAIT: 30,
        CONF_DISPLAY: None,
        CONF_RESET_AT: None,
    },
    CONF_HEATING: {
        CONF_COMFORT: 20.0,
        CONF_ECO: 17.0,
        CONF_FROST: 7.0,
        CONF_AWAY: 16.0,
        CONF_COMFORT_PRESET: None,
        CONF_ECO_PRESET: None,
        CONF_FROST_PRESET: None,
        CONF_AWAY_PRESET: None,
        CONF_SCHEDULE: None,
        CONF_SCHEDULE_OFF: "eco",
        # Frost protection when an opening stays open this long.
        CONF_OFF_ON_OPEN: 5,
        # Off while it is at least this warm outdoors (the heating season is over): None, never.
        CONF_MAX_OUTDOOR: 16.0,
        CONF_PREHEAT: True,
        CONF_PREHEAT_MAX: 120,
        CONF_TEMPO: None,
        CONF_TEMPO_TOMORROW: None,
        CONF_TEMPO_RED: 2.0,
        CONF_TEMPO_WHITE: 0.0,
        CONF_TEMPO_PREHEAT: 1.0,
        CONF_OFFPEAK: None,
        CONF_OFFPEAK_START: "22:00",
        CONF_OFFPEAK_END: "06:00",
        CONF_STOVE: False,
        CONF_PELLETS: None,
        CONF_BACKUP: False,
        CONF_BACKUP_MARGIN: 1.0,
        CONF_FAULT_AFTER: 90,
        CONF_DISPLAY: None,
        CONF_RESET_AT: None,
    },
}

# Brightness (%) by time of day: day (sun up), evening (sun down), night (quiet night hours, control
# night_start/night_end); warmth in kelvin with the same steps, for the lights that support it.
DEFAULT_LIGHTING: Final[dict] = {
    CONF_ENABLED: True,
    CONF_DAY: 100,
    CONF_EVENING: 60,
    CONF_NIGHT: 15,
    CONF_WARMTH: True,
    CONF_DAY_KELVIN: 4000,
    CONF_EVENING_KELVIN: 2700,
    CONF_NIGHT_KELVIN: 2200,
    # Quiet morning of the rooms that have it (bedrooms): from the end of the night until morning_end.
    CONF_MORNING: 40,
    CONF_MORNING_KELVIN: 3000,
    CONF_MORNING_END: "09:30",
    CONF_QUIET_MORNING: False,
    # During the nap slots of a room.
    CONF_NAP: 15,
    CONF_NAP_KELVIN: 2200,
    # Seconds of the gradual changes (a light just turned on gets its brightness at once).
    CONF_TRANSITION: 120,
}
# Sun elevation (degrees) from which it is day, and under which it is evening; in between, a blend.
SUN_DAY: Final = 6.0
SUN_EVENING: Final = -6.0
# Smallest gap worth a command: brightness points, kelvin.
LIGHT_STEP: Final = 3
KELVIN_STEP: Final = 100

# Seconds.
EVALUATE_INTERVAL: Final = 30
DEBOUNCE: Final = 3
NOTIFY_TIMEOUT: Final = 20
SERVICE_TIMEOUT: Final = 15
KEEP_ON_DELAY: Final = 10
# Minutes over which a shower's humidity rise is measured.
SHOWER_WINDOW: Final = 10
# Warm-up rate (°C/h) of a room before one is learnt, and the bounds of a learnt one.
HEAT_RATE_DEFAULT: Final = 1.0
HEAT_RATE_MIN: Final = 0.2
HEAT_RATE_MAX: Final = 6.0
# Minutes after which an unavailable opening is left out of its room instead of blocking it.
OPENING_UNAVAILABLE: Final = 10
# Minutes before a failed device command is tried again, doubled at each new failure up to the maximum.
COMMAND_RETRY: Final = 5
COMMAND_RETRY_MAX: Final = 60
# Minutes during which a device whose command failed gets no command at all (lights and displays included).
FAILURE_PAUSE: Final = 5
# Minutes before a clear that no phone got is tried again, doubled at each new failure; given up after CLEAR_RETRIES.
CLEAR_RETRY: Final = 1
CLEAR_RETRIES: Final = 6

STORAGE_VERSION: Final = 1
STORAGE_KEY: Final = DOMAIN

ACTION_SNOOZE: Final = "SMART_COMFORT_SNOOZE"
ACTION_ACK: Final = "SMART_COMFORT_ACK"

SERVICE_SNOOZE: Final = "snooze"
SERVICE_UNSNOOZE: Final = "unsnooze"
SERVICE_ACKNOWLEDGE: Final = "acknowledge"
SERVICE_NOTIFY_NOW: Final = "notify_now"
SERVICE_GET_CONFIG: Final = "get_config"
SERVICE_RELOAD: Final = "reload"

EVENT_NOTIFIED: Final = f"{DOMAIN}_notified"
EVENT_CONTROL: Final = f"{DOMAIN}_control"

PANEL_URL: Final = "smart-comfort"
PANEL_ICON: Final = "smart-comfort:comfort"
# Dispatched after every evaluation and setup/unload of the entry (configuration panel status).
SIGNAL_UPDATE: Final = f"{DOMAIN}_update"
# New activity entries (a list), for the panel and the activity card.
SIGNAL_ACTIVITY: Final = f"{DOMAIN}_activity"
ACTIVITY_SIZE: Final = 300
# Finished episodes kept for the calendar: at most this many, none older than HISTORY_DAYS.
HISTORY_SIZE: Final = 1000
HISTORY_DAYS: Final = 90

# Air quality services: their sensors are outdoor air quality indexes (some, like Atmo France's, without a device
# class). Listed in the panel's pickers too (src/smart-comfort-panel/form.js).
AIR_PLATFORMS = ("atmofrance", "waqi", "airvisual", "airly", "airnow", "google_air_quality")
