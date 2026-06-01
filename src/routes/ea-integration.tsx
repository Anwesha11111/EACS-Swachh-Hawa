import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

export const Route = createFileRoute("/ea-integration")({
  head: () => ({ meta: [{ title: "Integration Architecture · Swachh Hawa" }] }),
  component: Page,
});

// AsyncAPI-style Kafka topic catalogue
const KAFKA_TOPICS = [
  {
    topic: "sensor.telemetry.raw",
    pattern: "Publish/Subscribe",
    producers: ["Edge Node Agent"],
    consumers: ["Ingest Service", "Trust Engine"],
    schema: "Avro — SensorReading {device_id, ts, pm25, pm10, no2, so2, o3, temp, rh}",
    retention: "3 days",
    partitions: 48,
    throughput: "380 msg/s",
  },
  {
    topic: "aqi.computed.city",
    pattern: "Publish/Subscribe",
    producers: ["AQI Calculation Service"],
    consumers: ["API Gateway", "Notification Service", "Digital Twin Sync"],
    schema: "Avro — AqiEvent {city_id, ts, aqi, category, dominant_pollutant}",
    retention: "7 days",
    partitions: 12,
    throughput: "24 msg/s",
  },
  {
    topic: "trust.hash.anchored",
    pattern: "Event Sourcing",
    producers: ["Trust Engine"],
    consumers: ["Audit Log Store", "Merkle Anchor Job"],
    schema: "Avro — TrustAnchor {batch_id, ts, merkle_root, record_count, prev_root}",
    retention: "Indefinite (compacted)",
    partitions: 4,
    throughput: "1 msg/min",
  },
  {
    topic: "incidents.alerts",
    pattern: "Publish/Subscribe",
    producers: ["Threshold Alert Service"],
    consumers: ["Notification Service", "Command Center", "State PCB Webhook"],
    schema: "JSON — AlertEvent {alert_id, city_id, severity, pollutant, value, threshold, ts}",
    retention: "14 days",
    partitions: 8,
    throughput: "~18 msg/s (peak)",
  },
  {
    topic: "enforcement.events",
    pattern: "Event Sourcing",
    producers: ["Enforcement Module"],
    consumers: ["Audit Log Store", "CPCB Report Generator"],
    schema: "Avro — EnforcementEvent {notice_id, entity_id, action_type, officer_id, ts, hash}",
    retention: "Indefinite (compacted)",
    partitions: 4,
    throughput: "< 1 msg/s",
  },
  {
    topic: "ml.forecast.output",
    pattern: "Publish/Subscribe",
    producers: ["ML Forecast Service"],
    consumers: ["API Gateway", "Citizen Portal", "Digital Twin"],
    schema: "JSON — ForecastBatch {city_id, model_version, horizon_h, predictions: [{ts, aqi, p10, p90}]}",
    retention: "3 days",
    partitions: 8,
    throughput: "~2 msg/min",
  },
  {
    topic: "sensor.health.events",
    pattern: "Publish/Subscribe",
    producers: ["Edge Node Agent", "Device Health Monitor"],
    consumers: ["NOC Dashboard", "OTA Update Service", "Alert Service"],
    schema: "Avro — DeviceHealth {device_id, ts, status, battery_v, signal_rssi, last_calibration}",
    retention: "7 days",
    partitions: 16,
    throughput: "~46 msg/min",
  },
  {
    topic: "citizen.complaints",
    pattern: "Command",
    producers: ["Citizen Portal API"],
    consumers: ["Complaint Routing Service"],
    schema: "JSON — ComplaintCommand {complaint_id, category, city, description, contact_token, location}",
    retention: "5 years",
    partitions: 4,
    throughput: "< 1 msg/s",
  },
];

// OpenAPI REST endpoints summary
const REST_ENDPOINTS = [
  { path: "GET /v2/aqi/cities", auth: "API Key", rate: "60 rpm", consumers: "Public / Civic portals", desc: "Paginated list of current AQI for all cities" },
  { path: "GET /v2/aqi/{city}/history", auth: "API Key", rate: "30 rpm", consumers: "Research, apps", desc: "Time-range AQI history with pollutant breakdown" },
  { path: "GET /v2/forecast/{city}", auth: "API Key", rate: "20 rpm", consumers: "Apps, weather services", desc: "72h AQI forecast with confidence interval" },
  { path: "POST /v2/complaints", auth: "OAuth 2.0 (citizen)", rate: "5 rpm", consumers: "Citizen Portal", desc: "Submit a pollution complaint" },
  { path: "GET /v2/sensors", auth: "JWT (state PCB)", rate: "30 rpm", consumers: "State PCB dashboards", desc: "Sensor network status and calibration details" },
  { path: "POST /v2/enforcement/notice", auth: "JWT (officer)", rate: "10 rpm", consumers: "Enforcement mobile app", desc: "Issue enforcement notice to a source entity" },
  { path: "GET /v2/trust/{batch}/proof", auth: "API Key (public)", rate: "10 rpm", consumers: "Auditors, researchers", desc: "Merkle proof for a data batch (verifiable)" },
  { path: "WebSocket /v2/live/{city}", auth: "API Key", rate: "N/A", consumers: "Live dashboards", desc: "Real-time AQI push stream (JSON over WS)" },
];

const THROUGHPUT_DATA = KAFKA_TOPICS.map(t => ({
  name: t.topic.split(".")[0] + "." + t.topic.split(".")[1],
  partitions: t.partitions,
}));

