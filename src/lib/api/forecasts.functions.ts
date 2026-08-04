import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server";

// ═════════════════════════════════════════════════════════════════════════════
// Air Quality Forecast Functions
// ═════════════════════════════════════════════════════════════════════════════

interface Forecast {
  city: string;
  state: string;
  forecast_timestamp: string;
  forecast_horizon_hours: number;
  predicted_aqi: number;
  predicted_pm25: number | null;
  predicted_pm10: number | null;
  confidence_score: number;
  prediction_interval_lower: number | null;
  prediction_interval_upper: number | null;
  model_name: string;
  model_version: string | null;
}

/**
 * Generate mock forecast data
 */
function generateMockForecast(city: string, hours: number): Forecast[] {
  return Array.from({ length: hours }, (_, i) => ({
    city,
    state: "DL",
    forecast_timestamp: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
    forecast_horizon_hours: i + 1,
    predicted_aqi: Math.round(260 + 70 * Math.sin(i / 4.5) + (Math.random() * 40 - 20)),
    predicted_pm25: Math.round(185 + 45 * Math.sin(i / 4.5) + (Math.random() * 30 - 15)),
    predicted_pm10: Math.round(330 + 75 * Math.sin(i / 4.5) + (Math.random() * 50 - 25)),
    confidence_score: Math.max(0.5, 0.85 - i * 0.003),
    prediction_interval_lower: Math.round(220 + 60 * Math.sin(i / 4.5)),
    prediction_interval_upper: Math.round(300 + 80 * Math.sin(i / 4.5)),
    model_name: "LGBM-LSTM-Ensemble",
    model_version: "v2.1.4",
  }));
}

/**
 * Get forecast for a specific city
 */
export const getForecast = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    city: z.string(),
    hours: z.number().min(1).max(168).default(24), // Max 7 days
  }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();

    if (!db) {
      return {
        city: input.city,
        forecasts: generateMockForecast(input.city, input.hours),
        source: "mock" as const,
      };
    }

    try {
      const { data, error } = await db
        .from("forecasts")
        .select("*")
        .ilike("city", input.city)
        .gte("forecast_timestamp", new Date().toISOString())
        .lte("forecast_horizon_hours", input.hours)
        .order("forecast_timestamp", { ascending: true });

      if (error) throw error;

      // If no forecasts in database, return mock data
      if (!data || data.length === 0) {
        return {
          city: input.city,
          forecasts: generateMockForecast(input.city, input.hours),
          source: "mock" as const,
        };
      }

      return {
        city: input.city,
        forecasts: data as Forecast[],
        source: "database" as const,
      };
    } catch (err) {
      console.error("[forecasts] Fetch error:", err);
      return {
        city: input.city,
        forecasts: generateMockForecast(input.city, input.hours),
        source: "mock" as const,
      };
    }
  });

/**
 * Get 7-day forecast summary for multiple cities
 */
export const getMultiCityForecast = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    cities: z.array(z.string()).min(1).max(20),
  }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();

    if (!db) {
      return input.cities.map(city => ({
        city,
        forecast_1d: Math.round(220 + Math.random() * 100),
        forecast_3d: Math.round(240 + Math.random() * 80),
        forecast_7d: Math.round(230 + Math.random() * 90),
        trend: Math.random() > 0.5 ? "improving" : "worsening",
        source: "mock" as const,
      }));
    }

    try {
      const forecasts = await Promise.all(
        input.cities.map(async (city) => {
          const { data, error } = await db
            .from("forecasts")
            .select("predicted_aqi, forecast_horizon_hours")
            .ilike("city", city)
            .gte("forecast_timestamp", new Date().toISOString())
            .in("forecast_horizon_hours", [24, 72, 168])
            .order("forecast_horizon_hours", { ascending: true });

          if (error || !data || data.length === 0) {
            return {
              city,
              forecast_1d: Math.round(220 + Math.random() * 100),
              forecast_3d: Math.round(240 + Math.random() * 80),
              forecast_7d: Math.round(230 + Math.random() * 90),
              trend: "unknown",
              source: "mock" as const,
            };
          }

          const f1d = data.find(d => d.forecast_horizon_hours === 24)?.predicted_aqi || 0;
          const f3d = data.find(d => d.forecast_horizon_hours === 72)?.predicted_aqi || f1d;
          const f7d = data.find(d => d.forecast_horizon_hours === 168)?.predicted_aqi || f3d;

          return {
            city,
            forecast_1d: f1d,
            forecast_3d: f3d,
            forecast_7d: f7d,
            trend: f7d < f1d ? "improving" : f7d > f1d ? "worsening" : "stable",
            source: "database" as const,
          };
        })
      );

      return forecasts;
    } catch (err) {
      console.error("[forecasts] Multi-city error:", err);
      return input.cities.map(city => ({
        city,
        forecast_1d: Math.round(220 + Math.random() * 100),
        forecast_3d: Math.round(240 + Math.random() * 80),
        forecast_7d: Math.round(230 + Math.random() * 90),
        trend: "unknown",
        source: "mock" as const,
      }));
    }
  });

/**
 * Get hourly forecast for next 24 hours
 */
export const getHourlyForecast = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    city: z.string(),
  }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();

    if (!db) {
      return {
        city: input.city,
        hourly: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          timestamp: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
          aqi: Math.round(250 + 60 * Math.sin(i / 4) + Math.random() * 30),
          pm25: Math.round(180 + 40 * Math.sin(i / 4) + Math.random() * 20),
          confidence: Math.max(0.6, 0.88 - i * 0.01),
        })),
        source: "mock" as const,
      };
    }

    try {
      const { data, error } = await db
        .from("forecasts")
        .select("forecast_timestamp, predicted_aqi, predicted_pm25, confidence_score, forecast_horizon_hours")
        .ilike("city", input.city)
        .gte("forecast_timestamp", new Date().toISOString())
        .lte("forecast_horizon_hours", 24)
        .order("forecast_timestamp", { ascending: true })
        .limit(24);

      if (error || !data || data.length === 0) {
        return {
          city: input.city,
          hourly: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            timestamp: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
            aqi: Math.round(250 + 60 * Math.sin(i / 4) + Math.random() * 30),
            pm25: Math.round(180 + 40 * Math.sin(i / 4) + Math.random() * 20),
            confidence: Math.max(0.6, 0.88 - i * 0.01),
          })),
          source: "mock" as const,
        };
      }

      return {
        city: input.city,
        hourly: data.map((f, i) => ({
          hour: i,
          timestamp: f.forecast_timestamp,
          aqi: f.predicted_aqi,
          pm25: f.predicted_pm25 || 0,
          confidence: f.confidence_score,
        })),
        source: "database" as const,
      };
    } catch (err) {
      console.error("[forecasts] Hourly error:", err);
      throw new Error("Failed to fetch hourly forecast");
    }
  });
