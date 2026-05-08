"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Language } from "./translations";
import { t as getTranslation } from "./translations";

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = "angebotpro-lang";

function getInitialLang(): Language {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "en" || saved === "de") return saved;
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(getInitialLang);

  function setLang(l: Language) {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }

  function t(key: string): string {
    return getTranslation(lang, key);
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
