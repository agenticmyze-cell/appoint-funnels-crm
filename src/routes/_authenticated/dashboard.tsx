import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  listCampaigns,
  listClients,
  listDailyStats,
  listOpportunities,
  listReplies,
  listTestimonials,
  listScreenshots,
} from "@/lib/api";
import { useScope, PageHeader } from "@/components/app/AppShell";
import { KpiCard, Section, StatusBadge, EmptyState } from "@/components/app/primitives";
import { CampaignTable } from "@/components/app/CampaignTable";
import {
  MetricChart,
  MetricLegend,
  RangeTabs,
  type MetricKey,
} from "@/components/app/MetricChart";
import { money, num, pct, relative } from "@/lib/format";
import { totalsOf, totalsOpenRate, totalsReplyRate } from "@/lib/metrics";
import { ResultsProof } from "@/components/app/ResultsProof";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Appoint Funnels CRM" },
      {
        name: "description",
        content: "Live agency and client performance: sent volume, replies, opportunities and pipeline.",
      },
      { property: "og:title", content: "Dashboard — Appoint Funnels CRM" },
      { property: "og:description", content: "Live agency and client outbound performance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { clientId, isAdmin } = useScope();
  const [range, setRange] = useState("30");
  const [metrics, setMetrics] = useState<MetricKey[]>(["sent", "total_opens", "total_replies"]);

  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns", clientId],
    queryFn: () => listCampaigns(clientId ?? undefined),
  });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: listClients });
  const { data: replies = [] } = useQuery({
    queryKey: ["replies", clientId],
    queryFn: () => listReplies({ clientId: clientId ?? undefined }),
  });
  const { data: opportunities = [] } = useQuery({
    queryKey: ["opportunities", clientId],
    queryFn: () => listOpportunities(clientId ?? undefined),
  });
  const ids = campaigns.map((c) => c.id);
  const { data: stats = [] } = useQuery({
    queryKey: ["daily", ids.join(","), range],
    enabled: ids.length > 0,
    queryFn: () => listDailyStats(ids, Number(range)),
  });
  const { data: testimonials = [] } = useQuery({
    queryKey: ["testimonials", clientId],
    queryFn: () => listTestimonials(clientId ?? undefined),
  });
  const { data: screenshots = [] } = useQuery({
    queryKey: ["screenshots", clientId],
    queryFn: () => listScreenshots(clientId ?? undefined),
  });

  const t = totalsOf(campaigns);
  const client = clients.find((c) => c.id === clientId);

  return (
    <>
      <PageHeader
        title={client ? `${client.name} dashboard` : "Agency dashboard"}
        description={
          client
            ? `${client.industry ?? "Client"} · account manager ${client.account_manager ?? "—"}`
            : "Aggregated performance across every client and campaign."
        }
        actions={
          isAdmin ? (
            <Button size="sm" asChild>
              <Link to="/campaigns">Manage campaigns</Link>
            </Button>
          ) : null
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
        <KpiCard label="Active campaigns" value={num(campaigns.filter((c) => c.status === "active").length)} sub={`of ${num(t.campaigns)}`} />
        <KpiCard label="Leads" value={num(t.leads)} />
        <KpiCard label="Emails sent" value={num(t.sent)} />
        <KpiCard label="Replies" value={num(t.replies)} sub={totalsReplyRate(t)} />
        <KpiCard label="Opportunities" value={num(t.opportunities)} sub={money(t.pipeline)} />
        <KpiCard label="Meetings booked" value={num(t.meetings)} sub={`${num(t.won)} won`} />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-3">
        <Section
          className="xl:col-span-2"
          title="Performance"
          actions={<RangeTabs value={range} onChange={setRange} />}
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
              <MetricChart stats={stats} metrics={metrics} />
            ) : (
              <EmptyState title="No activity in this range" />
            )}
          </div>
        </Section>

        <Section title="Rates">
          <div className="divide-y divide-border">
            <Rate label="Open rate" value={totalsOpenRate(t)} />
            <Rate label="Reply rate" value={totalsReplyRate(t)} />
            <Rate
              label="Opportunity rate"
              value={t.sent ? pct((t.opportunities / t.sent) * 100) : "0.00%"}
            />
            <Rate label="Pipeline value" value={money(t.pipeline)} />
            <Rate label="Revenue won" value={money(t.revenue)} />
            <Rate label="Total clicks" value={num(t.clicks)} />
          </div>
        </Section>
      </div>

      <div className="mt-3">
        <Section
          title="Campaigns"
          actions={
            <Link to="/campaigns" className="text-[12px] font-semibold text-primary">
              View all
            </Link>
          }
        >
          {campaigns.length ? (
            <CampaignTable campaigns={campaigns.slice(0, 6)} clients={clients} showClient={!clientId} />
          ) : (
            <EmptyState title="No campaigns yet" description="Create a campaign to start tracking outbound performance." />
          )}
        </Section>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Section
          title="Recent replies"
          actions={
            <Link to="/inbox" className="text-[12px] font-semibold text-primary">
              Open inbox
            </Link>
          }
        >
          <div className="divide-y divide-border">
            {replies.slice(0, 6).map((r) => (
              <div key={r.id} className="flex items-start gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-semibold text-foreground">
                      {r.lead_name ?? r.lead_email}
                    </p>
                    <StatusBadge status={r.classification} />
                  </div>
                  <p className="truncate text-[12px] text-muted-foreground">{r.subject}</p>
                </div>
                <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                  {relative(r.received_at)}
                </span>
              </div>
            ))}
            {!replies.length && <EmptyState title="No replies yet" />}
          </div>
        </Section>

        <Section
          title="Opportunities"
          actions={
            <Link to="/opportunities" className="text-[12px] font-semibold text-primary">
              View all
            </Link>
          }
        >
          <div className="divide-y divide-border">
            {opportunities.slice(0, 6).map((o) => (
              <div key={o.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-foreground">
                    {o.lead_name ?? "Opportunity"}
                  </p>
                  <p className="truncate text-[12px] text-muted-foreground">{o.company}</p>
                </div>
                <StatusBadge status={o.stage} />
                <span className="num text-[13px] font-semibold">{money(o.value)}</span>
              </div>
            ))}
            {!opportunities.length && <EmptyState title="No opportunities yet" />}
          </div>
        </Section>
      </div>

      {clientId && (
        <div className="mt-3">
          <ResultsProof
            clientName={client?.name ?? "Client"}
            screenshots={screenshots}
            testimonial={testimonials[0]}
            totals={t}
          />
        </div>
      )}
    </>
  );
}

function Rate({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-[11px]">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="num text-[14px] font-semibold text-foreground">{value}</span>
    </div>
  );
}
