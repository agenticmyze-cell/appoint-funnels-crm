import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  deleteLead,
  insertLeads,
  listCampaigns,
  listClients,
  listLeads,
  logAudit,
  updateLead,
  type Lead,
} from "@/lib/api";
import { PageHeader, useScope } from "@/components/app/AppShell";
import { EmptyState, Section, StatusBadge } from "@/components/app/primitives";
import { ConfirmDelete, RecordDialog, type Field } from "@/components/app/RecordDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { relative } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({
    meta: [
      { title: "Leads — Appoint Funnels CRM" },
      {
        name: "description",
        content: "Search, filter and manage every lead across campaigns with status and activity tracking.",
      },
      { property: "og:title", content: "Leads — Appoint Funnels CRM" },
      { property: "og:description", content: "Lead database with campaign, status and activity filters." },
    ],
  }),
  component: LeadsPage,
});

const LEAD_STATUSES = [
  "new",
  "contacted",
  "opened",
  "replied",
  "interested",
  "not_interested",
  "meeting_booked",
  "opportunity",
  "won",
  "lost",
];

const PAGE = 25;

function LeadsPage() {
  const { clientId, isAdmin } = useScope();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [campaign, setCampaign] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Lead | null>(null);

  const { data: leads = [] } = useQuery({
    queryKey: ["leads", clientId],
    queryFn: () => listLeads({ clientId: clientId ?? undefined }),
  });
  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns", clientId],
    queryFn: () => listCampaigns(clientId ?? undefined),
  });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: listClients });

  const filtered = useMemo(
    () =>
      leads.filter((l) => {
        const hay = `${l.email} ${l.first_name ?? ""} ${l.last_name ?? ""} ${l.company ?? ""} ${l.location ?? ""}`.toLowerCase();
        return (
          (!q || hay.includes(q.toLowerCase())) &&
          (status === "all" || l.status === status) &&
          (campaign === "all" || l.campaign_id === campaign)
        );
      }),
    [leads, q, status, campaign],
  );

  const visible = filtered.slice(0, page * PAGE);

  const fields: Field[] = [
    { name: "email", label: "Email", type: "email", required: true },
    {
      name: "client_id",
      label: "Client",
      type: "select",
      required: true,
      options: clients.map((c) => ({ value: c.id, label: c.name })),
    },
    { name: "first_name", label: "First name" },
    { name: "last_name", label: "Last name" },
    { name: "company", label: "Company" },
    { name: "website", label: "Website" },
    { name: "phone", label: "Phone" },
    { name: "location", label: "Location" },
    { name: "industry", label: "Industry" },
    {
      name: "campaign_id",
      label: "Campaign",
      type: "select",
      options: campaigns.map((c) => ({ value: c.id, label: c.name })),
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: LEAD_STATUSES.map((s) => ({ value: s, label: s.replace(/_/g, " ") })),
    },
    { name: "notes", label: "Notes", type: "textarea", span: 2 },
  ];

  const save = useMutation({
    mutationFn: async (v: Record<string, unknown>) => {
      const row = {
        email: String(v["email"]),
        client_id: String(v["client_id"]),
        first_name: (v["first_name"] as string) || null,
        last_name: (v["last_name"] as string) || null,
        company: (v["company"] as string) || null,
        website: (v["website"] as string) || null,
        phone: (v["phone"] as string) || null,
        location: (v["location"] as string) || null,
        industry: (v["industry"] as string) || null,
        campaign_id: (v["campaign_id"] as string) || null,
        status: (v["status"] || "new") as Lead["status"],
        notes: (v["notes"] as string) || null,
      };
      if (editing) await updateLead(editing.id, row);
      else await insertLeads([row]);
      if (isAdmin)
        await logAudit([
          {
            action: editing ? "update" : "create",
            entity_type: "lead",
            entity_id: editing?.id ?? null,
            entity_label: row.email,
          },
        ]);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead saved");
    },
  });

  const remove = useMutation({
    mutationFn: async (l: Lead) => {
      await deleteLead(l.id);
      if (isAdmin)
        await logAudit([
          { action: "delete", entity_type: "lead", entity_id: l.id, entity_label: l.email },
        ]);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead deleted");
    },
  });

  return (
    <>
      <PageHeader
        title="Leads"
        description={`${filtered.length} lead${filtered.length === 1 ? "" : "s"} in view`}
        actions={
          isAdmin ? (
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> Add lead
            </Button>
          ) : null
        }
      />

      <Section>
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2.5">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-8 pl-8 text-[13px]"
              placeholder="Search leads"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={campaign}
            onValueChange={(v) => {
              setCampaign(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[200px] text-[13px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All campaigns</SelectItem>
              {campaigns.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[160px] text-[13px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {LEAD_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                <th className="px-4 py-2">Lead</th>
                <th className="px-3 py-2">Company</th>
                <th className="px-3 py-2">Campaign</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Last activity</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {visible.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-b-0 hover:bg-muted/40">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-foreground">
                      {[l.first_name, l.last_name].filter(Boolean).join(" ") || l.email}
                    </p>
                    <p className="text-[12px] text-muted-foreground">{l.email}</p>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{l.company ?? "—"}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {campaigns.find((c) => c.id === l.campaign_id)?.name ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{l.location ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{relative(l.last_activity_at)}</td>
                  <td className="pr-3">
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <MoreHorizontal className="size-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditing(l)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleting(l)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <EmptyState title="No leads match" description="Try a different search or filter." />}
        </div>

        {visible.length < filtered.length && (
          <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
            <span className="text-[12px] text-muted-foreground">
              Showing {visible.length} of {filtered.length}
            </span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
              Load more
            </Button>
          </div>
        )}
      </Section>

      <RecordDialog
        open={creating || !!editing}
        onOpenChange={(o) => {
          if (!o) {
            setCreating(false);
            setEditing(null);
          }
        }}
        title={editing ? "Edit lead" : "Add lead"}
        fields={fields}
        initial={
          editing
            ? (editing as unknown as Record<string, unknown>)
            : { status: "new", client_id: clientId ?? clients[0]?.id ?? "" }
        }
        onSubmit={async (v) => {
          await save.mutateAsync(v);
        }}
      />

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        label={deleting?.email ?? "lead"}
        onConfirm={async () => {
          if (deleting) await remove.mutateAsync(deleting);
        }}
      />
    </>
  );
}
