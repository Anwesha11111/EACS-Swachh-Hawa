# Swachh Hawa — Setup & Persistence Guide (Phase 4)

This document explains how to connect real API keys and activate **Supabase persistence** for citizen complaints, settings, AirGPT chat history, and notification read-state.

---

## 1. Local Development Quick Start

The application is designed with **graceful degradation** — it runs out of the box with zero configuration using realistic mock data, seed accounts, and simulated SMS/email notifications.

To customize your local environment:
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Set a random 32-character string for `AUTH_SECRET`:
   ```env
   AUTH_SECRET=your_32_character_secret_key_here
   ```

---

## 2. Supabase Setup (Phase 4 Database Persistence)

By default, complaints, settings, and chat history live in memory for the current session. To persist data across page refreshes and server restarts:

### Step 1: Create a Supabase Project
1. Sign up / log in to [Supabase](https://supabase.com/).
2. Create a new free-tier project (e.g. `swachh-hawa-db`).
3. Note your **Project URL** and keys in Project Settings → API.

### Step 2: Add Keys to `.env`
Add your project details to `.env`:
```env
# Server-only (Service-Role key - NEVER expose to browser)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Client-safe (Anon key)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Run Database Migrations
1. Go to your Supabase Dashboard → **SQL Editor**.
2. Click **New Query**.
3. Copy the entire contents of [`supabase/migrations/001_init.sql`](file:///c:/Users/DELL/Downloads/New%20folder/PROJECTS/stll/EACS-Swachh-Hawa/supabase/migrations/001_init.sql) and paste it into the editor.
4. Click **Run**.

This creates four tables with Row Level Security (RLS) enabled:
- `public.complaints` — Stores user-submitted pollution reports.
- `public.user_settings` — Stores user preferences & notification thresholds.
- `public.chat_history` — Stores AirGPT conversation turns per user/session.
- `public.notification_reads` — Tracks read notifications per user.

---

## 3. Real API Keys (Live Data Integration)

To replace simulated demo data with real-time external services, add the corresponding keys to your `.env`:

### 🌐 Live Air Quality Index (data.gov.in / CPCB)
- **Env Variable**: `AQI_API_KEY`
- **Source**: [data.gov.in CPCB Resource](https://data.gov.in/)
- **Fallback**: Jittered CPCB city mock data.

### 🌤 Weather Data (OpenWeatherMap)
- **Env Variable**: `WEATHER_API_KEY`
- **Source**: [OpenWeatherMap API](https://openweathermap.org/api)
- **Fallback**: IMD historical seed dataset.

### 🤖 AirGPT AI Chatbot (Claude / Anthropic)
- **Env Variable**: `ANTHROPIC_API_KEY`
- **Model**: `LLM_MODEL=claude-haiku-4-5-20251001` (optional override)
- **Source**: [Anthropic Console](https://console.anthropic.com/)
- **Fallback**: Grounded CPCB/GRAP rule-based engine.

### 📱 SMS Alerts (Twilio)
- **Env Variables**:
  ```env
  TWILIO_ACCOUNT_SID=AC...
  TWILIO_AUTH_TOKEN=your_token
  TWILIO_FROM_NUMBER=+91XXXXXXXXXX
  ```
- **Fallback**: Returns `queued (demo)` response and logs alert to console.

### 📧 Email Alerts (SendGrid)
- **Env Variables**:
  ```env
  SENDGRID_API_KEY=SG...
  SENDGRID_FROM_EMAIL=noreply@swachhhawa.gov.in
  ```
- **Fallback**: Returns `queued (demo)` response and logs alert to console.

---

## 4. Verification & Testing

### Running the App
```bash
npm run dev
```

### Verification Steps
1. **Complaints**: Submit a complaint on `/citizen`. If Supabase is connected, a toast will confirm `Complaint registered in Supabase!` and it will appear on `/complaints`.
2. **Settings**: Modify thresholds on `/settings` and click `Save Changes`. Refresh the page to verify persistence.
3. **AirGPT**: Chat with AirGPT on `/citizen`. Refresh the page; past conversation turns will reload.
