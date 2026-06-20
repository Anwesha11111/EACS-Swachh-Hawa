import type { MetaNode, MetaEdge } from "./schema";

export const NODES: MetaNode[] = [
  // ── MOTIVATION ──────────────────────────────────────────────────────────────
  {
    id: "D1", label: "India Air Quality Crisis", type: "Driver", layer: "motivation",
    description: "Particulate matter & NO₂ levels chronically above NAAQS in 130+ cities.",
  },
  {
    id: "D2", label: "DPDP Act 2023", type: "Driver", layer: "motivation",
    description: "India's Digital Personal Data Protection Act mandates consent, purpose limitation and data minimisation.",
  },
  {
    id: "D3", label: "Net-Zero 2070 Commitment", type: "Driver", layer: "motivation",
    description: "India's NDC targets drive demand for granular emissions monitoring.",
  },
  {
    id: "G1", label: "NAAQS Compliance", type: "Goal", layer: "motivation",
    description: "Bring monitored cities within CPCB annual PM2.5 < 40 µg/m³ standard.",
  },
  {
    id: "G2", label: "Privacy-by-Design", type: "Goal", layer: "motivation",
    description: "All citizen data collected, stored and processed with explicit consent and minimal exposure.",
  },
  {
    id: "G3", label: "Equitable Access", type: "Goal", layer: "motivation",
    description: "Provide real-time AQI intelligence to every citizen regardless of literacy or device.",
  },
  {
    id: "O1", label: "Real-Time AQI Monitoring", type: "Objective", layer: "motivation",
    description: "Sub-60-second sensor-to-dashboard latency across 500+ nodes.",
  },
  {
    id: "O2", label: "AI Forecasting Accuracy R²≥0.93", type: "Objective", layer: "motivation",
    description: "XGBoost + LSTM ensemble achieving R²=0.93 on 72-hour AQI prediction.",
  },
  {
    id: "O3", label: "Audit-Ready Immutability", type: "Objective", layer: "motivation",
    description: "All enforcement actions anchored to Hyperledger Fabric for tamper-proof audit.",
  },
  {
    id: "P1", label: "Openness Principle", type: "Principle", layer: "motivation",
    description: "All non-PII environmental data published under CC-BY 4.0 via Open Data API.",
  },

  // ── STRATEGY ────────────────────────────────────────────────────────────────
  {
    id: "C1", label: "Environmental Monitoring", type: "Capability", layer: "strategy",
    description: "Ability to sense, ingest and fuse multi-source air quality signals in near real-time.",
  },
  {
    id: "C2", label: "AI/ML Intelligence", type: "Capability", layer: "strategy",
    description: "Ability to forecast AQI, detect anomalies and explain model decisions.",
  },
  {
    id: "C3", label: "Regulatory Enforcement", type: "Capability", layer: "strategy",
    description: "Ability to detect violations, issue alerts and log immutable enforcement records.",
  },
  {
    id: "C4", label: "Citizen Engagement", type: "Capability", layer: "strategy",
    description: "Ability to surface hyper-local AQI, health advisories and complaint resolution to citizens.",
  },
  {
    id: "C5", label: "Multi-City Scalability", type: "Capability", layer: "strategy",
    description: "Ability to onboard new cities with zero-touch configuration via edge templates.",
  },
  {
    id: "VS1", label: "Clean Air Value Stream", type: "ValueStream", layer: "strategy",
    description: "Sense → Ingest → Analyse → Alert → Enforce → Report → Improve.",
  },
  {
    id: "VS2", label: "Citizen Health Advisory", type: "ValueStream", layer: "strategy",
    description: "Predict → Personalise → Notify → Advise → Log feedback.",
  },

  // ── BUSINESS ────────────────────────────────────────────────────────────────
  {
    id: "A1", label: "CPCB", type: "BusinessActor", layer: "business",
    description: "Central Pollution Control Board — national regulatory authority.",
  },
  {
    id: "A2", label: "State PCBs", type: "BusinessActor", layer: "business",
    description: "State Pollution Control Boards — regional enforcement bodies.",
  },
  {
    id: "A3", label: "Municipal Corporation", type: "BusinessActor", layer: "business",
    description: "Urban local bodies responsible for industrial zone monitoring.",
  },
  {
    id: "A4", label: "Citizens", type: "BusinessActor", layer: "business",
    description: "End-users consuming AQI dashboards, health advisories and complaint portal.",
  },
  {
    id: "BP1", label: "Data Collection Process", type: "BusinessProcess", layer: "business",
    description: "Orchestrates periodic polling from IoT nodes, satellites and met stations.",
  },
  {
    id: "BP2", label: "Alert Management Process", type: "BusinessProcess", layer: "business",
    description: "Evaluates threshold breaches and dispatches multi-channel alerts.",
  },
  {
    id: "BP3", label: "Enforcement Workflow", type: "BusinessProcess", layer: "business",
    description: "Logs violations, assigns inspection tasks and escalates via CPCB hierarchy.",
  },
  {
    id: "BP4", label: "Citizen Complaint Process", type: "BusinessProcess", layer: "business",
    description: "Accepts, routes and resolves citizen-submitted pollution reports.",
  },
  {
    id: "BS1", label: "AQI Monitoring Service", type: "BusinessService", layer: "business",
    description: "Exposes live and historical AQI indices per station and city.",
  },
  {
    id: "BS2", label: "Emission Alert Service", type: "BusinessService", layer: "business",
    description: "Publishes threshold-breach notifications to regulators and citizens.",
  },

  // ── APPLICATION ──────────────────────────────────────────────────────────────
  {
    id: "AC1", label: "IoT Edge Gateway", type: "ApplicationComponent", layer: "application",
    description: "Raspberry Pi 4 / Jetson-based edge node with on-device pre-processing.",
  },
  {
    id: "AC2", label: "AI Forecasting Engine", type: "ApplicationComponent", layer: "application",
    description: "XGBoost + LSTM ensemble; SHAP explanations; Prometheus metrics.",
  },
  {
    id: "AC3", label: "Swachh Hawa Dashboard", type: "ApplicationComponent", layer: "application",
    description: "React 19 + TanStack Start SPA; real-time charts; EA metamodel viewer.",
  },
  {
    id: "AC4", label: "Citizen Mobile App", type: "ApplicationComponent", layer: "application",
    description: "PWA with offline caching; multilingual; hyperlocal AQI widget.",
  },
  {
    id: "AC5", label: "Blockchain Ledger Node", type: "ApplicationComponent", layer: "application",
    description: "Hyperledger Fabric peer node recording enforcement audit events.",
  },
  {
    id: "AS1", label: "Data Ingestion Service", type: "ApplicationService", layer: "application",
    description: "Kafka consumer → TimescaleDB writer; handles 50k msg/s burst.",
  },
  {
    id: "AS2", label: "Prediction API", type: "ApplicationService", layer: "application",
    description: "REST/gRPC endpoint serving 72-hour AQI forecasts; 58ms P95 latency.",
  },
  {
    id: "AS3", label: "Notification Service", type: "ApplicationService", layer: "application",
    description: "Fan-out via SMS/push/email; templated multilingual messages.",
  },
  {
    id: "AS4", label: "Open Data API", type: "ApplicationService", layer: "application",
    description: "CC-BY 4.0 bulk export and stream API for researchers and civic hackers.",
  },

  // ── DATA ─────────────────────────────────────────────────────────────────────
  {
    id: "DE1", label: "AQI Reading", type: "DataEntity", layer: "data",
    description: "PM2.5, PM10, NO₂, SO₂, CO, O₃ readings with timestamp and geo-tag.",
  },
  {
    id: "DE2", label: "Sensor Telemetry", type: "DataEntity", layer: "data",
    description: "Device health metrics: battery, RSSI, firmware version.",
  },
  {
    id: "DE3", label: "Weather Data", type: "DataEntity", layer: "data",
    description: "IMD temperature, humidity, wind speed/direction fused hourly.",
  },
  {
    id: "DE4", label: "Satellite Imagery", type: "DataEntity", layer: "data",
    description: "Sentinel-5P NO₂ and aerosol optical depth tiles (daily).",
  },
  {
    id: "DE5", label: "Citizen Report", type: "DataEntity", layer: "data",
    description: "Crowd-sourced pollution sighting with photo, geo, severity.",
  },
  {
    id: "DE6", label: "Enforcement Record", type: "DataEntity", layer: "data",
    description: "Immutable violation log anchored to Hyperledger Fabric.",
  },
  {
    id: "DE7", label: "Prediction Model Artifact", type: "DataEntity", layer: "data",
    description: "Versioned MLflow model: weights, hyperparams, evaluation metrics.",
  },

  // ── TECHNOLOGY ───────────────────────────────────────────────────────────────
  {
    id: "TC1", label: "LoRa Sensor Network", type: "TechnologyComponent", layer: "technology",
    description: "Long-range, low-power 868 MHz mesh; covers 5 km radius per gateway.",
  },
  {
    id: "TC2", label: "Edge Computing Nodes", type: "TechnologyComponent", layer: "technology",
    description: "Raspberry Pi 4 cluster with InfluxDB and Telegraf for local buffering.",
  },
  {
    id: "TS1", label: "Azure IoT Hub", type: "TechnologyService", layer: "technology",
    description: "Device registry, MQTT broker and bi-directional edge messaging.",
  },
  {
    id: "TS2", label: "Apache Kafka", type: "TechnologyService", layer: "technology",
    description: "Event streaming backbone; 3-node cluster; 7-day retention.",
  },
  {
    id: "TS3", label: "TimescaleDB", type: "TechnologyService", layer: "technology",
    description: "PostgreSQL time-series extension; continuous aggregates; 2-year retention.",
  },
  {
    id: "TS4", label: "Hyperledger Fabric", type: "TechnologyService", layer: "technology",
    description: "Permissioned blockchain; 3 orgs (CPCB, SPCB, ULBS); chaincode in Go.",
  },
  {
    id: "TS5", label: "ML Pipeline (MLflow)", type: "TechnologyService", layer: "technology",
    description: "Experiment tracking, model registry and scheduled retraining jobs.",
  },
  {
    id: "TS6", label: "Zero-Trust Gateway", type: "TechnologyService", layer: "technology",
    description: "mTLS + SPIFFE/SPIRE identity; OPA policy enforcement; DPDP consent store.",
  },
];

