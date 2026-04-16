"use client";

import { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { HoleDetail } from "@/types/golf";
import { calculateBearing } from "@/lib/distance";

interface FlyoverCameraProps {
  hole: HoleDetail;
}

/**
 * Runs a short cinematic camera flyover each time the hole number changes:
 *   1. Pulls out and tilts straight down
 *   2. Tilts up and orbits partway around the hole
 *   3. Settles looking down the line from tee toward green
 *
 * Uses `map.moveCamera()` on the underlying google.maps.Map instance.
 * Only runs on vector maps (mapId set) — tilt/heading are no-ops on raster.
 */
export default function FlyoverCamera({ hole }: FlyoverCameraProps) {
  const map = useMap();
  const lastHoleRef = useRef<number | null>(null);

  useEffect(() => {
    if (!map) return;
    // Only run once per hole change
    if (lastHoleRef.current === hole.number) return;
    lastHoleRef.current = hole.number;

    const teeHeading = calculateBearing(hole.teePosition, hole.greenCenter);
    const midpoint = {
      lat: (hole.teePosition.lat + hole.greenCenter.lat) / 2,
      lng: (hole.teePosition.lng + hole.greenCenter.lng) / 2,
    };

    let cancelled = false;
    const delay = (ms: number) =>
      new Promise<void>((res) => {
        if (cancelled) return res();
        setTimeout(res, ms);
      });

    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const animate = (
      to: { tilt?: number; heading?: number; zoom?: number; center?: google.maps.LatLngLiteral },
      duration: number
    ) =>
      new Promise<void>((resolve) => {
        const start = performance.now();
        const from = {
          tilt: map.getTilt() ?? 0,
          heading: map.getHeading() ?? 0,
          zoom: map.getZoom() ?? 17,
        };
        const tick = (now: number) => {
          if (cancelled) return resolve();
          const t = Math.min((now - start) / duration, 1);
          const e = easeInOut(t);
          const opts: google.maps.CameraOptions = {};
          if (to.tilt != null) opts.tilt = from.tilt + (to.tilt - from.tilt) * e;
          if (to.heading != null) {
            // Shortest-path heading interp (handles 350° → 10° cleanly)
            let delta = ((to.heading - from.heading + 540) % 360) - 180;
            opts.heading = from.heading + delta * e;
          }
          if (to.zoom != null) opts.zoom = from.zoom + (to.zoom - from.zoom) * e;
          if (to.center) opts.center = to.center;
          map.moveCamera(opts);
          if (t < 1) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      });

    (async () => {
      // Pull out and top-down
      await animate({ tilt: 0, zoom: 16.2, heading: teeHeading, center: midpoint }, 700);
      if (cancelled) return;
      // Tilt up and zoom in on the hole
      await animate({ tilt: 55, zoom: 17.6, heading: teeHeading - 25 }, 900);
      if (cancelled) return;
      await delay(80);
      // Swing the heading back to the playing line
      await animate({ tilt: 58, zoom: 17.8, heading: teeHeading, center: midpoint }, 900);
      if (cancelled) return;
      // Settle: slightly flatter so the map is usable
      await animate({ tilt: 35, zoom: 17.2 }, 500);
    })();

    return () => {
      cancelled = true;
    };
  }, [map, hole.number, hole.teePosition, hole.greenCenter]);

  return null;
}
