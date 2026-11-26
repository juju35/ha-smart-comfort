"""Dehumidifiers and heaters: control decisions, moist air, alerts. No Home Assistant needed."""

from __future__ import annotations

from dataclasses import replace
from datetime import UTC, datetime, time, timedelta

from custom_components.smart_comfort.config import build_settings
from custom_components.smart_comfort.control import Controller, DeviceState, RoomContext, heat_mode, tempo_colour
from custom_components.smart_comfort.engine import Check, Engine, RoomReading, check
from custom_components.smart_comfort.moisture import absolute_humidity, dew_point, surface_temperature

T0 = datetime(2026, 12, 1, 12, 0, tzinfo=UTC)
NOON = time(12, 0)
NIGHT = time(23, 0)


def settings(**room):
    return build_settings(
        {
            "rooms": [
                {
                    "name": "Cave",
                    "temperature": "sensor.t",
                    "humidity": "sensor.h",
                    "openings": ["binary_sensor.w"],
                    **room,
                }
            ]
        }
    )


def ctx(temp=19.0, humidity=None, opened=False, minutes=10, **extra):
    since = T0 - timedelta(minutes=minutes)
    return RoomContext(
        temperature=temp,
        any_open=opened,
        closed_since=None if opened else since,
        open_since=since if opened else None,
        has_openings=True,
        outdoor=extra.pop("outdoor", 5.0),
        humidity=humidity,
        local=T0,
        **extra,
    )


def calls(cmds):
    return [(c.entity_id, f"{c.domain}.{c.service}", c.data) for c in cmds]


# Moist air.


def test_moisture():
    assert dew_point(20, 50) == 9.3
    assert dew_point(None, 50) is None
    assert absolute_humidity(20, 50) == 8.62
    assert surface_temperature(20, 0) == 15.0
    assert surface_temperature(20, 25) == 20
    assert surface_temperature(20, 0, measured=12.5) == 12.5
    assert surface_temperature(None, 0) is None


# Dehumidifiers.


def test_dehumidifier_hysteresis_modes_and_night():
    s = settings(
        dehumidifiers=[{"entity_id": "humidifier.d", "mode": "dry", "night_mode": "sleep", "target_humidity": 50}]
    )
    c, room = Controller(s), s.rooms[0]
    off = {"humidifier.d": DeviceState(on=False)}
    assert calls(c.evaluate(T0, NOON, room, ctx(humidity=70), off)) == [
        ("humidifier.d", "humidifier.turn_on", {}),
        ("humidifier.d", "humidifier.set_mode", {"mode": "dry"}),
        ("humidifier.d", "humidifier.set_humidity", {"humidity": 50}),
    ]
    on = {"humidifier.d": DeviceState(on=True, mode="dry", target_humidity=50)}
    assert c.evaluate(T0, NOON, room, ctx(humidity=60), on) == []  # In the band: holds.
    assert calls(c.evaluate(T0, NIGHT, room, ctx(humidity=60), on)) == [
        ("humidifier.d", "humidifier.set_mode", {"mode": "sleep"})
    ]
    night = {"humidifier.d": DeviceState(on=True, mode="sleep", target_humidity=50)}
    assert calls(c.evaluate(T0, NOON, room, ctx(humidity=54), night)) == [("humidifier.d", "humidifier.turn_off", {})]


def test_dehumidifier_condensation_window_and_tank():
    s = settings(dehumidifiers=[{"entity_id": "switch.plug", "tank": "binary_sensor.tank"}])
    c, room = Controller(s), s.rooms[0]
    off = {"switch.plug": DeviceState(on=False)}
    # Below on_above, but a condensation risk under way: dries.
    assert calls(c.evaluate(T0, NOON, room, ctx(humidity=60, damp=True), off)) == [
        ("switch.plug", "switch.turn_on", {})
    ]
    on = {"switch.plug": DeviceState(on=True)}
    # A window just opened: waits; open for off_on_open: off.
    assert c.evaluate(T0, NOON, room, ctx(humidity=70, opened=True, minutes=1), on) == []
    assert calls(c.evaluate(T0, NOON, room, ctx(humidity=70, opened=True, minutes=6), on)) == [
        ("switch.plug", "switch.turn_off", {})
    ]
    # Tank full: left alone.
    c2 = Controller(s)
    assert c2.evaluate(T0, NOON, room, ctx(humidity=80, full_tanks=frozenset({"binary_sensor.tank"})), off) == []
    assert c.handled_keys(room, {"switch.plug": DeviceState(on=True)}) == set()


