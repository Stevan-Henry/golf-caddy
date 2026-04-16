import { Position } from "@/types/golf";

const EARTH_RADIUS_METERS = 6371000;
const METERS_TO_YARDS = 1.09361;

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function haversineDistance(a: Position, b: Position): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_METERS * c;
}

export function distanceInYards(a: Position, b: Position): number {
  return Math.round(haversineDistance(a, b) * METERS_TO_YARDS);
}

export function distanceInMeters(a: Position, b: Position): number {
  return Math.round(haversineDistance(a, b));
}

/** Returns bearing in degrees (0-360) from point A to point B */
export function calculateBearing(from: Position, to: Position): number {
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function toDeg(rad: number): number {
  return rad * (180 / Math.PI);
}

/**
 * Offset a position by a fraction of the vector toward another position.
 * factor > 0 shifts toward `toward`, factor < 0 shifts away.
 */
export function offsetPosition(
  base: Position,
  toward: Position,
  factor: number
): Position {
  return {
    lat: base.lat + (toward.lat - base.lat) * factor,
    lng: base.lng + (toward.lng - base.lng) * factor,
  };
}
