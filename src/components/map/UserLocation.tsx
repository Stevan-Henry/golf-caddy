"use client";

import { useState, useEffect, useCallback } from "react";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { Position, UserLocation as UserLocationData } from "@/types/golf";

interface UserLocationProps {
  onLocationUpdate?: (location: UserLocationData) => void;
  followUser?: boolean;
}

export default function UserLocation({
  onLocationUpdate,
  followUser = false,
}: UserLocationProps) {
  const map = useMap();
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePosition = useCallback(
    (pos: GeolocationPosition) => {
      const newPos: Position = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      setPosition(newPos);
      setError(null);

      onLocationUpdate?.({
        position: newPos,
        accuracy: pos.coords.accuracy,
        timestamp: pos.timestamp,
      });

      if (followUser && map) {
        map.panTo(newPos);
      }
    },
    [map, followUser, onLocationUpdate]
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      handlePosition,
      (err) => setError(err.message),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [handlePosition]);

  if (error) {
    return (
      <div className="absolute bottom-20 left-4 bg-red-900/90 text-red-200 px-3 py-2 rounded-lg text-xs">
        GPS: {error}
      </div>
    );
  }

  if (!position) return null;

  return (
    <AdvancedMarker position={position}>
      <div className="relative">
        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
        <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-40" />
      </div>
    </AdvancedMarker>
  );
}
