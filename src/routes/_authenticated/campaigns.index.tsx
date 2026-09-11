import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  deleteCampaign,
  listCampaigns,
  listClients,
  logAudit,
  upsertCampaign,
  type Campaign,
} from "@/lib/api";
import { PageHeader, useScope } from "@/components/app/AppShell";
import { EmptyState, Section } from "@/components/app/primitives";
import { CampaignTable } from "@/components/app/CampaignTable";
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

export const Route = createFileRoute("/_authenticated/campaigns/")({
  head: () => ({
    meta: [
      { title: "Campaigns — Appoint Funnels CRM" },
      {
        name: "description",
        content: "All outbound campaigns with status, progress, sent volume, replies and opportunities.",
      },
      { property: "og:title", content: "Campaigns — Appoint Funnels CRM" },
      { property: "og:description", content: "Campaign performance across every client account." },
    ],
  }),
  component: CampaignsPage,
});

const SORTS = [
  { value: "created", label: "Newest" },
  { value: "name", label: "Name" },
  { value: "sent", label: "Most sent" },
  { value: "replies", label: "Most replies" },
  { value: "opportunities", label: "Most opportunities" },
  { value: "progress", label: "Progress" },
] as const;

function CampaignsPage() {
  const { clientId, isAdmin } = useScope();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<string>("created");
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Campaign | null>(null);

  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns", clientId],
    queryFn: () => listCampaigns(clientId ?? undefined),
  });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: listClients });

  const rows = useMemo(() => {
    let out = campaigns.filter((c) => {
      const matchQ = !q || c.name.toLowerCase().includes(q.toLowerCase());
      const matchS = status === "all" || c.status === status;
      return matchQ && matchS;
    });
    out = [...out].sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "sent":
          return b.emails_sent - a.emails_sent;
        case "replies":
          return b.total_replies - a.total_replies;
        case "opportunities":
          return b.opportunities - a.opportunities;
        case "progress":
          return b.progress - a.progress;
        default:
          return b.created_at.localeCompare(a.created_at);
      }
    });
    return out;
  }, [campaigns, q, status, sort]);

  const fields: Field[] = [
    { name: "name", label: "Campaign name", required: true, span: 2 },
    {
      name: "client_id",
      label: "Client",
      type: "select",
      required: true,
      options: clients.map((c) => ({ value: c.id, label: c.name })),
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["draft", "active", "paused", "completed", "archived"].map((s) => ({
        value: s,
        label: s,
      })),
    },
    { name: "description", label: "Description", type: "textarea", span: 2 },
    { name: "start_date", label: "Start date", type: "date" },
    { name: "end_date", label: "End date", type: "date" },
    { name: "progress", label: "Progress %", type: "number" },
    {
      name: "metrics_mode",
      label: "Metrics mode",
      type: "select",
      options: [
        { value: "live", label: "Live (calculated)" },
        { value: "manual", label: "Manual (admin controlled)" },
      ],
    },
    { name: "open_rate_enabled", label: "Open rate metric", type: "switch" },
    { name: "click_rate_enabled", label: "Click rate metric", type: "switch" },
  ];

  const save = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const client_id = String(values["client_id"] ?? "").trim();
      if (!client_id) throw new Error("Please choose a client for this campaign");
      const patch = {
        name: String(values["name"]).trim(),
        client_id,
        status: (values["status"] as Campaign["status"]) || "draft",
        description: (values["description"] as string) || null,
        start_date: (values["start_date"] as string) || null,
        end_date: (values["end_date"] as string) || null,
        progress: Math.max(0, Math.min(100, Number(values["progress"] ?? 0) || 0)),
        metrics_mode: (values["metrics_mode"] as Campaign["metrics_mode"]) || "live",
        open_rate_enabled: !!values["open_rate_enabled"],
        click_rate_enabled: !!values["click_rate_enabled"],
      };
      const saved = editing
        ? await updateCampaign(editing.id, patch)
        : await upsertCampaign(patch);
      if (isAdmin) {
        await logAudit([
          {
            action: editing ? "update" : "create",
            entity_type: "campaign",
            entity_id: saved?.id ?? null,
            entity_label: saved?.name ?? String(values["name"]),
          },
        ]).catch(() => undefined);
      }
      return saved;
    },
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["campaign"] });
      qc.invalidateQueries({ queryKey: ["daily"] });
      if (saved?.id) qc.invalidateQueries({ queryKey: ["campaign", saved.id] });
      toast.success("Campaign saved");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const remove = useMutation({
    mutationFn: async (c: Campaign) => {
      await deleteCampaign(c.id);
      if (isAdmin)
        await logAudit([
          { action: "delete", entity_type: "campaign", entity_id: c.id, entity_label: c.name },
        ]);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign deleted");
    },
  });

  return (
    <>
      <PageHeader
        title="Campaigns"
        description={`${rows.length} campaign${rows.length === 1 ? "" : "s"} in view`}
        actions={
          isAdmin ? (
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> Add New
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
              placeholder="Search campaigns"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-8 w-[140px] text-[13px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {["draft", "active", "paused", "completed", "archived"].map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-8 w-[160px] text-[13px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  Sort: {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {rows.length ? (
          <CampaignTable
            campaigns={rows}
            clients={clients}
            showClient={!clientId}
            onEdit={isAdmin ? setEditing : undefined}
            onDelete={isAdmin ? setDeleting : undefined}
          />
        ) : (
          <EmptyState title="No campaigns match" description="Adjust your search or filters." />
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
        title={editing ? "Edit campaign" : "New campaign"}
        description="Campaign metadata, progress and metric control."
        fields={fields}
        initial={
          editing
            ? (editing as unknown as Record<string, unknown>)
            : {
                status: "draft",
                metrics_mode: "live",
                open_rate_enabled: true,
                click_rate_enabled: true,
                client_id: clientId ?? clients[0]?.id ?? "",
              }
        }
        onSubmit={async (v) => {
          await save.mutateAsync(v);
        }}
      />

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        label={deleting?.name ?? "campaign"}
        onConfirm={async () => {
          if (deleting) await remove.mutateAsync(deleting);
        }}
      />
    </>
  );
}
