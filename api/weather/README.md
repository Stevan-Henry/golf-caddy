# Weather API

This API provides weather information specifically formatted for golf course conditions and recommendations.

## Endpoint

`GET /api/weather`

## Parameters

- `lat` (required): Latitude of the golf course
- `lon` (required): Longitude of the golf course  
- `course` (optional): Name of the golf course

## Example Request

```
GET /api/weather?lat=40.7128&lon=-74.0060&course=Central Park Golf Course
```

## Example Response

```json
{
  "course": "Central Park Golf Course",
  "location": {
    "lat": 40.7128,
    "lon": -74.0060
  },
  "current": {
    "temperature": 72,
    "feelsLike": 75,
    "humidity": 65,
    "pressure": 1013,
    "visibility": 10
  },
  "wind": {
    "speed": 8,
    "direction": 225,
    "gust": null
  },
  "conditions": {
    "main": "Clear",
    "description": "clear sky",
    "icon": "01d"
  },
  "golfConditions": {
    "playability": "excellent",
    "recommendations": []
  },
  "timestamp": "2025-10-31T12:00:00.000Z"
}
```

## Setup

1. Get a weather API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Add your API key to your `.env.local` file:
   ```
   WEATHER_API_KEY=your_api_key_here
   ```

## Golf-Specific Features

- **Playability Score**: Rates conditions as excellent, good, challenging, or poor
- **Golf Recommendations**: Provides specific advice based on weather conditions
- **Wind Analysis**: Includes wind speed, direction, and gusts for shot planning
- **Temperature Effects**: Considers how temperature affects ball flight