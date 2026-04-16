import { Position } from "@/types/golf";

const STORAGE_KEY = "golf-caddy-hole-positions";

export interface HolePositionOverride {
  tee?: Position;
  green?: Position;
}

type AllOverrides = Record<number, HolePositionOverride>;

function readAll(): AllOverrides {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeAll(data: AllOverrides): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getHoleOverride(holeNumber: number): HolePositionOverride {
  return readAll()[holeNumber] || {};
}

export function setTeeOverride(holeNumber: number, pos: Position): void {
  const all = readAll();
  all[holeNumber] = { ...(all[holeNumber] || {}), tee: pos };
  writeAll(all);
}

export function setGreenOverride(holeNumber: number, pos: Position): void {
  const all = readAll();
  all[holeNumber] = { ...(all[holeNumber] || {}), green: pos };
  writeAll(all);
}
