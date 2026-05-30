import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";
import { Cpu, Wifi, AlertTriangle, CheckCircle2, RefreshCw, Thermometer } from "lucide-react";

export const Route = createFileRoute("/device-health")({
  head: () => ({ meta: [{ title: "Device Health · Swachh Hawa" }] }),
  component: Page,
});

const DEVICES = [
  { id: "SH-DEL-0042", city: "Delhi", type: "AQM300", fw: "v4.2.1", uptime: "12d 4h", trust: 0.97, battery: 94, rssi: -62, watchdog: "OK", calib: "2026-04-18", r2: 0.962, status: "operational" },
  { id: "SH-DEL-0043", city: "Delhi", type: "AQM300", fw: "v4.2.1", uptime: "9d 11h", trust: 0.91, battery: 78, rssi: -74, watchdog: "OK", calib: "2026-04-18", r2: 0.941, status: "operational" },
  { id: "SH-GZB-0011", city: "Ghaziabad", type: "AQM200", fw: "v4.1.3", uptime: "0d 2h", trust: 0.61, battery: 45, rssi: -88, watchdog: "REBOOTED", calib: "2026-03-02", r2: 0.714, status: "warning" },
  { id: "SH-LDH-0088", city: "Ludhiana", type: "AQM300", fw: "v4.2.1", uptime: "21d 7h", trust: 0.94, battery: 82, rssi: -58, watchdog: "OK", calib: "2026-04-30", r2: 0.978, status: "operational" },
  { id: "SH-PNE-0056", city: "Pune", type: "AQM100", fw: "v3.8.2", uptime: "—", trust: 0.12, battery: 0, rssi: null, watchdog: "OFFLINE", calib: "2026-02-11", r2: null, status: "offline" },
  { id: "SH-KOL-0031", city: "Kolkata", type: "AQM300", fw: "v4.2.0", uptime: "5d 18h", trust: 0.88, battery: 91, rssi: -67, watchdog: "OK", calib: "2026-05-01", r2: 0.934, status: "operational" },
];

const CALIBRATION_DRIFT = Array.from({ length: 30 }, (_, i) => ({
  day: `May ${1 + i}`,
  r2_del: parseFloat((0.96 - i * 0.001 + Math.random() * 0.01).toFixed(3)),
  r2_gzb: parseFloat((0.92 - i * 0.006 + Math.random() * 0.02).toFixed(3)),
  threshold: 0.85,
}));

const FIRMWARE_DIST = [
  { ver: "v4.2.1", count: 1241 },
  { ver: "v4.2.0", count: 612 },
  { ver: "v4.1.3", count: 384 },
  { ver: "v3.8.2", count: 214 },
];

const HEARTBEAT_LOG = Array.from({ length: 24 }, (_, i) => ({
  h: `${String(i).padStart(2, "0")}:00`,
  received: 2380 + Math.round(Math.random() * 60),
  expected: 2451,
}));

const TICKETS = [
  { id: "MNT-0481", device: "SH-GZB-0011", issue: "Calibration drift R²=0.71 → reference check needed", priority: "High", status: "Open" },
  { id: "MNT-0480", device: "SH-PNE-0056", issue: "Device offline >72h — physical inspection required", priority: "Critical", status: "In Progress" },
  { id: "MNT-0479", device: "SH-MUM-0019", issue: "Watchdog reboot × 3 in 24h — firmware rollback", priority: "High", status: "Open" },
  { id: "MNT-0478", device: "SH-CHN-0007", issue: "Battery below 20% — solar panel cleaning scheduled", priority: "Medium", status: "Scheduled" },
];