export default function Page() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="ENTERPRISE ARCHITECTURE · Integration Architecture"
        title="Integration Architecture"
        description="AsyncAPI event catalogue for 8 Kafka topics; OpenAPI REST/WebSocket contracts for external consumers; integration patterns (Pub/Sub, Event Sourcing, Command). Responds to Dr. Nayak's Point 3: 'What is the integration architecture?'"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Kafka Topics", v: "8", c: "primary" },
          { l: "REST Endpoints", v: "7 + 1 WS", c: "cyan" },
          { l: "Peak Ingest Throughput", v: "380 msg/s", c: "emerald" },
          { l: "Integration Patterns", v: "3", c: "amber" },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Kafka topic catalogue */}
      <Panel title="AsyncAPI Event Catalogue — Kafka Topics" subtitle="Schema · retention · partition count · throughput per topic">
        <div className="space-y-3 mt-1">
          {KAFKA_TOPICS.map(t => (
            <div key={t.topic} className="rounded-lg border border-border/60 p-3 space-y-2">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="mono text-xs font-bold text-primary">{t.topic}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{t.schema}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded px-1.5 py-0.5 text-[9px] mono font-bold bg-[var(--primary)]/15 text-primary">{t.pattern}</span>
                  <span className="rounded px-1.5 py-0.5 text-[9px] mono bg-border/60 text-muted-foreground">{t.partitions}p</span>
                  <span className="rounded px-1.5 py-0.5 text-[9px] mono bg-border/60 text-muted-foreground">{t.throughput}</span>
                </div>
              </div>
              <div className="flex gap-4 text-[10px]">
                <div>
                  <span className="text-muted-foreground">Producers: </span>
                  <span className="mono text-foreground">{t.producers.join(", ")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Consumers: </span>
                  <span className="mono text-foreground">{t.consumers.join(", ")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Retention: </span>
                  <span className="mono text-foreground">{t.retention}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* REST endpoints */}
      <Panel title="OpenAPI REST / WebSocket Contracts" subtitle="External consumer API — versioned at /v2" dense>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-[10px] mono uppercase tracking-wider text-muted-foreground">
              {["Endpoint","Auth","Rate Limit","Consumers","Description"].map(h => (
                <th key={h} className="px-3 py-2 text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REST_ENDPOINTS.map(e => (
              <tr key={e.path} className="border-b border-border/40 hover:bg-accent/30">
                <td className="px-3 py-2.5 mono text-primary font-semibold whitespace-nowrap">{e.path}</td>
                <td className="px-3 py-2.5 mono text-muted-foreground whitespace-nowrap">{e.auth}</td>
                <td className="px-3 py-2.5 mono text-muted-foreground">{e.rate}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{e.consumers}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{e.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      {/* Integration patterns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[
          {
            pattern: "Publish/Subscribe",
            color: "primary",
            topics: 5,
            desc: "One-to-many fan-out. Used for AQI broadcasts, sensor telemetry, and forecast distribution. Consumers receive all messages independently — no coordination needed.",
            examples: ["sensor.telemetry.raw", "aqi.computed.city", "incidents.alerts"],
          },
          {
            pattern: "Event Sourcing",
            color: "cyan",
            topics: 2,
            desc: "Append-only log as source of truth. Used for enforcement records and trust anchors where immutability and replay capability are required for legal and audit purposes.",
            examples: ["trust.hash.anchored", "enforcement.events"],
          },
          {
            pattern: "Command",
            color: "amber",
            topics: 1,
            desc: "Single consumer processes each message exactly once. Used for citizen complaints where each complaint must be routed to exactly one handler with no duplication.",
            examples: ["citizen.complaints"],
          },
        ].map(p => (
          <Panel key={p.pattern} title={p.pattern} subtitle={`${p.topics} topic${p.topics > 1 ? "s" : ""} use this pattern`}>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{p.desc}</p>
            <div className="space-y-1">
              {p.examples.map(e => (
                <div key={e} className="mono text-[10px] rounded px-2 py-1" style={{
                  background: `color-mix(in oklab,var(--${p.color}) 10%,transparent)`,
                  color: `var(--${p.color})`,
                }}>{e}</div>
              ))}
            </div>
          </Panel>
        ))}
      </div>

      {/* ADR */}
      <Panel title="ADR-004 · Apache Kafka over direct REST for sensor ingest" subtitle="Architecture Decision Record">
        <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
          <div><span className="font-semibold text-foreground">Status:</span> <span className="mono rounded px-1.5 py-0.5 text-[10px] font-bold bg-[var(--emerald)]/15 text-[var(--emerald)]">ACCEPTED</span> · 2024-09-22</div>
          <div><span className="font-semibold text-foreground">Context:</span> 380 sensor packets/second continuous ingest from 1,200+ sensors across India. Multiple downstream consumers (trust engine, AQI calculator, ML pipeline) need to independently process each reading. Network partitions between edge and cloud must be handled gracefully.</div>
          <div><span className="font-semibold text-foreground">Decision:</span> Apache Kafka on AWS MSK for all ingest. Edge nodes buffer locally for up to 72h during connectivity loss, then replay in order. Separate consumer groups per downstream service for independent lag tracking.</div>
          <div><span className="font-semibold text-foreground">Alternatives considered:</span> (1) Direct REST POST per reading — rejected: tight coupling, no buffering, no fan-out, back-pressure propagates to sensors; (2) AWS Kinesis — rejected: 1MB/s per shard limit awkward at this scale, less flexible replay; (3) MQTT broker — considered for edge tier only, not end-to-end due to lack of consumer group semantics.</div>
        </div>
      </Panel>
    </div>
  );
}
