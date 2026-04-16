"use client";

import { useState, useEffect } from "react";
import { highlands } from "@/data/highlands";
import { Settings } from "@/types/golf";

const SETTINGS_KEY = "golf-caddy-settings";

const defaultSettings: Settings = {
  selectedTee: "Blue",
  gpsEnabled: true,
  units: "yards",
};

function loadSettings(): Settings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function saveSettings(settings: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setMounted(true);
  }, []);

  const update = (partial: Partial<Settings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveSettings(updated);
  };

  if (!mounted) return null;

  return (
    <div className="bg-gray-900 min-h-full pb-20 px-4 pt-4">
      <h1 className="text-xl font-bold text-white mb-6">Settings</h1>

      {/* Default tee */}
      <div className="mb-6">
        <label className="text-sm text-gray-400 uppercase tracking-wider block mb-2">
          Default Tee
        </label>
        <div className="grid grid-cols-2 gap-2">
          {highlands.tees.map((tee) => (
            <button
              key={tee.name}
              onClick={() => update({ selectedTee: tee.name })}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                settings.selectedTee === tee.name
                  ? "border-emerald-500 bg-emerald-900/20"
                  : "border-gray-700 bg-gray-800 hover:border-gray-600"
              }`}
            >
              <span
                className="w-4 h-4 rounded-full border-2 border-white/30"
                style={{ backgroundColor: tee.color }}
              />
              <div className="text-left">
                <div className="text-sm font-medium text-white">{tee.name}</div>
                <div className="text-xs text-gray-500">{tee.totalYards} yds</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* GPS */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800 rounded-xl">
          <div>
            <div className="text-sm font-medium text-white">GPS Tracking</div>
            <div className="text-xs text-gray-500">
              Track your position on the course
            </div>
          </div>
          <button
            onClick={() => update({ gpsEnabled: !settings.gpsEnabled })}
            className={`w-12 h-7 rounded-full transition-colors relative ${
              settings.gpsEnabled ? "bg-emerald-500" : "bg-gray-600"
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                settings.gpsEnabled ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Units */}
      <div className="mb-6">
        <label className="text-sm text-gray-400 uppercase tracking-wider block mb-2">
          Distance Units
        </label>
        <div className="flex gap-2">
          {(["yards", "meters"] as const).map((unit) => (
            <button
              key={unit}
              onClick={() => update({ units: unit })}
              className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium capitalize transition-colors ${
                settings.units === unit
                  ? "border-emerald-500 bg-emerald-900/20 text-white"
                  : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
              }`}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>

      {/* Course info */}
      <div className="mt-8 pt-6 border-t border-gray-800">
        <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-3">
          Course
        </h2>
        <div className="bg-gray-800 rounded-xl px-4 py-3">
          <div className="text-sm font-medium text-white">{highlands.name}</div>
          <div className="text-xs text-gray-500 mt-1">{highlands.address}</div>
          <div className="text-xs text-gray-500 mt-1">
            Par {highlands.par} &middot; {highlands.holes} holes
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-gray-600">
        Golf Caddy v0.1.0
      </div>
    </div>
  );
}
