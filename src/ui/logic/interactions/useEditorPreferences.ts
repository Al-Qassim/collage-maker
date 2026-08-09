import { useEffect, useState } from "react";
import type { LocalDataService } from "../../../data-service";
import type { Language, Theme } from "../../../models";

export function useEditorPreferences(database: LocalDataService) {
  const [theme, setTheme] = useState<Theme>(
    () => database.loadTheme() ?? preferredTheme(),
  );
  const [language, setLanguage] = useState<Language>(
    () => database.loadLanguage() ?? "en",
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
