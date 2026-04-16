"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import { highlands } from "@/data/highlands";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MapProvider from "@/components/map/MapProvider";
import HoleMap from "@/components/map/HoleMap";
import { Position } from "@/types/golf";
import {
  getHoleOverride,
  setTeeOverride,
  setGreenOverride,
} from "@/lib/holePositions";
import { useGPS } from "@/hooks/useGPS";
import { useWeather } from "@/hooks/useWeather";
import { useGolfStore } from "@/store/useGolfStore";
import { calculateBearing } from "@/lib/distance";
import { recommendClub } from "@/lib/clubRecommender";
import WeatherOverlay from "@/components/map/WeatherOverlay";

const SETTINGS_KEY = "golf-caddy-settings";

export default function HolePage() {
  const params = useParams();
  const router = useRouter();
  const holeNumber = parseInt(params.number as string, 10);

  const [selectedTee, setSelectedTee] = useState("Blue");
  const [teeOverride, setTeePos] = useState<Position | null>(null);
  const [greenOverride, setGreenPos] = useState<Position | null>(null);
  const [cursorDistToGreen, setCursorDistToGreen] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
        if (saved.selectedTee) setSelectedTee(saved.selectedTee);
      } catch {}
    }
  }, []);

  // Load saved tee/green overrides whenever the hole changes
  useEffect(() => {
    const override = getHoleOverride(holeNumber);
    setTeePos(override.tee ?? null);
    setGreenPos(override.green ?? null);
  }, [holeNumber]);

  const baseHole = highlands.holeDetails.find((h) => h.number === holeNumber);

  // Merge overrides onto the base hole data
  const hole = useMemo(() => {
    if (!baseHole) return null;
    return {
      ...baseHole,
      teePosition: teeOverride ?? baseHole.teePosition,
      greenCenter: greenOverride ?? baseHole.greenCenter,
    };
  }, [baseHole, teeOverride, greenOverride]);

  const handleCursorDistance = useCallback(
    (_fromTee: number, toGreen: number) => {
      setCursorDistToGreen(toGreen);
    },
    []
  );

  const handleTeeMove = useCallback(
    (pos: Position) => {
      setTeePos(pos);
      setTeeOverride(holeNumber, pos);
    },
    [holeNumber]
  );

  const handleGreenMove = useCallback(
    (pos: Position) => {
      setGreenPos(pos);
      setGreenOverride(holeNumber, pos);
    },
    [holeNumber]
  );

  // Live GPS + weather wiring
  useGPS(hole?.greenCenter ?? null);
  const playerPos = useGolfStore((s) => s.playerPos);
  useWeather(playerPos);
  const distanceToPin = useGolfStore((s) => s.distanceToPin);
  const weather = useGolfStore((s) => s.weather);
  const activeWeather = useGolfStore((s) => s.activeWeatherSystem);

  // Club recommendation (uses live pin distance + wind)
  const livePinYards = distanceToPin?.yards ?? null;
  const club = useMemo(() => {
    if (!hole || livePinYards == null || !weather) return null;
    const facing = calculateBearing(hole.teePosition, hole.greenCenter);
    return recommendClub(
      livePinYards,
      weather.wind.speed,
      weather.wind.deg,
      facing
    );
  }, [hole, livePinYards, weather]);

  if (!hole) {
    return (
      <div className="flex items-center justify-center h-dvh bg-gray-950 text-gray-500">
        Hole not found
      </div>
    );
  }

  const goToHole = (n: number) => {
    if (n >= 1 && n <= 18) router.push(`/hole/${n}`);
  };

  const totalYards = hole.yardages[selectedTee];
  const displayedPinYards = livePinYards ?? cursorDistToGreen;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-950">
      {/* ── Google Map ── */}
      <div className="absolute inset-0">
        <MapProvider>
          <HoleMap
            hole={hole}
            onCursorDistanceChange={handleCursorDistance}
            onTeeMove={handleTeeMove}
            onGreenMove={handleGreenMove}
          />
        </MapProvider>
      </div>

      {/* ── Cartoon weather overlay (rain / fog / storm / sun rays) ── */}
      <WeatherOverlay
        system={activeWeather}
        windFromDeg={weather?.wind.deg}
        windSpeedMph={weather?.wind.speed}
      />

      {/* ── Top bar ── */}
      <div className="relative z-10 px-4 pt-5">
        <div className="bg-black/50 backdrop-blur-2xl rounded-[20px] border border-white/[0.06] px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between">
            {/* Left: Hole stats */}
            <div className="flex items-center gap-4">
              {/* Total distance */}
              <div>
                <div className="text-[10px] font-medium text-white/35 uppercase tracking-[0.2em] mb-0.5">
                  Distance
                </div>
                <div className="text-[22px] font-extrabold text-white tabular-nums leading-none">
                  {totalYards}
                  <span className="text-[11px] font-semibold text-white/25 ml-0.5">yd</span>
                </div>
              </div>

              <div className="w-px h-8 bg-white/[0.06]" />

              {/* Par */}
              <div>
                <div className="text-[10px] font-medium text-white/35 uppercase tracking-[0.2em] mb-0.5">
                  Par
                </div>
                <div className="text-[22px] font-extrabold text-white leading-none">
                  {hole.par}
                </div>
              </div>

              <div className="w-px h-8 bg-white/[0.06]" />

              {/* Handicap */}
              <div>
                <div className="text-[10px] font-medium text-white/35 uppercase tracking-[0.2em] mb-0.5">
                  Hdcp
                </div>
                <div className="text-[22px] font-extrabold text-white leading-none">
                  {hole.handicap}
                </div>
              </div>
            </div>

            {/* Right: Distance to pin — GPS-live when available, else rangefinder cursor */}
            <div className="text-right">
              <div className="text-[10px] font-medium text-white/35 uppercase tracking-[0.2em] mb-0.5 flex items-center justify-end gap-1">
                {livePinYards != null && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
                {livePinYards != null ? "GPS to Pin" : "To Pin"}
              </div>
              <div className="font-cartoon text-[36px] font-bold text-emerald-400 tabular-nums leading-none tracking-tight">
                {displayedPinYards}
              </div>
              <div className="text-[10px] font-medium text-emerald-400/30 uppercase tracking-[0.2em]">
                yards
              </div>
            </div>
          </div>
        </div>

        {/* ── Weather + Club recommendation row ── */}
        {(weather || club) && (
          <div className="mt-2.5 bg-black/50 backdrop-blur-2xl rounded-[20px] border border-white/[0.06] px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between gap-4">
              {/* Weather */}
              {weather && (
                <div className="flex items-center gap-3">
                  <div className="text-2xl leading-none" aria-hidden>
                    {weatherEmoji(activeWeather)}
                  </div>
                  <div>
                    <div className="text-[10px] font-medium text-white/35 uppercase tracking-[0.2em] leading-none mb-1">
                      {weather.weather[0]?.main ?? "—"}
                    </div>
                    <div className="text-[13px] font-semibold text-white/90 tabular-nums leading-none">
                      {Math.round(weather.main.temp)}°F · {Math.round(weather.wind.speed)} mph {windDir(weather.wind.deg)}
                    </div>
                  </div>
                </div>
              )}

              {/* Club suggestion */}
              {club && (
                <div className="text-right">
                  <div className="text-[10px] font-medium text-white/35 uppercase tracking-[0.2em] mb-1">
                    Suggested Club
                  </div>
                  <div className="font-cartoon text-[22px] font-bold text-amber-300 leading-none">
                    {club.club}
                  </div>
                  {club.note && (
                    <div className="text-[10px] font-medium text-amber-300/60 mt-1">
                      {club.note} · plays {club.effectiveYards}y
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Center: map area (placeholder for now) ── */}
      <div className="flex-1" />

      {/* ── Bottom bar: hole navigation (sits above the fixed BottomNav) ── */}
      <div
        className="relative z-10 px-4"
        style={{ paddingBottom: "calc(4rem + env(safe-area-inset-bottom) + 0.75rem)" }}
      >
        <div className="bg-black/50 backdrop-blur-2xl rounded-[20px] border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between px-1.5 py-1.5">
            {/* Prev hole */}
            <button
              onClick={() => goToHole(holeNumber - 1)}
              disabled={holeNumber === 1}
              className="w-12 h-12 flex items-center justify-center rounded-2xl text-white/70 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.15] disabled:text-white/10 transition-all duration-150"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>

            {/* Hole number */}
            <div className="flex items-baseline gap-2.5">
              <span className="text-[11px] font-semibold text-white/30 uppercase tracking-[0.2em]">
                Hole
              </span>
              <span className="font-cartoon text-[44px] font-bold text-white tabular-nums leading-none tracking-tight">
                {hole.number}
              </span>
            </div>

            {/* Next hole */}
            <button
              onClick={() => goToHole(holeNumber + 1)}
              disabled={holeNumber === 18}
              className="w-12 h-12 flex items-center justify-center rounded-2xl text-white/70 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.15] disabled:text-white/10 transition-all duration-150"
            >
              <ChevronRight size={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── UI helpers ────────────────────────────────────────────────────────────
function weatherEmoji(system: string | null): string {
  switch (system) {
    case "storm":
      return "⛈️";
    case "rain":
      return "🌧️";
    case "fog":
      return "🌫️";
    case "wind":
      return "💨";
    case "sun":
      return "☀️";
    default:
      return "🌤️";
  }
}

function windDir(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}
