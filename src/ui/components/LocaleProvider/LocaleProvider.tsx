import { createContext, useContext, type ReactNode } from "react";
import type { Language } from "../../../models";

const copy = {
  en: {
    new: "New",
    clear: "Clear",
    canvas: "Canvas",
    size: "Size",
    customSize: "Custom Size",
    pageMargin: "Margin",
    spacing: "Spacing",
    cornerRadius: "Corners",
    centimeterNote: "Physical measurements use 300 DPI and save automatically.",
    savedAutomatically: "Saved automatically. Print units use 300 DPI.",
    savedLayouts: "Saved Layouts",
    savedLayoutsCopy: "Save this structure and reuse it with new photos.",
    saveLayout: "Save Current Layout",
    noLayouts: "No saved layouts yet.",
    undo: "Undo",
    redo: "Redo",
    export: "Export",
    exporting: "Exporting…",
    addPhotos: "Add Photos",
    dropPhotos: "or drop them here",
    canvasTip: "Click to replace · Drag to position · Scroll to zoom",
    zoomOut: "Zoom out",
    zoomIn: "Zoom in",
    screen: "Screen",
    print: "Print",
    unit: "Unit",
    width: "Width",
    height: "Height",
    pixels: "Pixels",
    inches: "Inches",
    millimeters: "Millimeters",
    centimeters: "Centimeters",
    frameSize: "Frame size",
    editFrameSize: "View or edit frame size",
    fixedFrameDimension:
      "A dimension without a matching divider is fixed by the canvas.",
    applySize: "Apply size",
    exportFormat: "Export Format",
    jpg: "JPG",
    png: "PNG",
    pages: "Pages",
    page: "Page",
    addPage: "Add Page",
    removePage: "Remove page",
    shuffle: "Shuffle Layout",
    exportPages: "Pages to export",
    thisPage: "This page",
    allPages: "All pages",
    download: "Download",
    saveProject: "Save project",
    openProject: "Open project",
    lightTheme: "Light theme",
    darkTheme: "Dark theme",
    arabic: "العربية",
    english: "English",
  },
  ar: {
    new: "جديد",
    clear: "مسح",
    canvas: "لوحة العمل",
    size: "الحجم",
    customSize: "حجم مخصص",
    pageMargin: "الهامش",
    spacing: "التباعد",
    cornerRadius: "الزوايا",
    centimeterNote: "القياسات الفعلية تستخدم 300 نقطة/بوصة وتُحفظ تلقائياً.",
    savedAutomatically: "تُحفظ تلقائياً. وحدات الطباعة تستخدم 300 نقطة/بوصة.",
    savedLayouts: "التخطيطات المحفوظة",
    savedLayoutsCopy: "احفظ هذا التخطيط وأعد استخدامه مع صور جديدة.",
    saveLayout: "حفظ التخطيط الحالي",
    noLayouts: "لا توجد تخطيطات محفوظة.",
    undo: "تراجع",
    redo: "إعادة",
    export: "تصدير",
    exporting: "جارٍ التصدير…",
    addPhotos: "إضافة صور",
    dropPhotos: "أو أفلتها هنا",
    canvasTip: "انقر للاستبدال · اسحب للتحريك · مرر للتكبير",
    zoomOut: "تصغير",
    zoomIn: "تكبير",
    screen: "الشاشة",
    print: "الطباعة",
    unit: "الوحدة",
    width: "العرض",
    height: "الارتفاع",
    pixels: "بكسل",
    inches: "بوصة",
    millimeters: "ملليمتر",
    centimeters: "سنتيمتر",
    frameSize: "حجم الإطار",
    editFrameSize: "عرض أو تعديل حجم الإطار",
    fixedFrameDimension:
      "البعد الذي لا يحتوي على فاصل مطابق ثابت حسب لوحة العمل.",
    applySize: "تطبيق الحجم",
    exportFormat: "صيغة التصدير",
    jpg: "JPG",
    png: "PNG",
    pages: "الصفحات",
    page: "صفحة",
    addPage: "إضافة صفحة",
    removePage: "حذف الصفحة",
    shuffle: "تبديل التخطيط",
    exportPages: "الصفحات المراد تصديرها",
    thisPage: "هذه الصفحة",
    allPages: "كل الصفحات",
    download: "تنزيل",
    saveProject: "حفظ المشروع",
    openProject: "فتح مشروع",
    lightTheme: "الوضع الفاتح",
    darkTheme: "الوضع الداكن",
    arabic: "العربية",
    english: "English",
  },
} as const;

type CopyKey = keyof typeof copy.en;
const LocaleContext = createContext<Language>("en");

export function LocaleProvider({
  language,
  children,
}: {
  language: Language;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={language}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const language = useContext(LocaleContext);
  return {
    language,
    t: (key: CopyKey) => copy[language][key],
  };
}
