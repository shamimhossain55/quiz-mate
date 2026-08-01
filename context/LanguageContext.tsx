"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Language, translations, TranslationKey } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "bn",
  setLanguage: () => {},
  t: (key: TranslationKey) => translations.bn[key] || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("bn");

  // Load language from localStorage / system preference on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("qm_language") as Language;
      if (savedLang === "bn" || savedLang === "en") {
        setLanguageState(savedLang);
      }
    } catch {
      // Fallback
    }

    const handleCustomChange = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (customEvt.detail?.language) {
        const lang = customEvt.detail.language as Language;
        if (lang === "bn" || lang === "en") {
          setLanguageState(lang);
        }
      }
    };

    window.addEventListener("qm_language_changed", handleCustomChange);
    return () => {
      window.removeEventListener("qm_language_changed", handleCustomChange);
    };
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("qm_language", lang);
      window.dispatchEvent(new CustomEvent("qm_language_changed", { detail: { language: lang } }));
    } catch {
      // Fallback
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const currentDict = translations[language] || translations.bn;
      return currentDict[key] || translations.bn[key] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
