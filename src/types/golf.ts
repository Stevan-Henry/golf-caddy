export interface Position {
  lat: number;
  lng: number;
}

export interface TeeBox {
  name: string;
  color: string;
  totalYards: number;
  rating: number;
  slope: number;
}

export interface HoleDetail {
  number: number;
  par: number;
  handicap: number;
  yardages: Record<string, number>; // tee name -> yards
  teePosition: Position;
  greenCenter: Position;
  description: string;
}

export interface Course {
  name: string;
  address: string;
  center: Position;
  par: number;
  holes: number;
  tees: TeeBox[];
  holeDetails: HoleDetail[];
}

export interface DistanceMeasurement {
  from: Position;
  to: Position;
  yards: number;
}

export interface UserLocation {
  position: Position;
  accuracy: number; // meters
  timestamp: number;
}

export interface ScoreEntry {
  holeNumber: number;
  score: number | null;
}

export interface Settings {
  selectedTee: string;
  gpsEnabled: boolean;
  units: "yards" | "meters";
}
