-- ═════════════════════════════════════════════════════════════════════════════
-- Swachh Hawa · Core Data Tables Migration
-- Production-grade schema for air quality monitoring system
-- ═════════════════════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "timescaledb" CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. SENSORS & DEVICES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.sensors (
  id VARCHAR(50) PRIMARY KEY,
  name TEXT NOT NULL,
  device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('CAAQMS', 'low-cost', 'mobile', 'drone', 'satellite')),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'degraded', 'offline', 'maintenance')),
  battery_level INTEGER CHECK (battery_level BETWEEN 0 AND 100),
  firmware_version VARCHAR(20),
  installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_heartbeat TIMESTAMPTZ,
  calibration_due_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX sensors_city_idx ON public.sensors (city);
CREATE INDEX sensors_status_idx ON public.sensors (status);
CREATE INDEX sensors_location_idx ON public.sensors USING GIST (location);
CREATE INDEX sensors_last_heartbeat_idx ON public.sensors (last_heartbeat DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. AIR QUALITY READINGS (Time-series data)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.air_quality_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sensor_id VARCHAR(50) NOT NULL REFERENCES public.sensors(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  
  -- AQI & Pollutants
  aqi INTEGER NOT NULL,
  aqi_category VARCHAR(20),
  pm25 DECIMAL(10, 2) NOT NULL,
  pm10 DECIMAL(10, 2) NOT NULL,
  no2 DECIMAL(10, 2),
  so2 DECIMAL(10, 2),
  co DECIMAL(10, 2),
  o3 DECIMAL(10, 2),
  nh3 DECIMAL(10, 2),
  
  -- Meteorological data
  temperature DECIMAL(5, 2),
  humidity DECIMAL(5, 2),
  wind_speed DECIMAL(5, 2),
  wind_direction DECIMAL(5, 2),
  pressure DECIMAL(7, 2),
  
  -- Data quality
  data_quality_score DECIMAL(3, 2) CHECK (data_quality_score BETWEEN 0 AND 1),
  is_validated BOOLEAN DEFAULT FALSE,
  validation_notes TEXT,
  
  -- Provenance & integrity
  hash_chain VARCHAR(64),
  merkle_root VARCHAR(64),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Convert to hypertable for time-series optimization
SELECT create_hypertable('public.air_quality_readings', 'timestamp', 
  if_not_exists => TRUE,
  chunk_time_interval => INTERVAL '1 day'
);

CREATE INDEX readings_sensor_time_idx ON public.air_quality_readings (sensor_id, timestamp DESC);
CREATE INDEX readings_city_time_idx ON public.air_quality_readings (city, timestamp DESC);
CREATE INDEX readings_aqi_idx ON public.air_quality_readings (aqi);
CREATE INDEX readings_timestamp_idx ON public.air_quality_readings (timestamp DESC);

-- Continuous aggregates for 1-hour averages
CREATE MATERIALIZED VIEW IF NOT EXISTS air_quality_hourly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', timestamp) AS bucket,
  sensor_id,
  city,
  state,
  AVG(aqi) AS avg_aqi,
  AVG(pm25) AS avg_pm25,
  AVG(pm10) AS avg_pm10,
  AVG(no2) AS avg_no2,
  AVG(temperature) AS avg_temp,
  COUNT(*) AS reading_count
FROM public.air_quality_readings
GROUP BY bucket, sensor_id, city, state
WITH NO DATA;

-- Refresh policy: update every 30 minutes
SELECT add_continuous_aggregate_policy('air_quality_hourly',
  start_offset => INTERVAL '3 hours',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '30 minutes',
  if_not_exists => TRUE
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. FORECASTS & PREDICTIONS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  forecast_timestamp TIMESTAMPTZ NOT NULL,
  forecast_horizon_hours INTEGER NOT NULL CHECK (forecast_horizon_hours > 0),
  
  -- Predictions
  predicted_aqi INTEGER NOT NULL,
  predicted_pm25 DECIMAL(10, 2),
  predicted_pm10 DECIMAL(10, 2),
  confidence_score DECIMAL(3, 2) CHECK (confidence_score BETWEEN 0 AND 1),
  prediction_interval_lower INTEGER,
  prediction_interval_upper INTEGER,
  
  -- Model metadata
  model_name VARCHAR(100) NOT NULL,
  model_version VARCHAR(20),
  input_features JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX forecasts_city_time_idx ON public.forecasts (city, forecast_timestamp DESC);
CREATE INDEX forecasts_created_at_idx ON public.forecasts (created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. INCIDENTS & ENFORCEMENT
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.incidents (
  id VARCHAR(50) PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  incident_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
  status VARCHAR(50) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Investigating', 'Resolved', 'Closed', 'Escalated')),
  
  -- Location & source
  location GEOGRAPHY(POINT, 4326),
  location_description TEXT,
  source_type VARCHAR(50), -- 'sensor', 'complaint', 'drone', 'manual'
  source_id VARCHAR(100),
  
  -- Details
  description TEXT,
  pollutant_levels JSONB,
  evidence_urls TEXT[],
  
  -- Assignment & workflow
  assigned_officer VARCHAR(100),
  assigned_agency VARCHAR(100),
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  
  -- Timeline
  detected_at TIMESTAMPTZ NOT NULL,
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  
  -- Enforcement actions
  enforcement_dossier VARCHAR(100),
  fine_amount DECIMAL(12, 2),
  compliance_deadline TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX incidents_city_idx ON public.incidents (city);
CREATE INDEX incidents_status_idx ON public.incidents (status);
CREATE INDEX incidents_severity_idx ON public.incidents (severity);
CREATE INDEX incidents_detected_at_idx ON public.incidents (detected_at DESC);
CREATE INDEX incidents_location_idx ON public.incidents USING GIST (location);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. ENFORCEMENT ACTIONS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.enforcement_actions (
  id VARCHAR(50) PRIMARY KEY,
  incident_id VARCHAR(50) REFERENCES public.incidents(id) ON DELETE SET NULL,
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('notice', 'fine', 'closure', 'prosecution', 'warning')),
  
  -- Target entity
  target_entity_name TEXT NOT NULL,
  target_entity_type VARCHAR(50), -- 'industrial', 'commercial', 'individual'
  target_location TEXT,
  
  -- Action details
  violation_description TEXT NOT NULL,
  legal_provision TEXT,
  fine_amount DECIMAL(12, 2),
  compliance_deadline TIMESTAMPTZ,
  
  -- Status tracking
  status VARCHAR(50) NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'acknowledged', 'complied', 'appealed', 'escalated')),
  issued_by VARCHAR(100) NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  complied_at TIMESTAMPTZ,
  
  -- Documents
  document_urls TEXT[],
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX enforcement_incident_idx ON public.enforcement_actions (incident_id);
CREATE INDEX enforcement_status_idx ON public.enforcement_actions (status);
CREATE INDEX enforcement_issued_at_idx ON public.enforcement_actions (issued_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. ALERTS & NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('threshold_breach', 'sensor_offline', 'forecast_high', 'incident', 'system')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  
  -- Target
  city VARCHAR(100),
  state VARCHAR(50),
  affected_population INTEGER,
  
  -- Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_items TEXT[],
  
  -- Associated data
  sensor_id VARCHAR(50) REFERENCES public.sensors(id) ON DELETE SET NULL,
  incident_id VARCHAR(50) REFERENCES public.incidents(id) ON DELETE SET NULL,
  reading_data JSONB,
  
  -- Delivery
  delivery_channels VARCHAR(50)[] DEFAULT ARRAY['push', 'email'], -- 'push', 'email', 'sms', 'dashboard'
  target_user_groups VARCHAR(50)[], -- 'citizens', 'officers', 'admins', 'subscribers'
  sent_at TIMESTAMPTZ,
  
  -- Lifecycle
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  acknowledged_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX alerts_city_idx ON public.alerts (city);
CREATE INDEX alerts_severity_idx ON public.alerts (severity);
CREATE INDEX alerts_active_idx ON public.alerts (active) WHERE active = TRUE;
CREATE INDEX alerts_created_at_idx ON public.alerts (created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. AUDIT LOG
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_id VARCHAR(100),
  actor_role VARCHAR(50),
  actor_ip INET,
  
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(100),
  
  details JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) CHECK (status IN ('success', 'failure', 'partial')),
  error_message TEXT
);

CREATE INDEX audit_log_timestamp_idx ON public.audit_log (timestamp DESC);
CREATE INDEX audit_log_actor_idx ON public.audit_log (actor_id);
CREATE INDEX audit_log_resource_idx ON public.audit_log (resource_type, resource_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. ROW-LEVEL SECURITY POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

-- Sensors: read-only for public, full access for service role
ALTER TABLE public.sensors ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sensors' AND policyname = 'Public can view active sensors') THEN
    CREATE POLICY "Public can view active sensors"
      ON public.sensors FOR SELECT
      USING (status IN ('online', 'degraded'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sensors' AND policyname = 'Service role full access to sensors') THEN
    CREATE POLICY "Service role full access to sensors"
      ON public.sensors FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Air quality readings: public read access, service role writes
ALTER TABLE public.air_quality_readings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'air_quality_readings' AND policyname = 'Public can view validated readings') THEN
    CREATE POLICY "Public can view validated readings"
      ON public.air_quality_readings FOR SELECT
      USING (is_validated = TRUE OR auth.role() = 'service_role');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'air_quality_readings' AND policyname = 'Service role manages readings') THEN
    CREATE POLICY "Service role manages readings"
      ON public.air_quality_readings FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Forecasts: public read access
ALTER TABLE public.forecasts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'forecasts' AND policyname = 'Public can view forecasts') THEN
    CREATE POLICY "Public can view forecasts"
      ON public.forecasts FOR SELECT
      USING (TRUE);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'forecasts' AND policyname = 'Service role manages forecasts') THEN
    CREATE POLICY "Service role manages forecasts"
      ON public.forecasts FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Incidents: restricted read, service role manages
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'incidents' AND policyname = 'Public can view open incidents') THEN
    CREATE POLICY "Public can view open incidents"
      ON public.incidents FOR SELECT
      USING (status IN ('Open', 'Resolved'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'incidents' AND policyname = 'Service role manages incidents') THEN
    CREATE POLICY "Service role manages incidents"
      ON public.incidents FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Enforcement: restricted access
ALTER TABLE public.enforcement_actions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'enforcement_actions' AND policyname = 'Service role manages enforcement') THEN
    CREATE POLICY "Service role manages enforcement"
      ON public.enforcement_actions FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Alerts: public read of active alerts
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'alerts' AND policyname = 'Public can view active alerts') THEN
    CREATE POLICY "Public can view active alerts"
      ON public.alerts FOR SELECT
      USING (active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'alerts' AND policyname = 'Service role manages alerts') THEN
    CREATE POLICY "Service role manages alerts"
      ON public.alerts FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Audit log: service role only
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_log' AND policyname = 'Service role reads audit log') THEN
    CREATE POLICY "Service role reads audit log"
      ON public.audit_log FOR SELECT
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. FUNCTIONS & TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sensors_updated_at
  BEFORE UPDATE ON public.sensors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enforcement_updated_at
  BEFORE UPDATE ON public.enforcement_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate AQI from pollutant values
