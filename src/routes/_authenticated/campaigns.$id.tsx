import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  getCampaign,
  listActivities,
  listClients,
  listDailyStats,
  listLeads,
  listReplies,
  listSteps,
} from "@/lib/api";
import { PageHeader } from "@/components/app/AppShell";
import { EmptyState, KpiCard, ProgressCell, Section, StatusBadge } from "@/components/app/primitives";
import {
  GrainTabs,
  MetricChart,
  MetricLegend,
  RangeTabs,
  type Grain,
  type MetricKey,
} from "@/components/app/MetricChart";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { dateTime, money, num, pct, relative, shortDate, titleCase } from "@/lib/format";
import { clickRateLabel, openRateLabel, replyRate } from "@/lib/metrics";

export const Route = createFileRoute("/_authenticated/campaigns/$id")({
  head: () => ({
    meta: [
      { title: "Campaign analytics — Appoint Funnels CRM" },
      {
        name: "description",
        content: "Campaign KPIs, sequence step analytics, lead activity and reply history.",
      },
      { property: "og:title", content: "Campaign analytics — Appoint Funnels CRM" },
      { property: "og:description", content: "Deep-dive analytics for a single outbound campaign." },
    ],
  }),
  component: CampaignDetail,
});

function CampaignDetail() {
  const { id } = useParams({ from: "/_authenticated/campaigns/$id" });
  const [range, setRange] = useState("30");
  const [grain, setGrain] = useState<Grain>("day");
  const [metrics, setMetrics] = useState<MetricKey[]>(["sent", "total_opens", "total_replies"]);

  const { data: campaign } = useQuery({ queryKey: ["campaign", id], queryFn: () => getCampaign(id) });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: listClients });
  const { data: steps = [] } = useQuery({ queryKey: ["steps", id], queryFn: () => listSteps(id) });
  const { data: stats = [] } = useQuery({
    queryKey: ["daily", id, range],
    queryFn: () => listDailyStats([id], Number(range)),
  });
  const { data: leads = [] } = useQuery({
    queryKey: ["leads", "campaign", id],
    queryFn: () => listLeads({ campaignId: id }),
  });
  const { data: replies = [] } = useQuery({
    queryKey: ["replies", "campaign", id],
    queryFn: () => listReplies({ campaignId: id }),
  });
  const { data: activities = [] } = useQuery({
    queryKey: ["activities", id],
    queryFn: () => listActivities({ campaignId: id }),
  });

  if (!campaign) return <EmptyState title="Loading campaign…" />;
  const client = clients.find((c) => c.id === campaign.client_id);

  const availableMetrics: MetricKey[] = [
    "sent",
    ...(campaign.open_rate_enabled ? (["total_opens", "unique_opens"] as MetricKey[]) : []),
    ...(campaign.click_rate_enabled ? (["total_clicks", "unique_clicks"] as MetricKey[]) : []),
    "total_replies",
    "opportunities",
  ];

  return (
    <>
      <Link
        to="/campaigns"
        className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to campaigns
      </Link>

      <PageHeader
        title={campaign.name}
        description={`${client?.name ?? "Client"} · ${shortDate(campaign.start_date)} → ${
          campaign.end_date ? shortDate(campaign.end_date) : "ongoing"
        }`}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge status={campaign.status} />
            <StatusBadge status={campaign.metrics_mode} tone={campaign.metrics_mode === "manual" ? "warning" : "positive"} />
            <ProgressCell value={campaign.progress} />
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
        <KpiCard label="Leads" value={num(campaign.leads_count)} />
        <KpiCard label="Sequence started" value={num(campaign.sequence_started)} />
        <KpiCard label="Emails sent" value={num(campaign.emails_sent)} />
        <KpiCard label="Open rate" value={openRateLabel(campaign)} muted={!campaign.open_rate_enabled} sub={campaign.open_rate_enabled ? `${num(campaign.unique_opens)} unique` : undefined} />
        <KpiCard label="Click rate" value={clickRateLabel(campaign)} muted={!campaign.click_rate_enabled} sub={campaign.click_rate_enabled ? `${num(campaign.unique_clicks)} unique` : undefined} />
        <KpiCard label="Replies" value={num(campaign.total_replies)} sub={pct(replyRate(campaign))} />
        <KpiCard label="Opportunities" value={num(campaign.opportunities)} sub={money(campaign.opportunity_value)} />
      </div>

      <div className="mt-3">
        <Section
          title="Campaign performance"
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
              available={availableMetrics}
              onToggle={(k) =>
                setMetrics((m) => (m.includes(k) ? m.filter((x) => x !== k) : [...m, k]))
              }
            />
          </div>
          <div className="px-2 pb-3 pt-2">
            {stats.length ? (
              <MetricChart stats={stats} metrics={metrics} grain={grain} height={300} />
            ) : (
              <EmptyState title="No activity in this range" />
            )}
          </div>
        </Section>
      </div>

      <div className="mt-3">
        <Tabs defaultValue="steps">
          <TabsList>
            <TabsTrigger value="steps">Step Analytics</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
            <TabsTrigger value="replies">Replies ({replies.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="steps" className="mt-3">
            <Section>
              {steps.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-[13px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                        <th className="px-4 py-2">Step</th>
                        <th className="px-3 py-2">Subject</th>
                        <th className="px-3 py-2 text-right">Sent</th>
                        <th className="px-3 py-2 text-right">Opened</th>
                        <th className="px-3 py-2 text-right">Clicked</th>
                        <th className="px-3 py-2 text-right">Replied</th>
                        <th className="px-3 py-2 text-right">Opportunities</th>
                        <th className="px-3 py-2 text-right">Reply %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {steps.map((s) => (
                        <tr key={s.id} className="border-b border-border last:border-b-0">
                          <td className="px-4 py-2.5 font-semibold">Step {s.step_number}</td>
                          <td className="max-w-[280px] truncate px-3 py-2.5 text-muted-foreground">
                            {s.subject ?? "—"}
                          </td>
                          <td className="num px-3 py-2.5 text-right">{num(s.sent)}</td>
                          <td className="num px-3 py-2.5 text-right">
                            {campaign.open_rate_enabled ? num(s.opened) : "Disabled"}
                          </td>
                          <td className="num px-3 py-2.5 text-right">
                            {campaign.click_rate_enabled ? num(s.clicked) : "Disabled"}
                          </td>
                          <td className="num px-3 py-2.5 text-right">{num(s.replied)}</td>
                          <td className="num px-3 py-2.5 text-right">{num(s.opportunities)}</td>
                          <td className="num px-3 py-2.5 text-right">
                            {s.sent ? pct((s.replied / s.sent) * 100) : "0.00%"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No sequence steps" description="Add steps in the Admin Console." />
              )}
            </Section>
          </TabsContent>

          <TabsContent value="activity" className="mt-3">
            <Section>
              <div className="divide-y divide-border">
                {activities.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                    <StatusBadge status={a.activity_type} />
                    <p className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                      {a.description ?? titleCase(a.activity_type)}
                    </p>
                    <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                      {relative(a.created_at)}
                    </span>
                  </div>
                ))}
                {!activities.length && <EmptyState title="No activity recorded" />}
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="leads" className="mt-3">
            <Section>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-[13px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                      <th className="px-4 py-2">Lead</th>
                      <th className="px-3 py-2">Company</th>
                      <th className="px-3 py-2">Location</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Last activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((l) => (
                      <tr key={l.id} className="border-b border-border last:border-b-0">
                        <td className="px-4 py-2.5">
                          <p className="font-medium">
                            {[l.first_name, l.last_name].filter(Boolean).join(" ") || l.email}
                          </p>
                          <p className="text-[12px] text-muted-foreground">{l.email}</p>
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">{l.company ?? "—"}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{l.location ?? "—"}</td>
                        <td className="px-3 py-2.5">
                          <StatusBadge status={l.status} />
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">
                          {relative(l.last_activity_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!leads.length && <EmptyState title="No leads in this campaign" />}
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="replies" className="mt-3">
            <Section>
              <div className="divide-y divide-border">
                {replies.map((r) => (
                  <div key={r.id} className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold">{r.lead_name ?? r.lead_email}</p>
                      <StatusBadge status={r.classification} />
                      <span className="ml-auto text-[11px] text-muted-foreground">
                        {dateTime(r.received_at)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[13px] text-foreground">{r.subject}</p>
                    <p className="mt-1 line-clamp-2 text-[12px] text-muted-foreground">{r.body}</p>
                  </div>
                ))}
                {!replies.length && <EmptyState title="No replies yet" />}
              </div>
            </Section>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
