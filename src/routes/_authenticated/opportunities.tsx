import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  deleteOpportunity,
  listCampaigns,
  listClients,
  listOpportunities,
  upsertOpportunity,
  type Opportunity,
} from "@/lib/api";
import { PageHeader, useScope } from "@/components/app/AppShell";
import { EmptyState, KpiCard, Section, StatusBadge } from "@/components/app/primitives";
import { ConfirmDelete, RecordDialog, type Field } from "@/components/app/RecordDialog";
import { Button } from "@/components/ui/button";
import { money, num, shortDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities — Appoint Funnels CRM" },
      { name: "description", content: "Pipeline of qualified opportunities, stages and expected close dates." },
      { property: "og:title", content: "Opportunities — Appoint Funnels CRM" },
      { property: "og:description", content: "Track pipeline value and deal stages per client." },
    ],
  }),
  component: OpportunitiesPage,
});

const STAGES = ["qualified", "meeting_booked", "proposal", "negotiation", "won", "lost"];

function OpportunitiesPage() {
  const { clientId, isAdmin } = useScope();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [deleting, setDeleting] = useState<Opportunity | null>(null);

  const { data: rows = [] } = useQuery({
    queryKey: ["opportunities", clientId],
    queryFn: () => listOpportunities(clientId ?? undefined),
  });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: listClients });
  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns", clientId],
    queryFn: () => listCampaigns(clientId ?? undefined),
  });

  const total = rows.reduce((a, o) => a + Number(o.value), 0);
  const won = rows.filter((o) => o.stage === "won");

  const fields: Field[] = [
    { name: "lead_name", label: "Contact", required: true },
    { name: "company", label: "Company" },
    {
      name: "client_id",
      label: "Client",
      type: "select",
      required: true,
      options: clients.map((c) => ({ value: c.id, label: c.name })),
    },
    {
      name: "campaign_id",
      label: "Campaign",
      type: "select",
      options: campaigns.map((c) => ({ value: c.id, label: c.name })),
    },
    { name: "value", label: "Value", type: "number" },
    { name: "stage", label: "Stage", type: "select", options: STAGES.map((s) => ({ value: s, label: s.replace(/_/g, " ") })) },
    { name: "expected_close_date", label: "Expected close", type: "date" },
    { name: "notes", label: "Notes", type: "textarea", span: 2 },
  ];

  const save = useMutation({
    mutationFn: (v: Record<string, unknown>) =>
      upsertOpportunity({
        ...(editing ? { id: editing.id } : {}),
        lead_name: String(v["lead_name"]),
        company: (v["company"] as string) || null,
        client_id: String(v["client_id"]),
        campaign_id: (v["campaign_id"] as string) || null,
        value: Number(v["value"] ?? 0),
        stage: (v["stage"] || "qualified") as Opportunity["stage"],
        expected_close_date: (v["expected_close_date"] as string) || null,
        notes: (v["notes"] as string) || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["opportunities"] });
      toast.success("Opportunity saved");
    },
  });

  return (
    <>
      <PageHeader
        title="Opportunities"
        description={`${rows.length} opportunities · ${money(total)} pipeline`}
        actions={
          isAdmin ? (
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> Add opportunity
            </Button>
          ) : null
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Open pipeline" value={money(rows.filter((o) => !["won", "lost"].includes(o.stage)).reduce((a, o) => a + Number(o.value), 0))} />
        <KpiCard label="Won" value={num(won.length)} sub={money(won.reduce((a, o) => a + Number(o.value), 0))} />
        <KpiCard label="Total opportunities" value={num(rows.length)} />
        <KpiCard label="Total value" value={money(total)} />
      </div>

      <div className="mt-3">
        <Section>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-[13px]">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  <th className="px-4 py-2">Contact</th>
                  <th className="px-3 py-2">Company</th>
                  <th className="px-3 py-2">Client</th>
                  <th className="px-3 py-2">Campaign</th>
                  <th className="px-3 py-2">Stage</th>
                  <th className="px-3 py-2 text-right">Value</th>
                  <th className="px-3 py-2">Expected close</th>
                  <th className="w-24" />
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-b-0 hover:bg-muted/40">
                    <td className="px-4 py-2.5 font-medium">{o.lead_name ?? "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{o.company ?? "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {clients.find((c) => c.id === o.client_id)?.name ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {campaigns.find((c) => c.id === o.campaign_id)?.name ?? "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={o.stage} />
                    </td>
                    <td className="num px-3 py-2.5 text-right font-semibold">{money(o.value)}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {shortDate(o.expected_close_date)}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {isAdmin && (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="text-[12px] font-semibold text-primary"
                            onClick={() => setEditing(o)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-[12px] font-semibold text-destructive"
                            onClick={() => setDeleting(o)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && <EmptyState title="No opportunities yet" />}
          </div>
        </Section>
      </div>

      <RecordDialog
        open={creating || !!editing}
        onOpenChange={(o) => {
          if (!o) {
            setCreating(false);
            setEditing(null);
          }
        }}
        title={editing ? "Edit opportunity" : "New opportunity"}
        fields={fields}
        initial={
          editing
            ? (editing as unknown as Record<string, unknown>)
            : { stage: "qualified", client_id: clientId ?? clients[0]?.id ?? "" }
        }
        onSubmit={async (v) => {
          await save.mutateAsync(v);
        }}
      />

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        label={deleting?.lead_name ?? "opportunity"}
        onConfirm={async () => {
          if (deleting) await deleteOpportunity(deleting.id);
          qc.invalidateQueries({ queryKey: ["opportunities"] });
        }}
      />
    </>
  );
}
