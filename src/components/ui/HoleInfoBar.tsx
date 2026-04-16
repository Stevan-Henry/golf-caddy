"use client";

import { HoleDetail, TeeBox } from "@/types/golf";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface HoleInfoBarProps {
  hole: HoleDetail;
  tees: TeeBox[];
  selectedTee: string;
  onTeeChange: (tee: string) => void;
  onPrevHole: () => void;
  onNextHole: () => void;
}

export default function HoleInfoBar({
  hole,
  tees,
  selectedTee,
  onTeeChange,
  onPrevHole,
  onNextHole,
}: HoleInfoBarProps) {
  const [showDescription, setShowDescription] = useState(false);
  const [showTeeDropdown, setShowTeeDropdown] = useState(false);

  const currentTee = tees.find((t) => t.name === selectedTee);

  return (
    <div className="absolute top-0 left-0 right-0 z-20">
      {/* Main info bar */}
      <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between px-3 py-2">
          {/* Prev hole */}
          <button
            onClick={onPrevHole}
            disabled={hole.number === 1}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Hole info */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-400 uppercase tracking-wider">Hole</div>
              <div className="text-2xl font-bold text-white">{hole.number}</div>
            </div>

            <div className="w-px h-10 bg-gray-700" />

            <div className="text-center">
              <div className="text-xs text-gray-400 uppercase tracking-wider">Par</div>
              <div className="text-2xl font-bold text-white">{hole.par}</div>
            </div>

            <div className="w-px h-10 bg-gray-700" />

            {/* Tee selector */}
            <div className="relative">
              <button
                onClick={() => setShowTeeDropdown(!showTeeDropdown)}
                className="text-center"
              >
                <div className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: currentTee?.color }}
                  />
                  {selectedTee}
                </div>
                <div className="text-2xl font-bold text-white">
                  {hole.yardages[selectedTee]}
                  <span className="text-sm text-gray-400 ml-1">yds</span>
                </div>
              </button>

              {showTeeDropdown && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden min-w-[120px]">
                  {tees.map((tee) => (
                    <button
                      key={tee.name}
                      onClick={() => {
                        onTeeChange(tee.name);
                        setShowTeeDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left flex items-center gap-2 text-sm transition-colors ${
                        tee.name === selectedTee
                          ? "bg-gray-700 text-white"
                          : "text-gray-300 hover:bg-gray-700/50"
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tee.color }}
                      />
                      {tee.name} — {hole.yardages[tee.name]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-10 bg-gray-700" />

            <div className="text-center">
              <div className="text-xs text-gray-400 uppercase tracking-wider">Hdcp</div>
              <div className="text-2xl font-bold text-white">{hole.handicap}</div>
            </div>
          </div>

          {/* Next hole */}
          <button
            onClick={onNextHole}
            disabled={hole.number === 18}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Description toggle */}
      <button
        onClick={() => setShowDescription(!showDescription)}
        className="w-full bg-gray-900/80 backdrop-blur-sm text-gray-400 text-xs px-4 py-1.5 flex items-center justify-center gap-1 hover:text-gray-300 transition-colors"
      >
        Strategy tip
        {showDescription ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {showDescription && (
        <div className="bg-gray-900/90 backdrop-blur-sm text-gray-300 text-sm px-4 py-3 border-b border-gray-800">
          {hole.description}
        </div>
      )}
    </div>
  );
}
