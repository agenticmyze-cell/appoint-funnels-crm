import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listCampaigns, listClients, listScreenshots, listTestimonials } from "@/lib/api";
import { PageHeader, useScope } from "@/components/app/AppShell";
import { EmptyState, Section } from "@/components/app/primitives";
import { ResultsProof } from "@/components/app/ResultsProof";
import { totalsOf } from "@/lib/metrics";

export const Route = createFileRoute("/_authenticated/results")({
  head: () => ({
    meta: [
      { title: "Results & Proof — Appoint Funnels CRM" },
      { name: "description", content: "Client results, proof screenshots, testimonials and performance summaries." },
      { property: "og:title", content: "Results & Proof — Appoint Funnels CRM" },
      { property: "og:description", content: "Screenshots, testimonials and performance results per client." },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const { clientId } = useScope();
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: listClients });
  const { data: campaigns = [] } = useQuery({ queryKey: ["campaigns", null], queryFn: () => listCampaigns() });
  const { data: screenshots = [] } = useQuery({ queryKey: ["screenshots", null], queryFn: () => listScreenshots() });
  const { data: testimonials = [] } = useQuery({ queryKey: ["testimonials", null], queryFn: () => listTestimonials() });

  const scoped = clientId ? clients.filter((c) => c.id === clientId) : clients;

  return (
    <>
      <PageHeader title="Results & Proof" description="Proof of performance for every client account." />
      {scoped.length ? (
        <div className="space-y-3">
          {scoped.map((c) => (
            <ResultsProof
              key={c.id}
              clientName={c.name}
              screenshots={screenshots.filter((s) => s.client_id === c.id)}
              testimonial={testimonials.find((t) => t.client_id === c.id)}
              totals={totalsOf(campaigns.filter((x) => x.client_id === c.id))}
            />
          ))}
        </div>
      ) : (
        <Section>
          <EmptyState title="No clients yet" />
        </Section>
      )}
    </>
  );
}
