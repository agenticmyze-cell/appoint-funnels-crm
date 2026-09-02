import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import {
  getClient,
  listCampaigns,
  listReplies,
  listScreenshots,
  listTestimonials,
} from "@/lib/api";
import { PageHeader } from "@/components/app/AppShell";
import { EmptyState, KpiCard, Section, StatusBadge } from "@/components/app/primitives";
import { CampaignTable } from "@/components/app/CampaignTable";
import { ResultsProof } from "@/components/app/ResultsProof";
import { money, num, relative } from "@/lib/format";
import { totalsOf, totalsReplyRate } from "@/lib/metrics";

export const Route = createFileRoute("/_authenticated/clients/$id")({
  head: () => ({
    meta: [
      { title: "Client overview — Appoint Funnels CRM" },
      { name: "description", content: "Client-specific campaigns, replies, pipeline and results & proof." },
      { property: "og:title", content: "Client overview — Appoint Funnels CRM" },
      { property: "og:description", content: "Everything for a single client account." },
    ],
  }),
  component: ClientDetail,
});

function ClientDetail() {
  const { id } = useParams({ from: "/_authenticated/clients/$id" });
  const { data: client } = useQuery({ queryKey: ["client", id], queryFn: () => getClient(id) });
  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns", id],
    queryFn: () => listCampaigns(id),
  });
  const { data: replies = [] } = useQuery({
    queryKey: ["replies", id],
    queryFn: () => listReplies({ clientId: id }),
  });
  const { data: testimonials = [] } = useQuery({
    queryKey: ["testimonials", id],
    queryFn: () => listTestimonials(id),
  });
  const { data: screenshots = [] } = useQuery({
    queryKey: ["screenshots", id],
    queryFn: () => listScreenshots(id),
  });

  if (!client) return <EmptyState title="Loading client…" />;
  const t = totalsOf(campaigns);

  return (
    <>
      <Link
        to="/clients"
        className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to clients
      </Link>

      <PageHeader
        title={client.name}
        description={`${client.industry ?? "Client"} · ${client.contact_name ?? "—"} · ${client.contact_email ?? "—"}`}
        actions={<StatusBadge status={client.status} />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Campaigns" value={num(t.campaigns)} />
        <KpiCard label="Leads" value={num(t.leads)} />
        <KpiCard label="Sent" value={num(t.sent)} />
        <KpiCard label="Replies" value={num(t.replies)} sub={totalsReplyRate(t)} />
        <KpiCard label="Opportunities" value={num(t.opportunities)} />
        <KpiCard label="Pipeline" value={money(t.pipeline)} />
      </div>

      <div className="mt-3">
        <Section title="Campaigns">
          {campaigns.length ? (
            <CampaignTable campaigns={campaigns} showClient={false} />
          ) : (
            <EmptyState title="No campaigns for this client" />
          )}
        </Section>
      </div>

      <div className="mt-3">
        <Section title="Recent replies">
          <div className="divide-y divide-border">
            {replies.slice(0, 8).map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-2.5">
                <p className="min-w-0 flex-1 truncate text-[13px]">
                  <span className="font-semibold">{r.lead_name ?? r.lead_email}</span>{" "}
                  <span className="text-muted-foreground">— {r.subject}</span>
                </p>
                <StatusBadge status={r.classification} />
                <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                  {relative(r.received_at)}
                </span>
              </div>
            ))}
            {!replies.length && <EmptyState title="No replies yet" />}
          </div>
        </Section>
      </div>

      <div className="mt-3">
        <ResultsProof
          clientName={client.name}
          screenshots={screenshots}
          testimonial={testimonials[0]}
          totals={t}
        />
      </div>
    </>
  );
}