def test_dehumidifier_prefers_airing():
    s = settings(dehumidifiers=["switch.plug"])
    c, room = Controller(s), s.rooms[0]
    off = {"switch.plug": DeviceState(on=False)}
    suggested = T0 - timedelta(minutes=10)
    assert c.evaluate(T0, NOON, room, ctx(humidity=75, airing_since=suggested), off) == []
    later = T0 + timedelta(minutes=25)
    assert calls(c.evaluate(later, NOON, room, ctx(humidity=75, airing_since=suggested), off)) == [
        ("switch.plug", "switch.turn_on", {})
    ]
    assert c.handled_keys(room, {"switch.plug": DeviceState(on=True)}) == {
        "cave|humidity_high",
        "cave|condensation_risk",
        "cave|air_to_dry",
    }


def test_shower_boost():
    s = settings(
        dehumidifiers=[{"entity_id": "humidifier.d", "mode": "dry", "boost_mode": "turbo"}],
        fans=[{"entity_id": "fan.vmc", "on_above": None, "off_below": None, "shower_percentage": 80}],
    )
    c, room = Controller(s), s.rooms[0]
    states = {"humidifier.d": DeviceState(on=False), "fan.vmc": DeviceState(on=False)}
    assert c.evaluate(T0, NOON, room, ctx(humidity=50), states) == []
    cmds = calls(c.evaluate(T0 + timedelta(minutes=4), NOON, room, ctx(humidity=62), states))
    assert ("humidifier.d", "humidifier.set_mode", {"mode": "turbo"}) in cmds
    assert ("fan.vmc", "fan.set_percentage", {"percentage": 80}) in cmds
    # Boost over: the fan off, the dehumidifier drying while still humid.
    after = T0 + timedelta(minutes=40)
    states = {"humidifier.d": DeviceState(on=True, mode="turbo"), "fan.vmc": DeviceState(on=True, percentage=80)}
    cmds = calls(c.evaluate(after, NOON, room, ctx(humidity=60), states))
    assert ("fan.vmc", "fan.turn_off", {}) in cmds
    assert ("humidifier.d", "humidifier.set_mode", {"mode": "dry"}) in cmds


# Heaters.


def test_tempo_colour():
    assert tempo_colour("Rouge") == "red"
    assert tempo_colour("TEMPO_BLANC") == "white"
    assert tempo_colour("blue") == "blue"
    assert tempo_colour("unknown") is None


def test_heater_schedule_open_and_season():
    s = settings(type="living_space", heating=[{"entity_id": "climate.r", "schedule": "schedule.h"}])
    c, room = Controller(s), s.rooms[0]
    off = {"climate.r": DeviceState(on=False, hvac_mode="off")}
    assert calls(c.evaluate(T0, NOON, room, ctx(states={"schedule.h": "on"}), off)) == [
        ("climate.r", "climate.set_hvac_mode", {"hvac_mode": "heat"}),
        ("climate.r", "climate.set_temperature", {"temperature": 20.0}),
    ]
    heat = {"climate.r": DeviceState(on=True, hvac_mode="heat", setpoint=20.0)}
    assert calls(c.evaluate(T0, NOON, room, ctx(states={"schedule.h": "off"}), heat)) == [
        ("climate.r", "climate.set_temperature", {"temperature": 17.0})
    ]
    eco = {"climate.r": DeviceState(on=True, hvac_mode="heat", setpoint=17.0)}
    assert calls(c.evaluate(T0, NOON, room, ctx(opened=True, minutes=6, states={"schedule.h": "off"}), eco)) == [
        ("climate.r", "climate.set_temperature", {"temperature": 7.0})
    ]
    assert calls(c.evaluate(T0, NOON, room, ctx(outdoor=17.0, states={"schedule.h": "on"}), eco)) == [
        ("climate.r", "climate.turn_off", {})
    ]
    # Back on only 1 °C below max_outdoor.
    stopped = {"climate.r": DeviceState(on=False, hvac_mode="off")}
    assert c.evaluate(T0, NOON, room, ctx(outdoor=15.5, states={"schedule.h": "on"}), stopped) == []
    assert c.evaluate(T0, NOON, room, ctx(outdoor=14.5, states={"schedule.h": "on"}), stopped) != []


