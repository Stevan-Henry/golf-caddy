"use client";

import { useEffect } from "react";
import { useGolfStore } from "@/store/useGolfStore";
import { distanceInMeters, distanceInYards } from "@/lib/distance";
import { Position } from "@/types/golf";

/**
 * Watches the browser's geolocation and pushes updates into the global store.
 * Also recomputes `distanceToPin` whenever either the player position or the
 * provided pin changes.
 *
 * @param pin Current pin (green) position — pass null to skip distance calc.
 */
export function useGPS(pin: Position | null) {
  const setPlayerPos = useGolfStore((s) => s.setPlayerPos);
  const setGpsError = useGolfStore((s) => s.setGpsError);
  const setDistanceToPin = useGolfStore((s) => s.setDistanceToPin);
  const playerPos = useGolfStore((s) => s.playerPos);

  // 1. Subscribe to geolocation
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsError("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPlayerPos(
          { lat: pos.coords.latitude, lng: pos.coords.longitude },
          pos.coords.accuracy
        );
      },
      (err) => {
        setGpsError(err.message);
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [setPlayerPos, setGpsError]);

  // 2. Recompute distance to pin whenever position or pin changes
  useEffect(() => {
    if (!playerPos || !pin) {
      setDistanceToPin(null);
      return;
    }
    setDistanceToPin({
      meters: distanceInMeters(playerPos, pin),
      yards: distanceInYards(playerPos, pin),
    });
  }, [playerPos, pin, setDistanceToPin]);
}