CREATE OR REPLACE FUNCTION calculate_aqi(
  p_pm25 DECIMAL,
  p_pm10 DECIMAL,
  p_no2 DECIMAL DEFAULT NULL,
  p_so2 DECIMAL DEFAULT NULL,
  p_co DECIMAL DEFAULT NULL,
  p_o3 DECIMAL DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  aqi_pm25 INTEGER;
  aqi_pm10 INTEGER;
  max_aqi INTEGER;
BEGIN
  -- Simplified AQI calculation (CPCB India standard)
  -- PM2.5 breakpoints: 0-30, 31-60, 61-90, 91-120, 121-250, >250
  aqi_pm25 := CASE
    WHEN p_pm25 <= 30 THEN (p_pm25 / 30.0 * 50)::INTEGER
    WHEN p_pm25 <= 60 THEN (((p_pm25 - 30) / 30.0 * 50) + 50)::INTEGER
    WHEN p_pm25 <= 90 THEN (((p_pm25 - 60) / 30.0 * 100) + 100)::INTEGER
    WHEN p_pm25 <= 120 THEN (((p_pm25 - 90) / 30.0 * 100) + 200)::INTEGER
    WHEN p_pm25 <= 250 THEN (((p_pm25 - 120) / 130.0 * 100) + 300)::INTEGER
    ELSE (((p_pm25 - 250) / 130.0 * 100) + 400)::INTEGER
  END;
  
  -- PM10 breakpoints: 0-50, 51-100, 101-250, 251-350, 351-430, >430
  aqi_pm10 := CASE
    WHEN p_pm10 <= 50 THEN (p_pm10 / 50.0 * 50)::INTEGER
    WHEN p_pm10 <= 100 THEN (((p_pm10 - 50) / 50.0 * 50) + 50)::INTEGER
    WHEN p_pm10 <= 250 THEN (((p_pm10 - 100) / 150.0 * 100) + 100)::INTEGER
    WHEN p_pm10 <= 350 THEN (((p_pm10 - 250) / 100.0 * 100) + 200)::INTEGER
    WHEN p_pm10 <= 430 THEN (((p_pm10 - 350) / 80.0 * 100) + 300)::INTEGER
    ELSE (((p_pm10 - 430) / 80.0 * 100) + 400)::INTEGER
  END;
  
  -- Return maximum of all pollutant AQIs
  max_aqi := GREATEST(aqi_pm25, aqi_pm10);
  
  RETURN GREATEST(0, LEAST(500, max_aqi));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get AQI category
CREATE OR REPLACE FUNCTION get_aqi_category(aqi INTEGER)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE
    WHEN aqi <= 50 THEN 'Good'
    WHEN aqi <= 100 THEN 'Satisfactory'
    WHEN aqi <= 200 THEN 'Moderate'
    WHEN aqi <= 300 THEN 'Poor'
    WHEN aqi <= 400 THEN 'Very Poor'
    ELSE 'Severe'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ═════════════════════════════════════════════════════════════════════════════
-- Migration Complete
-- ═════════════════════════════════════════════════════════════════════════════
