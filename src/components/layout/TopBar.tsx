import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Bell, Settings, Sun, Moon, ChevronDown, Menu,
  X, LogOut, User, Shield, AlertTriangle, Info, CheckCircle,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { CommandPalette } from "./CommandPalette";

const PAGE_TITLES: Record<string, string> = {
  "/":                 "National Overview",
  "/live-aqi":         "Live AQI Feed",
  "/smart-city":       "Smart City Monitor",
  "/intelligence":     "Environmental Intelligence",
  "/live-map":         "Live Map",
  "/sensors":          "Sensor Network",
  "/device-health":    "Device Health",
  "/telemetry":        "Telemetry Feed",
  "/heatmaps":         "Heatmaps",
  "/forecasting":      "AI Forecasting",
  "/prediction":       "Pollution Prediction",
  "/explainable":      "Explainable AI",
  "/policy-simulator": "Policy Simulator",
  "/what-if":          "What-If Analysis",
  "/digital-twin":     "Digital Twin",
  "/incidents":        "Incidents",
  "/enforcement":      "Enforcement",
  "/audit":            "Audit Trail",
  "/compliance":       "Compliance",
  "/complaints":       "Citizen Complaints",
  "/edge-nodes":       "Edge Nodes",
  "/lora-mesh":        "LoRa Mesh",
  "/cloud-edge":       "Cloud-Edge",
  "/drones":           "Drone Monitoring",
  "/vehicles":         "Mobile Vehicles",
  "/sandbox":          "Open Data Sandbox",
  "/api":              "Research APIs",
  "/data-trust":       "Data Trust Engine",
  "/reports":          "Environmental Reports",
  "/users":            "User Roles",
  "/access":           "Access Control",
  "/security":         "Security",
  "/system":           "System Health",
  "/settings":         "Settings",
  "/command-center":   "Command Center",
  "/citizen":          "Citizen Portal",
};

const NOTIFICATIONS = [
  { id: 1, type: "critical", icon: AlertTriangle, title: "AQI Breach — Delhi NCR", body: "PM2.5 exceeded 300 µg/m³ at 3 stations. Enforcement dispatched.", time: "2 min ago", read: false },
  { id: 2, type: "warning",  icon: AlertTriangle, title: "Sensor Offline — MUM-087", body: "No heartbeat for 12 minutes. Battery at 8%.", time: "9 min ago", read: false },
  { id: 3, type: "info",     icon: Info,          title: "Forecast Updated", body: "72-hour AQI forecast for Lucknow revised upward to Very Poor.", time: "18 min ago", read: false },
  { id: 4, type: "success",  icon: CheckCircle,   title: "Enforcement Resolved", body: "INC-48199 closed. Factory emissions within NAAQS limits.", time: "34 min ago", read: false },
  { id: 5, type: "warning",  icon: AlertTriangle, title: "GRAP Stage II Active — Kolkata", body: "AQI 341 triggers Stage II construction ban.", time: "1 hr ago", read: true },
  { id: 6, type: "info",     icon: Info,          title: "Model Retrain Complete", body: "XGBoost v2.4.1 deployed. RMSE improved by 4.2%.", time: "2 hr ago", read: true },
  { id: 7, type: "critical", icon: AlertTriangle, title: "Industrial Source Detected", body: "Anomalous SO₂ spike near Patna Industrial Corridor.", time: "3 hr ago", read: true },
  { id: 8, type: "success",  icon: CheckCircle,   title: "Merkle Anchor Confirmed", body: "Hourly hash chain anchored to IPFS. Block 4,829,112.", time: "4 hr ago", read: true },
  { id: 9, type: "info",     icon: Info,          title: "API Rate Limit Warning", body: "Research API consumer IMD-BULK approaching quota (88%).", time: "5 hr ago", read: true },
  { id: 10, type: "warning", icon: AlertTriangle, title: "Calibration Drift — CHN-022", body: "R² dropped to 0.71. Maintenance scheduled.", time: "6 hr ago", read: true },
  { id: 11, type: "success", icon: CheckCircle,   title: "NCAP Report Submitted", body: "Q2 2026 non-attainment city report filed to CPCB.", time: "8 hr ago", read: true },
  { id: 12, type: "info",    icon: Info,          title: "Drone Survey Complete", body: "UAV-7 finished Patna corridor scan. 2.4 GB imagery uploaded.", time: "10 hr ago", read: true },
];

const NOTIF_COLORS: Record<string, string> = {
  critical: "var(--rose)",
  warning:  "var(--amber)",
  info:     "var(--cyan)",
  success:  "var(--emerald)",
};

