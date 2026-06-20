import { useEffect, useState, useRef, useCallback, type KeyboardEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, LayoutDashboard, Activity, Map, Flame, Wind, Brain, FileText,
  Users, ShieldAlert, Settings, MapPin, AlertTriangle, X,
} from "lucide-react";
import { CITIES } from "@/lib/mock-data";

interface CommandItem {
  id: string;
  label: string;
  group: string;
  href: string;
  icon: React.ElementType;
  description?: string;
}

const NAV_ITEMS: CommandItem[] = [
  { id: "dashboard",    label: "National Dashboard",     group: "Pages", href: "/",                icon: LayoutDashboard },
  { id: "live-aqi",     label: "Live AQI Feed",          group: "Pages", href: "/live-aqi",         icon: Activity },
  { id: "live-map",     label: "Live Map",               group: "Pages", href: "/live-map",         icon: Map },
  { id: "heatmaps",     label: "Heatmaps",               group: "Pages", href: "/heatmaps",         icon: Flame },
  { id: "sensors",      label: "Sensor Network",         group: "Pages", href: "/sensors",          icon: Wind },
  { id: "forecasting",  label: "AI Forecasting",         group: "Pages", href: "/forecasting",      icon: Brain },
  { id: "prediction",   label: "Pollution Prediction",   group: "Pages", href: "/prediction",       icon: Brain },
  { id: "incidents",    label: "Incidents",              group: "Pages", href: "/incidents",        icon: AlertTriangle },
  { id: "enforcement",  label: "Enforcement",            group: "Pages", href: "/enforcement",      icon: ShieldAlert },
  { id: "complaints",   label: "Citizen Complaints",     group: "Pages", href: "/complaints",       icon: FileText },
  { id: "citizen",      label: "Citizen Portal",         group: "Pages", href: "/citizen",          icon: MapPin },
  { id: "reports",      label: "Reports",                group: "Pages", href: "/reports",          icon: FileText },
  { id: "users",        label: "User Management",        group: "Admin", href: "/users",            icon: Users },
  { id: "settings",     label: "Settings",               group: "Admin", href: "/settings",         icon: Settings },
];

const CITY_ITEMS: CommandItem[] = CITIES.map(c => ({
  id:   `city-${c.name}`,
  label: c.name,
  group: "Cities",
  href:  "/live-aqi",
  icon:  MapPin,
  description: `AQI ${c.aqi} · ${c.state}`,
}));

const ALL_ITEMS = [...NAV_ITEMS, ...CITY_ITEMS];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? ALL_ITEMS.filter(
        item =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase())
      )
    : NAV_ITEMS.slice(0, 8);

  const groups = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});

  const flat = Object.values(groups).flat();

  const handleSelect = useCallback((href: string) => {
    navigate({ to: href as "/" });
    onClose();
    setQuery("");
    setCursor(0);
  }, [navigate, onClose]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => Math.min(c + 1, flat.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    if (e.key === "Enter" && flat[cursor]) handleSelect(flat[cursor].href);
    if (e.key === "Escape") onClose();
  };

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 60); setQuery(""); setCursor(0); }
  }, [open]);

  useEffect(() => { setCursor(0); }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed left-1/2 top-[18%] z-50 w-full max-w-lg -translate-x-1/2"
          >
            <div className="rounded-xl border border-border bg-card/95 shadow-2xl backdrop-blur-xl overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Search pages, cities, incidents…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] mono text-muted-foreground">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-[360px] overflow-y-auto py-2 scrollbar-thin">
                {flat.length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">No results for "{query}"</div>
                )}

                {Object.entries(groups).map(([group, items]) => (
                  <div key={group}>
                    <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group}
                    </div>
                    {items.map(item => {
                      const Icon = item.icon;
                      const idx = flat.indexOf(item);
                      const isActive = idx === cursor;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item.href)}
                          onMouseEnter={() => setCursor(idx)}
                          className={`flex w-full cursor-pointer items-center gap-3 rounded-lg mx-2 px-3 py-2 text-sm text-foreground transition-colors outline-none ${isActive ? "bg-accent" : "hover:bg-accent/60"}`}
                          style={{ width: "calc(100% - 1rem)" }}
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-background/60">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1 text-left">
                            <div className="font-medium truncate">{item.label}</div>
                            {item.description && (
                              <div className="text-[11px] text-muted-foreground mono">{item.description}</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-border px-4 py-2 flex items-center gap-3 text-[10px] text-muted-foreground mono">
                <span><kbd className="rounded border border-border px-1">↑↓</kbd> navigate</span>
                <span><kbd className="rounded border border-border px-1">↵</kbd> open</span>
                <span><kbd className="rounded border border-border px-1">ESC</kbd> close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
