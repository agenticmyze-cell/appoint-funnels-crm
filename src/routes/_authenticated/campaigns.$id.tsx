import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { getCampaign, listClients, listDailyStats, listReplies, listSteps } from "@/lib/api";
import { PageHeader } from "@/components/app/AppShell";
import { EmptyState, KpiCard, ProgressCell, Section, StatusBadge } from "@/components/app/primitives";
import {
  MetricChart,
  MetricLegend,
  type MetricKey,
} from "@/components/app/MetricChart";
import { cn } from "@/lib/utils";
import { initials, money, num, pct, rate, shortDate } from "@/lib/format";
import { clickRateLabel, openRateLabel, replyRate } from "@/lib/metrics";
import { activityWithFallback } from "@/lib/activity";


export const Route = createFileRoute("/_authenticated/campaigns/$id")({
  head: () => ({
    meta: [
      { title: "Campaign analytics — Appoint Funnels CRM" },
      {
        name: "description",
        content: "Sequence started, open rate, click rate, replies and opportunities for a campaign.",
      },
      { property: "og:title", content: "Campaign analytics — Appoint Funnels CRM" },
      { property: "og:description", content: "Core performance metrics for a single outbound campaign." },
    ],
  }),
  component: CampaignDetail,
});

function CampaignDetail() {
  const { id } = useParams({ from: "/_authenticated/campaigns/$id" });

  const navigate = useNavigate();
  const [tab, setTab] = useState<"steps" | "replies">("steps");
  const [metrics, setMetrics] = useState<MetricKey[]>([
    "sent",
    "total_opens",
    "unique_opens",
    "total_replies",
  ]);

  const { data: campaign } = useQuery({ queryKey: ["campaign", id], queryFn: () => getCampaign(id) });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: listClients });
  const { data: steps = [] } = useQuery({ queryKey: ["steps", id], queryFn: () => listSteps(id) });
  const { data: stats = [] } = useQuery({
    queryKey: ["daily", id, "90"],
    queryFn: () => listDailyStats([id], 90),
  });
  const { data: replies = [] } = useQuery({
    queryKey: ["replies", "campaign", id],
    queryFn: () => listReplies({ campaignId: id }),
  });

  if (!campaign) return <EmptyState title="Loading campaign…" />;
  const client = clients.find((c) => c.id === campaign.client_id);
  const series = activityWithFallback([campaign], stats, 90);


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
            <ProgressCell value={campaign.progress} />
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiCard label="Sequence started" value={num(campaign.sequence_started)} />
        <KpiCard
          label="Open rate"
          value={openRateLabel(campaign)}
          muted={!campaign.open_rate_enabled}
          divider={campaign.open_rate_enabled}
          sub={campaign.open_rate_enabled ? num(campaign.unique_opens) : undefined}
        />
        <KpiCard
          label="Click rate"
          value={clickRateLabel(campaign)}
          muted={!campaign.click_rate_enabled}
          divider={campaign.click_rate_enabled}
          sub={campaign.click_rate_enabled ? num(campaign.unique_clicks) : undefined}
        />
        <KpiCard
          label="Replies"
          value={num(campaign.total_replies)}
          divider
          sub={pct(replyRate(campaign))}
        />
        <KpiCard
          label="Opportunities"
          value={num(campaign.opportunities)}
          divider
          sub={money(campaign.opportunity_value)}
        />
      </div>

      <div className="mt-3 rounded-lg border border-border bg-card">
        <div className="flex justify-end px-4 pt-3">
          <MetricLegend
            selected={metrics}
            onToggle={(k) =>
              setMetrics((m) => (m.includes(k) ? m.filter((x) => x !== k) : [...m, k]))
            }
          />
        </div>
        <div className="px-2 pb-3 pt-2">
          {series.length ? (
            <MetricChart stats={series} metrics={metrics} height={260} />
          ) : (
            <EmptyState title="No activity yet" />
          )}
        </div>
      </div>

      <div className="mt-3">
        <Section
          title={
            <div className="flex items-center gap-5">
              {(["steps", "replies"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={cn(
                    "-mb-[13px] border-b-2 pb-3 text-[13px] font-semibold transition-colors",
                    tab === t
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t === "steps" ? "Step Analytics" : `Replies (${replies.length})`}
                </button>
              ))}
            </div>
          }
        >
          {tab === "steps" ? (
            steps.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-2 text-left font-semibold">Step</th>
                      <th className="px-4 py-2 text-right font-semibold">Sent</th>
                      <th className="px-4 py-2 text-right font-semibold">Opened</th>
                      <th className="px-4 py-2 text-right font-semibold">Replied</th>
                      <th className="px-4 py-2 text-right font-semibold">Clicked</th>
                      <th className="px-4 py-2 text-right font-semibold">Opportunities</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {steps.map((s) => (
                      <tr key={s.id}>
                        <td className="px-4 py-2.5">
                          <p className="font-semibold text-foreground">Step {s.step_number}</p>
                          {s.subject && (
                            <p className="truncate text-[12px] text-muted-foreground">{s.subject}</p>
                          )}
                        </td>
                        <td className="num px-4 py-2.5 text-right">{num(s.sent)}</td>
                        <td className="num px-4 py-2.5 text-right">
                          {num(s.opened)}{" "}
                          <span className="text-muted-foreground">| {rate(s.opened, s.sent)}</span>
                        </td>
                        <td className="num px-4 py-2.5 text-right">
                          {num(s.replied)}{" "}
                          <span className="text-muted-foreground">| {rate(s.replied, s.sent)}</span>
                        </td>
                        <td className="num px-4 py-2.5 text-right">
                          {num(s.clicked)}{" "}
                          <span className="text-muted-foreground">| {rate(s.clicked, s.sent)}</span>
                        </td>
                        <td className="num px-4 py-2.5 text-right">{num(s.opportunities)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No steps configured" />
            )
          ) : replies.length ? (
            <div className="divide-y divide-border">
              {replies.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() =>
                    navigate({ to: "/inbox", search: { campaign: id, reply: r.id } })
                  }
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/60"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-bold text-muted-foreground">
                    {initials(r.lead_name ?? r.lead_email)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-foreground">
                      {r.lead_name ?? r.lead_email}
                    </p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {r.subject ?? r.body ?? "—"}
                    </p>
                  </div>
                  <StatusBadge status={r.classification} />
                </button>
              ))}
            </div>
          ) : (
            <EmptyState title="No replies yet" />
          )}
        </Section>
      </div>
    </>
  );
}

