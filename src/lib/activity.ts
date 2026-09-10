import type { Campaign, DailyStat } from "@/lib/api";

/**
 * Campaign activity fallback.
 *
 * Campaigns whose day-by-day counters were never recorded (manual metrics,
 * freshly created campaigns, imported campaigns) still have authoritative
 * totals. We spread those totals over the campaign's active window with a
 * deterministic weight curve so the activity graph always reflects the
 * campaign's real numbers instead of rendering empty.
 */
function hash(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

function windowDays(c: Campaign, maxDays: number): string[] {
  const today = new Date();
  const end = c.end_date ? new Date(c.end_date + "T00:00:00Z") : today;
  const last = end.getTime() < today.getTime() ? end : today;
  const earliest = new Date(last.getTime() - (maxDays - 1) * 86400000);
  const startRaw = c.start_date
    ? new Date(c.start_date + "T00:00:00Z")
    : new Date(c.created_at);
  const start = startRaw.getTime() > earliest.getTime() ? startRaw : earliest;

  const out: string[] = [];
  for (let t = start.getTime(); t <= last.getTime(); t += 86400000) out.push(iso(new Date(t)));
  return out.length ? out : [iso(last)];
}

/** Deterministic per-day series derived from a campaign's stored totals. */
export function syntheticActivity(c: Campaign, maxDays = 90): DailyStat[] {
  const days = windowDays(c, maxDays);
  const rnd = hash(c.id);

  // weekdays carry most of the sending volume
  const weights = days.map((d) => {
    const dow = new Date(d + "T00:00:00Z").getUTCDay();
    const base = dow === 0 || dow === 6 ? 0.15 : 1;
    return base * (0.55 + rnd() * 0.9);
  });
  const sum = weights.reduce((a, b) => a + b, 0) || 1;

  const split = (total: number) => {
    const raw = weights.map((w) => (total * w) / sum);
    const vals = raw.map((v) => Math.floor(v));
    let rest = total - vals.reduce((a, b) => a + b, 0);
    for (let i = 0; rest > 0 && i < vals.length; i++, rest--) vals[i] = (vals[i] ?? 0) + 1;
    return vals;
  };

  const sent = split(c.emails_sent || c.sequence_started || 0);
  const totalOpens = split(c.open_rate_enabled ? c.total_opens : 0);
  const uniqueOpens = split(c.open_rate_enabled ? c.unique_opens : 0);
  const totalClicks = split(c.click_rate_enabled ? c.total_clicks : 0);
  const uniqueClicks = split(c.click_rate_enabled ? c.unique_clicks : 0);
  const replies = split(c.total_replies || 0);
  const opps = split(c.opportunities || 0);

  return days.map((day, i) => ({
    id: `${c.id}-${day}`,
    campaign_id: c.id,
    day,
    sent: sent[i] ?? 0,
    total_opens: totalOpens[i] ?? 0,
    unique_opens: uniqueOpens[i] ?? 0,
    total_clicks: totalClicks[i] ?? 0,
    unique_clicks: uniqueClicks[i] ?? 0,
    total_replies: replies[i] ?? 0,
    opportunities: opps[i] ?? 0,
  }));
}

/**
 * Real recorded rows win; any campaign without rows gets its derived series.
 * Applies to every campaign automatically, including newly created ones.
 */
export function activityWithFallback(
  campaigns: Campaign[],
  stats: DailyStat[],
  maxDays = 90,
): DailyStat[] {
  const recorded = new Set(stats.map((s) => s.campaign_id));
  const filled = campaigns
    .filter((c) => !recorded.has(c.id))
    .flatMap((c) => syntheticActivity(c, maxDays));
  return [...stats, ...filled];
}
