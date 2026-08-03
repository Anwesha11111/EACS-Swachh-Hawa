import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { MessageSquare, CheckCircle2, Clock, AlertTriangle, Database } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getComplaints } from "@/lib/api/complaints.functions";

export const Route = createFileRoute("/complaints")({
  head: () => ({ meta: [{ title: "Citizen Complaints · Swachh Hawa" }] }),
  component: Page,
});

const STATIC_FALLBACK = [
  { id: "CMP-4821", citizen: "Rahul M., Delhi", type: "Industrial Smoke", location: "Wazirpur Industrial Area", created_at: "2026-05-30T04:11:00Z", verified: true, correlation: "Sensor SH-DEL-0042 corroborates — PM2.5 spike 356 µg/m³", status: "Escalated to Enforcement", dossier: "ENF-2026-0341" },
  { id: "CMP-4820", citizen: "Priya S., Ghaziabad", type: "Construction Dust", location: "NH-9 Bypass Site", created_at: "2026-05-30T03:48:00Z", verified: true, correlation: "SH-GZB-0018 PM10 elevated 3× baseline", status: "Under Investigation", dossier: "ENF-2026-0340" },
  { id: "CMP-4819", citizen: "Anonymous", type: "Garbage Burning", location: "Yamuna Khadar", created_at: "2026-05-30T02:22:00Z", verified: false, correlation: "No sensor within 500m — drone survey dispatched", status: "Drone Dispatched", dossier: null },
  { id: "CMP-4818", citizen: "Amit K., Patna", type: "Brick Kiln Smoke", location: "Phulwari Sharif", created_at: "2026-05-29T22:01:00Z", verified: true, correlation: "SH-PNA-0031 PM2.5 287 µg/m³ sustained 45 min", status: "Dossier Compiled", dossier: "ENF-2026-0338" },
  { id: "CMP-4817", citizen: "Sunita D., Bengaluru", type: "Vehicle Emission", location: "Outer Ring Road", created_at: "2026-05-29T19:44:00Z", verified: false, correlation: "No fixed sensor — flagged for mobile vehicle check", status: "Pending Verification", dossier: null },
];

const TREND = Array.from({ length: 14 }, (_, i) => ({
  day: `${16 + i} May`,
  received: 80 + Math.round(30 * Math.sin(i / 3) + Math.random() * 20),
  verified: 45 + Math.round(20 * Math.sin(i / 3) + Math.random() * 10),
  escalated: 18 + Math.round(8 * Math.sin(i / 3) + Math.random() * 5),
}));

const TYPE_DIST = [
  { type: "Industrial Smoke", count: 312, c: "var(--rose)" },
  { type: "Construction Dust", count: 228, c: "var(--amber)" },
  { type: "Vehicle Emission", count: 184, c: "var(--chart-1)" },
  { type: "Garbage Burning", count: 142, c: "var(--chart-2)" },
  { type: "Brick Kiln", count: 98, c: "var(--cyan)" },
];

