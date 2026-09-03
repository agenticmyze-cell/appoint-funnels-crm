import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { getCampaign, listActivities, listClients, listDailyStats, listSteps } from "@/lib/api";
import { PageHeader } from "@/components/app/AppShell";
import { EmptyState, KpiCard, ProgressCell, Section, StatusBadge } from "@/components/app/primitives";
import {
  MetricChart,
  MetricLegend,
  type MetricKey,
} from "@/components/app/MetricChart";
import { cn } from "@/lib/utils";
import { dateTime, money, num, pct, rate, shortDate, titleCase } from "@/lib/format";
import { clickRateLabel, openRateLabel, replyRate } from "@/lib/metrics";


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

  const [tab, setTab] = useState<"steps" | "activity">("steps");
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
  const { data: activities = [] } = useQuery({
    queryKey: ["activities", id],
    queryFn: () => listActivities({ campaignId: id }),
  });

  if (!campaign) return <EmptyState title="Loading campaign…" />;
  const client = clients.find((c) => c.id === campaign.client_id);


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
    </>
  );
}
