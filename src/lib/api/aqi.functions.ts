import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CityAqi } from "../mock-data";
import { CITIES } from "../mock-data";
import { getSupabaseAdmin } from "../supabase.server";

// ═════════════════════════════════════════════════════════════════════════════
// AQI Data Functions
// Production-grade air quality data retrieval from multiple sources:
// 1. Supabase (local database with sensor readings)
// 2. CPCB Live API (data.gov.in)
// 3. Mock data (fallback for demo/testing)
// ═════════════════════════════════════════════════════════════════════════════

interface AqiReading {
  sensor_id: string;
  city: string;
  state: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2?: number;
  so2?: number;
  co?: number;
  timestamp: string;
  temperature?: number;
  humidity?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch latest AQI from Supabase (prioritized source)
// ─────────────────────────────────────────────────────────────────────────────

async function fetchFromDatabase(): Promise<(CityAqi & { source: "database" })[] | null> {
  const db = await getSupabaseAdmin();
  if (!db) return null;

  try {
    // Get latest reading per city from the last 2 hours
    const { data, error } = await db
      .from('air_quality_readings')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())
      .eq('is_validated', true)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('[aqi] Database fetch error:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    // Group by city and take the latest reading for each
    const latestByCity = new Map<string, AqiReading>();
    for (const reading of data as AqiReading[]) {
      if (!latestByCity.has(reading.city)) {
        latestByCity.set(reading.city, reading);
      }
    }

    // Transform to CityAqi format
    return Array.from(latestByCity.values()).map(r => {
      const seed = CITIES.find(c => c.name.toLowerCase() === r.city.toLowerCase());
      
      // Calculate 24h trend (simplified - in production, query historical data)
      const trend = Math.round((Math.random() - 0.5) * 20); // TODO: Calculate from historical data

      return {
        name: r.city,
        state: r.state,
        aqi: r.aqi,
        pm25: r.pm25,
        pm10: r.pm10,
        trend,
        lon: seed?.lon ?? 78.96,
        lat: seed?.lat ?? 20.59,
        x: seed?.x ?? 300,
        y: seed?.y ?? 400,
        source: "database" as const,
      };
    });
  } catch (err) {
    console.error('[aqi] Database exception:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch from CPCB Live API (secondary source)
// ─────────────────────────────────────────────────────────────────────────────

async function fetchCpcbLive(apiKey: string): Promise<(CityAqi & { source: "cpcb" })[]> {
  const url = `https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69?api-key=${apiKey}&format=json&limit=100`;
  
  const res = await fetch(url, { 
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10000) // 10s timeout
  });
  
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
        aqi: parseInt(r.aqi_value, 10) || 0,
        pm25: parseFloat(r["pm2.5"] ?? r.pm25 ?? "0") || 0,
        pm10: parseFloat(r.pm10 ?? "0") || 0,
        trend: 0, // CPCB doesn't provide trend
        lon: seed?.lon ?? 78.96,
        lat: seed?.lat ?? 20.59,
        x: seed?.x ?? 300,
        y: seed?.y ?? 400,
        source: "cpcb" as const,
      };
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock data with realistic jitter (fallback)
// ─────────────────────────────────────────────────────────────────────────────

function jitter(cities: CityAqi[]): (CityAqi & { source: "mock" })[] {
  return cities.map(c => ({
    ...c,
    aqi: Math.max(10, c.aqi + Math.round((Math.random() - 0.5) * 20)),
    pm25: Math.max(5, c.pm25 + Math.round((Math.random() - 0.5) * 12)),
    pm10: Math.max(8, c.pm10 + Math.round((Math.random() - 0.5) * 18)),
    trend: c.trend + Math.round((Math.random() - 0.5) * 4),
    source: "mock" as const,
  }));
}

// ═════════════════════════════════════════════════════════════════════════════
// PUBLIC API FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Get live AQI data for all cities
 * Priority: Database → CPCB API → Mock data
 */
export const getLiveAqi = createServerFn({ method: "GET" }).handler(async () => {
  // Try database first
  const dbData = await fetchFromDatabase();
  if (dbData && dbData.length > 0) {
    return { data: dbData, source: "database" as const };
  }

  // Try CPCB API
  const apiKey = process.env.AQI_API_KEY;
  if (apiKey) {
    try {
      const cpcbData = await fetchCpcbLive(apiKey);
      if (cpcbData.length > 0) {
        return { data: cpcbData, source: "cpcb" as const };
      }
    } catch (err) {
      console.error('[aqi] CPCB API error:', err);
    }
  }

  // Fallback to mock
  return { data: jitter(CITIES), source: "mock" as const };
});

/**
 * Get AQI for a specific city
 */
export const getAqiForCity = createServerFn({ method: "POST" })
  .inputValidator(z.object({ city: z.string() }))
  .handler(async ({ data: input }) => {
    const cityName = input.city.toLowerCase();

    // Try database first
    const db = await getSupabaseAdmin();
    if (db) {
      try {
        const { data, error } = await db
          .from('air_quality_readings')
          .select('*')
          .ilike('city', cityName)
          .eq('is_validated', true)
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();

        if (!error && data) {
          const seed = CITIES.find(c => c.name.toLowerCase() === cityName);
          return {
            name: data.city,
            state: data.state,
            aqi: data.aqi,
            pm25: data.pm25,
            pm10: data.pm10,
            trend: 0, // TODO: Calculate from history
            lon: seed?.lon ?? 78.96,
            lat: seed?.lat ?? 20.59,
            x: seed?.x ?? 300,
            y: seed?.y ?? 400,
            source: "database" as const,
          };
        }
      } catch (err) {
        console.error('[aqi] City lookup error:', err);
      }
    }

    // Try CPCB API
    const apiKey = process.env.AQI_API_KEY;
    if (apiKey) {
      try {
        const cities = await fetchCpcbLive(apiKey);
        const found = cities.find(c => c.name.toLowerCase() === cityName);
        if (found) return found;
      } catch {
        // Fall through
      }
    }

    // Fallback to mock
    const mockCities = jitter(CITIES);
    return mockCities.find(c => c.name.toLowerCase() === cityName) ?? null;
  });

/**
 * Get historical AQI data for a city
 */
export const getHistoricalAqi = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    city: z.string(),
    hours: z.number().min(1).max(168).default(24), // Max 7 days
  }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();
    if (!db) {
      // Return mock time-series data
      return {
        city: input.city,
        data: Array.from({ length: input.hours }, (_, i) => ({
          timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
          aqi: 150 + Math.round(50 * Math.sin(i / 4) + Math.random() * 30),
          pm25: 85 + Math.round(30 * Math.sin(i / 4) + Math.random() * 20),
          pm10: 145 + Math.round(50 * Math.sin(i / 4) + Math.random() * 30),
        })).reverse(),
        source: "mock" as const,
      };
    }

    try {
      const { data, error } = await db
        .from('air_quality_readings')
        .select('timestamp, aqi, pm25, pm10, no2, temperature, humidity')
        .ilike('city', input.city)
        .gte('timestamp', new Date(Date.now() - input.hours * 60 * 60 * 1000).toISOString())
        .eq('is_validated', true)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      return {
        city: input.city,
        data: data || [],
        source: "database" as const,
      };
    } catch (err) {
      console.error('[aqi] Historical fetch error:', err);
      throw new Error('Failed to fetch historical data');
    }
  });
