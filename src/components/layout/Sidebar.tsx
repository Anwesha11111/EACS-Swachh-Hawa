import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Activity, Building2, Sparkles,
  Map, Radio, HeartPulse, Waves, Flame,
  Brain, LineChart, ScanEye, FlaskConical, Layers3, Boxes,
  ShieldAlert, Gavel, History, FileCheck2, MessageSquareWarning,
  Cpu, Network, Cloud, Plane, Truck,
  Database, Code2, Lock as LockIcon, FileBarChart2,
  Users, KeyRound, ShieldCheck, ServerCog, Settings,
  ChevronLeft, Wind,
} from "lucide-react";

type Item = { to: string; label: string; icon: any; badge?: string };
type Group = { label: string; items: Item[] };

const NAV: Group[] = [
  {
    label: "Overview",
    items: [
      { to: "/",                 label: "National Dashboard", icon: LayoutDashboard },
      { to: "/live-aqi",         label: "Live AQI",           icon: Activity, badge: "LIVE" },
      { to: "/smart-city",       label: "Smart City Monitor", icon: Building2 },
      { to: "/intelligence",     label: "Env. Intelligence",  icon: Sparkles },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { to: "/live-map",         label: "Live Map",           icon: Map },
      { to: "/sensors",          label: "Sensor Network",     icon: Radio },
      { to: "/device-health",    label: "Device Health",      icon: HeartPulse },
      { to: "/telemetry",        label: "Telemetry Feed",     icon: Waves },
      { to: "/heatmaps",         label: "Heatmaps",           icon: Flame },
    ],
  },
  {
    label: "AI & Forecasting",
    items: [
      { to: "/forecasting",      label: "AI Forecasting",     icon: Brain, badge: "AI" },
      { to: "/prediction",       label: "Pollution Prediction", icon: LineChart },
      { to: "/explainable",      label: "Explainable AI",     icon: ScanEye },
      { to: "/policy-simulator", label: "Policy Simulator",   icon: FlaskConical },
      { to: "/what-if",          label: "What-if Analysis",   icon: Layers3 },
      { to: "/digital-twin",     label: "Digital Twin",       icon: Boxes },
    ],
  },
  {
    label: "Governance",
    items: [
      { to: "/incidents",        label: "Incidents",          icon: ShieldAlert, badge: "8" },
      { to: "/enforcement",      label: "Enforcement",        icon: Gavel },
      { to: "/audit",            label: "Audit Trail",        icon: History },
      { to: "/compliance",       label: "Compliance",         icon: FileCheck2 },
      { to: "/complaints",       label: "Citizen Complaints", icon: MessageSquareWarning },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { to: "/edge-nodes",       label: "Edge Nodes",         icon: Cpu },
      { to: "/lora-mesh",        label: "LoRa Mesh",          icon: Network },
      { to: "/cloud-edge",       label: "Cloud-Edge",         icon: Cloud },
      { to: "/drones",           label: "Drone Monitoring",   icon: Plane },
      { to: "/vehicles",         label: "Mobile Vehicles",    icon: Truck },
    ],
  },
  {
    label: "Research",
    items: [
      { to: "/sandbox",          label: "Open Data Sandbox",  icon: Database },
      { to: "/api",              label: "Research APIs",      icon: Code2 },
      { to: "/data-trust",       label: "Data Trust Engine",  icon: LockIcon },
      { to: "/reports",          label: "Env. Reports",       icon: FileBarChart2 },
    ],
  },
  {
    label: "Administration",
    items: [
      { to: "/users",            label: "User Roles",         icon: Users },
      { to: "/access",           label: "Access Control",     icon: KeyRound },
      { to: "/security",         label: "Security",           icon: ShieldCheck },
      { to: "/system",           label: "System Health",      icon: ServerCog },
      { to: "/settings",         label: "Settings",           icon: Settings },
    ],
  },
  {
    label: "Command",
    items: [
      { to: "/command-center",   label: "Command Center",     icon: Wind, badge: "OPS" },
      { to: "/citizen",          label: "Citizen Portal",     icon: Users },
    ],
  },
];

export function Sidebar({
  collapsed, setCollapsed,
}: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="relative z-30 flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
    >
      <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary glow-cyan">
          <Wind className="h-5 w-5" />
          <span className="absolute inset-0 rounded-lg border border-primary/40 animate-pulse-ring" />
        </div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="min-w-0"
            >
              <div className="truncate text-sm font-semibold tracking-tight">Swachh Hawa</div>
              <div className="truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground mono">
                Clean Air Alliance · v4.2
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3">
        {NAV.map((group) => (
          <SidebarGroup key={group.label} group={group} pathname={pathname} collapsed={collapsed} />
        ))}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="m-3 flex items-center justify-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/40 py-2 text-xs text-muted-foreground hover:bg-sidebar-accent transition"
        aria-label="Collapse sidebar"
      >
        <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        {!collapsed && <span>Collapse</span>}
      </button>
    </motion.aside>
  );
}

function SidebarGroup({ group, pathname, collapsed }: { group: Group; pathname: string; collapsed: boolean }) {
  return (
    <div className="mb-3">
      {!collapsed && (
        <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {group.label}
        </div>
      )}
      <ul className="space-y-0.5">
        {group.items.map((it) => {
          const active = pathname === it.to;
          const Icon = it.icon;
          return (
            <li key={it.to}>
              <Link
                to={it.to as any}
                className={`group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}
                title={collapsed ? it.label : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="active-pill"
                    className="absolute left-0 top-1.5 h-[calc(100%-12px)] w-[3px] rounded-r bg-primary glow-cyan"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : ""}`} />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{it.label}</span>
                    {it.badge && (
                      <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-primary mono">
                        {it.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}