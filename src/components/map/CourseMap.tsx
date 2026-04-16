"use client";

import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useRouter } from "next/navigation";
import { highlands } from "@/data/highlands";
import UserLocation from "./UserLocation";

export default function CourseMap() {
  const router = useRouter();
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || "";

  return (
    <Map
      style={{ width: "100vw", height: "calc(100dvh - 4rem)" }}
      defaultCenter={highlands.center}
      defaultZoom={15}
      mapTypeId="hybrid"
      gestureHandling="greedy"
      disableDefaultUI
      mapId={mapId}
    >
      {highlands.holeDetails.map((hole) => (
        <AdvancedMarker
          key={hole.number}
          position={hole.teePosition}
          onClick={() => router.push(`/hole/${hole.number}`)}
        >
          <div className="flex flex-col items-center cursor-pointer group">
            <div className="w-8 h-8 bg-emerald-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-sm font-bold group-hover:bg-emerald-500 transition-colors">
              {hole.number}
            </div>
            <div className="mt-1 bg-gray-900/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
              Par {hole.par}
            </div>
          </div>
        </AdvancedMarker>
      ))}
      <UserLocation />
    </Map>
  );
}