export function TopBar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const pageTitle = PAGE_TITLES[pathname] ?? "Swachh Hawa";

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const [cmdOpen, setCmdOpen] = useState(false);
  const openCmd = useCallback(() => setCmdOpen(true), []);
  const closeCmd = useCallback(() => setCmdOpen(false), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen(o => !o);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));

  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase();

  return (
    <>
      <CommandPalette open={cmdOpen} onClose={closeCmd} />
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-card/60 hover:bg-accent transition"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
          <h1 className="truncate text-sm font-semibold tracking-tight text-foreground">{pageTitle}</h1>
          <LiveBadge />
        </div>

        {/* Center: search — clicks open the command palette */}
        <button
          onClick={openCmd}
          className="mx-4 flex max-w-sm flex-1 items-center gap-2 rounded-md border border-border bg-card/60 px-3 py-1.5 text-sm text-left hover:bg-accent transition"
        >
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="flex-1 text-sm text-muted-foreground">Search locations, devices, incidents…</span>
          <kbd className="hidden md:inline-flex rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] mono text-muted-foreground">⌘K</kbd>
        </button>

        {/* Right */}
        <div className="ml-auto flex items-center gap-1.5">
          {/* Date + time */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-3 py-1.5 text-xs mono text-foreground whitespace-nowrap">
            <span className="text-muted-foreground">{dateStr},</span>
            <span>{timeStr}</span>
          </div>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => { setNotifOpen((o) => !o); setUserOpen(false); }}
              className="relative flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card/60 hover:bg-accent transition"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--rose)] text-[9px] font-bold text-white mono">
                  {unread}
                </span>
              )}
            </button>
          </div>

          {/* Settings */}
          <button
            onClick={() => navigate({ to: "/settings" })}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card/60 hover:bg-accent transition"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card/60 hover:bg-accent transition"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* User dropdown */}
          <div ref={userRef} className="relative">
            <button
              onClick={() => { setUserOpen((o) => !o); setNotifOpen(false); }}
              className="flex items-center gap-2 rounded-md border border-border bg-card/60 px-2.5 py-1.5 hover:bg-accent transition"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                {user?.initials ?? "?"}
              </div>
              <div className="hidden md:block text-left leading-tight">
                <div className="text-xs font-medium">{user?.name ?? "Guest"}</div>
                <div className="text-[10px] text-muted-foreground">{user?.role ?? "—"}</div>
              </div>
              <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${userOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {userOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card/95 shadow-[var(--shadow-elevated)] backdrop-blur-xl z-50"
                >
                  <div className="border-b border-border px-4 py-3">
                    <div className="text-sm font-semibold text-foreground">{user?.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                    <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      <Shield className="h-2.5 w-2.5" />
                      {user?.role}
                    </div>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={() => { navigate({ to: "/users" }); setUserOpen(false); }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent transition"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      View Profile
                    </button>
                    <button
                      onClick={() => { navigate({ to: "/settings" }); setUserOpen(false); }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent transition"
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      Account Settings
                    </button>
                  </div>
                  <div className="border-t border-border p-1.5">
                    <button
                      onClick={() => { logout(); setUserOpen(false); }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--rose)] hover:bg-[var(--rose)]/10 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Notifications slide-over panel */}
      <AnimatePresence>
        {notifOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px]"
              onClick={() => setNotifOpen(false)}
            />
            {/* Panel */}
            <motion.aside
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="fixed right-0 top-0 z-40 flex h-full w-full max-w-sm flex-col border-l border-border bg-card/95 shadow-2xl backdrop-blur-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
                  <p className="text-[10px] text-muted-foreground">{unread} unread alerts</p>
                </div>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button onClick={markAllRead} className="text-[11px] text-primary hover:underline">
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setNotifOpen(false)} className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  const color = NOTIF_COLORS[n.type];
                  return (
                    <div
                      key={n.id}
                      className={`flex gap-3 border-b border-border/50 px-4 py-3 transition hover:bg-accent/40 ${n.read ? "opacity-60" : ""}`}
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                           style={{ background: `color-mix(in oklab, ${color} 15%, transparent)` }}>
                        <Icon className="h-3.5 w-3.5" style={{ color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-medium text-foreground leading-snug">{n.title}</p>
                          {!n.read && (
                            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">{n.body}</p>
                        <p className="mt-1 text-[10px] mono text-muted-foreground/60">{n.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="border-t border-border px-4 py-3">
                <button
                  onClick={() => { navigate({ to: "/audit" }); setNotifOpen(false); }}
                  className="w-full rounded-lg border border-border bg-card/60 py-2 text-xs font-medium text-foreground hover:bg-accent transition"
                >
                  View full audit log →
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function LiveBadge() {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-[var(--emerald)]/30 bg-[var(--emerald)]/10 px-2.5 py-0.5">
      <motion.span
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        className="h-1.5 w-1.5 rounded-full bg-[var(--emerald)]"
      />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--emerald)] mono">Live</span>
    </div>
  );
}
