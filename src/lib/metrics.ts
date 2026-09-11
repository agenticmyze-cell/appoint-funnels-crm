import type { Tables } from "@/integrations/supabase/types";
import { DISABLED, money, num, pct } from "./format";

export type Campaign = Tables<"campaigns">;

/**
 * Metric resolution rules:
 * - manual mode  -> stored values are authoritative
 * - live mode    -> derived rates are calculated from stored counters
 * - a disabled rate is never calculated, it renders as "Disabled"
 */
/** Rate denominator: emails sent, falling back to sequence/lead volume. */
export function rateBase(c: Campaign): number {
  return c.emails_sent || c.sequence_started || c.leads_count || 0;
}

export function openRate(c: Campaign): number | null {
  if (!c.open_rate_enabled) return null;
  const base = rateBase(c);
  if (!base) return 0;
  return (c.unique_opens / base) * 100;
}

export function clickRate(c: Campaign): number | null {
  if (!c.click_rate_enabled) return null;
  const base = rateBase(c);
  if (!base) return 0;
  return (c.unique_clicks / base) * 100;
}

export function replyRate(c: Campaign): number {
  const base = rateBase(c);
  if (!base) return 0;
  return (c.total_replies / base) * 100;
}

export function opportunityRate(c: Campaign): number {
  const base = rateBase(c);
  if (!base) return 0;
  return (c.opportunities / base) * 100;
}

export function openRateLabel(c: Campaign): string {
  const r = openRate(c);
  return r === null ? DISABLED : pct(r);
}

export function clickRateLabel(c: Campaign): string {
  const r = clickRate(c);
  return r === null ? DISABLED : pct(r);
}

export type Totals = {
  campaigns: number;
  leads: number;
  sent: number;
  opens: number;
  uniqueOpens: number;
  clicks: number;
  replies: number;
  opportunities: number;
  pipeline: number;
  meetings: number;
  won: number;
  revenue: number;
};

export function totalsOf(campaigns: Campaign[]): Totals {
  return campaigns.reduce<Totals>(
    (acc, c) => ({
      campaigns: acc.campaigns + 1,
      leads: acc.leads + c.leads_count,
      sent: acc.sent + c.emails_sent,
      opens: acc.opens + c.total_opens,
      uniqueOpens: acc.uniqueOpens + c.unique_opens,
      clicks: acc.clicks + c.unique_clicks,
      replies: acc.replies + c.total_replies,
      opportunities: acc.opportunities + c.opportunities,
      pipeline: acc.pipeline + Number(c.opportunity_value),
      meetings: acc.meetings + c.meetings_booked,
      won: acc.won + c.won_deals,
      revenue: acc.revenue + Number(c.revenue),
    }),
    {
      campaigns: 0,
      leads: 0,
      sent: 0,
      opens: 0,
      uniqueOpens: 0,
      clicks: 0,
      replies: 0,
      opportunities: 0,
      pipeline: 0,
      meetings: 0,
      won: 0,
      revenue: 0,
    },
  );
}

export function totalsReplyRate(t: Totals): string {
  return t.sent ? pct((t.replies / t.sent) * 100) : "0.00%";
}

export function totalsOpenRate(t: Totals): string {
  return t.sent ? pct((t.uniqueOpens / t.sent) * 100) : "0.00%";
}

export const EDITABLE_METRICS: { key: keyof Campaign; label: string; kind: "int" | "money" }[] = [
  { key: "leads_count", label: "Leads", kind: "int" },
  { key: "sequence_started", label: "Sequence Started", kind: "int" },
  { key: "emails_sent", label: "Emails Sent", kind: "int" },
  { key: "total_opens", label: "Total Opens", kind: "int" },
  { key: "unique_opens", label: "Unique Opens", kind: "int" },
  { key: "total_clicks", label: "Total Clicks", kind: "int" },
  { key: "unique_clicks", label: "Unique Clicks", kind: "int" },
  { key: "total_replies", label: "Total Replies", kind: "int" },
  { key: "unique_replies", label: "Unique Replies", kind: "int" },
  { key: "opportunities", label: "Opportunities", kind: "int" },
  { key: "opportunity_value", label: "Opportunity Value", kind: "money" },
  { key: "meetings_booked", label: "Meetings Booked", kind: "int" },
  { key: "meetings_completed", label: "Meetings Completed", kind: "int" },
  { key: "won_deals", label: "Won Deals", kind: "int" },
  { key: "revenue", label: "Revenue", kind: "money" },
  { key: "progress", label: "Progress %", kind: "int" },
];

export function metricDisplay(kind: "int" | "money", value: unknown): string {
  return kind === "money" ? money(Number(value)) : num(Number(value));
}
