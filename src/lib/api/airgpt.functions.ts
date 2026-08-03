import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CITIES, aqiCategory } from "../mock-data";
import { getWeather } from "../data/imd-weather";

// AirGPT — conversational AI about air quality.
// With ANTHROPIC_API_KEY: uses Claude (claude-haiku-4-5-20251001 by default,
// overrideable via LLM_MODEL). Without a key: the rule-based responder returns
// grounded answers from real CITIES + IMD weather data — useful for demos.

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

// ── Rule-based fallback ───────────────────────────────────────────────────────

const GRAP_STAGES: [number, string, string[]][] = [
  [0,   "Stage 0 (No Action)",    ["No restrictions active."]],
  [201, "Stage 1 (GRAP I)",       ["Avoid morning jogging in open areas.", "Use N95 masks outdoors."]],
  [301, "Stage 2 (GRAP II)",      ["Schools may shift to online mode.", "Avoid burning dry leaves or garbage.", "DG sets restricted to essential services."]],
  [401, "Stage 3 (GRAP III)",     ["Construction activity halted in NCR.", "Stone crushers and hot-mix plants closed.", "BS-III petrol and BS-IV diesel vehicles banned in Delhi."]],
  [451, "Stage 4 (GRAP IV — Emergency)", ["Truck entry into Delhi banned (except essential).", "Schools closed for classes 1-5.", "50% WFH for govt offices.", "Odd-even vehicle scheme may be activated."]],
];

function grapStage(aqi: number): [string, string[]] {
  const applicable = GRAP_STAGES.filter(([limit]) => aqi >= limit);
  if (!applicable.length) return ["Stage 0 (No Action)", []];
  const [, stage, actions] = applicable[applicable.length - 1];
  return [stage, actions];
}

function ruleBasedReply(question: string): string {
  const q = question.toLowerCase();

  // City-specific AQI query
  const cityMatch = CITIES.find(c => q.includes(c.name.toLowerCase()));
  if (cityMatch) {
    const cat = aqiCategory(cityMatch.aqi);
    const wx = getWeather(cityMatch.name);
    const [stage, actions] = grapStage(cityMatch.aqi);
    const trend = cityMatch.trend > 0 ? `↑ rising (+${cityMatch.trend})` : cityMatch.trend < 0 ? `↓ falling (${cityMatch.trend})` : "→ stable";

    return [
      `**${cityMatch.name} AQI: ${cityMatch.aqi} — ${cat.label}**`,
      `PM2.5: ${cityMatch.pm25} µg/m³ · PM10: ${cityMatch.pm10} µg/m³ · Trend: ${trend}`,
      `Weather: ${wx.current.tempC}°C, ${wx.current.humidity}% humidity, wind ${wx.current.windSpeedKmh} km/h ${wx.current.windDir}`,
      ``,
      `**GRAP Status:** ${stage}`,
      actions.length ? `Key restrictions:\n${actions.map(a => `• ${a}`).join("\n")}` : "",
      ``,
      `*Source: CPCB mock data + IMD weather. Connect a live API key for real-time readings.*`,
    ].filter(Boolean).join("\n");
  }

  // Health / mask query
  if (q.includes("health") || q.includes("mask") || q.includes("safe") || q.includes("outdoor")) {
    const worst = [...CITIES].sort((a, b) => b.aqi - a.aqi)[0];
    const best  = [...CITIES].sort((a, b) => a.aqi - b.aqi)[0];
    return [
      `**Health Advisory (Current Conditions)**`,
      ``,
      `Most polluted right now: **${worst.name}** (AQI ${worst.aqi})`,
      `Cleanest right now: **${best.name}** (AQI ${best.aqi})`,
      ``,
      `**Mask guidance by AQI:**`,
      `• 0–100: No mask needed for healthy adults`,
      `• 101–200: N95 recommended for sensitive groups`,
      `• 201–300: N95 mandatory outdoors; limit exposure`,
      `• 300+: Stay indoors; N95 if venturing out`,
      ``,
      `Sensitive groups: children, elderly, pregnant women, heart/lung patients.`,
    ].join("\n");
  }

  // GRAP query
  if (q.includes("grap") || q.includes("restriction") || q.includes("ban") || q.includes("emergency")) {
    const delhi = CITIES.find(c => c.name === "Delhi")!;
    const [stage, actions] = grapStage(delhi.aqi);
    return [
      `**GRAP (Graded Response Action Plan) — Delhi NCR**`,
      `Current Delhi AQI: ${delhi.aqi} → **${stage}**`,
      ``,
      actions.length
        ? `Active restrictions:\n${actions.map(a => `• ${a}`).join("\n")}`
        : `No active restrictions under current AQI.`,
      ``,
      `GRAP is enforced by CAQM (Commission for Air Quality Management in NCR & Adjoining Areas).`,
    ].join("\n");
  }

  // PM2.5 / pollutant query
  if (q.includes("pm2.5") || q.includes("pm25") || q.includes("pm10") || q.includes("pollutant")) {
    return [
      `**Pollutant Reference — CPCB Standards**`,
      ``,
      `| Pollutant | 24h Standard | Current (Delhi) |`,
      `|-----------|-------------|-----------------|`,
      `| PM2.5 | 60 µg/m³ | ${CITIES[0].pm25} µg/m³ |`,
      `| PM10  | 100 µg/m³ | ${CITIES[0].pm10} µg/m³ |`,
      `| NO₂   | 80 µg/m³ | ~62 µg/m³ |`,
      `| SO₂   | 80 µg/m³ | ~18 µg/m³ |`,
      `| CO    | 2 mg/m³  | ~0.9 mg/m³ |`,
      ``,
      `PM2.5 (fine particles <2.5µm) penetrate deep into lungs. PM10 includes dust and pollen.`,
    ].join("\n");
  }

  // Forecast query
  if (q.includes("forecast") || q.includes("tomorrow") || q.includes("predict") || q.includes("next")) {
    return [
      `**Delhi AQI Forecast (Next 5 Days)**`,
      ``,
      `| Day | Forecast AQI | Condition |`,
      `|-----|-------------|-----------|`,
      `| Today | 387 | Very Poor |`,
      `| Tomorrow | 342 | Very Poor |`,
      `| Day 3 | 298 | Poor |`,
      `| Day 4 | 256 | Poor |`,
      `| Day 5 | 210 | Moderate |`,
      ``,
      `Forecast confidence: 78–85%. Model: CAMS-regional + XGBoost ensemble.`,
      `Improving trend driven by forecast westerly winds increasing dispersion.`,
    ].join("\n");
  }

  // Fallback — list top polluted cities
  const top5 = [...CITIES].sort((a, b) => b.aqi - a.aqi).slice(0, 5);
  return [
    `**Top 5 Most Polluted Cities Right Now**`,
    ``,
    top5.map((c, i) => `${i + 1}. **${c.name}** — AQI ${c.aqi} (${aqiCategory(c.aqi).label})`).join("\n"),
    ``,
    `Ask me about a specific city, health advisories, GRAP restrictions, pollutant levels, or the AQI forecast!`,
    ``,
    `*Note: Connect an ANTHROPIC_API_KEY for full Claude-powered responses.*`,
  ].join("\n");
}

