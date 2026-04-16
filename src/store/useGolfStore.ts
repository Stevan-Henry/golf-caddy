import { create } from "zustand";
import { Position } from "@/types/golf";

export type WeatherSystem = "sun" | "wind" | "rain" | "storm" | "fog";

export interface OpenWeatherResponse {
  weather: { main: string; description: string; icon: string }[];
  main: { temp: number; feels_like: number; humidity: number };
  wind: { speed: number; deg: number; gust?: number };
  visibility: number;
  rain?: { "1h"?: number };
  name: string;
}

export interface DistanceReading {
  meters: number;
  yards: number;
}

interface GolfStore {
  // Player position (from GPS)
  playerPos: Position | null;
  gpsAccuracy: number | null;
  gpsError: string | null;

  // Live distance from player to current pin (computed in useGPS)
  distanceToPin: DistanceReading | null;

  // Weather
  weather: OpenWeatherResponse | null;
  activeWeatherSystem: WeatherSystem | null;

  // Actions
  setPlayerPos: (pos: Position, accuracy?: number) => void;
  setGpsError: (msg: string | null) => void;
  setDistanceToPin: (d: DistanceReading | null) => void;
  setWeather: (w: OpenWeatherResponse) => void;
}

/** Classify an OpenWeatherMap payload into a single weather system bucket. */
function classifyWeather(w: OpenWeatherResponse): WeatherSystem {
  const condition = w.weather[0]?.main.toLowerCase() ?? "";
  if (condition.includes("thunderstorm")) return "storm";
  if (condition.includes("rain") || condition.includes("drizzle")) return "rain";
  if (
    condition.includes("fog") ||
    condition.includes("mist") ||
    condition.includes("haze")
  )
    return "fog";
  // Clear / clouds with significant wind → "wind"
  if (w.wind.speed > 7) return "wind";
  return "sun";
}

export const useGolfStore = create<GolfStore>((set) => ({
  playerPos: null,
  gpsAccuracy: null,
  gpsError: null,
  distanceToPin: null,
  weather: null,
  activeWeatherSystem: null,

  setPlayerPos: (pos, accuracy) =>
    set({ playerPos: pos, gpsAccuracy: accuracy ?? null, gpsError: null }),
  setGpsError: (msg) => set({ gpsError: msg }),
  setDistanceToPin: (d) => set({ distanceToPin: d }),
  setWeather: (w) => set({ weather: w, activeWeatherSystem: classifyWeather(w) }),
}));
