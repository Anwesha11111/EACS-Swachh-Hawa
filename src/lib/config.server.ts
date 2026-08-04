/**
 * Server-side configuration loader
 * Reads all API keys and configuration from .env at startup
 * No prompts - everything comes from environment variables
 */

import process from "node:process";

export const config = {
  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: process.env.VITE_SUPABASE_ANON_KEY,
  },

  // CPCB Air Quality API
  cpcb: {
    apiKey: process.env.AQI_API_KEY,
  },

  // Weather API
  weather: {
    apiKey: process.env.WEATHER_API_KEY,
  },

  // Maps
  maps: {
    tileKey: process.env.VITE_MAP_TILE_KEY,
  },

  // LLM / AirGPT
  llm: {
    apiKey: process.env.ANTHROPIC_API_KEY || process.env.GROQ_API_KEY,
    model: process.env.LLM_MODEL,
    groqApiKey: process.env.GROQ_API_KEY,
  },

  // SMS (Twilio)
  sms: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_FROM_NUMBER,
  },

  // Email (SendGrid)
  email: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL,
  },

  // Push Notifications (FCM)
  fcm: {
    serverKey: process.env.FCM_SERVER_KEY,
  },

  // Auth
  auth: {
    secret: process.env.AUTH_SECRET,
  },
};

/**
 * Verify which services are configured
 */
export const configStatus = {
  supabaseConfigured: !!(config.supabase.url && config.supabase.serviceRoleKey),
  cpcbConfigured: !!config.cpcb.apiKey,
  weatherConfigured: !!config.weather.apiKey,
  llmConfigured: !!config.llm.apiKey,
  smsConfigured: !!config.sms.accountSid,
  emailConfigured: !!config.email.apiKey,
  fcmConfigured: !!config.fcm.serverKey,
};

/**
 * Log configuration status at startup (server-only, safe to log keys are present)
 */
export function logConfigStatus(): void {
  console.log("\n📋 Configuration Status:");
  console.log(`  ✓ Supabase: ${configStatus.supabaseConfigured ? "✅ Configured" : "❌ Not configured (demo mode)"}`);
  console.log(`  ✓ CPCB AQI API: ${configStatus.cpcbConfigured ? "✅ Configured" : "⚠️  Using mock data"}`);
  console.log(`  ✓ Weather API: ${configStatus.weatherConfigured ? "✅ Configured" : "⚠️  Using mock data"}`);
  console.log(`  ✓ LLM (AirGPT): ${configStatus.llmConfigured ? "✅ Configured" : "⚠️  Chat disabled"}`);
  console.log(`  ✓ SMS (Twilio): ${configStatus.smsConfigured ? "✅ Configured" : "⚠️  SMS disabled"}`);
  console.log(`  ✓ Email (SendGrid): ${configStatus.emailConfigured ? "✅ Configured" : "⚠️  Email disabled"}`);
  console.log(`  ✓ Push (FCM): ${configStatus.fcmConfigured ? "✅ Configured" : "⚠️  Push disabled"}`);
  console.log();
}
