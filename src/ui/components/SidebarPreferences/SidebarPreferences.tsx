import { Languages, Moon, Sun } from "lucide-react";
import type { Language, Theme } from "../../../models";
import { useLocale } from "../LocaleProvider/LocaleProvider";
import styles from "./SidebarPreferences.module.css";

export function SidebarPreferences({
  theme,
  language,
  toggleTheme,
  toggleLanguage,
}: {
  theme: Theme;
  language: Language;
  toggleTheme(): void;
  toggleLanguage(): void;
}) {
  const { t } = useLocale();
  const dark = theme === "dark";
  return (
    <div className={styles.preferences}>
      <button
        onClick={toggleTheme}
        title={dark ? t("lightTheme") : t("darkTheme")}
      >
        {dark ? <Sun size={15} /> : <Moon size={15} />}
        {dark ? t("lightTheme") : t("darkTheme")}
      </button>
      <button
        onClick={toggleLanguage}
        title={language === "en" ? t("arabic") : t("english")}
      >
        <Languages size={15} />
        {language === "en" ? t("arabic") : t("english")}
      </button>
    </div>
  );
}
