// Analytics stub. In production this is the event sink that powers the A/B test
// — exposures and conversions keyed by experiment + variant, fed to a warehouse
// or product-analytics tool (GA4 / Segment / PostHog). Here it just logs to the
// server so the experiment is observable end-to-end without adding infra.

export type AnalyticsEvent = {
  event: "experiment_exposure" | "lead_submitted";
  experiment: string;
  variant: string;
} & Record<string, unknown>;

export function track(event: AnalyticsEvent): void {
  console.log(`[analytics] ${JSON.stringify({ ts: new Date().toISOString(), ...event })}`);
}
