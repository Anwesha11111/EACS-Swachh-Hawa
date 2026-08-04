export interface CityAqi {
  name: string;
  state: string;
  aqi: number;
  pm25: number;
  pm10: number;
  trend: number;
  /** Geographic coordinates — used by d3-geo projection */
  lon: number;
  lat: number;
  /** Legacy SVG pixel coords — kept for non-map components */
  x: number;
  y: number;
}

export const CITIES: CityAqi[] = [
  { name: "Delhi",      state: "DL", aqi: 379, pm25: 213, pm10: 412, trend: +12, lon: 77.10, lat: 28.70, x: 247, y: 254 },
  { name: "Mumbai",     state: "MH", aqi: 168, pm25: 98,  pm10: 168, trend: -4,  lon: 72.88, lat: 19.08, x: 150, y: 516 },
  { name: "Kolkata",    state: "WB", aqi: 243, pm25: 146, pm10: 232, trend: +8,  lon: 88.37, lat: 22.57, x: 509, y: 419 },
  { name: "Chennai",    state: "TN", aqi: 122, pm25: 50,  pm10: 118, trend: -2,  lon: 80.27, lat: 13.08, x: 323, y: 678 },
  { name: "Bengaluru",  state: "KA", aqi: 105, pm25: 42,  pm10: 88,  trend: -1,  lon: 77.59, lat: 12.97, x: 256, y: 681 },
  { name: "Hyderabad",  state: "TG", aqi: 140, pm25: 74,  pm10: 134, trend: +3,  lon: 78.48, lat: 17.38, x: 282, y: 559 },
  { name: "Ahmedabad",  state: "GJ", aqi: 219, pm25: 115, pm10: 198, trend: +5,  lon: 72.57, lat: 23.03, x: 120, y: 408 },
  { name: "Pune",       state: "MH", aqi: 141, pm25: 69,  pm10: 122, trend: -3,  lon: 73.86, lat: 18.52, x: 173, y: 530 },
  { name: "Lucknow",    state: "UP", aqi: 307, pm25: 174, pm10: 308, trend: +9,  lon: 80.95, lat: 26.85, x: 337, y: 305 },
  { name: "Jaipur",     state: "RJ", aqi: 203, pm25: 110, pm10: 192, trend: +2,  lon: 75.79, lat: 26.91, x: 213, y: 303 },
  { name: "Patna",      state: "BR", aqi: 358, pm25: 203, pm10: 342, trend: +14, lon: 85.14, lat: 25.61, x: 433, y: 338 },
  { name: "Kanpur",     state: "UP", aqi: 291, pm25: 166, pm10: 282, trend: +7,  lon: 80.35, lat: 26.46, x: 325, y: 314 },
  { name: "Varanasi",   state: "UP", aqi: 271, pm25: 154, pm10: 264, trend: +6,  lon: 83.00, lat: 25.32, x: 385, y: 346 },
  { name: "Bhopal",     state: "MP", aqi: 158, pm25: 76,  pm10: 154, trend: -2,  lon: 77.41, lat: 23.26, x: 247, y: 403 },
  { name: "Surat",      state: "GJ", aqi: 187, pm25: 95,  pm10: 178, trend: +1,  lon: 72.83, lat: 21.17, x: 142, y: 457 },
  { name: "Nagpur",     state: "MH", aqi: 142, pm25: 71,  pm10: 142, trend: -1,  lon: 79.09, lat: 21.15, x: 295, y: 459 },
  { name: "Indore",     state: "MP", aqi: 176, pm25: 86,  pm10: 168, trend: 0,   lon: 75.86, lat: 22.72, x: 213, y: 416 },
  { name: "Guwahati",   state: "AS", aqi: 219, pm25: 124, pm10: 218, trend: +5,  lon: 91.74, lat: 26.14, x: 585, y: 324 },
  { name: "Chandigarh", state: "CH", aqi: 264, pm25: 148, pm10: 254, trend: +6,  lon: 76.79, lat: 30.74, x: 242, y: 200 },
  { name: "Kochi",      state: "KL", aqi: 68,  pm25: 29,  pm10: 68,  trend: -1,  lon: 76.27, lat:  9.93, x: 231, y: 762 },
];