def test_heater_annex_away_presets_tempo():
    s = settings(
        type="annex",
        heating=[{"entity_id": "climate.fp", "frost_preset": "frost", "tempo": "sensor.tempo"}],
    )
    c, room = Controller(s), s.rooms[0]
    on = {"climate.fp": DeviceState(on=True, hvac_mode="heat", preset="comfort")}
    # Annex without schedule: frost protection, by its preset.
    assert calls(c.evaluate(T0, NOON, room, ctx(), on)) == [
        ("climate.fp", "climate.set_preset_mode", {"preset_mode": "frost"})
    ]
    s = settings(heating=[{"entity_id": "climate.r", "tempo": "sensor.tempo", "tempo_tomorrow": "sensor.tomorrow"}])
    c, room = Controller(s), s.rooms[0]
    heat = {"climate.r": DeviceState(on=True, hvac_mode="heat", setpoint=20.0)}
    assert calls(c.evaluate(T0, NOON, room, ctx(states={"sensor.tempo": "Rouge"}), heat)) == [
        ("climate.r", "climate.set_temperature", {"temperature": 18.0})
    ]
    # Off-peak (22:00-06:00) before a red day: a little warmer.
    late = ctx(states={"sensor.tempo": "Bleu", "sensor.tomorrow": "Rouge"})
    late.local = T0.replace(hour=23)
    assert calls(c.evaluate(T0, NOON, room, late, heat)) == [
        ("climate.r", "climate.set_temperature", {"temperature": 21.0})
    ]
    assert calls(c.evaluate(T0, NOON, room, ctx(away=True), heat)) == [
        ("climate.r", "climate.set_temperature", {"temperature": 16.0})
    ]


def test_heater_preheat_backup_and_cooling_lock():
    s = settings(heating=[{"entity_id": "climate.r", "schedule": "schedule.h"}])
    c, room = Controller(s), s.rooms[0]
    c.heat_rates["cave"] = 2.0  # °C/h: 3 °C take 90 min.
    eco = {"climate.r": DeviceState(on=True, hvac_mode="heat", setpoint=17.0)}
    soon = {"schedule.h": T0 + timedelta(minutes=80)}
    assert calls(c.evaluate(T0, NOON, room, ctx(temp=17.0, states={"schedule.h": "off"}, next_on=soon), eco)) == [
        ("climate.r", "climate.set_temperature", {"temperature": 20.0})
    ]
    s = settings(heating=[{"entity_id": "climate.r", "backup": True}])
    c, room = Controller(s), s.rooms[0]
    heat = {"climate.r": DeviceState(on=True, hvac_mode="heat", setpoint=20.0)}
    assert calls(c.evaluate(T0, NOON, room, ctx(temp=19.5, stove_heating=True), heat)) == [
        ("climate.r", "climate.set_temperature", {"temperature": 17.0})
    ]
    c.targets.clear()
    assert c.evaluate(T0, NOON, room, ctx(temp=18.5, stove_heating=True), heat) == []  # Cold room: stays comfort.
    # A room that heats: its air conditioner doesn't cool.
    s = settings(climate="climate.ac", heating=["climate.r"])
    c, room = Controller(s), s.rooms[0]
    c.targets["climate.r"] = "heat:comfort:20"
    states = {"climate.ac": DeviceState(on=False, hvac_mode="off"), "climate.r": heat["climate.r"]}
    assert all(
        cmd.entity_id != "climate.ac" for cmd in c.evaluate(T0, NOON, room, ctx(temp=25.0, outdoor=25.0), states)
    )


