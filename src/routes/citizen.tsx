import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { IndiaMap } from "@/components/ui-kit/IndiaMap";
import { AqiGauge } from "@/components/ui-kit/AqiGauge";
import { CITIES, aqiCategory, FORECAST_DELHI } from "@/lib/mock-data";
import { Send, MessageCircle, HeartPulse, Activity, Wind, Footprints, Baby, UserRound, Stethoscope, Bike, School, Factory, Loader2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Cell, Tooltip } from "recharts";
import { useAirGpt, type ChatMessage } from "@/hooks/useLiveData";

export const Route = createFileRoute("/citizen")({
  head: () => ({ meta: [{ title: "Citizen Portal · Swachh Hawa" }] }),
  component: Page,
});

const SEED_MESSAGES: ChatMessage[] = [
  { role: "user",      content: "Why is Delhi AQI so high today?" },
  { role: "assistant", content: "A nocturnal boundary layer (~280 m) is trapping emissions overnight. Key contributors: vehicular exhaust (38%), stubble-burn transport from Punjab (31%), industrial sources in Ghaziabad (18%). GRAP Stage III is active — construction and diesel generators are banned until AQI drops below 400." },
  { role: "user",      content: "Is it safe to jog outside?" },
  { role: "assistant", content: "Current Delhi AQI 387 — **Very Poor**. Outdoor exercise is strongly discouraged for all groups. Children, elderly, and those with asthma or heart conditions should remain indoors. If venturing out is unavoidable, wear a well-fitted N95 mask and limit activity to under 30 min." },
];

function AirGptPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { mutate: ask, isPending } = useAirGpt();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text || isPending) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    ask(next, {
      onSuccess: (res) => {
        setMessages(m => [...m, { role: "assistant", content: res.reply }]);
      },
      onError: () => {
        setMessages(m => [...m, { role: "assistant", content: "Sorry, I couldn't reach the server. Please try again." }]);
      },
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <Panel title="AirGPT · Verified AI Assistant">
      <div className="flex flex-col gap-2 text-xs">
        <div className="rounded-lg bg-[var(--primary)]/8 border border-[var(--primary)]/20 px-3 py-2 text-[10px] text-muted-foreground flex items-start gap-1.5">
          <span className="text-[var(--primary)] font-bold flex-shrink-0">🔐</span>
          <span>Responses grounded on CPCB/GRAP policy data. Connect ANTHROPIC_API_KEY for full Claude-powered answers.</span>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-thin pr-0.5">
          {messages.map((m, i) => (
            <div key={i} className={`rounded-lg px-3 py-2 leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-muted" : "bg-primary/12 text-foreground"}`}>
              {m.role === "assistant" && (
                <div className="font-semibold text-[var(--primary)] mb-1 text-[10px] mono">AirGPT</div>
              )}
              {m.content}
            </div>
          ))}
          {isPending && (
            <div className="rounded-lg bg-primary/12 px-3 py-2 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Thinking…</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex items-center gap-2 rounded-md border border-border bg-background/60 p-1.5">
          <MessageCircle className="h-4 w-4 text-primary shrink-0" />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask AirGPT about air quality, health, or GRAP rules…"
            className="w-full bg-transparent text-xs outline-none"
            disabled={isPending}
          />
          <button
            onClick={send}
            disabled={!input.trim() || isPending}
            className="rounded bg-primary p-1.5 text-primary-foreground disabled:opacity-40 transition"
          >
            <Send className="h-3 w-3" />
          </button>
        </div>
        <div className="text-[10px] text-muted-foreground">Responses grounded in CPCB/IMD data · DPDP §7(a) compliant · No personal data stored</div>
      </div>
    </Panel>
  );
}

function Page() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="PUBLIC · Air Quality for Everyone"
        title="Citizen Transparency Portal"
        description="Know the air you breathe. Get health recommendations, file complaints, and chat with AirGPT."
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Panel dense><div className="h-[440px]"><IndiaMap /></div></Panel>
        <div className="space-y-4">
          <Panel title="Your City · Delhi">
            <div className="flex justify-center"><AqiGauge value={387} /></div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <Tip i={HeartPulse} t="Avoid outdoor exercise" tone="rose" />
              <Tip i={Wind} t="Use N95 outdoors" tone="amber" />
              <Tip i={Footprints} t="Limit kids' play" tone="rose" />
              <Tip i={Activity} t="Run purifier indoors" tone="cyan" />
            </div>
          </Panel>
          <AirGptPanel />
        </div>
      </div>
      <Panel title="Compare Cities">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {CITIES.slice(0, 8).map((c) => {
            const cat = aqiCategory(c.aqi);
            return (
              <div key={c.name} className="rounded-lg border border-border bg-background/40 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="mono text-xs" style={{ color: `var(--${cat.token})` }}>{c.aqi}</div>
                </div>
                <div className="mt-2 h-1.5 rounded bg-muted overflow-hidden">
                  <div className="h-full" style={{ width: `${Math.min(100, c.aqi/5)}%`, background: `var(--${cat.token})` }} />
                </div>
                <div className="mt-1 text-[10px] mono uppercase text-muted-foreground">{cat.label}</div>
              </div>
            );
          })}
        </div>
      </Panel>
      <Panel title="Submit a Complaint" subtitle="Complaints are cross-correlated with sensor data — verified reports auto-escalate to enforcement queue">
        <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <input className="rounded-md border border-border bg-background/60 px-3 py-2 text-sm" placeholder="Your location (area / landmark)" />
          <select className="rounded-md border border-border bg-background/60 px-3 py-2 text-sm">
            <option>Industrial smoke</option>
            <option>Burning waste / garbage</option>
            <option>Vehicle smoke</option>
            <option>Construction dust</option>
            <option>Brick kiln</option>
            <option>Other</option>
          </select>
          <input className="rounded-md border border-border bg-background/60 px-3 py-2 text-sm" placeholder="Optional: describe the source" />
          <button className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Submit · Anonymous OK</button>
        </form>
        <div className="mt-2 text-[10px] text-muted-foreground">
          🔒 Submissions are anonymous by default. Your location is coarsened to neighbourhood level (DPDP §7 compliant). Verified complaints with sensor correlation are escalated to CPCB officers within 4h.
        </div>
      </Panel>

      {/* ── 5-Day Forecast + Health Advisory ──────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="5-Day AQI Forecast · Delhi" subtitle="AI model updated every 3h · CPCB/IMD data fusion">
          <div className="flex justify-between gap-2 mb-4">
            {FORECAST_DELHI.map((d) => {
              const cat = aqiCategory(d.aqi);
              return (
                <div key={d.day} className="flex flex-col items-center gap-1.5 flex-1 rounded-lg border border-border bg-background/40 py-3">
                  <span className="text-[11px] text-muted-foreground">{d.day}</span>
                  <span className="text-lg">
                    {d.icon === "sun" ? "☀️" : d.icon === "cloud-sun" ? "⛅" : d.icon === "cloud" ? "☁️" : "🌧️"}
                  </span>
                  <span className="mono text-base font-bold" style={{ color: `var(--${cat.token})` }}>{d.aqi}</span>
                  <span className="text-[9px] mono uppercase" style={{ color: `var(--${cat.token})` }}>{cat.label}</span>
                </div>
              );
            })}
          </div>
          <div className="h-[120px]">
            <ResponsiveContainer>
              <BarChart data={FORECAST_DELHI} barSize={28} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }}
                  formatter={(v: number) => [`AQI ${v}`, ""]}
                />
                <Bar dataKey="aqi" radius={[4, 4, 0, 0]}>
                  {FORECAST_DELHI.map((d) => {
                    const cat = aqiCategory(d.aqi);
                    return <Cell key={d.day} fill={`var(--${cat.token})`} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/8 px-3 py-2 text-[11px] text-amber-400">
            ⚠ GRAP Stage III active through weekend. Avoid outdoor exposure on Sat–Sun.
          </div>
        </Panel>

        <Panel title="Health Advisory by Risk Group" subtitle="Based on current Delhi AQI 387 · Very Poor">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Baby,           label: "Infants (0–2 yr)",    advice: "Keep indoors. Run air purifier.",       tone: "rose" },
              { icon: School,         label: "Children (2–14 yr)",  advice: "Cancel outdoor sports. Wear N95.",      tone: "rose" },
              { icon: Stethoscope,    label: "Asthma / CVD",        advice: "Carry inhaler. Avoid all exertion.",    tone: "rose" },
              { icon: UserRound,       label: "Elderly (60+)",       advice: "Stay indoors. Open windows sparingly.", tone: "amber" },
              { icon: Bike,           label: "Active Adults",       advice: "Limit outdoor runs to <20 min.",        tone: "amber" },
              { icon: Factory,        label: "Outdoor Workers",     advice: "Mandatory N95 mask. 30 min breaks.",    tone: "amber" },
            ].map(({ icon: Icon, label, advice, tone }) => (
              <div key={label} className="flex items-start gap-2.5 rounded-lg border border-border bg-background/40 p-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                  style={{ background: `color-mix(in oklab, var(--${tone}) 15%, transparent)`, color: `var(--${tone})` }}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold text-foreground leading-tight">{label}</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5 leading-snug">{advice}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* ── Nearby Monitoring Stations ─────────────────────────── */}
      <Panel title="Nearest CPCB Monitoring Stations" subtitle="Stations within 25 km of Delhi NCR · auto-updated every 15 min">
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Anand Vihar",  zone: "East Delhi",   aqi: 412, pm25: 198, status: "Online",  lat: "28.6508", lon: "77.3152" },
            { name: "ITO",          zone: "Central Delhi", aqi: 389, pm25: 176, status: "Online",  lat: "28.6289", lon: "77.2410" },
            { name: "Dwarka",       zone: "West Delhi",   aqi: 361, pm25: 162, status: "Online",  lat: "28.5825", lon: "77.0590" },
            { name: "Rohini",       zone: "North Delhi",  aqi: 398, pm25: 184, status: "Warning", lat: "28.7197", lon: "77.1494" },
          ].map((s) => {
            const cat = aqiCategory(s.aqi);
            return (
              <div key={s.name} className="rounded-lg border border-border bg-background/40 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold">{s.name}</div>
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] mono font-bold ${
                    s.status === "Online" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                  }`}>{s.status}</span>
                </div>
                <div className="text-[10px] text-muted-foreground mb-2">{s.zone}</div>
                <div className="mono text-2xl font-bold" style={{ color: `var(--${cat.token})` }}>{s.aqi}</div>
                <div className="text-[10px] mono text-muted-foreground">PM2.5: {s.pm25} µg/m³</div>
                <div className="mt-2 h-1 rounded bg-muted overflow-hidden">
                  <div className="h-full transition-all" style={{ width: `${Math.min(100, s.aqi / 5)}%`, background: `var(--${cat.token})` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function Tip({ i: I, t, tone }: any) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-background/40 px-2 py-1.5">
      <I className="h-3.5 w-3.5" style={{ color: `var(--${tone})` }} />
      <span>{t}</span>
    </div>
  );
}