export function aqiCategory(aqi: number) {
  if (aqi <= 50)  return { label: "Good",          token: "aqi-good" };
  if (aqi <= 100) return { label: "Satisfactory",  token: "aqi-moderate" };
  if (aqi <= 200) return { label: "Moderate",      token: "aqi-poor" };
  if (aqi <= 300) return { label: "Poor",          token: "aqi-unhealthy" };
  if (aqi <= 400) return { label: "Very Poor",     token: "aqi-severe" };
  return            { label: "Severe",          token: "aqi-hazardous" };
}

export const HOURLY_AQI = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}:00`,
  delhi:    220 + Math.round(80 * Math.sin(i / 3.4) + Math.random() * 40),
  mumbai:   140 + Math.round(40 * Math.sin(i / 4.1 + 1) + Math.random() * 30),
  kolkata:  200 + Math.round(50 * Math.sin(i / 3.9 + 0.5) + Math.random() * 30),
  forecast: 240 + Math.round(60 * Math.sin(i / 3.2 + 0.3) + Math.random() * 25),
}));

export const FORECAST_7D = Array.from({ length: 7 }, (_, i) => ({
  day: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],
  predicted: 260 + Math.round(60 * Math.sin(i)),
  upper:     310 + Math.round(50 * Math.sin(i)),
  lower:     210 + Math.round(50 * Math.sin(i)),
  confidence: 0.78 + Math.random() * 0.15,
}));

export const POLLUTION_SOURCES = [
  { name: "Vehicular",       value: 34, color: "var(--chart-1)" },
  { name: "Industrial",      value: 26, color: "var(--chart-2)" },
  { name: "Construction",    value: 14, color: "var(--chart-3)" },
  { name: "Biomass Burning", value: 12, color: "var(--chart-4)" },
  { name: "Dust",            value: 9,  color: "var(--chart-5)" },
  { name: "Other",           value: 5,  color: "var(--muted-foreground)" },
];

export interface Incident {
  id: string;
  city: string;
  type: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "Investigating" | "Resolved";
  officer: string;
  ts: string;
}
export const INCIDENTS: Incident[] = [
  { id: "INC-48211", city: "Delhi",     type: "Industrial Emission Breach",   severity: "Critical",     status: "Investigating", officer: "Insp. R. Khanna",  ts: "12 min ago" },
  { id: "INC-48210", city: "Patna",     type: "Crop Residue Burning",         severity: "High",         status: "Open",          officer: "Insp. S. Mahato",  ts: "28 min ago" },
  { id: "INC-48209", city: "Lucknow",   type: "Construction Dust Violation",  severity: "High",         status: "Open",          officer: "Insp. A. Verma",   ts: "44 min ago" },
  { id: "INC-48208", city: "Mumbai",    type: "Vehicular PM Spike",           severity: "Medium",       status: "Investigating", officer: "Insp. D. Naik",    ts: "1 hr ago"   },
  { id: "INC-48207", city: "Ahmedabad", type: "Refinery SOx Release",         severity: "Critical",     status: "Open",          officer: "Insp. P. Joshi",   ts: "2 hr ago"   },
  { id: "INC-48206", city: "Kolkata",   type: "Brick Kiln Non-Compliance",    severity: "Medium",       status: "Resolved",      officer: "Insp. M. Ghosh",   ts: "3 hr ago"   },
  { id: "INC-48205", city: "Kanpur",    type: "Tannery Effluent Burning",     severity: "High",         status: "Investigating", officer: "Insp. V. Singh",   ts: "5 hr ago"   },
  { id: "INC-48204", city: "Jaipur",    type: "Stone Crusher Emission",       severity: "Low",          status: "Resolved",      officer: "Insp. K. Rathore", ts: "6 hr ago"   },
];

export interface Sensor {
  id: string;
  city: string;
  type: string;
  status: "online" | "degraded" | "offline";
  battery: number;
  uptime: number;
  packets: number;
  latencyMs: number;
}
export const SENSORS: Sensor[] = [
  { id: "SH-D-0142", city: "Delhi",     type: "LoRa-Mesh Edge",  status: "online",   battery: 92, uptime: 99.94, packets: 18420, latencyMs: 38 },
  { id: "SH-M-0098", city: "Mumbai",    type: "MQTT Industrial", status: "online",   battery: 87, uptime: 99.81, packets: 14210, latencyMs: 42 },
  { id: "SH-K-0077", city: "Kolkata",   type: "Satellite-Link",  status: "degraded", battery: 41, uptime: 96.20, packets: 8120,  latencyMs: 188 },
  { id: "SH-B-0044", city: "Bengaluru", type: "LoRa-Mesh Edge",  status: "online",   battery: 78, uptime: 99.62, packets: 12340, latencyMs: 46 },
  { id: "SH-H-0061", city: "Hyderabad", type: "MQTT Industrial", status: "online",   battery: 95, uptime: 99.99, packets: 16780, latencyMs: 34 },
  { id: "SH-P-0029", city: "Patna",     type: "Mobile Vehicle",  status: "online",   battery: 64, uptime: 98.40, packets: 7210,  latencyMs: 72 },
  { id: "SH-L-0153", city: "Lucknow",   type: "LoRa-Mesh Edge",  status: "offline",  battery: 0,  uptime: 0,     packets: 0,     latencyMs: 0   },
  { id: "SH-J-0019", city: "Jaipur",    type: "Drone Swarm-3",   status: "online",   battery: 81, uptime: 99.10, packets: 9420,  latencyMs: 58 },
  { id: "SH-A-0202", city: "Ahmedabad", type: "Refinery Probe",  status: "online",   battery: 88, uptime: 99.71, packets: 13980, latencyMs: 40 },
  { id: "SH-G-0011", city: "Guwahati",  type: "Satellite-Link",  status: "online",   battery: 72, uptime: 98.92, packets: 6840,  latencyMs: 120 },
];

export const AI_INSIGHTS = [
  { title: "Predicted AQI spike in Delhi-NCR", detail: "Model expects PM2.5 to exceed 280 µg/m³ between 18:00–22:00 due to inversion + traffic load.", confidence: 0.91, severity: "Critical" },
  { title: "Industrial emissions anomaly — Surat",  detail: "Refinery cluster shows abnormal NOx pattern (z-score 3.2). Recommend on-site inspection.",   confidence: 0.84, severity: "High" },
  { title: "Health risk escalation — Patna",        detail: "Pediatric admissions likely to rise 14% within 48h based on PM10 trend.",                     confidence: 0.76, severity: "High" },
  { title: "Crop burning hotspot — Punjab belt",    detail: "Satellite thermal anomalies up 23%. Activating drone patrol grid 7B.",                        confidence: 0.88, severity: "Medium" },
];

export const ALERTS = [
  { ts: "21:14:02", code: "AQI-SEV", region: "Delhi-NCR",  msg: "Severe AQI threshold breached (387)" },
  { ts: "21:13:47", code: "PM-HI",   region: "Patna",      msg: "PM2.5 anomaly +38% over baseline" },
  { ts: "21:12:11", code: "OFL",     region: "Lucknow",    msg: "Sensor SH-L-0153 offline > 5 min" },
  { ts: "21:11:03", code: "NOx-AN",  region: "Surat",      msg: "NOx anomaly detected (z=3.2)" },
  { ts: "21:09:58", code: "ENF-NEW", region: "Ahmedabad",  msg: "Enforcement case opened: INC-48207" },
  { ts: "21:08:21", code: "AI-FCT",  region: "Kolkata",    msg: "Forecast confidence dropped to 71%" },
  { ts: "21:06:09", code: "DRN",     region: "Punjab",     msg: "Drone swarm 7B dispatched (12 units)" },
  { ts: "21:05:11", code: "AQI-MOD", region: "Bengaluru",  msg: "AQI improving — moderate band restored" },
];

// ── Dashboard: 5-day forecast ─────────────────────────────────────────────
export const FORECAST_DELHI = [
  { day: "Today", aqi: 162, icon: "sun" },
  { day: "Fri",   aqi: 138, icon: "cloud-sun" },
  { day: "Sat",   aqi: 110, icon: "cloud" },
  { day: "Sun",   aqi: 92,  icon: "cloud-rain" },
  { day: "Mon",   aqi: 68,  icon: "cloud-rain" },
];

// ── Hourly for forecast panel chart (AQI + PM2.5) ─────────────────────────
export const FORECAST_HOURLY = Array.from({ length: 24 }, (_, i) => ({
  h: `${String(i).padStart(2, "0")}:00`,
  aqi:  100 + Math.round(80 * Math.sin((i - 6) / 3.8) + 20),
  pm25: 55  + Math.round(40 * Math.sin((i - 8) / 4.0) + 10),
}));

// ── Active incidents for dashboard card ────────────────────────────────────
export const ACTIVE_INCIDENTS_DASH = [
  { location: "Delhi – Anand Vihar",      pm25: 356, type: "High Smoke",          ago: "10 min ago" },
  { location: "Ghaziabad – Loni",         pm25: 312, type: "Industrial Emission",  ago: "20 min ago" },
  { location: "Ludhiana – Industrial Area", pm25: 278, type: "Fire / Smoke",       ago: "35 min ago" },
];

// ── Environmental impact summary ───────────────────────────────────────────
export const ENV_IMPACT = {
  livesProtected:     1245,
  incidentsDetected:  48,
  emissionReduced:    520,
  alertsSent:         3827,
};

// ── Sensor network summary ─────────────────────────────────────────────────
export const SENSOR_NETWORK_STATS = {
  total:       2451,
  operational: { count: 2101, pct: 86 },
  warning:     { count: 210,  pct: 8 },
  offline:     { count: 140,  pct: 6 },
};

// ── 7-day multi-pollutant trend ────────────────────────────────────────────
export const AQI_TREND_WEEKLY = Array.from({ length: 7 }, (_, i) => ({
  date: ["22 May","23 May","24 May","25 May","26 May","27 May","28 May"][i],
  aqi:  140 + Math.round(50 * Math.sin(i / 1.4) + 20),
  pm25: 75  + Math.round(30 * Math.sin(i / 1.6 + 0.5) + 15),
  pm10: 120 + Math.round(45 * Math.sin(i / 1.3 + 1) + 20),
  no2:  42  + Math.round(20 * Math.sin(i / 1.8 + 0.8) + 8),
  co:   1.8 + Math.round(8 * Math.sin(i / 2 + 0.3) + 2) / 10,
}));

// ── Top-polluted cities (dashboard overlay) ────────────────────────────────
export const TOP_POLLUTED_DASH = [
  { name: "Delhi",     aqi: 198 },
  { name: "Ghaziabad", aqi: 184 },
  { name: "Faridabad", aqi: 176 },
  { name: "Patna",     aqi: 165 },
  { name: "Lucknow",   aqi: 154 },
];

// ── Live updates for map overlay ───────────────────────────────────────────
export const LIVE_UPDATES_DASH = [
  { icon: "alert",   text: "High AQI alert in Delhi",             ago: "2 min ago",  tone: "rose" },
  { icon: "smoke",   text: "Smoke detected in Ludhiana Industrial Area", ago: "6 min ago",  tone: "amber" },
  { icon: "resolve", text: "Incident resolved in Bengaluru",       ago: "12 min ago", tone: "emerald" },
];

export const TELEMETRY_FEED = Array.from({ length: 40 }, (_, i) => ({
  t: Date.now() - i * 1500,
  node: ["SH-D-0142","SH-M-0098","SH-B-0044","SH-H-0061","SH-A-0202"][i % 5],
  pm25: 40 + Math.round(Math.random() * 220),
  co2:  410 + Math.round(Math.random() * 120),
  nox:  10 + Math.round(Math.random() * 90),
  ok: Math.random() > 0.08,
}));