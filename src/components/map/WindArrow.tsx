"use client";

import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { Position } from "@/types/golf";

interface WindArrowProps {
  position: Position;
  /** Direction wind is coming FROM, in degrees (OpenWeatherMap spec). */
  fromDeg: number;
  /** Wind speed in mph. Arrow scales with magnitude. */
  speedMph: number;
}

/**
 * Floating cartoon wind arrow rendered as an AdvancedMarker.
 * Size + opacity scale with wind speed. Bobs up and down with a CSS float animation.
 */
export default function WindArrow({ position, fromDeg, speedMph }: WindArrowProps) {
  if (speedMph < 2) return null; // Hide when effectively calm

  // Convert "wind from" to "wind toward" for the arrow direction
  const towardDeg = (fromDeg + 180) % 360;

  // Scale visual size: 2mph → 0.85, 25mph → 1.6
  const scale = Math.min(1.6, 0.85 + (speedMph - 2) / 30);
  const opacity = Math.min(0.95, 0.55 + speedMph / 40);
  const label = `${Math.round(speedMph)} mph`;

  return (
    <AdvancedMarker position={position}>
      <div
        className="flex flex-col items-center select-none pointer-events-none"
        style={{
          transform: `scale(${scale})`,
          opacity,
          animation: "windArrowFloat 3s ease-in-out infinite",
        }}
      >
        <div
          style={{
            transform: `rotate(${towardDeg}deg)`,
          }}
        >
          <svg
            width="38"
            height="52"
            viewBox="0 0 38 52"
            className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]"
          >
            {/* Arrow shaft */}
            <rect x="16" y="14" width="6" height="24" rx="2" fill="#60A5FA" />
            {/* Arrow head */}
            <polygon points="4,14 19,0 34,14 26,14 26,20 12,20 12,14" fill="#3B82F6" />
            {/* Tail */}
            <polygon points="14,38 19,50 24,38" fill="#1D4ED8" />
            {/* Highlight */}
            <rect x="17" y="14" width="2" height="24" fill="#DBEAFE" opacity="0.6" />
          </svg>
        </div>
        <div className="mt-1 px-2 py-0.5 rounded-full bg-blue-500/90 text-white text-[10px] font-bold tracking-wide shadow">
          {label}
        </div>
      </div>
    </AdvancedMarker>
  );
}
