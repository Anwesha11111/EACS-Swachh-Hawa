-- ═════════════════════════════════════════════════════════════════════════════
-- Swachh Hawa · Seed Data Migration
-- Production-realistic seed data for testing and demo
-- ═════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. SENSORS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.sensors (id, name, device_type, city, state, location, status, battery_level, firmware_version, last_heartbeat) VALUES
('SH-DEL-001', 'CAAQMS Delhi ITO', 'CAAQMS', 'Delhi', 'DL', ST_SetSRID(ST_MakePoint(77.10, 28.70), 4326), 'online', 100, 'v4.2.1', NOW() - INTERVAL '5 minutes'),
('SH-DEL-042', 'Low-cost Wazirpur', 'low-cost', 'Delhi', 'DL', ST_SetSRID(ST_MakePoint(77.15, 28.72), 4326), 'online', 87, 'v4.2.1', NOW() - INTERVAL '3 minutes'),
('SH-MUM-001', 'CAAQMS Mumbai Worli', 'CAAQMS', 'Mumbai', 'MH', ST_SetSRID(ST_MakePoint(72.88, 19.08), 4326), 'online', 100, 'v4.2.1', NOW() - INTERVAL '8 minutes'),
('SH-KOL-001', 'CAAQMS Kolkata Ballygunge', 'CAAQMS', 'Kolkata', 'WB', ST_SetSRID(ST_MakePoint(88.37, 22.57), 4326), 'online', 100, 'v4.2.1', NOW() - INTERVAL '2 minutes'),
('SH-BLR-001', 'CAAQMS Bengaluru Silk Board', 'CAAQMS', 'Bengaluru', 'KA', ST_SetSRID(ST_MakePoint(77.59, 12.97), 4326), 'online', 100, 'v4.2.0', NOW() - INTERVAL '10 minutes'),
('SH-HYD-001', 'CAAQMS Hyderabad Jubilee Hills', 'CAAQMS', 'Hyderabad', 'TG', ST_SetSRID(ST_MakePoint(78.48, 17.38), 4326), 'degraded', 92, 'v4.2.1', NOW() - INTERVAL '45 minutes'),
('SH-PNA-031', 'Low-cost Patna Phulwari', 'low-cost', 'Patna', 'BR', ST_SetSRID(ST_MakePoint(85.14, 25.61), 4326), 'online', 78, 'v4.1.8', NOW() - INTERVAL '4 minutes'),
('SH-LKO-001', 'CAAQMS Lucknow Gomti Nagar', 'CAAQMS', 'Lucknow', 'UP', ST_SetSRID(ST_MakePoint(80.95, 26.85), 4326), 'online', 100, 'v4.2.1', NOW() - INTERVAL '6 minutes'),
('SH-GZB-018', 'Low-cost Ghaziabad NH-9', 'low-cost', 'Ghaziabad', 'UP', ST_SetSRID(ST_MakePoint(77.45, 28.66), 4326), 'online', 91, 'v4.2.0', NOW() - INTERVAL '12 minutes'),
('SH-AMD-001', 'CAAQMS Ahmedabad Maninagar', 'CAAQMS', 'Ahmedabad', 'GJ', ST_SetSRID(ST_MakePoint(72.57, 23.03), 4326), 'online', 100, 'v4.2.1', NOW() - INTERVAL '7 minutes'),
('SH-MOBILE-001', 'Mobile Unit NCR-1', 'mobile', 'Delhi', 'DL', ST_SetSRID(ST_MakePoint(77.20, 28.65), 4326), 'online', 65, 'v4.3.0', NOW() - INTERVAL '15 minutes'),
('SH-DRONE-001', 'Drone Fleet Alpha', 'drone', 'Delhi', 'DL', ST_SetSRID(ST_MakePoint(77.18, 28.68), 4326), 'maintenance', NULL, 'v3.1.2', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. AIR QUALITY READINGS (Last 7 days sample data)
-- ─────────────────────────────────────────────────────────────────────────────

-- Generate realistic time-series data for Delhi over the past 7 days
INSERT INTO public.air_quality_readings (
  sensor_id, timestamp, city, state, aqi, aqi_category,
  pm25, pm10, no2, so2, co, o3,
  temperature, humidity, wind_speed, pressure,
  data_quality_score, is_validated
)
SELECT
  'SH-DEL-001' AS sensor_id,
  NOW() - (INTERVAL '1 hour' * generate_series) AS timestamp,
  'Delhi' AS city,
  'DL' AS state,
  -- AQI varies through the day (higher at night, lower midday)
  (250 + 80 * SIN(generate_series / 4.0) + (RANDOM() * 60 - 30))::INTEGER AS aqi,
  'Poor' AS aqi_category,
  (180 + 50 * SIN(generate_series / 4.0) + (RANDOM() * 40 - 20))::DECIMAL(10,2) AS pm25,
  (320 + 80 * SIN(generate_series / 4.0) + (RANDOM() * 60 - 30))::DECIMAL(10,2) AS pm10,
  (45 + 15 * SIN(generate_series / 5.0) + (RANDOM() * 10 - 5))::DECIMAL(10,2) AS no2,
  (12 + 5 * SIN(generate_series / 6.0) + (RANDOM() * 4 - 2))::DECIMAL(10,2) AS so2,
  (1.2 + 0.5 * SIN(generate_series / 4.5) + (RANDOM() * 0.4 - 0.2))::DECIMAL(10,2) AS co,
  (38 + 12 * SIN(generate_series / 3.8) + (RANDOM() * 8 - 4))::DECIMAL(10,2) AS o3,
  (28 + 8 * SIN(generate_series / 12.0) + (RANDOM() * 4 - 2))::DECIMAL(5,2) AS temperature,
  (52 + 18 * SIN(generate_series / 10.0) + (RANDOM() * 10 - 5))::DECIMAL(5,2) AS humidity,
  (8 + 4 * SIN(generate_series / 7.0) + (RANDOM() * 3 - 1.5))::DECIMAL(5,2) AS wind_speed,
  (1012 + 5 * SIN(generate_series / 20.0) + (RANDOM() * 4 - 2))::DECIMAL(7,2) AS pressure,
  (0.85 + RANDOM() * 0.12)::DECIMAL(3,2) AS data_quality_score,
  TRUE AS is_validated
FROM generate_series(0, 168) -- 7 days * 24 hours
ON CONFLICT DO NOTHING;

-- Mumbai readings (lower pollution)
INSERT INTO public.air_quality_readings (
  sensor_id, timestamp, city, state, aqi, aqi_category,
  pm25, pm10, no2, temperature, humidity, data_quality_score, is_validated
)
SELECT
  'SH-MUM-001' AS sensor_id,
  NOW() - (INTERVAL '1 hour' * generate_series) AS timestamp,
  'Mumbai' AS city,
  'MH' AS state,
  (140 + 40 * SIN(generate_series / 4.2) + (RANDOM() * 30 - 15))::INTEGER AS aqi,
  'Moderate' AS aqi_category,
  (85 + 30 * SIN(generate_series / 4.2) + (RANDOM() * 20 - 10))::DECIMAL(10,2) AS pm25,
  (145 + 50 * SIN(generate_series / 4.2) + (RANDOM() * 30 - 15))::DECIMAL(10,2) AS pm10,
  (32 + 10 * SIN(generate_series / 5.5) + (RANDOM() * 6 - 3))::DECIMAL(10,2) AS no2,
  (29 + 3 * SIN(generate_series / 12.0) + (RANDOM() * 2 - 1))::DECIMAL(5,2) AS temperature,
  (68 + 12 * SIN(generate_series / 10.0) + (RANDOM() * 8 - 4))::DECIMAL(5,2) AS humidity,
  (0.88 + RANDOM() * 0.10)::DECIMAL(3,2) AS data_quality_score,
  TRUE AS is_validated
FROM generate_series(0, 168)
ON CONFLICT DO NOTHING;

-- Patna readings (high pollution)
INSERT INTO public.air_quality_readings (
  sensor_id, timestamp, city, state, aqi, aqi_category,
  pm25, pm10, temperature, humidity, data_quality_score, is_validated
)
SELECT
  'SH-PNA-031' AS sensor_id,
  NOW() - (INTERVAL '1 hour' * generate_series) AS timestamp,
  'Patna' AS city,
  'BR' AS state,
  (320 + 60 * SIN(generate_series / 3.8) + (RANDOM() * 50 - 25))::INTEGER AS aqi,
  'Very Poor' AS aqi_category,
  (210 + 50 * SIN(generate_series / 3.8) + (RANDOM() * 40 - 20))::DECIMAL(10,2) AS pm25,
  (380 + 80 * SIN(generate_series / 3.8) + (RANDOM() * 60 - 30))::DECIMAL(10,2) AS pm10,
  (30 + 7 * SIN(generate_series / 12.0) + (RANDOM() * 3 - 1.5))::DECIMAL(5,2) AS temperature,
  (48 + 15 * SIN(generate_series / 10.0) + (RANDOM() * 10 - 5))::DECIMAL(5,2) AS humidity,
  (0.78 + RANDOM() * 0.15)::DECIMAL(3,2) AS data_quality_score,
  TRUE AS is_validated
FROM generate_series(0, 168)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. FORECASTS (Next 7 days for major cities)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.forecasts (
  city, state, forecast_timestamp, forecast_horizon_hours,
  predicted_aqi, predicted_pm25, predicted_pm10,
  confidence_score, prediction_interval_lower, prediction_interval_upper,
  model_name, model_version
)
SELECT
  'Delhi' AS city,
  'DL' AS state,
  NOW() + (INTERVAL '1 hour' * generate_series) AS forecast_timestamp,
  generate_series AS forecast_horizon_hours,
  (260 + 70 * SIN(generate_series / 4.5) + (RANDOM() * 40 - 20))::INTEGER AS predicted_aqi,
  (185 + 45 * SIN(generate_series / 4.5) + (RANDOM() * 30 - 15))::DECIMAL(10,2) AS predicted_pm25,
  (330 + 75 * SIN(generate_series / 4.5) + (RANDOM() * 50 - 25))::DECIMAL(10,2) AS predicted_pm10,
  (0.82 - generate_series * 0.003)::DECIMAL(3,2) AS confidence_score, -- confidence decreases over time
  (220 + 60 * SIN(generate_series / 4.5))::INTEGER AS prediction_interval_lower,
  (300 + 80 * SIN(generate_series / 4.5))::INTEGER AS prediction_interval_upper,
  'LGBM-LSTM-Ensemble' AS model_name,
  'v2.1.4' AS model_version
FROM generate_series(1, 168) -- 7 days ahead
ON CONFLICT DO NOTHING;

INSERT INTO public.forecasts (
  city, state, forecast_timestamp, forecast_horizon_hours,
  predicted_aqi, predicted_pm25, confidence_score,
  prediction_interval_lower, prediction_interval_upper,
  model_name, model_version
)
SELECT
  'Mumbai' AS city,
  'MH' AS state,
  NOW() + (INTERVAL '1 hour' * generate_series) AS forecast_timestamp,
  generate_series AS forecast_horizon_hours,
  (145 + 35 * SIN(generate_series / 4.8) + (RANDOM() * 25 - 12))::INTEGER AS predicted_aqi,
  (88 + 28 * SIN(generate_series / 4.8) + (RANDOM() * 18 - 9))::DECIMAL(10,2) AS predicted_pm25,
  (0.84 - generate_series * 0.003)::DECIMAL(3,2) AS confidence_score,
  (110 + 30 * SIN(generate_series / 4.8))::INTEGER AS prediction_interval_lower,
  (180 + 40 * SIN(generate_series / 4.8))::INTEGER AS prediction_interval_upper,
  'LGBM-LSTM-Ensemble' AS model_name,
  'v2.1.4' AS model_version
FROM generate_series(1, 168)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. INCIDENTS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.incidents (
  id, city, state, incident_type, severity, status,
  location, location_description, source_type, source_id,
  description, assigned_officer, priority,
  detected_at, enforcement_dossier
) VALUES
('INC-48211', 'Delhi', 'DL', 'Industrial Emission Breach', 'Critical', 'Investigating',
 ST_SetSRID(ST_MakePoint(77.15, 28.72), 4326), 'Wazirpur Industrial Area', 'sensor', 'SH-DEL-042',
 'PM2.5 spike to 356 µg/m³ detected from industrial source. Sensor correlation with CAAQMS confirmed.',
 'Insp. R. Khanna', 10, NOW() - INTERVAL '12 minutes', 'ENF-2026-0341'),

('INC-48210', 'Patna', 'BR', 'Crop Residue Burning', 'High', 'Open',
 ST_SetSRID(ST_MakePoint(85.10, 25.58), 4326), 'Agricultural fields near Danapur', 'satellite', 'MODIS-2026-05-30',
 'Multiple fire hotspots detected via satellite imagery. Ground verification pending.',
 'Insp. S. Mahato', 9, NOW() - INTERVAL '28 minutes', NULL),

('INC-48209', 'Lucknow', 'UP', 'Construction Dust Violation', 'High', 'Open',
 ST_SetSRID(ST_MakePoint(80.92, 26.88), 4326), 'Gomti Nagar Extension Site', 'complaint', 'CMP-4822',
 'Construction site operating without dust control measures. PM10 elevated 3× baseline.',
 'Insp. A. Verma', 8, NOW() - INTERVAL '44 minutes', NULL),

('INC-48208', 'Mumbai', 'MH', 'Vehicular PM Spike', 'Medium', 'Investigating',
 ST_SetSRID(ST_MakePoint(72.85, 19.12), 4326), 'Western Express Highway near Bandra', 'sensor', 'SH-MUM-001',
 'Traffic congestion led to localized PM spike. Monitoring for compliance.',
 'Insp. D. Naik', 6, NOW() - INTERVAL '1 hour 12 minutes', NULL),

('INC-48207', 'Ahmedabad', 'GJ', 'Refinery SOx Release', 'Critical', 'Open',
 ST_SetSRID(ST_MakePoint(72.60, 23.05), 4326), 'Industrial refinery complex', 'sensor', 'SH-AMD-001',
 'Elevated SO₂ levels detected. Emergency response team dispatched.',
 'Insp. P. Joshi', 10, NOW() - INTERVAL '2 hours 8 minutes', 'ENF-2026-0339'),

('INC-48206', 'Kolkata', 'WB', 'Brick Kiln Non-Compliance', 'Medium', 'Resolved',
 ST_SetSRID(ST_MakePoint(88.40, 22.55), 4326), 'Brick kiln cluster near EM Bypass', 'manual', 'OFFICER-PATROL-042',
 'Brick kiln operating with non-compliant fuel. Notice issued, compliance achieved.',
 'Insp. M. Ghosh', 7, NOW() - INTERVAL '3 hours 22 minutes', 'ENF-2026-0337')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. ENFORCEMENT ACTIONS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.enforcement_actions (
  id, incident_id, action_type, target_entity_name, target_entity_type,
  target_location, violation_description, legal_provision,
  fine_amount, compliance_deadline, status, issued_by, issued_at
) VALUES
('ENF-ACT-001', 'INC-48211', 'notice', 'Wazirpur Steel Works Pvt. Ltd.', 'industrial',
 'Wazirpur Industrial Area, Delhi', 'Emission of particulate matter exceeding permissible limits under Air (Prevention and Control of Pollution) Act, 1981',
 'Section 21, Air Act 1981', 250000.00, NOW() + INTERVAL '15 days', 'issued',
 'Delhi PCB Officer R. Khanna', NOW() - INTERVAL '10 minutes'),

('ENF-ACT-002', 'INC-48207', 'closure', 'Gujarat Refinery Ltd.', 'industrial',
 'Industrial Area, Ahmedabad', 'Critical SO₂ emission breach. Immediate closure order issued pending investigation.',
 'Section 31A, Air Act 1981', 5000000.00, NOW() + INTERVAL '7 days', 'issued',
 'Gujarat PCB Officer P. Joshi', NOW() - INTERVAL '2 hours'),

('ENF-ACT-003', 'INC-48206', 'warning', 'Local Brick Kiln Operator', 'industrial',
 'EM Bypass, Kolkata', 'Use of non-compliant fuel in brick kilns. Warning issued with compliance achieved.',
 'Section 22, Air Act 1981', 50000.00, NOW() - INTERVAL '1 day', 'complied',
 'West Bengal PCB Officer M. Ghosh', NOW() - INTERVAL '3 hours')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. ALERTS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.alerts (
  alert_type, severity, city, state, affected_population,
  title, message, action_items,
  sensor_id, incident_id, delivery_channels, target_user_groups,
  active, expires_at
) VALUES
('threshold_breach', 'critical', 'Delhi', 'DL', 2000000,
 'Critical Air Quality Alert - Delhi NCR', 
 'AQI has reached 387 (Severe). Vulnerable groups advised to stay indoors. All outdoor activities should be minimized.',
 ARRAY['Close windows', 'Use air purifiers', 'Wear N95 masks outdoors', 'Avoid strenuous activity'],
 'SH-DEL-001', NULL, ARRAY['push', 'email', 'sms'], ARRAY['citizens', 'subscribers'],
 TRUE, NOW() + INTERVAL '6 hours'),

('incident', 'high', 'Ahmedabad', 'GJ', 500000,
 'Industrial Emission Alert - Ahmedabad',
 'Elevated SO₂ levels detected near industrial area. Enforcement action in progress.',
 ARRAY['Avoid the industrial area', 'Keep windows closed if nearby'],
 'SH-AMD-001', 'INC-48207', ARRAY['push', 'email'], ARRAY['citizens', 'officers'],
 TRUE, NOW() + INTERVAL '12 hours'),

('forecast_high', 'medium', 'Patna', 'BR', 800000,
 'Air Quality Advisory - Patna',
 'AQI forecast to reach Poor category tomorrow. Plan outdoor activities accordingly.',
 ARRAY['Check AQI before going out', 'Sensitive groups take precautions'],
 NULL, NULL, ARRAY['push', 'email'], ARRAY['subscribers'],
 TRUE, NOW() + INTERVAL '24 hours'),

('sensor_offline', 'low', 'Hyderabad', 'TG', NULL,
 'Sensor Status Update',
 'Sensor SH-HYD-001 showing degraded performance. Maintenance team notified.',
 NULL, 'SH-HYD-001', NULL, ARRAY['dashboard'], ARRAY['admins', 'officers'],
 TRUE, NULL)
ON CONFLICT DO NOTHING;

-- ═════════════════════════════════════════════════════════════════════════════
-- Seed Data Migration Complete
-- ═════════════════════════════════════════════════════════════════════════════
