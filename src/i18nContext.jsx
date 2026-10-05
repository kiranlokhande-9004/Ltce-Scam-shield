// ---------------------------------------------------------------------------
// i18nContext.jsx — app-wide language state (English / हिंदी / मराठी).
//
// A single source of truth for the selected language, shared by every screen
// and by the voice assistant. It uses the existing dictionary in i18n.js and
// adds NO new dependency. The choice is persisted in localStorage.
// ---------------------------------------------------------------------------

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LANGUAGES, translate } from "./i18n";

const STORAGE_KEY = "scamshield.lang";
const CODES = LANGUAGES.map((entry) => entry.code);

const LanguageContext = createContext(null);

function readStoredLang() {
  try {
    if (typeof window === "undefined") return "en";
    const value = window.localStorage.getItem(STORAGE_KEY);
    return CODES.includes(value) ? value : "en";
  } catch {
    return "en";
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readStoredLang);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.setAttribute("lang", lang);
      }
    } catch {
      /* storage unavailable — in-memory only */
    }
  }, [lang]);

  const setLang = useCallback((next) => {
    setLangState(CODES.includes(next) ? next : "en");
  }, []);

  const value = useMemo(() => {
    const t = (key, vars) => translate(lang, key, vars);
    return { lang, setLang, t };
  }, [lang, setLang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLang must be used within a LanguageProvider");
  }
  return ctx;
}