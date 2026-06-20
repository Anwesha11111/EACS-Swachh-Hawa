import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLiveAqi, getAqiForCity } from "@/lib/api/aqi.functions";
import { getWeatherFn } from "@/lib/api/weather.functions";
import { askAirGpt } from "@/lib/api/airgpt.functions";
import { broadcastAlert } from "@/lib/api/notify.functions";

// ── AQI hooks ─────────────────────────────────────────────────────────────────

/** Fetches all-city AQI snapshot. Refreshes every 5 minutes. */
export function useLiveAqi() {
  return useQuery({
    queryKey: ["aqi", "all"],
    queryFn:  () => getLiveAqi(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/** Fetches AQI for a single city. */
export function useCityAqi(city: string) {
  return useQuery({
    queryKey: ["aqi", "city", city],
    queryFn:  () => getAqiForCity({ data: { city } }),
    staleTime: 5 * 60 * 1000,
    enabled:   !!city,
  });
}

// ── Weather hooks ─────────────────────────────────────────────────────────────

/** Fetches weather for a single city. Refreshes every 15 minutes. */
export function useWeather(city: string) {
  return useQuery({
    queryKey: ["weather", city],
    queryFn:  () => getWeatherFn({ data: { city } }),
    staleTime: 15 * 60 * 1000,
    enabled:   !!city,
  });
}

// ── AirGPT chat hook ──────────────────────────────────────────────────────────

export type ChatMessage = { role: "user" | "assistant"; content: string };

/** Sends a chat message to AirGPT and returns the reply. */
export function useAirGpt() {
  return useMutation({
    mutationFn: (messages: ChatMessage[]) => askAirGpt({ data: { messages } }),
  });
}

// ── Notification hook ─────────────────────────────────────────────────────────

/** Broadcasts an alert. Returns mutation state (loading/error/data). */
export function useBroadcastAlert() {
  return useMutation({
    mutationFn: (args: {
      city: string;
      aqi: number;
      channels: ("sms" | "email" | "push")[];
      demoRecipients?: { phone?: string; email?: string; pushToken?: string };
    }) => broadcastAlert({ data: args }),
  });
}

// ── Source badge helper ───────────────────────────────────────────────────────

/** Returns a small label string for the data source badge. */
export function sourceBadge(source: "live" | "mock" | undefined): string {
  return source === "live" ? "LIVE" : "DEMO";
}
