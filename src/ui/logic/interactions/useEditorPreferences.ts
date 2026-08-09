import { useEffect, useState } from "react";
import type { LocalDataService } from "../../../data-service";
import type { Language, Theme } from "../../../models";

export function useEditorPreferences(database: LocalDataService) {
  const [theme, setTheme] = useState<Theme>(
    () => database.loadTheme() ?? preferredTheme(),
  );
  const [language, setLanguage] = useState<Language>(
    () => database.loadLanguage() ?? preferredLanguage(),
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    database.saveTheme(next);
    setTheme(next);
  };
  const toggleLanguage = () => {
    const next = language === "en" ? "ar" : "en";
    database.saveLanguage(next);
    setLanguage(next);
  };

  return { theme, language, toggleTheme, toggleLanguage };
}

function preferredTheme(): Theme {
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const ARABIC_SPEAKING_REGIONS = new Set([
  "AE",
  "BH",
  "DJ",
  "DZ",
  "EG",
  "EH",
  "IQ",
  "JO",
  "KM",
  "KW",
  "LB",
  "LY",
  "MA",
  "MR",
  "OM",
  "PS",
  "QA",
  "SA",
  "SD",
  "SO",
  "SY",
  "TN",
  "YE",
]);

function preferredLanguage(): Language {
  const locales = navigator.languages.length
    ? navigator.languages
    : [navigator.language];
  const useArabic = locales.some((localeName) => {
    try {
      const locale = new Intl.Locale(localeName).maximize();
      return (
        locale.language === "ar" ||
        ARABIC_SPEAKING_REGIONS.has(locale.region ?? "")
      );
    } catch {
      return localeName.toLowerCase().startsWith("ar");
    }
  });
  return useArabic ? "ar" : "en";
}
