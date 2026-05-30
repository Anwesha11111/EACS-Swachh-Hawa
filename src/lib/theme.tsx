import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
type Mode = "auto" | "light" | "dark";

interface ThemeCtx {
  theme: Theme;
  mode: Mode;
  setMode: (m: Mode) => void;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

function resolveAuto(): Theme {
  if (typeof window === "undefined") return "dark";
  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 18;
  const sys = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  // Day -> light, Night -> dark, with system as tiebreaker
  return isDay ? (sys ? "dark" : "light") : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("auto");
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("sh-mode")) as Mode | null;
    if (stored) setModeState(stored);
  }, []);

  useEffect(() => {
    const apply = () => {
      const next: Theme = mode === "auto" ? resolveAuto() : mode;
      setTheme(next);
      const root = document.documentElement;
      root.classList.toggle("dark", next === "dark");
      root.style.colorScheme = next;
    };
    apply();
    if (mode === "auto") {
      const id = setInterval(apply, 60_000);
      return () => clearInterval(id);
    }
  }, [mode]);

  const setMode = (m: Mode) => {
    setModeState(m);
    try { localStorage.setItem("sh-mode", m); } catch {}
  };
  const toggle = () => setMode(theme === "dark" ? "light" : "dark");

  return <Ctx.Provider value={{ theme, mode, setMode, toggle }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTheme outside provider");
  return c;
}