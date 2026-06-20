import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CityAqi } from "../mock-data";
import { CITIES } from "../mock-data";

// Live AQI from data.gov.in CPCB resource.
// Requires AQI_API_KEY env var (server-only). Without a key the function
// returns jittered mock data with source:"mock" so the demo always works.

function jitter(cities: CityAqi[]): (CityAqi & { source: "mock" })[] {
  return cities.map(c => ({
    ...c,
    aqi:   Math.max(10, c.aqi  + Math.round((Math.random() - 0.5) * 20)),
    pm25:  Math.max(5,  c.pm25 + Math.round((Math.random() - 0.5) * 12)),
    pm10:  Math.max(8,  c.pm10 + Math.round((Math.random() - 0.5) * 18)),
    trend: c.trend + Math.round((Math.random() - 0.5) * 4),
    source: "mock" as const,
  }));
}

async function fetchCpcbLive(apiKey: string): Promise<(CityAqi & { source: "live" })[]> {
  const url = `https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69?api-key=${apiKey}&format=json&limit=50`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`CPCB API ${res.status}`);
  const json = await res.json() as { records?: Record<string, string>[] };
  const records = json.records ?? [];
  return records
    .filter(r => r.city && r.aqi_value)
    .map(r => {
      const name = r.city.trim();
      const seed = CITIES.find(c => c.name.toLowerCase() === name.toLowerCase());
      return {
        name,
        state: r.state?.trim() ?? seed?.state ?? "IN",
        aqi:   parseInt(r.aqi_value, 10) || 0,
        pm25:  parseFloat(r["pm2.5"] ?? r.pm25 ?? "0") || 0,
        pm10:  parseFloat(r.pm10 ?? "0") || 0,
        trend: 0,
        lon:   seed?.lon ?? 78.96,
        lat:   seed?.lat ?? 20.59,
        x:     seed?.x ?? 300,
        y:     seed?.y ?? 400,
        source: "live" as const,
      };
    });
}

export const getLiveAqi = createServerFn({ method: "GET" }).handler(async () => {
  const apiKey = process.env.AQI_API_KEY;
  if (apiKey) {
    try {
      const data = await fetchCpcbLive(apiKey);
      return { data, source: "live" as const };
    } catch {
      // Fall through to mock on API error
    }
  }
  return { data: jitter(CITIES), source: "mock" as const };
});

export const getAqiForCity = createServerFn({ method: "POST" })
  .inputValidator(z.object({ city: z.string() }))
  .handler(async ({ data }) => {
    const apiKey = process.env.AQI_API_KEY;
    const cities = apiKey
      ? await fetchCpcbLive(apiKey).catch(() => jitter(CITIES))
      : jitter(CITIES);
    const found = cities.find(c => c.name.toLowerCase() === data.city.toLowerCase());
    return found ?? null;
  });
