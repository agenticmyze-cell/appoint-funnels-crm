import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Quote } from "lucide-react";
import { toast } from "sonner";
import {
  deleteTestimonial,
  listClients,
  listTestimonials,
  upsertTestimonial,
  type Testimonial,
} from "@/lib/api";
import { PageHeader, useScope } from "@/components/app/AppShell";
import { EmptyState, Section, StoredImage } from "@/components/app/primitives";
import { ConfirmDelete, RecordDialog, type Field } from "@/components/app/RecordDialog";
import { Button } from "@/components/ui/button";
import { money, num } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/testimonials")({
  head: () => ({
    meta: [
      { title: "Testimonials — Appoint Funnels CRM" },
      { name: "description", content: "Client testimonials and headline results used as social proof." },
      { property: "og:title", content: "Testimonials — Appoint Funnels CRM" },
      { property: "og:description", content: "Client quotes and campaign result summaries." },
    ],
  }),
  component: TestimonialsPage,
});

function TestimonialsPage() {
  const { clientId, isAdmin } = useScope();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState<Testimonial | null>(null);

  const { data: rows = [] } = useQuery({
    queryKey: ["testimonials", clientId],
    queryFn: () => listTestimonials(clientId ?? undefined),
  });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: listClients });

  const fields: Field[] = [
    { name: "client_name", label: "Person / client name", required: true },
    { name: "company", label: "Company" },
    {
      name: "client_id",
      label: "Client account",
      type: "select",
      options: clients.map((c) => ({ value: c.id, label: c.name })),
    },
    { name: "industry", label: "Industry" },
    { name: "quote", label: "Quote", type: "textarea", span: 2 },
    { name: "result_headline", label: "Result headline", span: 2 },
    { name: "result_description", label: "Result description", type: "textarea", span: 2 },
    { name: "leads", label: "Leads", type: "number" },
    { name: "emails_sent", label: "Emails sent", type: "number" },
    { name: "replies", label: "Replies", type: "number" },
    { name: "opportunities", label: "Opportunities", type: "number" },
    { name: "opportunity_value", label: "Opportunity value", type: "number" },
    { name: "meetings", label: "Meetings", type: "number" },
    { name: "revenue", label: "Revenue", type: "number" },
    { name: "featured", label: "Featured", type: "switch" },
    { name: "photo_url", label: "Photo", type: "image", span: 2 },
  ];

  const save = useMutation({
    mutationFn: (v: Record<string, unknown>) =>
      upsertTestimonial({
        ...(editing ? { id: editing.id } : {}),
        client_name: String(v["client_name"]),
        company: (v["company"] as string) || null,
        client_id: (v["client_id"] as string) || null,
        industry: (v["industry"] as string) || null,
        quote: (v["quote"] as string) || null,
        result_headline: (v["result_headline"] as string) || null,
        result_description: (v["result_description"] as string) || null,
        leads: Number(v["leads"] ?? 0),
        emails_sent: Number(v["emails_sent"] ?? 0),
        replies: Number(v["replies"] ?? 0),
        opportunities: Number(v["opportunities"] ?? 0),
        opportunity_value: Number(v["opportunity_value"] ?? 0),
        meetings: Number(v["meetings"] ?? 0),
        revenue: Number(v["revenue"] ?? 0),
        featured: !!v["featured"],
        photo_url: (v["photo_url"] as string) || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("Testimonial saved");
    },
  });

  return (
    <>
      <PageHeader
        title="Testimonials"
        description={`${rows.length} testimonial${rows.length === 1 ? "" : "s"}`}
        actions={
          isAdmin ? (
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> Add testimonial
            </Button>
          ) : null
        }
      />

      {rows.length ? (
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {rows.map((t) => (
            <div key={t.id} className="panel flex flex-col p-4">
              <Quote className="size-4 text-primary" />
              <blockquote className="mt-2 flex-1 text-[13px] leading-relaxed text-foreground">
                {t.quote}
              </blockquote>
              <div className="mt-3 flex items-center gap-2.5">
                <StoredImage
                  path={t.photo_url}
                  alt={t.client_name ?? "Client"}
                  className="size-8 rounded-full border border-border object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold">{t.client_name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {t.company ?? t.industry}
                  </p>
                </div>
              </div>
              {t.result_headline && (
                <div className="mt-3 rounded-md border border-border bg-muted/50 p-2.5">
                  <p className="text-[12px] font-semibold">{t.result_headline}</p>
                  <p className="num mt-1 text-[11px] text-muted-foreground">
                    {num(t.emails_sent)} sent · {num(t.replies)} replies · {num(t.opportunities)} opps ·{" "}
                    {money(t.opportunity_value)}
                  </p>
                </div>
              )}
              {isAdmin && (
                <div className="mt-3 flex gap-3">
                  <button className="text-[12px] font-semibold text-primary" onClick={() => setEditing(t)}>
                    Edit
                  </button>
                  <button
                    className="text-[12px] font-semibold text-destructive"
                    onClick={() => setDeleting(t)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Section>
          <EmptyState title="No testimonials yet" />
        </Section>
      )}

      <RecordDialog
        open={creating || !!editing}
        onOpenChange={(o) => {
          if (!o) {
            setCreating(false);
            setEditing(null);
          }
        }}
        title={editing ? "Edit testimonial" : "New testimonial"}
        fields={fields}
        initial={
          editing
            ? (editing as unknown as Record<string, unknown>)
            : { featured: false, client_id: clientId ?? "" }
        }
        onSubmit={async (v) => {
          await save.mutateAsync(v);
        }}
      />

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        label={deleting?.client_name ?? "testimonial"}
        onConfirm={async () => {
          if (deleting) await deleteTestimonial(deleting.id);
          qc.invalidateQueries({ queryKey: ["testimonials"] });
        }}
      />
    </>
  );
}
