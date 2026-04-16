"use client";

import { useState, useEffect } from "react";
import { highlands } from "@/data/highlands";
import { ScoreEntry } from "@/types/golf";

const STORAGE_KEY = "golf-caddy-scores";

function loadScores(): ScoreEntry[] {
  if (typeof window === "undefined") return createEmptyScores();
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return createEmptyScores();
    }
  }
  return createEmptyScores();
}

function createEmptyScores(): ScoreEntry[] {
  return highlands.holeDetails.map((h) => ({
    holeNumber: h.number,
    score: null,
  }));
}

function saveScores(scores: ScoreEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

export default function Scorecard() {
  const [scores, setScores] = useState<ScoreEntry[]>(createEmptyScores);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setScores(loadScores());
    setMounted(true);
  }, []);

  const updateScore = (holeNumber: number, value: string) => {
    const num = value === "" ? null : parseInt(value, 10);
    if (num !== null && (isNaN(num) || num < 1 || num > 15)) return;

    const updated = scores.map((s) =>
      s.holeNumber === holeNumber ? { ...s, score: num } : s
    );
    setScores(updated);
    saveScores(updated);
  };

  const clearScores = () => {
    const empty = createEmptyScores();
    setScores(empty);
    saveScores(empty);
  };

  const front9 = scores.slice(0, 9);
  const back9 = scores.slice(9, 18);
  const front9Total = front9.reduce((sum, s) => sum + (s.score || 0), 0);
  const back9Total = back9.reduce((sum, s) => sum + (s.score || 0), 0);
  const total = front9Total + back9Total;
  const frontPar = highlands.holeDetails.slice(0, 9).reduce((s, h) => s + h.par, 0);
  const backPar = highlands.holeDetails.slice(9, 18).reduce((s, h) => s + h.par, 0);
  const totalPar = frontPar + backPar;

  const getScoreColor = (score: number | null, par: number) => {
    if (score === null) return "";
    const diff = score - par;
    if (diff <= -2) return "text-yellow-400"; // eagle or better
    if (diff === -1) return "text-red-400"; // birdie
    if (diff === 0) return "text-white"; // par
    if (diff === 1) return "text-blue-400"; // bogey
    return "text-blue-300"; // double+
  };

  if (!mounted) return null;

  return (
    <div className="bg-gray-900 min-h-full pb-20">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Scorecard</h1>
        <button
          onClick={clearScores}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors px-3 py-1 border border-gray-700 rounded-lg"
        >
          Clear
        </button>
      </div>

      <div className="px-4 mb-3">
        <p className="text-sm text-gray-500">{highlands.name}</p>
      </div>

      {/* Score grid */}
      <div className="px-2">
        {/* Front 9 */}
        <div className="mb-2">
          <div className="text-xs text-gray-500 uppercase tracking-wider px-2 mb-1">
            Front 9
          </div>
          <div className="grid grid-cols-10 gap-0.5">
            {/* Header */}
            <div className="bg-gray-800 text-gray-500 text-[10px] text-center py-1 rounded-tl-lg">
              Hole
            </div>
            {front9.map((_, i) => (
              <div
                key={i}
                className="bg-gray-800 text-gray-400 text-xs text-center py-1 font-medium"
              >
                {i + 1}
              </div>
            ))}

            {/* Par row */}
            <div className="bg-gray-800/60 text-gray-500 text-[10px] text-center py-1">
              Par
            </div>
            {highlands.holeDetails.slice(0, 9).map((h) => (
              <div
                key={h.number}
                className="bg-gray-800/60 text-gray-400 text-xs text-center py-1"
              >
                {h.par}
              </div>
            ))}

            {/* Score row */}
            <div className="bg-gray-800/30 text-gray-500 text-[10px] text-center py-1 rounded-bl-lg">
              Score
            </div>
            {front9.map((entry, i) => (
              <div key={entry.holeNumber} className="bg-gray-800/30">
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={entry.score ?? ""}
                  onChange={(e) => updateScore(entry.holeNumber, e.target.value)}
                  className={`w-full h-full text-center text-sm bg-transparent outline-none py-1 ${getScoreColor(
                    entry.score,
                    highlands.holeDetails[i].par
                  )} placeholder-gray-700`}
                  placeholder="-"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end px-1 mt-1">
            <span className="text-xs text-gray-500">
              Front: <span className="text-white font-medium">{front9Total || "-"}</span>
              <span className="text-gray-600 mx-1">/</span>
              <span className="text-gray-400">{frontPar}</span>
            </span>
          </div>
        </div>

        {/* Back 9 */}
        <div className="mb-2">
          <div className="text-xs text-gray-500 uppercase tracking-wider px-2 mb-1">
            Back 9
          </div>
          <div className="grid grid-cols-10 gap-0.5">
            <div className="bg-gray-800 text-gray-500 text-[10px] text-center py-1 rounded-tl-lg">
              Hole
            </div>
            {back9.map((_, i) => (
              <div
                key={i}
                className="bg-gray-800 text-gray-400 text-xs text-center py-1 font-medium"
              >
                {i + 10}
              </div>
            ))}

            <div className="bg-gray-800/60 text-gray-500 text-[10px] text-center py-1">
              Par
            </div>
            {highlands.holeDetails.slice(9, 18).map((h) => (
              <div
                key={h.number}
                className="bg-gray-800/60 text-gray-400 text-xs text-center py-1"
              >
                {h.par}
              </div>
            ))}

            <div className="bg-gray-800/30 text-gray-500 text-[10px] text-center py-1 rounded-bl-lg">
              Score
            </div>
            {back9.map((entry, i) => (
              <div key={entry.holeNumber} className="bg-gray-800/30">
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={entry.score ?? ""}
                  onChange={(e) => updateScore(entry.holeNumber, e.target.value)}
                  className={`w-full h-full text-center text-sm bg-transparent outline-none py-1 ${getScoreColor(
                    entry.score,
                    highlands.holeDetails[i + 9].par
                  )} placeholder-gray-700`}
                  placeholder="-"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end px-1 mt-1">
            <span className="text-xs text-gray-500">
              Back: <span className="text-white font-medium">{back9Total || "-"}</span>
              <span className="text-gray-600 mx-1">/</span>
              <span className="text-gray-400">{backPar}</span>
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-gray-400 font-medium">Total</span>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-white">
              {total || "-"}
            </span>
            <span className="text-gray-500">/</span>
            <span className="text-lg text-gray-400">{totalPar}</span>
            {total > 0 && (
              <span
                className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                  total - totalPar < 0
                    ? "bg-red-900/40 text-red-400"
                    : total - totalPar === 0
                    ? "bg-gray-700 text-gray-300"
                    : "bg-blue-900/40 text-blue-400"
                }`}
              >
                {total - totalPar > 0 ? "+" : ""}
                {total - totalPar}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
