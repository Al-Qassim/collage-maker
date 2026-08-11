export interface AnalyticsService {
  track(event: string, properties?: Record<string, string | number>): void;
}
