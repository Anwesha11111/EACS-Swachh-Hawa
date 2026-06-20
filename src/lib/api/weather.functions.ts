import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getWeather, type CityWeather } from "../data/imd-weather";

// Weather server function.
// With WEATHER_API_KEY: fetches from OpenWeatherMap 2.5 (or any compatible
// provider set via WEATHER_PROVIDER env). Without a key: returns the IMD
// seed dataset — already detailed enough for the demo.

async function fetchOpenWeather(city: string, apiKey: string): Promise<CityWeather | null> {
  try {
    const current = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},IN&appid=${apiKey}&units=metric`,
      { headers: { Accept: "application/json" } }
    );
    if (!current.ok) return null;
    const c = await current.json() as {
      main: { temp: number; feels_like: number; humidity: number; pressure: number };
      wind: { speed: number; deg: number };
      visibility: number;
      weather: { description: string }[];
      dt: number;
    };

    const dirs = ["N","NE","E","SE","S","SW","W","NW"];
    const windDir = dirs[Math.round(c.wind.deg / 45) % 8];
    const imd = getWeather(city);

    return {
      ...imd,
      current: {
        ...imd.current,
        tempC:         Math.round(c.main.temp),
        feelsLikeC:    Math.round(c.main.feels_like),
        humidity:      c.main.humidity,
        pressureHpa:   c.main.pressure,
        windSpeedKmh:  Math.round(c.wind.speed * 3.6),
        windDir,
        visibilityKm:  (c.visibility ?? 10000) / 1000,
        condition:     c.weather[0]?.description ?? imd.current.condition,
        updatedAt:     new Date(c.dt * 1000).toISOString(),
      },
    };
  } catch {
    return null;
  }
}

export const getWeatherFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ city: z.string().min(1) }))
  .handler(async ({ data }) => {
    const apiKey = process.env.WEATHER_API_KEY;
    if (apiKey) {
      const live = await fetchOpenWeather(data.city, apiKey);
      if (live) return { data: live, source: "live" as const };
    }
    return { data: getWeather(data.city), source: "mock" as const };
  });

export const getWeatherMulti = createServerFn({ method: "POST" })
  .inputValidator(z.object({ cities: z.array(z.string()) }))
  .handler(async ({ data }) => {
    const apiKey = process.env.WEATHER_API_KEY;
    const results = await Promise.all(
      data.cities.map(async city => {
        if (apiKey) {
          const live = await fetchOpenWeather(city, apiKey);
          if (live) return { city, data: live, source: "live" as const };
        }
        return { city, data: getWeather(city), source: "mock" as const };
      })
    );
    return results;
  });
