import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyStat } from "@/lib/api";
import { cn } from "@/lib/utils";
import { num } from "@/lib/format";

export type MetricKey =
  | "sent"
  | "total_opens"
  | "unique_opens"
  | "total_replies"
  | "total_clicks"
  | "unique_clicks"
  | "opportunities";

export const METRICS: { key: MetricKey; label: string; color: string }[] = [
  { key: "sent", label: "Sent", color: "var(--color-primary)" },
  { key: "total_opens", label: "Total opens", color: "oklch(0.72 0.13 240)" },
  { key: "unique_opens", label: "Unique opens", color: "oklch(0.78 0.09 235)" },
  { key: "total_replies", label: "Total replies", color: "oklch(0.42 0.13 262)" },
  { key: "total_clicks", label: "Total clicks", color: "oklch(0.68 0.05 264)" },
  { key: "unique_clicks", label: "Unique clicks", color: "oklch(0.8 0.03 264)" },
  { key: "opportunities", label: "Opportunities", color: "oklch(0.5 0.05 264)" },
];

export const RANGES = [
  { key: "1", label: "Today", days: 1 },
  { key: "7", label: "7 days", days: 7 },
  { key: "30", label: "30 days", days: 30 },
  { key: "90", label: "90 days", days: 90 },
] as const;

export type Grain = "day" | "week" | "month";

function bucket(day: string, grain: Grain) {
  const d = new Date(day + "T00:00:00Z");
  if (grain === "day") return day;
  if (grain === "week") {
    const shift = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - shift);
    return d.toISOString().slice(0, 10);
  }
  return `${day.slice(0, 7)}-01`;
}

export function MetricChart({
  stats,
  metrics,
  grain = "day",
  height = 260,
}: {
  stats: DailyStat[];
  metrics: MetricKey[];
  grain?: Grain;
  height?: number;
}) {
  const data = useMemo(() => {
    const map = new Map<string, Record<string, number> & { day: string }>();
    for (const s of stats) {
      const key = bucket(s.day, grain);
      const row =
        map.get(key) ??
        ({
          day: key,
          sent: 0,
          total_opens: 0,
          unique_opens: 0,
          total_replies: 0,
          total_clicks: 0,
          unique_clicks: 0,
          opportunities: 0,
        } as Record<string, number> & { day: string });
      row.sent += s.sent;
      row.total_opens += s.total_opens;
      row.unique_opens += s.unique_opens;
      row.total_replies += s.total_replies;
      row.total_clicks += s.total_clicks;
      row.unique_clicks += s.unique_clicks;
      row.opportunities += s.opportunities;
      map.set(key, row);
    }
    return [...map.values()].sort((a, b) => a.day.localeCompare(b.day));
  }, [stats, grain]);

  const active = METRICS.filter((m) => metrics.includes(m.key));

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            {active.map((m) => (
              <linearGradient key={m.key} id={`fill-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={m.color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={m.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            tickFormatter={(v: string) =>
              new Date(v + "T00:00:00Z").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                timeZone: "UTC",
              })
            }
            minTickGap={28}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-panel)",
              fontSize: 12,
            }}
            labelFormatter={(v) =>
              new Date(String(v) + "T00:00:00Z").toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                timeZone: "UTC",
              })
            }
            formatter={(value, name) => [num(Number(value)), String(name)]}
          />
          {active.map((m) => (
            <Area
              key={m.key}
              type="monotone"
              dataKey={m.key}
              name={m.label}
              stroke={m.color}
              strokeWidth={2}
              fill={`url(#fill-${m.key})`}
              dot={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MetricLegend({
  selected,
  onToggle,
  available = METRICS.map((m) => m.key),
}: {
  selected: MetricKey[];
  onToggle: (key: MetricKey) => void;
  available?: MetricKey[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {METRICS.filter((m) => available.includes(m.key)).map((m) => {
        const on = selected.includes(m.key);
        return (
          <button
            key={m.key}
            type="button"
            onClick={() => onToggle(m.key)}
            className={cn(
              "flex items-center gap-1.5 text-[12px] transition-colors",
              on ? "text-foreground" : "text-muted-foreground/60",
            )}
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: on ? m.color : "var(--color-border-strong)" }}
            />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

export function RangeTabs({
  value,
  onChange,
  options = RANGES.map((r) => r.key),
}: {
  value: string;
  onChange: (v: string) => void;
  options?: readonly string[];
}) {
  return (
    <div className="inline-flex items-center rounded-md border border-border bg-card p-0.5">
      {RANGES.filter((r) => options.includes(r.key)).map((r) => (
        <button
          key={r.key}
          type="button"
          onClick={() => onChange(r.key)}
          className={cn(
            "rounded-[5px] px-2.5 py-1 text-[12px] font-medium transition-colors",
            value === r.key
              ? "bg-primary-soft text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

export function GrainTabs({ value, onChange }: { value: Grain; onChange: (v: Grain) => void }) {
  const [hover, setHover] = useState<Grain | null>(null);
  return (
    <div className="inline-flex items-center rounded-md border border-border bg-card p-0.5">
      {(["day", "week", "month"] as Grain[]).map((g) => (
        <button
          key={g}
          type="button"
          onMouseEnter={() => setHover(g)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onChange(g)}
          className={cn(
            "rounded-[5px] px-2.5 py-1 text-[12px] font-medium capitalize transition-colors",
            value === g
              ? "bg-primary-soft text-primary"
              : hover === g
                ? "text-foreground"
                : "text-muted-foreground",
          )}
        >
          {g}
        </button>
      ))}
    </div>
  );
}
