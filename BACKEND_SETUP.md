# Swachh Hawa - Backend Setup Guide

Complete production-grade backend implementation for the Swachh Hawa Air Quality Monitoring Platform.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Database Setup](#database-setup)
- [API Configuration](#api-configuration)
- [Running Locally](#running-locally)
- [Production Deployment](#production-deployment)
- [API Documentation](#api-documentation)

---

## 🏗️ Architecture Overview

The Swachh Hawa backend is built with:

- **Framework**: TanStack Start (React-based full-stack framework)
- **Database**: Supabase (PostgreSQL + PostGIS + TimescaleDB)
- **API**: Server Functions with automatic type safety
- **Middleware**: Rate limiting, caching, logging, error handling
- **Data Sources**: 
  - Primary: Supabase (time-series sensor data)
  - Secondary: CPCB Live API (data.gov.in)
  - Fallback: Mock data (demo mode)

### Key Features

✅ **Time-Series Data**: TimescaleDB hypertables for efficient sensor readings
✅ **Geospatial Queries**: PostGIS for location-based queries  
✅ **Real-Time**: Live data updates from sensors and CPCB API
✅ **Forecasting**: AI/ML-based AQI predictions (7-day horizon)
✅ **Incident Management**: Complete workflow from detection to enforcement
✅ **Rate Limiting**: Token bucket algorithm (100-1000 req/min)
✅ **Caching**: LRU cache with TTL (5-30 min depending on data type)
✅ **Audit Logging**: Complete request/response audit trail

---

## 🔧 Prerequisites

### Required

- **Node.js** 18+ or **Bun** 1.0+
- **PostgreSQL** 14+ with extensions:
  - PostGIS (geospatial)
  - TimescaleDB (time-series)
  - uuid-ossp
  - pgcrypto

### Optional (for full functionality)

- **Supabase Account** (free tier works)
- **CPCB API Key** (data.gov.in registration)
- **SendGrid API Key** (email alerts)
- **Twilio Account** (SMS alerts)

---

## 🗄️ Database Setup

### Option 1: Supabase (Recommended)

1. **Create a Supabase Project**
   ```bash
   # Visit https://supabase.com and create new project
   ```

2. **Enable Required Extensions**
   
   Go to **SQL Editor** in Supabase Dashboard and run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS pgcrypto;
   ```

3. **Run Migrations**
   
   Execute migrations in order:
   ```bash
   # In Supabase SQL Editor, run each file:
   # 1. supabase/migrations/001_init.sql
   # 2. supabase/migrations/002_core_data_tables.sql
   # 3. supabase/migrations/003_seed_data.sql
   ```

4. **Get API Keys**
   
   From **Project Settings → API**:
   - Copy `Project URL`
   - Copy `anon public` key (for client)
   - Copy `service_role` key (for server)

### Option 2: Local PostgreSQL

1. **Install TimescaleDB**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install timescaledb-2-postgresql-14
   
   # macOS
   brew install timescaledb
   
   # Configure postgresql.conf
   shared_preload_libraries = 'timescaledb'
   ```

2. **Install PostGIS**
   ```bash
   sudo apt-get install postgis postgresql-14-postgis-3
   ```

3. **Create Database**
   ```bash
   createdb swachh_hawa
   psql swachh_hawa < supabase/migrations/001_init.sql
   psql swachh_hawa < supabase/migrations/002_core_data_tables.sql
   psql swachh_hawa < supabase/migrations/003_seed_data.sql
   ```

---

## ⚙️ API Configuration

### 1. Environment Setup

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 2. Configure Supabase

```bash
# Required for database access
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Required for client-side real-time (optional)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
```

### 3. Configure External APIs (Optional)

```bash
# CPCB Live Data (data.gov.in)
AQI_API_KEY=your_datagov_api_key

# Weather data (OpenWeatherMap)
WEATHER_API_KEY=your_weather_api_key

# AirGPT (Claude AI)
ANTHROPIC_API_KEY=your_anthropic_key
LLM_MODEL=claude-haiku-4-5-20251001

# Notifications
SENDGRID_API_KEY=SG.your_sendgrid_key
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_token
```

**Note**: Without these keys, the system falls back to realistic mock data. All features work in demo mode.

---

## 🚀 Running Locally

### Install Dependencies

```bash
npm install
# or
bun install
```

### Start Development Server

```bash
npm run dev
# or
bun run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api/*

### Verify Setup

1. **Check Database Connection**
   ```bash
   # Open http://localhost:3000/api/health
   # Should return: {"status": "ok", "database": "connected"}
   ```

2. **Test API Endpoints**
   ```bash
   # Get live AQI data
   curl http://localhost:3000/api/aqi/live
   
   # Get sensors
   curl http://localhost:3000/api/sensors
   
   # Get incidents
   curl http://localhost:3000/api/incidents
   ```

---

## 🌐 Production Deployment

### Build for Production

```bash
npm run build
# or
bun run build
```

### Deploy Options

#### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard
```

#### Option 2: Docker

```dockerfile
# Dockerfile (create this)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

```bash
docker build -t swachh-hawa .
docker run -p 3000:3000 --env-file .env swachh-hawa
```

#### Option 3: Traditional Server

```bash
# Build
npm run build

# Start server
npm run preview

# Use PM2 for process management
npm i -g pm2
pm2 start "npm run preview" --name swachh-hawa
```

### Environment Variables for Production

Ensure all production values are set:

```bash
# Database
SUPABASE_URL=https://prod-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=production_key_here

# Security
AUTH_SECRET=random_32_char_secret_for_production

# APIs
AQI_API_KEY=production_api_key
ANTHROPIC_API_KEY=production_anthropic_key

# Monitoring (optional)
VITE_SENTRY_DSN=your_sentry_dsn
```

---

## 📚 API Documentation

### Core Endpoints

#### 1. Air Quality Data

**Get Live AQI for All Cities**
```typescript
GET /api/aqi/live

Response:
{
  "data": [
    {
      "name": "Delhi",
      "state": "DL",
      "aqi": 387,
      "pm25": 218,
      "pm10": 412,
      "trend": +12,
      "lon": 77.10,
      "lat": 28.70,
      "source": "database"
    }
  ],
  "source": "database" | "cpcb" | "mock"
}
```

**Get AQI for Specific City**
```typescript
POST /api/aqi/city
Body: { "city": "Delhi" }

Response: { (CityAqi object) }
```

**Get Historical Data**
```typescript
POST /api/aqi/historical
Body: { 
  "city": "Delhi",
  "hours": 24  // 1-168 hours
}

Response: {
  "city": "Delhi",
  "data": [
    {
      "timestamp": "2024-01-15T10:00:00Z",
      "aqi": 350,
      "pm25": 200,
      "pm10": 380
    }
  ]
}
```

#### 2. Sensors

**Get All Sensors**
```typescript
POST /api/sensors
Body: {
  "city"?: string,
  "status"?: "online" | "degraded" | "offline" | "all",
  "type"?: "CAAQMS" | "low-cost" | "mobile" | "all"
}

Response: {
  "sensors": [...],
  "total": 120,
  "online": 108,
  "offline": 12
}
```

**Get Sensor Health**
```typescript
GET /api/sensors/health

Response: {
  "total": 120,
  "online": 108,
  "degraded": 8,
  "offline": 4,
  "uptime_percentage": 92.5,
  "avg_battery_level": 87
}
```

#### 3. Forecasts

**Get Forecast for City**
```typescript
POST /api/forecasts
Body: {
  "city": "Delhi",
  "hours": 24
}

Response: {
  "city": "Delhi",
  "forecasts": [
    {
      "forecast_timestamp": "2024-01-15T11:00:00Z",
      "predicted_aqi": 360,
      "confidence_score": 0.85,
      "prediction_interval_lower": 320,
      "prediction_interval_upper": 400
    }
  ]
}
```

**Get Hourly Forecast**
```typescript
POST /api/forecasts/hourly
Body: { "city": "Delhi" }

Response: {
  "hourly": [
    { "hour": 0, "aqi": 350, "pm25": 200, "confidence": 0.88 }
  ]
}
```

#### 4. Incidents

**Get All Incidents**
```typescript
POST /api/incidents
Body: {
  "city"?: string,
  "status"?: "Open" | "Investigating" | "Resolved" | "all",
  "severity"?: "Critical" | "High" | "Medium" | "Low" | "all",
  "limit"?: number
}

Response: {
  "incidents": [...],
  "total": 150
}
```

**Create Incident**
```typescript
POST /api/incidents/create
Body: {
  "city": "Delhi",
  "state": "DL",
  "incident_type": "Industrial Emission",
  "severity": "High",
  "location_description": "Wazirpur Area",
  "description": "PM2.5 spike detected"
}

Response: {
  "ok": true,
  "incidentId": "INC-48215"
}
```

**Update Incident Status**
```typescript
POST /api/incidents/update
Body: {
  "incidentId": "INC-48215",
  "status": "Investigating",
  "notes": "Officer dispatched"
}

Response: { "ok": true }
```

### Rate Limits

| Tier | Requests/Min | Requests/Hour |
|------|--------------|---------------|
| Public | 100 | 6,000 |
| Authenticated | 1,000 | 60,000 |
| Download | 10 | 10 |
| AI/LLM | 20 | 20 |

Response headers include:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642329600
```

### Caching

| Data Type | Cache TTL | Cache Size |
|-----------|-----------|------------|
| AQI Data | 5 min | 50MB |
| Sensors | 10 min | 20MB |
| Forecasts | 30 min | 30MB |
| Static Data | 1 hour | 10MB |

Response headers include:
```
X-Cache: HIT | MISS
```

---

## 🔍 Monitoring & Debugging

### Check Logs

```bash
# Application logs
tail -f logs/app.log

# Database queries (if enabled)
tail -f logs/db.log
```

### Database Performance

```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check hypertable chunk usage
SELECT * FROM timescaledb_information.chunks
WHERE hypertable_name = 'air_quality_readings';

-- Check recent readings
SELECT city, COUNT(*), MAX(timestamp) as latest
FROM air_quality_readings
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY city;
```

### Cache Statistics

```bash
# Access at runtime
curl http://localhost:3000/api/cache/stats
```

---

## 🐛 Troubleshooting

### Database Connection Fails

```bash
# Check if Supabase is accessible
curl https://your-project.supabase.co

# Verify service role key
echo $SUPABASE_SERVICE_ROLE_KEY

# Test database query
psql $DATABASE_URL -c "SELECT NOW();"
```

### No Data Showing

1. **Check database has seed data**:
   ```sql
   SELECT COUNT(*) FROM air_quality_readings;
   ```

2. **Verify API returns data**:
   ```bash
   curl http://localhost:3000/api/aqi/live | jq
   ```

3. **Check browser console** for client-side errors

### Rate Limit Issues

```typescript
// Reset rate limit for testing
import { rateLimiters } from './src/lib/middleware/rate-limit';
rateLimiters.public.reset('your-ip');
```

---

## 📦 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **TimescaleDB Docs**: https://docs.timescale.com
- **CPCB API**: https://data.gov.in/catalog/real-time-air-quality-index
- **TanStack Start**: https://tanstack.com/start

---

## 🤝 Support

For issues or questions:
1. Check this documentation
2. Review console logs
3. Check database connectivity
4. Verify environment variables
5. Create an issue on GitHub

---

**Happy Building! 🚀**
