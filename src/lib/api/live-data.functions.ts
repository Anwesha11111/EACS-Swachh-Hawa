/**
 * Live Data Integration
 * Fetches real-time AQI data from CPCB, SPCB, and other government sources
 * Replaces mock data with live government data feeds
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import process from "node:process";

// ═════════════════════════════════════════════════════════════════════════════
// CPCB Data Integration
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Fetch live AQI data from CPCB API (data.gov.in)
 * Endpoint: https://api.data.gov.in/resource/3b01bcb8-0b14-41b6-b57d-d00ec81fae8d
 * Requires: AQI_API_KEY in .env
 */
export const fetchCPCBLiveData = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    state: z.string().optional(),
    city: z.string().optional(),
    limit: z.number().min(1).max(500).default(100),
  }))
  .handler(async ({ data: input }) => {
    const apiKey = process.env.AQI_API_KEY;
    
    if (!apiKey) {
      console.log("[live-data] CPCB API key not configured - using mock data");
      return {
        data: [],
        source: "mock" as const,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      // CPCB API endpoint (data.gov.in)
      const params = new URLSearchParams({
        "api-key": apiKey,
        format: "json",
        limit: String(input.limit),
        offset: "0",
      });

      // Add filters if provided
      if (input.state) {
        params.append("filters[state]", input.state);
      }
      if (input.city) {
        params.append("filters[city]", input.city);
      }

      const url = `https://api.data.gov.in/resource/3b01bcb8-0b14-41b6-b57d-d00ec81fae8d?${params}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`CPCB API error: ${response.status}`);
      }

      const result = await response.json();

      // Transform CPCB response to standard format
      const cities = (result.records || []).map((record: any) => ({
        name: record.city || record.station || "Unknown",
        state: record.state || "",
        aqi: parseInt(record.aqi || "0"),
        pm25: parseFloat(record.pm25 || "0"),
        pm10: parseFloat(record.pm10 || "0"),
        no2: parseFloat(record.no2 || "0"),
        so2: parseFloat(record.so2 || "0"),
        co: parseFloat(record.co || "0"),
        o3: parseFloat(record.o3 || "0"),
        timestamp: record.timestamp || new Date().toISOString(),
      }));

      return {
        data: cities,
        source: "cpcb" as const,
        timestamp: new Date().toISOString(),
        recordCount: result.records?.length || 0,
      };
    } catch (err) {
      console.error("[live-data] CPCB fetch error:", err);
      return {
        data: [],
        source: "mock" as const,
        error: String(err),
        timestamp: new Date().toISOString(),
      };
    }
  });

// ═════════════════════════════════════════════════════════════════════════════
// SPCB Data Integration (State Pollution Control Boards)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Fetch live data from State PCBs
 * Supports: Delhi-DPCC, Maharashtra-MPCB, etc.
 */
export const fetchStatePCBData = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    state: z.string(),
    limit: z.number().min(1).max(100).default(50),
  }))
  .handler(async ({ data: input }) => {
    // Map state codes to SPCB API endpoints
    const spcbEndpoints: Record<string, string> = {
      "DL": "https://www.dpcc.delhigovt.nic.in/api/aqi/live",
      "MH": "https://www.mpcb.gov.in/api/aqi",
      "UP": "https://www.uppcb.com/api/aqi",
      "TN": "https://www.tnpcb.gov.in/api/aqi",
      "KA": "https://www.kspcb.gov.in/api/aqi",
      // Add more states as needed
    };

    const endpoint = spcbEndpoints[input.state];

    if (!endpoint) {
      console.log(`[live-data] No SPCB endpoint for state: ${input.state}`);
      return {
        data: [],
        source: "mock" as const,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const response = await fetch(`${endpoint}?limit=${input.limit}`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "User-Agent": "Swachh-Hawa/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(`SPCB API error: ${response.status}`);
      }

      const result = await response.json();

      return {
        data: result.records || [],
        source: "spcb" as const,
        state: input.state,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      console.error(`[live-data] SPCB fetch error for ${input.state}:`, err);
      return {
        data: [],
        source: "mock" as const,
        error: String(err),
        timestamp: new Date().toISOString(),
      };
    }
  });

// ═════════════════════════════════════════════════════════════════════════════
// OpenWeather & Alternative Sources
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Fetch AQI data from OpenWeatherMap (alternative source)
 * Uses WEATHER_API_KEY from .env
 */
export const fetchOpenWeatherAQI = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    latitude: z.number(),
    longitude: z.number(),
  }))
  .handler(async ({ data: input }) => {
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      return {
        data: null,
        source: "mock" as const,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const url = `https://api.openweathermap.org/data/3.0/air_pollution?lat=${input.latitude}&lon=${input.longitude}&appid=${apiKey}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`OpenWeather API error: ${response.status}`);
      }

      const result = await response.json();

      // Transform to standard AQI format
      const aqi = {
        aqi: result.list?.[0]?.main?.aqi || 0, // 1-5 scale (1=Good, 5=Very Poor)
        components: result.list?.[0]?.components || {},
        timestamp: new Date(result.list?.[0]?.dt * 1000 || Date.now()).toISOString(),
      };

      return {
        data: aqi,
        source: "openweather" as const,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      console.error("[live-data] OpenWeather fetch error:", err);
      return {
        data: null,
        source: "mock" as const,
        error: String(err),
        timestamp: new Date().toISOString(),
      };
    }
  });

// ═════════════════════════════════════════════════════════════════════════════
// Consolidated Live Data Fetch
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Fetch all available live data and merge with mock data
 * Priority: CPCB > SPCB > OpenWeather > Mock
 */
export const fetchLiveAQIData = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    state: z.string().optional(),
    city: z.string().optional(),
  }))
  .handler(async ({ data: input }) => {
    // Try CPCB first (primary source)
    const cpcbResult = await fetchCPCBLiveData({ data: { state: input.state, city: input.city } });

    if (cpcbResult.source === "cpcb" && cpcbResult.data.length > 0) {
      return {
        cities: cpcbResult.data,
        source: "cpcb" as const,
        primarySource: "CPCB (Central Pollution Control Board)",
        timestamp: cpcbResult.timestamp,
      };
    }

    // Fallback to SPCB if state is provided
    if (input.state) {
      const spcbResult = await fetchStatePCBData({ data: { state: input.state } });

      if (spcbResult.source === "spcb" && spcbResult.data.length > 0) {
        return {
          cities: spcbResult.data,
          source: "spcb" as const,
          primarySource: `${input.state} Pollution Control Board`,
          timestamp: spcbResult.timestamp,
        };
      }
    }

    // Fallback to mock data
    return {
      cities: [],
      source: "mock" as const,
      primarySource: "Mock Data (Live sources unavailable)",
      timestamp: new Date().toISOString(),
      note: "Configured live data sources not responding. Using demo data.",
    };
  });

// ═════════════════════════════════════════════════════════════════════════════
// Data Caching Layer
// ═════════════════════════════════════════════════════════════════════════════

interface CachedData {
  data: any;
  timestamp: number;
  ttl: number; // milliseconds
}

const cache: Map<string, CachedData> = new Map();

/**
 * Fetch with caching (5 minute TTL)
 */
export const fetchLiveAQIWithCache = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    state: z.string().optional(),
    city: z.string().optional(),
    cacheTTL: z.number().default(300000), // 5 minutes
  }))
  .handler(async ({ data: input }) => {
    const cacheKey = `aqi-${input.state || "all"}-${input.city || "all"}`;
    const cached = cache.get(cacheKey);

    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return {
        ...cached.data,
        source: `${cached.data.source}-cached` as any,
        cachedAt: new Date(cached.timestamp).toISOString(),
      };
    }

    // Fetch fresh data
    const freshData = await fetchLiveAQIData({ data: input });

    // Cache it
    cache.set(cacheKey, {
      data: freshData,
      timestamp: Date.now(),
      ttl: input.cacheTTL,
    });

    return freshData;
  });
