"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { Position } from "@/types/golf";
import { distanceInYards } from "@/lib/distance";
import { RotateCcw } from "lucide-react";

interface DistanceMeasurerProps {
  active: boolean;
}

export default function DistanceMeasurer({ active }: DistanceMeasurerProps) {
  const map = useMap();
  const [pointA, setPointA] = useState<Position | null>(null);
  const [pointB, setPointB] = useState<Position | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const lineRef = useRef<google.maps.Polyline | null>(null);
  const pointARef = useRef<Position | null>(null);

  // Keep ref in sync with state so the click handler always has the latest value
  pointARef.current = pointA;

  const clearLine = useCallback(() => {
    if (lineRef.current) {
      lineRef.current.setMap(null);
      lineRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setPointA(null);
    setPointB(null);
    setDistance(null);
    clearLine();
  }, [clearLine]);

  // Attach / detach click listener
  useEffect(() => {
    if (!map || !active) return;

    const listener = map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      const clicked: Position = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };

      if (!pointARef.current) {
        setPointA(clicked);
        setPointB(null);
        setDistance(null);
        clearLine();
      } else {
        setPointB(clicked);
        const yards = distanceInYards(pointARef.current, clicked);
        setDistance(yards);

        clearLine();
        const newLine = new google.maps.Polyline({
          path: [pointARef.current, clicked],
          strokeColor: "#FACC15",
          strokeWeight: 3,
          strokeOpacity: 0.9,
          map: map,
        });
        lineRef.current = newLine;

        // Reset pointA so next tap starts fresh
        setPointA(null);
      }
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, active, clearLine]);

  // Clean up line when deactivated
  useEffect(() => {
    if (!active) {
      reset();
    }
  }, [active, reset]);

  if (!active) return null;

  return (
    <>
      {pointA && (
        <AdvancedMarker position={pointA}>
          <div className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-gray-900">
            A
          </div>
        </AdvancedMarker>
      )}
      {pointB && (
        <AdvancedMarker position={pointB}>
          <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white">
            B
          </div>
        </AdvancedMarker>
      )}

      {/* Measurement overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        {distance !== null ? (
          <div className="bg-gray-900/95 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <span className="text-2xl font-bold text-yellow-400">
              {distance} yds
            </span>
            <button
              onClick={reset}
              className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        ) : (
          <div className="bg-gray-900/95 text-gray-300 px-4 py-2 rounded-xl shadow-lg text-sm">
            {pointA ? "Tap target" : "Tap ball position"}
          </div>
        )}
      </div>
    </>
  );
}