export const EDGES: MetaEdge[] = [
  // Motivation linkages
  { id: "e1",  source: "D1", target: "G1", type: "realizes",       label: "drives" },
  { id: "e2",  source: "D1", target: "O1", type: "realizes",       label: "drives" },
  { id: "e3",  source: "D2", target: "G2", type: "realizes",       label: "mandates" },
  { id: "e4",  source: "D3", target: "G1", type: "realizes",       label: "aligns with" },
  { id: "e5",  source: "G1", target: "O1", type: "realizes",       label: "requires" },
  { id: "e6",  source: "G1", target: "O2", type: "realizes",       label: "requires" },
  { id: "e7",  source: "G2", target: "O3", type: "realizes",       label: "requires" },
  { id: "e8",  source: "G3", target: "O1", type: "realizes",       label: "requires" },

  // Motivation → Strategy
  { id: "e9",  source: "O1", target: "C1", type: "isRealizedBy",   label: "realized by" },
  { id: "e10", source: "O2", target: "C2", type: "isRealizedBy",   label: "realized by" },
  { id: "e11", source: "O3", target: "C3", type: "isRealizedBy",   label: "realized by" },
  { id: "e12", source: "G3", target: "C4", type: "isRealizedBy",   label: "realized by" },
  { id: "e13", source: "P1", target: "C4", type: "enables",        label: "enables" },
  { id: "e14", source: "C1", target: "VS1", type: "composedOf",    label: "anchors" },
  { id: "e15", source: "C4", target: "VS2", type: "composedOf",    label: "anchors" },

  // Strategy → Business
  { id: "e16", source: "C1", target: "BP1", type: "operationalizes", label: "operationalized by" },
  { id: "e17", source: "C2", target: "BP1", type: "operationalizes", label: "operationalized by" },
  { id: "e18", source: "C3", target: "BP3", type: "operationalizes", label: "operationalized by" },
  { id: "e19", source: "C4", target: "BP4", type: "operationalizes", label: "operationalized by" },
  { id: "e20", source: "C5", target: "BP1", type: "operationalizes", label: "operationalized by" },
  { id: "e21", source: "VS1", target: "BS1", type: "delivers",     label: "delivers" },
  { id: "e22", source: "VS1", target: "BS2", type: "delivers",     label: "delivers" },
  { id: "e23", source: "BP2", target: "BS2", type: "uses",         label: "uses" },
  { id: "e24", source: "A1", target: "BS1", type: "serves",        label: "consumes" },
  { id: "e25", source: "A2", target: "BS1", type: "serves",        label: "consumes" },
  { id: "e26", source: "A4", target: "BS1", type: "serves",        label: "consumes" },
  { id: "e27", source: "BP3", target: "A1", type: "serves",        label: "notifies" },

  // Business → Application
  { id: "e28", source: "BS1", target: "AC3", type: "isRealizedBy", label: "realized by" },
  { id: "e29", source: "BS2", target: "AS3", type: "isRealizedBy", label: "realized by" },
  { id: "e30", source: "BP1", target: "AC1", type: "uses",         label: "uses" },
  { id: "e31", source: "BP1", target: "AS1", type: "uses",         label: "uses" },
  { id: "e32", source: "BP3", target: "AC5", type: "uses",         label: "uses" },
  { id: "e33", source: "BP4", target: "AC4", type: "uses",         label: "uses" },
  { id: "e34", source: "AC3", target: "AS2", type: "uses",         label: "calls" },
  { id: "e35", source: "AC3", target: "AS4", type: "uses",         label: "calls" },
  { id: "e36", source: "AC4", target: "AS3", type: "uses",         label: "calls" },
  { id: "e37", source: "AC2", target: "AS2", type: "delivers",     label: "serves" },
  { id: "e38", source: "AS1", target: "AC2", type: "triggers",     label: "triggers" },

  // Application → Data
  { id: "e39", source: "AC1", target: "DE1", type: "delivers",     label: "produces" },
  { id: "e40", source: "AC1", target: "DE2", type: "delivers",     label: "produces" },
  { id: "e41", source: "AS1", target: "DE1", type: "stores",       label: "persists" },
  { id: "e42", source: "AS1", target: "DE3", type: "stores",       label: "ingests" },
  { id: "e43", source: "AS1", target: "DE4", type: "stores",       label: "ingests" },
  { id: "e44", source: "AC4", target: "DE5", type: "delivers",     label: "submits" },
  { id: "e45", source: "AC5", target: "DE6", type: "stores",       label: "anchors" },
  { id: "e46", source: "AC2", target: "DE7", type: "delivers",     label: "produces" },
  { id: "e47", source: "AC2", target: "DE1", type: "uses",         label: "reads" },
  { id: "e48", source: "AC2", target: "DE3", type: "uses",         label: "reads" },
  { id: "e49", source: "AC2", target: "DE4", type: "uses",         label: "reads" },

  // Application → Technology
  { id: "e50", source: "AC1", target: "TC1", type: "runsOn",       label: "runs on" },
  { id: "e51", source: "AC1", target: "TC2", type: "runsOn",       label: "runs on" },
  { id: "e52", source: "AC1", target: "TS1", type: "uses",         label: "connects via" },
  { id: "e53", source: "AS1", target: "TS2", type: "uses",         label: "consumes" },
  { id: "e54", source: "AS1", target: "TS3", type: "uses",         label: "writes to" },
  { id: "e55", source: "AC2", target: "TS3", type: "uses",         label: "reads from" },
  { id: "e56", source: "AC2", target: "TS5", type: "uses",         label: "tracked by" },
  { id: "e57", source: "AC5", target: "TS4", type: "runsOn",       label: "runs on" },
  { id: "e58", source: "AS2", target: "TS3", type: "uses",         label: "queries" },
  { id: "e59", source: "AS3", target: "TS6", type: "uses",         label: "secured by" },
  { id: "e60", source: "AC3", target: "TS6", type: "uses",         label: "secured by" },
  { id: "e61", source: "TS1", target: "TS2", type: "delivers",     label: "routes to" },
  { id: "e62", source: "TS2", target: "TS3", type: "delivers",     label: "feeds" },
  { id: "e63", source: "TC2", target: "TS1", type: "delivers",     label: "uplinks to" },
  { id: "e64", source: "TC1", target: "TC2", type: "delivers",     label: "feeds" },
];