def test_heating_rate_and_fault():
    s = settings(heating=[{"entity_id": "climate.r", "fault_after": 60}])
    c, room = Controller(s), s.rooms[0]
    heat = {"climate.r": DeviceState(on=True, hvac_mode="heat", setpoint=20.0)}
    c.evaluate(T0, NOON, room, ctx(temp=17.0), heat)
    assert heat_mode(c.targets["climate.r"]) == ("comfort", 20.0)
    c.evaluate(T0 + timedelta(minutes=30), NOON, room, ctx(temp=18.0), heat)
    assert c.heat_rates["cave"] == 2.0
    # No warming for an hour: a fault.
    for minutes in (60, 90, 100):
        c.evaluate(T0 + timedelta(minutes=minutes), NOON, room, ctx(temp=18.0), heat)
    assert c.faults == {"cave": 20.0}
    c.evaluate(T0 + timedelta(minutes=110), NOON, room, ctx(temp=19.8), heat)
    assert c.faults == {}
    assert Controller(s).as_dict()["heat_rates"] == {}
    restored = Controller(s)
    restored.restore(c.as_dict())
    assert restored.heat_rates == {"cave": 2.0}


def test_rest_puts_heaters_back_to_comfort_and_dehumidifiers_off():
    s = settings(heating=["climate.r"], dehumidifiers=["switch.plug"])
    c, room = Controller(s), s.rooms[0]
    c.targets.update({"climate.r": "heat:eco:17", "switch.plug": "dry"})
    states = {
        "climate.r": DeviceState(on=True, hvac_mode="heat", setpoint=17.0),
        "switch.plug": DeviceState(on=True),
    }
    assert calls(c.rest(T0, room, "heating", states)) == [
        ("climate.r", "climate.set_temperature", {"temperature": 20.0})
    ]
    assert calls(c.rest(T0, room, "dehumidifiers", states)) == [("switch.plug", "switch.turn_off", {})]


# Alerts.


def test_new_alert_checks():
    s = settings(dehumidifiers=[{"entity_id": "switch.plug", "tank": "binary_sensor.tank"}]).rooms[0].alerts
    r = RoomReading(temperature=20, humidity=70, dew_margin=1.0, drier=3.0, has_openings=True, open=[])
    assert check("condensation_risk", s["condensation_risk"], r, 5.0, False).state is True
    assert check("air_to_dry", s["air_to_dry"], r, 5.0, False).state is True
    assert check("air_to_dry", s["air_to_dry"], replace(r, open=["binary_sensor.w"]), 5.0, False).state is False
    assert check("air_to_dry", s["air_to_dry"], r, -3.0, False).state is False  # Too cold outdoors.
    assert check("tank_full", s["tank_full"], replace(r, tank_full=True), 5.0, False) == Check(True)
    fault = check("heating_fault", s["heating_fault"], replace(r, heating_fault=20.0), 5.0, False)
    assert fault.state is True and fault.details == {"threshold": 20.0}
    assert check("pellets_low", s["pellets_low"], replace(r, pellets=15.0), 5.0, False).state is True


def test_air_to_dry_needs_a_damp_room():
    s = build_settings(
        {
            "outdoor_temperature": "sensor.out",
            "outdoor_humidity": "sensor.out_h",
            "rooms": [{"name": "Cave", "temperature": "sensor.t", "humidity": "sensor.h"}],
        }
    )
    e = Engine(s)
    dry = RoomReading(temperature=18, humidity=50, dew_margin=8.0, drier=3.0)
    e.evaluate(T0, {"cave": dry}, 5.0)
    assert "cave|air_to_dry" not in e.episodes
    damp = RoomReading(temperature=18, humidity=75, dew_margin=4.0, drier=3.0)
    e.evaluate(T0, {"cave": damp}, 5.0)
    assert "cave|humidity_high" in e.episodes and "cave|air_to_dry" in e.episodes
