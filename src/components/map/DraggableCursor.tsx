"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { Position } from "@/types/golf";
import { distanceInYards } from "@/lib/distance";

interface DraggableCursorProps {
  teePosition: Position;
  greenPosition: Position;
  /** Called whenever the cursor distance from tee changes */
  onDistanceChange?: (distFromTee: number, distToGreen: number) => void;
}

export default function DraggableCursor({
  teePosition,
  greenPosition,
  onDistanceChange,
}: DraggableCursorProps) {
  const map = useMap();

  // Start cursor at midpoint between tee and green
  const midpoint: Position = {
    lat: (teePosition.lat + greenPosition.lat) / 2,
    lng: (teePosition.lng + greenPosition.lng) / 2,
  };

  const [cursorPos, setCursorPos] = useState<Position>(midpoint);
  const [isDragging, setIsDragging] = useState(false);
  const teeLineRef = useRef<google.maps.Polyline | null>(null);
  const greenLineRef = useRef<google.maps.Polyline | null>(null);

  // Report distances up
  useEffect(() => {
    const fromTee = distanceInYards(teePosition, cursorPos);
    const toGreen = distanceInYards(cursorPos, greenPosition);
    onDistanceChange?.(fromTee, toGreen);
  }, [cursorPos, teePosition, greenPosition, onDistanceChange]);

  // Draw lines: tee → cursor (solid white) and cursor → green (dashed white)
  useEffect(() => {
    if (!map) return;

    // Tee to cursor line (solid)
    if (!teeLineRef.current) {
      teeLineRef.current = new google.maps.Polyline({
        strokeColor: "#ffffff",
        strokeWeight: 2.5,
        strokeOpacity: 0.6,
        geodesic: true,
        map,
      });
    }
    teeLineRef.current.setPath([teePosition, cursorPos]);

    // Cursor to green line (dashed)
    if (!greenLineRef.current) {
      greenLineRef.current = new google.maps.Polyline({
        strokeColor: "#ffffff",
        strokeWeight: 2,
        strokeOpacity: 0,
        geodesic: true,
        map,
        icons: [
          {
            icon: {
              path: "M 0,-1 0,1",
              strokeOpacity: 0.5,
              strokeColor: "#ffffff",
              scale: 3,
            },
            offset: "0",
            repeat: "14px",
          },
        ],
      });
    }
    greenLineRef.current.setPath([cursorPos, greenPosition]);

    return () => {
      teeLineRef.current?.setMap(null);
      teeLineRef.current = null;
      greenLineRef.current?.setMap(null);
      greenLineRef.current = null;
    };
  }, [map, teePosition, greenPosition, cursorPos]);

  const handleDrag = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    setCursorPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  }, []);

  const distFromTee = distanceInYards(teePosition, cursorPos);
  const distToGreen = distanceInYards(cursorPos, greenPosition);

  return (
    <AdvancedMarker
      position={cursorPos}
      draggable
      onDragStart={() => setIsDragging(true)}
      onDrag={handleDrag}
      onDragEnd={(e) => {
        setIsDragging(false);
        if (e.latLng) {
          setCursorPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
      }}
    >
      <div className="flex flex-col items-center select-none">
        {/* Distance badge above cursor */}
        <div
          className={`mb-1.5 px-3 py-1 rounded-full shadow-xl transition-all ${
            isDragging
              ? "bg-white text-gray-900 scale-105"
              : "bg-black/70 backdrop-blur-md text-white border border-white/20"
          }`}
        >
          <span className="text-sm font-bold tabular-nums">{distToGreen}</span>
          <span className="text-[10px] ml-0.5 opacity-60">yd</span>
        </div>

        {/* Crosshair */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          className={`drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-transform ${
            isDragging ? "scale-110" : ""
          }`}
        >
          {/* Outer ring */}
          <circle
            cx="24"
            cy="24"
            r="18"
            fill="none"
            stroke="white"
            strokeWidth="2"
            opacity="0.85"
          />
          {/* Inner ring */}
          <circle
            cx="24"
            cy="24"
            r="6"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            opacity="0.85"
          />
          {/* Center dot */}
          <circle cx="24" cy="24" r="2" fill="white" />
          {/* Crosshair lines */}
          <line x1="24" y1="2" x2="24" y2="15" stroke="white" strokeWidth="1.5" opacity="0.7" />
          <line x1="24" y1="33" x2="24" y2="46" stroke="white" strokeWidth="1.5" opacity="0.7" />
          <line x1="2" y1="24" x2="15" y2="24" stroke="white" strokeWidth="1.5" opacity="0.7" />
          <line x1="33" y1="24" x2="46" y2="24" stroke="white" strokeWidth="1.5" opacity="0.7" />
        </svg>
      </div>
    </AdvancedMarker>
  );
}