export default function Page() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="OPS · Device Health"
        title="Hardware & Firmware Fleet Monitor"
        description="Hardware watchdog timers (ESP32 auto-reboot), liveness heartbeats, calibration R² drift, and maintenance ticket queue across 2,451 deployed nodes."
        actions={
          <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent/50">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Operational", v: "2,101", sub: "86%", c: "emerald", icon: <CheckCircle2 className="h-4 w-4" /> },
          { l: "Warning", v: "210", sub: "8%", c: "amber", icon: <AlertTriangle className="h-4 w-4" /> },
          { l: "Offline", v: "140", sub: "6%", c: "rose", icon: <Wifi className="h-4 w-4" /> },
          { l: "Watchdog Reboots 24h", v: "18", sub: "auto-recovered", c: "cyan", icon: <Cpu className="h-4 w-4" /> },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4 flex items-start gap-3">
            <span style={{ color: `var(--${s.c})` }} className="mt-0.5">{s.icon}</span>
            <div>
              <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
              <div className="mono text-2xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
              <div className="text-[10px] text-muted-foreground">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <Panel title="Device Fleet Status" subtitle="Watchdog = hardware timer on ESP32 (auto-reboot on hang) · R² = reference co-location calibration quality" dense>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
              <tr className="border-b border-border">
                {["Device ID","City","Model","Firmware","Uptime","Trust Score","Battery","RSSI","Watchdog","Last Calib","R²","Status"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEVICES.map((d) => (
                <tr key={d.id} className="border-b border-border/40 hover:bg-accent/40">
                  <td className="px-3 py-2.5 mono text-primary font-semibold whitespace-nowrap">{d.id}</td>
                  <td className="px-3 py-2.5">{d.city}</td>
                  <td className="px-3 py-2.5 mono text-muted-foreground">{d.type}</td>
                  <td className="px-3 py-2.5 mono text-[10px]">{d.fw}</td>
                  <td className="px-3 py-2.5 mono text-muted-foreground">{d.uptime}</td>
                  <td className="px-3 py-2.5 mono font-semibold" style={{ color: d.trust > 0.85 ? "var(--emerald)" : d.trust > 0.6 ? "var(--amber)" : "var(--rose)" }}>
                    {d.trust.toFixed(2)}
                  </td>
                  <td className="px-3 py-2.5 mono">{d.battery > 0 ? `${d.battery}%` : "—"}</td>
                  <td className="px-3 py-2.5 mono text-muted-foreground">{d.rssi ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <span className="rounded px-1.5 py-0.5 text-[10px] mono font-bold" style={{
                      background: d.watchdog === "OK" ? "color-mix(in oklab,var(--emerald) 18%,transparent)"
                        : d.watchdog === "REBOOTED" ? "color-mix(in oklab,var(--amber) 18%,transparent)"
                        : "color-mix(in oklab,var(--rose) 18%,transparent)",
                      color: d.watchdog === "OK" ? "var(--emerald)" : d.watchdog === "REBOOTED" ? "var(--amber)" : "var(--rose)",
                    }}>{d.watchdog}</span>
                  </td>
                  <td className="px-3 py-2.5 mono text-muted-foreground text-[10px]">{d.calib}</td>
                  <td className="px-3 py-2.5 mono font-semibold" style={{ color: !d.r2 ? "var(--rose)" : d.r2 > 0.9 ? "var(--emerald)" : d.r2 > 0.85 ? "var(--amber)" : "var(--rose)" }}>
                    {d.r2 ? d.r2.toFixed(3) : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="rounded px-1.5 py-0.5 text-[10px] mono font-bold" style={{
                      background: d.status === "operational" ? "color-mix(in oklab,var(--emerald) 16%,transparent)"
                        : d.status === "warning" ? "color-mix(in oklab,var(--amber) 16%,transparent)"
                        : "color-mix(in oklab,var(--rose) 16%,transparent)",
                      color: d.status === "operational" ? "var(--emerald)" : d.status === "warning" ? "var(--amber)" : "var(--rose)",
                    }}>{d.status.toUpperCase()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Calibration R² Drift — 30 Days" subtitle="R² < 0.85 (dashed line) triggers auto maintenance ticket">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CALIBRATION_DRIFT} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={7} />
                <YAxis tick={{ fontSize: 9 }} domain={[0.6, 1.0]} />
                <Tooltip />
                <Line type="monotone" dataKey="r2_del" stroke="var(--chart-1)" strokeWidth={2} dot={false} name="SH-DEL-0042" />
                <Line type="monotone" dataKey="r2_gzb" stroke="var(--rose)" strokeWidth={2} dot={false} name="SH-GZB-0011" />
                <Line type="monotone" dataKey="threshold" stroke="var(--amber)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Min threshold (0.85)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Heartbeat / Liveness Monitor — 24h" subtitle="Expected 2,451 pings/hour · missed pings trigger liveness watchdog alert">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HEARTBEAT_LOG} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="h" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={3} />
                <YAxis tick={{ fontSize: 9 }} domain={[2300, 2460]} />
                <Tooltip />
                <Line type="monotone" dataKey="received" stroke="var(--emerald)" strokeWidth={2} dot={false} name="Received" />
                <Line type="monotone" dataKey="expected" stroke="var(--muted-foreground)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Expected" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Firmware Fleet Distribution" subtitle="Target: ≥90% on latest stable (v4.2.1)">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FIRMWARE_DIST} layout="vertical" margin={{ left: 60, right: 40 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="ver" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                <Tooltip formatter={(v: number) => [v, "devices"]} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {FIRMWARE_DIST.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "var(--emerald)" : i === 3 ? "var(--rose)" : "var(--chart-1)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Maintenance Ticket Queue" subtitle="Auto-generated from watchdog events, calibration drift, and liveness failures" dense>
          <div className="divide-y divide-border">
            {TICKETS.map((t) => (
              <div key={t.id} className="flex items-start gap-3 p-3">
                <Thermometer className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="mono text-xs text-primary font-semibold">{t.id}</span>
                    <span className="mono text-[10px] text-muted-foreground">{t.device}</span>
                    <span className="rounded px-1.5 py-0.5 text-[10px] mono font-bold" style={{
                      background: t.priority === "Critical" ? "color-mix(in oklab,var(--rose) 18%,transparent)"
                        : t.priority === "High" ? "color-mix(in oklab,var(--amber) 18%,transparent)"
                        : "color-mix(in oklab,var(--chart-1) 18%,transparent)",
                      color: t.priority === "Critical" ? "var(--rose)" : t.priority === "High" ? "var(--amber)" : "var(--chart-1)",
                    }}>{t.priority}</span>
                    <span className="ml-auto mono text-[10px] text-muted-foreground">{t.status}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{t.issue}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
