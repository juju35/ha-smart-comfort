"""Three-way merge of a changed YAML into the UI changes."""

from custom_components.smart_comfort.merge import merge


def test_unchanged_yaml_keeps_ui() -> None:
    base = {"digest_window": 5, "rooms": [{"name": "A"}]}
    current = {"digest_window": 10, "rooms": [{"name": "A"}, {"name": "B"}]}
    assert merge(base, current, base) == (current, [])


def test_yaml_change_keeps_other_ui_changes() -> None:
    base = {"digest_window": 5, "quiet_start": "22:00", "alerts": {"too_hot": {"threshold": 27}}}
    current = {"digest_window": 10, "quiet_start": "22:00", "alerts": {"too_hot": {"threshold": 27, "delay": 15}}}
    new = {"digest_window": 5, "quiet_start": "23:00", "alerts": {"too_hot": {"threshold": 28}}}
    merged, conflicts = merge(base, current, new)
    assert merged == {
        "digest_window": 10,
        "quiet_start": "23:00",
        "alerts": {"too_hot": {"threshold": 28, "delay": 15}},
    }
    assert conflicts == []


def test_both_changed_yaml_wins() -> None:
    merged, conflicts = merge({"digest_window": 5}, {"digest_window": 10}, {"digest_window": 3})
    assert merged == {"digest_window": 3}
    assert conflicts == ["digest_window"]


def test_same_change_no_conflict() -> None:
    assert merge({"digest_window": 5}, {"digest_window": 3}, {"digest_window": 3}) == ({"digest_window": 3}, [])


def test_removed_from_yaml() -> None:
    merged, conflicts = merge({"a": 1, "b": 2}, {"a": 1, "b": 2, "c": 3}, {"a": 1})
    assert merged == {"a": 1, "c": 3}
    assert conflicts == []


def test_rooms_matched_by_name_and_id() -> None:
    base = {"rooms": [{"name": "Séjour", "temperature": "sensor.t1"}, {"name": "Bureau"}]}
    current = {
        "rooms": [
            {"name": "Séjour", "temperature": "sensor.t1", "humidity": "sensor.h1"},
            {"name": "Bureau"},
            {"id": "chambre", "name": "Chambre"},
        ]
    }
    new = {"rooms": [{"name": "Séjour", "temperature": "sensor.t2"}, {"name": "Cuisine"}]}
    merged, conflicts = merge(base, current, new)
    assert merged["rooms"] == [
        {"name": "Séjour", "temperature": "sensor.t2", "humidity": "sensor.h1"},
        {"id": "chambre", "name": "Chambre"},
        {"name": "Cuisine"},
    ]
    assert conflicts == []


def test_room_conflict_path() -> None:
    base = {"rooms": [{"name": "Séjour", "alerts": {"too_hot": {"threshold": 27}}}]}
    current = {"rooms": [{"name": "Séjour", "alerts": {"too_hot": {"threshold": 26}}}]}
    new = {"rooms": [{"name": "Séjour", "alerts": {"too_hot": {"threshold": 28}}}]}
    merged, conflicts = merge(base, current, new)
    assert merged == new
    assert conflicts == ["rooms[Séjour].alerts.too_hot.threshold"]


def test_entity_lists_by_item() -> None:
    base = {"notify": ["notify.a"], "rooms": [{"name": "A", "fans": ["fan.x"]}]}
    current = {
        "notify": ["notify.a", "notify.b"],
        "rooms": [{"name": "A", "fans": [{"entity_id": "fan.x", "preset": "p"}]}],
    }
    new = {"notify": ["notify.c"], "rooms": [{"name": "A", "fans": ["fan.x", "fan.y"]}]}
    merged, conflicts = merge(base, current, new)
    assert merged["notify"] == ["notify.b", "notify.c"]
    assert merged["rooms"][0]["fans"] == [{"entity_id": "fan.x", "preset": "p"}, "fan.y"]
    assert conflicts == []


def test_plain_list_is_one_value() -> None:
    merged, conflicts = merge({"naps": [1, 2]}, {"naps": [1, 3]}, {"naps": [2, 2]})
    assert merged == {"naps": [2, 2]}
    assert conflicts == ["naps"]
