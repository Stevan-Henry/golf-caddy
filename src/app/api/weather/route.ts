import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy to OpenWeatherMap.
 *
 * Keeps the API key off the client. The browser calls /api/weather?lat=..&lng=..
 * and this route forwards the request with the secret key.
 */
export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lng = req.nextUrl.searchParams.get("lng");
  const apiKey = process.env.WEATHER_API_KEY;

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Missing lat or lng query param" },
      { status: 400 }
    );
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: "WEATHER_API_KEY not configured on the server" },
      { status: 500 }
    );
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=imperial`;

  try {
    const upstream = await fetch(url, { next: { revalidate: 300 } });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `OpenWeather returned ${upstream.status}` },
        { status: upstream.status }
      );
    }
    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 }
    );
  }
}
