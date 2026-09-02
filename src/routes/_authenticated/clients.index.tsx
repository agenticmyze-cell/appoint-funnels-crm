import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { deleteClient, listCampaigns, listClients, upsertClient, type Client } from "@/lib/api";
import { PageHeader, useScope } from "@/components/app/AppShell";
import { EmptyState, Section, StatusBadge } from "@/components/app/primitives";
import { ConfirmDelete, RecordDialog, type Field } from "@/components/app/RecordDialog";
import { Button } from "@/components/ui/button";
import { money, num, shortDate } from "@/lib/format";
import { totalsOf } from "@/lib/metrics";

export const Route = createFileRoute("/_authenticated/clients/")({
  head: () => ({
    meta: [
      { title: "Clients — Appoint Funnels CRM" },
      { name: "description", content: "Agency client accounts with campaign counts, pipeline and status." },
      { property: "og:title", content: "Clients — Appoint Funnels CRM" },
      { property: "og:description", content: "Manage every client account in one place." },
    ],
  }),
  component: ClientsPage,
});

function ClientsPage() {
  const { isAdmin } = useScope();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState<Client | null>(null);

  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: listClients });
  const { data: campaigns = [] } = useQuery({ queryKey: ["campaigns", null], queryFn: () => listCampaigns() });

  const fields: Field[] = [
    { name: "name", label: "Client name", required: true },
    { name: "company", label: "Company" },
    { name: "industry", label: "Industry" },
    { name: "status", label: "Status", type: "select", options: ["active", "paused", "inactive"].map((s) => ({ value: s, label: s })) },
    { name: "contact_name", label: "Contact name" },
    { name: "contact_email", label: "Contact email", type: "email" },
    { name: "phone", label: "Phone" },
    { name: "website", label: "Website" },
    { name: "account_manager", label: "Account manager" },
    { name: "joined_date", label: "Joined", type: "date" },
    { name: "logo_url", label: "Logo", type: "image", span: 2 },
    { name: "notes", label: "Notes", type: "textarea", span: 2 },
  ];

  const save = useMutation({
    mutationFn: (v: Record<string, unknown>) =>
      upsertClient({
        ...(editing ? { id: editing.id } : {}),
        name: String(v["name"]),
        company: (v["company"] as string) || null,
        industry: (v["industry"] as string) || null,
        status: (v["status"] || "active") as Client["status"],
        contact_name: (v["contact_name"] as string) || null,
        contact_email: (v["contact_email"] as string) || null,
        phone: (v["phone"] as string) || null,
        website: (v["website"] as string) || null,
        account_manager: (v["account_manager"] as string) || null,
        ...(v["joined_date"] ? { joined_date: String(v["joined_date"]) } : {}),
        logo_url: (v["logo_url"] as string) || null,
        notes: (v["notes"] as string) || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client saved");
    },
  });

  return (
    <>
      <PageHeader
        title="Clients"
        description={`${clients.length} account${clients.length === 1 ? "" : "s"}`}
        actions={
          isAdmin ? (
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> Add client
            </Button>
          ) : null
        }
      />

      <Section>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                <th className="px-4 py-2">Client</th>
                <th className="px-3 py-2">Industry</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Campaigns</th>
                <th className="px-3 py-2 text-right">Sent</th>
                <th className="px-3 py-2 text-right">Replies</th>
                <th className="px-3 py-2 text-right">Pipeline</th>
                <th className="px-3 py-2">Joined</th>
                <th className="w-24" />
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const t = totalsOf(campaigns.filter((x) => x.client_id === c.id));
                return (
                  <tr key={c.id} className="border-b border-border last:border-b-0 hover:bg-muted/40">
                    <td className="px-4 py-2.5">
                      <Link
                        to="/clients/$id"
                        params={{ id: c.id }}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {c.name}
                      </Link>
                      <p className="text-[12px] text-muted-foreground">{c.contact_email}</p>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{c.industry ?? "—"}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="num px-3 py-2.5 text-right">{num(t.campaigns)}</td>
                    <td className="num px-3 py-2.5 text-right">{num(t.sent)}</td>
                    <td className="num px-3 py-2.5 text-right">{num(t.replies)}</td>
                    <td className="num px-3 py-2.5 text-right">{money(t.pipeline)}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{shortDate(c.joined_date)}</td>
                    <td className="px-3 py-2.5 text-right">
                      {isAdmin && (
                        <div className="flex justify-end gap-2">
                          <button className="text-[12px] font-semibold text-primary" onClick={() => setEditing(c)}>
                            Edit
                          </button>
                          <button
                            className="text-[12px] font-semibold text-destructive"
                            onClick={() => setDeleting(c)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!clients.length && <EmptyState title="No clients yet" />}
        </div>
      </Section>

      <RecordDialog
        open={creating || !!editing}
        onOpenChange={(o) => {
          if (!o) {
            setCreating(false);
            setEditing(null);
          }
        }}
        title={editing ? "Edit client" : "New client"}
        fields={fields}
        initial={editing ? (editing as unknown as Record<string, unknown>) : { status: "active" }}
        onSubmit={async (v) => {
          await save.mutateAsync(v);
        }}
      />

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        label={deleting?.name ?? "client"}
        onConfirm={async () => {
          if (deleting) await deleteClient(deleting.id);
          qc.invalidateQueries({ queryKey: ["clients"] });
        }}
      />
    </>
  );
}
