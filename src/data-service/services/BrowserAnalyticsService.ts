import type { AnalyticsService } from "../AnalyticsService";

type Gtag = (
  command: "js" | "config" | "event",
  nameOrDate: string | Date,
  properties?: Record<string, unknown>,
) => void;

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: Gtag;
};

export class BrowserAnalyticsService implements AnalyticsService {
  private readonly gtag?: Gtag;

  constructor(measurementId?: string) {
    if (!measurementId?.startsWith("G-")) return;

    const analyticsWindow = window as AnalyticsWindow;
    analyticsWindow.dataLayer ??= [];
    analyticsWindow.gtag ??= function gtag() {
      analyticsWindow.dataLayer?.push(arguments);
    } as Gtag;
    this.gtag = analyticsWindow.gtag;
    this.gtag("js", new Date());
    this.gtag("config", measurementId, {
      anonymize_ip: true,
      send_page_view: true,
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.append(script);
  }

  track(event: string, properties?: Record<string, string | number>) {
    this.gtag?.("event", event, properties);
  }
}
