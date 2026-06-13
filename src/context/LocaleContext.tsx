import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { translate } from "../i18n/translations";
import type { Locale } from "../i18n/translations";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const Ctx = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = "box2box.locale";

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored === "en" || stored === "id") return stored;
  const nav = (navigator.language || "en").toLowerCase();
  return nav.startsWith("id") ? "id" : "en";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  // Persist choice + reflect it on <html lang> for accessibility.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* noop */
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const t = (key: string, params?: Record<string, string | number>) =>
    translate(locale, key, params);

  const value: LocaleContextValue = { locale, setLocale, t };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
