"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AppDict, Locale } from "./types";
import { en } from "./en";
import { zh } from "./zh";

const LOCALE_COOKIE = "multica-app-locale";
const SUPPORTED_LOCALES: Locale[] = ["en", "zh"];

function getBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return "zh";
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("zh")) return "zh";
  return "en";
}

function readStoredLocale(): Locale | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )multica-app-locale=([^;]*)/);
  const val = match?.[1] ? decodeURIComponent(match[1]) : null;
  return SUPPORTED_LOCALES.includes(val as Locale) ? (val as Locale) : null;
}

function writeLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  const oneYear = 60 * 60 * 24 * 365;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)}; path=/; max-age=${oneYear}; SameSite=Lax${secure}`;
}

const dictionaries: Record<Locale, AppDict> = { en, zh };

export type TranslateFn = <K extends keyof AppDict, S extends keyof AppDict[K]>(
  section: K,
  key: S,
) => AppDict[K][S];

interface I18nContextValue {
  locale: Locale;
  dict: AppDict;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function useAppI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useAppI18n must be used within AppI18nProvider");
  return ctx;
}

interface AppI18nProviderProps {
  children: ReactNode;
  /** Initial locale — falls back to cookie → browser → "zh" */
  initialLocale?: Locale;
}

export function AppI18nProvider({ children, initialLocale }: AppI18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    return initialLocale ?? readStoredLocale() ?? getBrowserLocale();
  });

  const setLocale = (locale: Locale) => {
    setLocaleState(locale);
    writeLocaleCookie(locale);
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  };

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  const dict = dictionaries[locale];

  const t = <K extends keyof AppDict, S extends keyof AppDict[K]>(
    section: K,
    key: S,
  ): AppDict[K][S] => {
    return dict[section][key];
  };

  return (
    <I18nContext.Provider value={{ locale, dict, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}
