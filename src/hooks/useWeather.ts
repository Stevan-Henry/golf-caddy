"use client";

import { useEffect } from "react";
import { useGolfStore, OpenWeatherResponse } from "@/store/useGolfStore";
import { Position } from "@/types/golf";

const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Polls /api/weather for current conditions at the given position.
 * Refetches every 5 minutes. Pass null to disable.
 */
export function useWeather(position: Position | null) {
  const setWeather = useGolfStore((s) => s.setWeather);

  useEffect(() => {
    if (!position) return;

    let cancelled = false;

    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `/api/weather?lat=${position.lat}&lng=${position.lng}`
        );
        if (!res.ok) return;
        const data: OpenWeatherResponse = await res.json();
        if (!cancelled) setWeather(data);
      } catch (err) {
        console.warn("Weather fetch failed:", err);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [position?.lat, position?.lng, setWeather]);
}
