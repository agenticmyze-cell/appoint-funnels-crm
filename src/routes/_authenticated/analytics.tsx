import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listCampaigns, listClients, listDailyStats } from "@/lib/api";
import { PageHeader, useScope } from "@/components/app/AppShell";
import { EmptyState, KpiCard, Section } from "@/components/app/primitives";
import {
  GrainTabs,
  MetricChart,
  MetricLegend,
  RangeTabs,
  type Grain,
  type MetricKey,
} from "@/components/app/MetricChart";
import { CampaignTable } from "@/components/app/CampaignTable";
import { money, num, pct } from "@/lib/format";
import { totalsOf, totalsOpenRate, totalsReplyRate } from "@/lib/metrics";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Appoint Funnels CRM" },
      {
        name: "description",
        content: "Outbound analytics with selectable metrics, date grain and per-campaign breakdown.",
      },
      { property: "og:title", content: "Analytics — Appoint Funnels CRM" },
      { property: "og:description", content: "Selectable metric graphs and campaign comparisons." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { clientId } = useScope();
  const [range, setRange] = useState("30");
  const [grain, setGrain] = useState<Grain>("day");
  const [metrics, setMetrics] = useState<MetricKey[]>(["sent", "total_opens", "total_replies", "opportunities"]);

  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns", clientId],
    queryFn: () => listCampaigns(clientId ?? undefined),
  });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: listClients });
  const ids = campaigns.map((c) => c.id);
  const { data: stats = [] } = useQuery({
    queryKey: ["daily", ids.join(","), range],
    enabled: ids.length > 0,
    queryFn: () => listDailyStats(ids, Number(range)),
  });

  const t = totalsOf(campaigns);

  return (
    <>
      <PageHeader title="Analytics" description="Performance across the selected scope." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Emails sent" value={num(t.sent)} />
        <KpiCard label="Open rate" value={totalsOpenRate(t)} />
        <KpiCard label="Reply rate" value={totalsReplyRate(t)} />
        <KpiCard label="Opportunities" value={num(t.opportunities)} />
        <KpiCard label="Pipeline" value={money(t.pipeline)} />
        <KpiCard label="Revenue" value={money(t.revenue)} sub={t.sent ? pct((t.won / Math.max(t.opportunities, 1)) * 100) + " win" : undefined} />
      </div>

      <div className="mt-3">
        <Section
          title="Metric explorer"
          actions={
            <div className="flex items-center gap-2">
              <GrainTabs value={grain} onChange={setGrain} />
              <RangeTabs value={range} onChange={setRange} />
            </div>
          }
        >
          <div className="px-4 pt-3">
            <MetricLegend
              selected={metrics}
              onToggle={(k) =>
                setMetrics((m) => (m.includes(k) ? m.filter((x) => x !== k) : [...m, k]))
              }
            />
          </div>
          <div className="px-2 pb-3 pt-2">
            {stats.length ? (
              <MetricChart stats={stats} metrics={metrics} grain={grain} height={320} />
            ) : (
              <EmptyState title="No activity in this range" />
            )}
          </div>
        </Section>
      </div>

      <div className="mt-3">
        <Section title="Campaign breakdown">
          {campaigns.length ? (
            <CampaignTable campaigns={campaigns} clients={clients} showClient={!clientId} />
          ) : (
            <EmptyState title="No campaigns" />
          )}
        </Section>
      </div>
    </>
  );
}
