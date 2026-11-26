"""Moist air: dew point, absolute humidity and the temperature of a room's coldest surface. Pure Python."""

from __future__ import annotations

import math

# Magnus formula over water (Sonntag 1990), good to ±0.35 °C from -45 to 60 °C.
MAGNUS_A = 17.62
MAGNUS_B = 243.12
# Inner surface temperature factor of a cold spot (thermal bridge, window frame): the surface sits this share of the
# way from the outdoor to the indoor temperature. 0.75 is the mould limit of EN ISO 13788 (fRsi), so a surface
# estimated with it condensing means a typical cold spot of the room would.
SURFACE_FACTOR = 0.75


def _vapour_pressure(temperature: float, humidity: float) -> float:
    """Partial pressure of the water vapour (hPa)."""
    return humidity / 100 * 6.112 * math.exp(MAGNUS_A * temperature / (MAGNUS_B + temperature))


def dew_point(temperature: float | None, humidity: float | None) -> float | None:
    """Dew point (°C) of air at this temperature (°C) and relative humidity (%), None when unknown."""
    if temperature is None or humidity is None or humidity <= 0:
        return None
    gamma = math.log(min(humidity, 100) / 100) + MAGNUS_A * temperature / (MAGNUS_B + temperature)
    return round(MAGNUS_B * gamma / (MAGNUS_A - gamma), 1)


def absolute_humidity(temperature: float | None, humidity: float | None) -> float | None:
    """Water held by the air (g/m³) at this temperature (°C) and relative humidity (%), None when unknown."""
    if temperature is None or humidity is None or humidity < 0:
        return None
    return round(216.7 * _vapour_pressure(temperature, min(humidity, 100)) / (273.15 + temperature), 2)


def surface_temperature(indoor: float | None, outdoor: float | None, measured: float | None = None) -> float | None:
    """Temperature (°C) of the room's coldest surface: measured, else estimated from the indoor and outdoor ones."""
    if measured is not None:
        return measured
    if indoor is None or outdoor is None:
        return None
    if outdoor >= indoor:
        return indoor
    return round(outdoor + SURFACE_FACTOR * (indoor - outdoor), 1)