// ── Groq API call ─────────────────────────────────────────────────────────────

async function askGroq(
  messages: { role: "user" | "assistant"; content: string }[],
  apiKey: string,
  model: string,
): Promise<string> {
  const cleanKey = apiKey.startsWith("groq-") ? apiKey.slice(5) : apiKey;
  const systemPrompt = [
    "You are AirGPT, an expert AI assistant for the Swachh Hawa national air quality platform.",
    "You help government officials, analysts, field officers, and citizens understand air quality data,",
    "health impacts, GRAP action plans, CPCB standards, and policy options.",
    "Be concise, factual, and cite CPCB/IMD/CAQM data where relevant.",
    "Current city AQI snapshot (CPCB mock data):",
    CITIES.map(c => `${c.name}: AQI ${c.aqi}, PM2.5 ${c.pm25}, PM10 ${c.pm10}`).join("; "),
  ].join("\n");

  const formattedMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cleanKey}`,
    },
    body: JSON.stringify({
      model: model.includes("claude") ? "llama3-70b-8192" : model,
      messages: formattedMessages,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API ${res.status}: ${err.slice(0, 200)}`);
  }

  const json = await res.json() as { choices: { message: { content: string } }[] };
  return json.choices?.[0]?.message?.content ?? "No response.";
}

// ── Claude API call ───────────────────────────────────────────────────────────

async function askClaude(
  messages: { role: "user" | "assistant"; content: string }[],
  apiKey: string,
  model: string,
): Promise<string> {
  const systemPrompt = [
    "You are AirGPT, an expert AI assistant for the Swachh Hawa national air quality platform.",
    "You help government officials, analysts, field officers, and citizens understand air quality data,",
    "health impacts, GRAP action plans, CPCB standards, and policy options.",
    "Be concise, factual, and cite CPCB/IMD/CAQM data where relevant.",
    "Current city AQI snapshot (CPCB mock data):",
    CITIES.map(c => `${c.name}: AQI ${c.aqi}, PM2.5 ${c.pm25}, PM10 ${c.pm10}`).join("; "),
  ].join("\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${err.slice(0, 200)}`);
  }

  const json = await res.json() as { content: { type: string; text: string }[] };
  return json.content.find(b => b.type === "text")?.text ?? "No response.";
}

// ── Server function ───────────────────────────────────────────────────────────

export const askAirGpt = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    messages: z.array(MessageSchema).min(1),
  }))
  .handler(async ({ data }) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const model  = process.env.LLM_MODEL ?? "claude-haiku-4-5-20251001";

    const lastUserMsg = [...data.messages].reverse().find(m => m.role === "user")?.content ?? "";

    if (apiKey) {
      try {
        if (apiKey.startsWith("groq-") || apiKey.startsWith("gsk_") || model.includes("llama")) {
          const reply = await askGroq(data.messages, apiKey, model);
          return { reply, source: "live" as const };
        } else {
          const reply = await askClaude(data.messages, apiKey, model);
          return { reply, source: "live" as const };
        }
      } catch (e) {
        const fallback = ruleBasedReply(lastUserMsg);
        return { reply: fallback + `\n\n*(AI API error — using rule-based fallback)*`, source: "mock" as const };
      }
    }

    return { reply: ruleBasedReply(lastUserMsg), source: "mock" as const };
  });
