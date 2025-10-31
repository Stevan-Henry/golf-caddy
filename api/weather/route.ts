import { NextRequest, NextResponse } from 'next/server';

// Weather API endpoint for golf course conditions
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const courseName = searchParams.get('course');

  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }

  try {
    // TODO: Replace with your preferred weather API (OpenWeatherMap, WeatherAPI, etc.)
    const weatherApiKey = process.env.WEATHER_API_KEY;
    
    if (!weatherApiKey) {
      return NextResponse.json(
        { error: 'Weather API key not configured' },
        { status: 500 }
      );
    }

    // Example using OpenWeatherMap API
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=imperial`
    );

    if (!weatherResponse.ok) {
      throw new Error('Weather API request failed');
    }

    const weatherData = await weatherResponse.json();

    // Format weather data for golf-specific needs
    const golfWeatherData = {
      course: courseName || 'Unknown Course',
      location: {
        lat: parseFloat(lat),
        lon: parseFloat(lon)
      },
      current: {
        temperature: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility ? Math.round(weatherData.visibility * 0.000621371) : null, // Convert to miles
        uvIndex: null, // Would need additional API call for UV data
      },
      wind: {
        speed: Math.round(weatherData.wind.speed),
        direction: weatherData.wind.deg,
        gust: weatherData.wind.gust ? Math.round(weatherData.wind.gust) : null
      },
      conditions: {
        main: weatherData.weather[0].main,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon
      },
      golfConditions: {
        playability: getPlayabilityScore(weatherData),
        recommendations: getGolfRecommendations(weatherData)
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(golfWeatherData);

  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}

// Helper function to determine golf playability
function getPlayabilityScore(weatherData: any): string {
  const temp = weatherData.main.temp;
  const windSpeed = weatherData.wind.speed;
  const condition = weatherData.weather[0].main.toLowerCase();

  if (condition.includes('rain') || condition.includes('storm')) {
    return 'poor';
  }
  
  if (temp < 45 || temp > 95 || windSpeed > 25) {
    return 'challenging';
  }
  
  if (temp >= 60 && temp <= 80 && windSpeed < 15) {
    return 'excellent';
  }
  
  return 'good';
}

// Helper function to provide golf-specific recommendations
function getGolfRecommendations(weatherData: any): string[] {
  const recommendations: string[] = [];
  const temp = weatherData.main.temp;
  const windSpeed = weatherData.wind.speed;
  const humidity = weatherData.main.humidity;

  if (windSpeed > 15) {
    recommendations.push('Strong winds - consider club up and aim into the wind');
  }
  
  if (humidity > 80) {
    recommendations.push('High humidity - balls may not carry as far');
  }
  
  if (temp < 50) {
    recommendations.push('Cold weather - balls will have less distance');
  }
  
  if (temp > 85) {
    recommendations.push('Hot weather - stay hydrated and take breaks');
  }

  return recommendations;
}