"use client";

import { useEffect, useMemo, useRef } from "react";
import { Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { HoleDetail, Position } from "@/types/golf";
import { calculateBearing, offsetPosition } from "@/lib/distance";
import DraggableCursor from "./DraggableCursor";
import FlyoverCamera from "./FlyoverCamera";
import WindArrow from "./WindArrow";
import ThreeOverlay from "./ThreeOverlay";
import { useGolfStore } from "@/store/useGolfStore";

interface HoleMapProps {
  hole: HoleDetail;
  onCursorDistanceChange?: (distFromTee: number, distToGreen: number) => void;
  onTeeMove?: (pos: Position) => void;
  onGreenMove?: (pos: Position) => void;
}

/**
 * Fits the viewport to tee + green on hole change. Asymmetric padding pushes
 * the green toward the top of the screen (assuming vector rotation works).
 */
function FitToHole({ hole }: { hole: HoleDetail }) {
  const map = useMap();
  const positionsRef = useRef({ tee: hole.teePosition, green: hole.greenCenter });
  positionsRef.current = { tee: hole.teePosition, green: hole.greenCenter };

  useEffect(() => {
    if (!map) return;
    const { tee, green } = positionsRef.current;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(tee);
    bounds.extend(green);
    map.fitBounds(bounds, { top: 80, bottom: 160, left: 20, right: 20 });
  }, [map, hole.number]);

  return null;
}

export default function HoleMap({
  hole,
  onCursorDistanceChange,
  onTeeMove,
  onGreenMove,
}: HoleMapProps) {
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || "";
  const weather = useGolfStore((s) => s.weather);

  useEffect(() => {
    if (!mapId && typeof window !== "undefined") {
      console.warn(
        "NEXT_PUBLIC_GOOGLE_MAP_ID is not set — map is running in raster mode and cannot rotate/tilt."
      );
    }
  }, [mapId]);

  const heading = useMemo(
    () => calculateBearing(hole.teePosition, hole.greenCenter),
    [hole]
  );

  const defaultCenter = useMemo<Position>(
    () => ({
      lat: (hole.teePosition.lat + hole.greenCenter.lat) / 2,
      lng: (hole.teePosition.lng + hole.greenCenter.lng) / 2,
    }),
    [hole]
  );

  // Wind arrow sits about 40% of the way from tee to green, off to one side
  const windArrowPos = useMemo<Position>(
    () => offsetPosition(hole.teePosition, hole.greenCenter, 0.4),
    [hole]
  );

  return (
    <div className="w-full h-full cartoon-map-filter">
      <Map
        style={{ width: "100vw", height: "100dvh" }}
        defaultCenter={defaultCenter}
        defaultZoom={17}
        mapTypeId="hybrid"
        gestureHandling="greedy"
        disableDefaultUI
        mapId={mapId}
        heading={heading}
        tilt={0}
        minZoom={15}
        maxZoom={20}
      >
        <FitToHole hole={hole} />
        <FlyoverCamera hole={hole} />

        {/* Cartoon tee box marker */}
        <AdvancedMarker
          position={hole.teePosition}
          draggable
          onDragEnd={(e) => {
            if (e.latLng) onTeeMove?.({ lat: e.latLng.lat(), lng: e.latLng.lng() });
          }}
        >
          <div className="relative flex flex-col items-center select-none">
            <div className="px-2.5 py-0.5 rounded-full bg-white text-[10px] font-extrabold text-emerald-700 tracking-wide shadow-lg mb-1 border-2 border-emerald-500">
              TEE
            </div>
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.5)] border-[3px] border-emerald-500">
              <div className="w-4 h-4 rounded-full bg-emerald-500" />
            </div>
          </div>
        </AdvancedMarker>

        {/* Cartoon flag (waving) */}
        <AdvancedMarker
          position={hole.greenCenter}
          draggable
          onDragEnd={(e) => {
            if (e.latLng) onGreenMove?.({ lat: e.latLng.lat(), lng: e.latLng.lng() });
          }}
        >
          <div className="relative flex flex-col items-center select-none">
            <div className="px-2.5 py-0.5 rounded-full bg-red-500 text-[10px] font-extrabold text-white tracking-wide shadow-lg mb-1 border-2 border-white">
              PIN
            </div>
            <svg
              width="44"
              height="56"
              viewBox="0 0 44 56"
              className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
            >
              {/* Pole */}
              <rect x="20" y="4" width="3" height="48" fill="#FAFAFA" rx="1.5" />
              {/* Waving flag — this inner group is animated */}
              <g
                style={{
                  transformOrigin: "21px 10px",
                  animation: "flagWave 1.8s ease-in-out infinite",
                }}
              >
                <path
                  d="M23 5 L42 11 L23 18 Z"
                  fill="#EF4444"
                  stroke="#991B1B"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
                {/* Hole number on the flag */}
                <text
                  x="29"
                  y="14"
                  fontSize="8"
                  fontWeight="800"
                  fill="white"
                  textAnchor="middle"
                  style={{ pointerEvents: "none" }}
                >
                  {hole.number}
                </text>
              </g>
              {/* Base plate */}
              <ellipse cx="21.5" cy="53" rx="7" ry="2.5" fill="#1F2937" opacity="0.55" />
              {/* Ball under the pole */}
              <circle cx="21.5" cy="51" r="3" fill="white" stroke="#9CA3AF" strokeWidth="0.8" />
            </svg>
          </div>
        </AdvancedMarker>

        {/* Live 3D golfer avatar at player's GPS position (requires vector mapId) */}
        <ThreeOverlay />

        {/* Wind direction arrow */}
        {weather && (
          <WindArrow
            position={windArrowPos}
            fromDeg={weather.wind.deg}
            speedMph={weather.wind.speed}
          />
        )}

        {/* Rangefinder cursor (unchanged) */}
        <DraggableCursor
          teePosition={hole.teePosition}
          greenPosition={hole.greenCenter}
          onDistanceChange={onCursorDistanceChange}
        />
      </Map>
    </div>
  );
}
