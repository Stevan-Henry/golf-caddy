"use client";

import { useMemo } from "react";
import { WeatherSystem } from "@/store/useGolfStore";

interface WeatherOverlayProps {
  system: WeatherSystem | null;
  /** Wind bearing "from" direction in degrees (OWM) — used to tilt rain/snow. */
  windFromDeg?: number;
  /** Wind speed in mph — used to amplify drift. */
  windSpeedMph?: number;
}

/**
 * Pure-CSS weather effects layered over the map.
 * No Three.js — lightweight, works everywhere, looks cartoon-y.
 */
export default function WeatherOverlay({
  system,
  windFromDeg = 0,
  windSpeedMph = 0,
}: WeatherOverlayProps) {
  // Tilt rain/snow based on wind direction
  const dropTilt = useMemo(() => {
    // Clamp influence so heavy wind doesn't make drops horizontal
    const mag = Math.min(1, windSpeedMph / 25);
    // Sign flips based on whether wind blows left-to-right or right-to-left
    const sway = Math.sin(((windFromDeg + 90) * Math.PI) / 180);
    return sway * mag * 22; // degrees
  }, [windFromDeg, windSpeedMph]);

  if (!system || system === "sun" || system === "wind") {
    // 'sun' still gets a subtle glow; 'wind' handled by the WindArrow on the map
    if (system === "sun") return <SunRays />;
    return null;
  }

  if (system === "rain") return <RainLayer tilt={dropTilt} density={1} />;
  if (system === "storm")
    return (
      <>
        <StormTint />
        <RainLayer tilt={dropTilt} density={1.5} />
        <LightningLayer />
      </>
    );
  if (system === "fog") return <FogLayer />;

  return null;
}

// ────────────────────────────────────────────────────────────────
// Effect layers
// ────────────────────────────────────────────────────────────────

function RainLayer({ tilt, density }: { tilt: number; density: number }) {
  const count = Math.round(70 * density);
  const drops = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: 0.7 + Math.random() * 0.8,
        length: 14 + Math.random() * 18,
        key: i,
      })),
    [count]
  );

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden z-[5]"
      style={{ transform: `rotate(${tilt}deg) scale(1.3)` }}
      aria-hidden
    >
      {drops.map((d) => (
        <span
          key={d.key}
          className="absolute top-0 block bg-gradient-to-b from-sky-200/0 via-sky-200/70 to-sky-200/80 rounded-full"
          style={{
            left: `${d.left}%`,
            width: "2px",
            height: `${d.length}px`,
            animation: `rainFall ${d.duration}s linear ${d.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function StormTint() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[4] bg-slate-900/35"
      aria-hidden
    />
  );
}

function LightningLayer() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[6] bg-white"
      style={{ animation: "lightningFlash 9s ease-in-out infinite" }}
      aria-hidden
    />
  );
}

function FogLayer() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden" aria-hidden>
      <div
        className="absolute inset-x-[-20%] top-0 h-[45%] bg-gradient-to-b from-white/85 via-white/55 to-transparent"
        style={{ animation: "fogDrift 18s ease-in-out infinite" }}
      />
      <div
        className="absolute inset-x-[-20%] bottom-0 h-[40%] bg-gradient-to-t from-white/70 via-white/40 to-transparent"
        style={{ animation: "fogDrift 22s ease-in-out infinite reverse" }}
      />
    </div>
  );
}

function SunRays() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[3] overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute -top-[25%] -right-[20%] w-[70vmax] h-[70vmax] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,240,170,0.55) 0%, rgba(255,240,170,0.25) 25%, rgba(255,240,170,0) 55%)",
          animation: "sunRays 12s ease-in-out infinite",
        }}
      />
    </div>
  );
}
