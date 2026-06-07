import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type ThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (m: ThemeMode) => void;
  cycle: () => void;
}

const Ctx = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "box2box.theme";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  root.dataset.theme = resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "system";
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    return stored ?? "system";
  });
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  const resolved: ResolvedTheme = mode === "system" ? systemTheme : mode;

  // Apply theme to <html>
  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  // Listen for system preference changes when in "system" mode
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemTheme(mq.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Persist mode
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* noop */
    }
  }, [mode]);

  const cycle = () => {
    setMode((m) =>
      m === "system" ? "light" : m === "light" ? "dark" : "system",
    );
  };

  return (
    <Ctx.Provider value={{ mode, resolved, setMode, cycle }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