export default function Page() {
  const { data: qData, isLoading } = useQuery({
    queryKey: ["complaints"],
    queryFn: () => getComplaints(),
  });

  const list = qData?.complaints ?? STATIC_FALLBACK;
  const isLive = qData?.source === "live";

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="GOV · Citizen Complaints"
        title="Citizen Complaint Triage & Verification"
        description="Complaints submitted via AirGPT or citizen portal are cross-correlated with sensor data. Verified complaints auto-escalate into enforcement dossiers. Correlation score required before action."
        actions={
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 text-[11px] mono text-muted-foreground">
            <Database className="h-3 w-3 text-primary" />
            <span>{isLive ? "SUPABASE LIVE" : "DEMO / SEED DATA"}</span>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Received 24h", v: list.length.toString(), c: "primary", icon: <MessageSquare className="h-4 w-4" /> },
          { l: "Sensor-Verified", v: list.filter(c => c.verified).length.toString(), c: "emerald", icon: <CheckCircle2 className="h-4 w-4" /> },
          { l: "Escalated to Enforcement", v: list.filter(c => c.status.includes("Escalated")).length.toString(), c: "rose", icon: <AlertTriangle className="h-4 w-4" /> },
          { l: "Avg Resolution Time", v: "4.2h", c: "amber", icon: <Clock className="h-4 w-4" /> },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4 flex items-start gap-3">
            <span style={{ color: `var(--${s.c})` }} className="mt-0.5">{s.icon}</span>
            <div>
              <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
              <div className="mono text-2xl font-semibold mt-0.5" style={{ color: `var(--${s.c})` }}>{s.v}</div>
            </div>
          </div>
        ))}
      </div>

      <Panel title="Recent Complaints — with Sensor Correlation" subtitle="Verified = sensor data within 500m corroborates complaint · auto-escalates to enforcement queue" dense>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Loading complaints…</div>
          ) : (
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
                <tr className="border-b border-border">
                  {["Complaint ID","Citizen","Type","Location","Timestamp","Verified","Sensor Correlation","Status","Dossier"].map(h => (
                    <th key={h} className="px-3 py-2 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map(c => (
                  <tr key={c.id} className="border-b border-border/40 hover:bg-accent/40">
                    <td className="px-3 py-2.5 mono text-primary font-semibold">{c.id}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{c.citizen ?? "Anonymous"}</td>
                    <td className="px-3 py-2.5">{c.type}</td>
                    <td className="px-3 py-2.5 max-w-[140px] truncate text-muted-foreground">{c.location}</td>
                    <td className="px-3 py-2.5 mono text-[10px] text-muted-foreground whitespace-nowrap">{(c.created_at ?? "").replace("T"," ").slice(0, 16)}</td>
                    <td className="px-3 py-2.5">
                      {c.verified ? <span className="text-[var(--emerald)] font-bold">✓</span> : <span className="text-[var(--amber)]">Pending</span>}
                    </td>
                    <td className="px-3 py-2.5 max-w-[200px] text-[10px] text-muted-foreground">{c.correlation ?? "No sensor match"}</td>
                    <td className="px-3 py-2.5">
                      <span className="rounded px-1.5 py-0.5 text-[10px] mono whitespace-nowrap" style={{
                        background: c.status.includes("Escalated") ? "color-mix(in oklab,var(--rose) 16%,transparent)"
                          : c.status.includes("Compiled") ? "color-mix(in oklab,var(--amber) 16%,transparent)"
                          : c.status.includes("Dispatched") ? "color-mix(in oklab,var(--cyan) 16%,transparent)"
                          : "color-mix(in oklab,var(--muted-foreground) 16%,transparent)",
                        color: c.status.includes("Escalated") ? "var(--rose)"
                          : c.status.includes("Compiled") ? "var(--amber)"
                          : c.status.includes("Dispatched") ? "var(--cyan)"
                          : "var(--muted-foreground)",
                      }}>{c.status}</span>
                    </td>
                    <td className="px-3 py-2.5 mono text-[10px]" style={{ color: c.dossier ? "var(--primary)" : "var(--muted-foreground)" }}>
                      {c.dossier ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Complaint Volume — 14 Days" subtitle="Received · verified · escalated">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={2} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Line type="monotone" dataKey="received" stroke="var(--chart-1)" strokeWidth={2} dot={false} name="Received" />
                <Line type="monotone" dataKey="verified" stroke="var(--emerald)" strokeWidth={2} dot={false} name="Verified" />
                <Line type="monotone" dataKey="escalated" stroke="var(--rose)" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Escalated" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Complaint Type Distribution" subtitle="Last 30 days — industrial smoke most reported">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TYPE_DIST} layout="vertical" margin={{ left: 120, right: 40 }}>
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis type="category" dataKey="type" tick={{ fontSize: 9 }} width={120} />
                <Tooltip formatter={(v: number) => [v, "complaints"]} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {TYPE_DIST.map((d, i) => <Cell key={i} fill={d.c} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}
