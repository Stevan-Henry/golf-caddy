// Weather API Types

export interface WeatherLocation {
  lat: number;
  lon: number;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  visibility: number | null;
  uvIndex?: number | null;
}

export interface WindConditions {
  speed: number;
  direction: number;
  gust: number | null;
}

export interface WeatherConditions {
  main: string;
  description: string;
  icon: string;
}

export interface GolfConditions {
  playability: 'excellent' | 'good' | 'challenging' | 'poor';
  recommendations: string[];
}

export interface WeatherResponse {
  course: string;
  location: WeatherLocation;
  current: CurrentWeather;
  wind: WindConditions;
  conditions: WeatherConditions;
  golfConditions: GolfConditions;
  timestamp: string;
}

export interface WeatherApiError {
  error: string;
}