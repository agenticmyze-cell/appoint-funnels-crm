import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  deleteCampaign,
  deleteReply,
  insertReply,
  listAuditLogs,
  listCampaigns,
  listClients,
  listReplies,
  logAudit,
  updateCampaign,
  updateReply,
  upsertCampaign,
  type Campaign,
  type Reply,
} from "@/lib/api";
import { ConfirmDelete, RecordDialog, type Field } from "@/components/app/RecordDialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { initials, relative } from "@/lib/format";
import { PageHeader } from "@/components/app/AppShell";
import { EmptyState, Section, StatusBadge } from "@/components/app/primitives";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EDITABLE_METRICS } from "@/lib/metrics";
import { dateTime, titleCase } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — Appoint Funnels CRM" },
      { name: "description", content: "Master control over campaign metrics, metric modes and audit history." },
      { property: "og:title", content: "Admin Console — Appoint Funnels CRM" },
      { property: "og:description", content: "Role-restricted control panel for campaign data." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { data: session } = useSession();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string>("");
  const [draft, setDraft] = useState<Record<string, number>>({});
  const [campaignForm, setCampaignForm] = useState<Campaign | "new" | null>(null);
  const [campaignDelete, setCampaignDelete] = useState<Campaign | null>(null);
  const [replyForm, setReplyForm] = useState<Reply | "new" | null>(null);
  const [replyDelete, setReplyDelete] = useState<Reply | null>(null);

  const { data: campaigns = [] } = useQuery({ queryKey: ["campaigns", null], queryFn: () => listCampaigns() });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: listClients });
  const { data: logs = [] } = useQuery({ queryKey: ["audit"], queryFn: listAuditLogs });
  const { data: replies = [] } = useQuery({ queryKey: ["replies", null], queryFn: () => listReplies() });

  const campaignFields: Field[] = [
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
      options: ["draft", "active", "paused", "completed", "archived"].map((v) => ({ value: v, label: v })),
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
    { name: "sequence_started", label: "Sequence started", type: "number" },
    { name: "emails_sent", label: "Emails sent", type: "number" },
    { name: "unique_opens", label: "Unique opens", type: "number" },
    { name: "unique_clicks", label: "Unique clicks", type: "number" },
    { name: "total_replies", label: "Replies", type: "number" },
    { name: "opportunities", label: "Opportunities", type: "number" },
    { name: "opportunity_value", label: "Opportunity value ($)", type: "number" },
    { name: "open_rate_enabled", label: "Open rate metric", type: "switch" },
    { name: "click_rate_enabled", label: "Click rate metric", type: "switch" },
  ];

  const replyFields: Field[] = [
    {
      name: "client_id",
      label: "Client",
      type: "select",
      required: true,
      options: clients.map((c) => ({ value: c.id, label: c.name })),
    },
    {
      name: "campaign_id",
      label: "Tag campaign",
      type: "select",
      options: campaigns.map((c) => ({ value: c.id, label: c.name })),
    },
    { name: "lead_name", label: "Lead name" },
    { name: "lead_email", label: "Lead email", type: "email", required: true },
    { name: "subject", label: "Subject", span: 2 },
    { name: "body", label: "Reply message", type: "textarea", span: 2 },
    {
      name: "classification",
      label: "Classification",
      type: "select",
      options: [
        "interested",
        "meeting_request",
        "question",
        "not_interested",
        "out_of_office",
        "other",
      ].map((v) => ({ value: v, label: v.replace(/_/g, " ") })),
    },
    {
      name: "folder",
      label: "Folder",
      type: "select",
      options: ["inbox", "lead", "archived"].map((v) => ({ value: v, label: v })),
    },
  ];

  const saveCampaign = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const editingRow = campaignForm && campaignForm !== "new" ? campaignForm : null;
      const saved = await upsertCampaign({
        ...(editingRow ? { id: editingRow.id } : {}),
        name: String(values["name"]),
        client_id: String(values["client_id"]),
        status: values["status"] as Campaign["status"],
        description: (values["description"] as string) || null,
        start_date: (values["start_date"] as string) || null,
        end_date: (values["end_date"] as string) || null,
        progress: Number(values["progress"] ?? 0),
        metrics_mode: values["metrics_mode"] as Campaign["metrics_mode"],
        sequence_started: Number(values["sequence_started"] ?? 0),
        emails_sent: Number(values["emails_sent"] ?? 0),
        unique_opens: Number(values["unique_opens"] ?? 0),
        unique_clicks: Number(values["unique_clicks"] ?? 0),
        total_replies: Number(values["total_replies"] ?? 0),
        opportunities: Number(values["opportunities"] ?? 0),
        opportunity_value: Number(values["opportunity_value"] ?? 0),
        open_rate_enabled: !!values["open_rate_enabled"],
        click_rate_enabled: !!values["click_rate_enabled"],
      });
      await logAudit([
        {
          action: editingRow ? "update" : "create",
          entity_type: "campaign",
          entity_id: saved.id,
          entity_label: saved.name,
        },
      ]);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
      toast.success("Campaign saved");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const removeCampaign = useMutation({
    mutationFn: async (c: Campaign) => {
      await deleteCampaign(c.id);
      await logAudit([
        { action: "delete", entity_type: "campaign", entity_id: c.id, entity_label: c.name },
      ]);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
      toast.success("Campaign deleted");
    },
  });

  const saveReply = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const editingRow = replyForm && replyForm !== "new" ? replyForm : null;
      const row = {
        client_id: String(values["client_id"]),
        campaign_id: (values["campaign_id"] as string) || null,
        lead_name: (values["lead_name"] as string) || null,
        lead_email: String(values["lead_email"]),
        subject: (values["subject"] as string) || null,
        body: (values["body"] as string) || null,
        classification: values["classification"] as Reply["classification"],
        folder: String(values["folder"] || "inbox"),
      };
      const saved = editingRow ? await updateReply(editingRow.id, row) : await insertReply(row);
      await logAudit([
        {
          action: editingRow ? "update" : "create",
          entity_type: "reply",
          entity_id: saved?.id ?? null,
          entity_label: saved?.lead_email ?? String(values["lead_email"]),
        },
      ]);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["replies"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
      toast.success("Reply saved");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const removeReply = useMutation({
    mutationFn: async (r: Reply) => {
      await deleteReply(r.id);
      await logAudit([
        { action: "delete", entity_type: "reply", entity_id: r.id, entity_label: r.lead_email },
      ]);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["replies"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
      toast.success("Reply deleted");
    },
  });

  const campaign = campaigns.find((c) => c.id === (selected || campaigns[0]?.id));

  const save = useMutation({
    mutationFn: async (patch: Partial<Campaign>) => {
      if (!campaign) return;
      const before = campaign as unknown as Record<string, unknown>;
      const saved = await updateCampaign(campaign.id, patch);
      await logAudit(
        Object.keys(patch).map((field) => ({
          action: "update_metric",
          entity_type: "campaign",
          entity_id: campaign.id,
          entity_label: campaign.name,
          field,
          old_value: String(before[field] ?? ""),
          new_value: String((patch as Record<string, unknown>)[field] ?? ""),
        })),
      );
      return saved;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
      setDraft({});
      toast.success("Campaign data updated");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  if (session && session.role !== "admin") {
    return <EmptyState title="Admins only" description="You do not have access to the Admin Console." />;
  }

  return (
    <>
      <PageHeader
        title="Admin Console"
        description="Master control over campaign metrics, metric modes and audit history."
      />

      <Tabs defaultValue="metrics">
        <TabsList>
          <TabsTrigger value="metrics">Campaign metrics</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="replies">Replies</TabsTrigger>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="mt-3 space-y-3">
          <Section title="Select campaign">
            <div className="flex flex-wrap items-center gap-2 p-3">
              <Select value={campaign?.id ?? ""} onValueChange={setSelected}>
                <SelectTrigger className="h-8 w-[280px] text-[13px]">
                  <SelectValue placeholder="Choose campaign" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {clients.find((cl) => cl.id === c.client_id)?.name} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {campaign && <StatusBadge status={campaign.metrics_mode} />}
            </div>
          </Section>

          {campaign ? (
            <>
              <Section title="Metric control">
                <div className="grid gap-4 p-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold">Metrics mode</Label>
                    <Select
                      value={campaign.metrics_mode}
                      onValueChange={(v) => save.mutate({ metrics_mode: v as Campaign["metrics_mode"] })}
                    >
                      <SelectTrigger className="h-9 text-[13px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="live">Live (calculated)</SelectItem>
                        <SelectItem value="manual">Manual (admin controlled)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold">Open rate metric</Label>
                    <div className="flex h-9 items-center gap-2">
                      <Switch
                        checked={campaign.open_rate_enabled}
                        onCheckedChange={(v) => save.mutate({ open_rate_enabled: v })}
                      />
                      <span className="text-[12px] text-muted-foreground">
                        {campaign.open_rate_enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold">Click rate metric</Label>
                    <div className="flex h-9 items-center gap-2">
                      <Switch
                        checked={campaign.click_rate_enabled}
                        onCheckedChange={(v) => save.mutate({ click_rate_enabled: v })}
                      />
                      <span className="text-[12px] text-muted-foreground">
                        {campaign.click_rate_enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
              </Section>

              <Section
                title="Editable metrics"
                actions={
                  <Button
                    size="sm"
                    disabled={!Object.keys(draft).length}
                    onClick={() => save.mutate(draft as Partial<Campaign>)}
                  >
                    Save changes
                  </Button>
                }
              >
                <div className="grid gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
                  {EDITABLE_METRICS.map((m) => {
                    const key = m.key as string;
                    const value =
                      draft[key] ?? Number((campaign as unknown as Record<string, unknown>)[key] ?? 0);
                    return (
                      <div key={key} className="space-y-1.5">
                        <Label className="text-[12px] font-semibold">{m.label}</Label>
                        <Input
                          type="number"
                          className="num h-9"
                          value={String(value)}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, [key]: Number(e.target.value || 0) }))
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </Section>
            </>
          ) : (
            <Section>
              <EmptyState title="No campaigns available" />
            </Section>
          )}
        </TabsContent>

        <TabsContent value="campaigns" className="mt-3">
          <Section
            title="All campaigns"
            actions={
              <Button size="sm" onClick={() => setCampaignForm("new")}>
                <Plus className="size-3.5" /> Add campaign
              </Button>
            }
          >
            <div className="divide-y divide-border">
              {campaigns.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-foreground">{c.name}</p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {clients.find((cl) => cl.id === c.client_id)?.name ?? "—"} · {titleCase(c.status)}
                    </p>
                  </div>
                  <StatusBadge status={c.metrics_mode} />
                  <Button variant="outline" size="sm" onClick={() => setCampaignForm(c)}>
                    <Pencil className="size-3.5" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setCampaignDelete(c)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
              {!campaigns.length && <EmptyState title="No campaigns yet" />}
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="replies" className="mt-3">
          <Section
            title="Replies"
            actions={
              <Button size="sm" onClick={() => setReplyForm("new")}>
                <Plus className="size-3.5" /> Add reply
              </Button>
            }
          >
            <div className="divide-y divide-border">
              {replies.map((r) => (
                <div key={r.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-bold text-muted-foreground">
                    {initials(r.lead_name ?? r.lead_email)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-foreground">
                      {r.lead_name ?? r.lead_email}
                    </p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {campaigns.find((c) => c.id === r.campaign_id)?.name ?? "No campaign"} ·{" "}
                      {r.subject ?? r.body ?? "—"}
                    </p>
                  </div>
                  <StatusBadge status={r.classification} />
                  <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                    {relative(r.received_at)}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setReplyForm(r)}>
                    <Pencil className="size-3.5" /> Edit reply
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setReplyDelete(r)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
              {!replies.length && <EmptyState title="No replies yet" />}
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="audit" className="mt-3">
          <Section title="Audit log">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    <th className="px-4 py-2">When</th>
                    <th className="px-3 py-2">Actor</th>
                    <th className="px-3 py-2">Action</th>
                    <th className="px-3 py-2">Entity</th>
                    <th className="px-3 py-2">Field</th>
                    <th className="px-3 py-2">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-2.5 text-muted-foreground">{dateTime(l.created_at)}</td>
                      <td className="px-3 py-2.5">{l.actor_email ?? "—"}</td>
                      <td className="px-3 py-2.5">{titleCase(l.action)}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {titleCase(l.entity_type)} · {l.entity_label ?? "—"}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{l.field ?? "—"}</td>
                      <td className="num px-3 py-2.5 text-muted-foreground">
                        {l.field ? `${l.old_value ?? "—"} → ${l.new_value ?? "—"}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!logs.length && <EmptyState title="No admin activity recorded yet" />}
            </div>
          </Section>
        </TabsContent>
      </Tabs>

      <RecordDialog
        open={!!campaignForm}
        onOpenChange={(v) => !v && setCampaignForm(null)}
        title={campaignForm && campaignForm !== "new" ? "Edit campaign" : "Add campaign"}
        description="Full campaign details and manual metric values."
        fields={campaignFields}
        {...(campaignForm && campaignForm !== "new"
          ? { initial: campaignForm as unknown as Record<string, unknown> }
          : {})}
        onSubmit={async (values) => {
          await saveCampaign.mutateAsync(values);
        }}
      />

      <RecordDialog
        open={!!replyForm}
        onOpenChange={(v) => !v && setReplyForm(null)}
        title={replyForm && replyForm !== "new" ? "Edit reply" : "Add reply"}
        description="Create or edit a reply and tag it to a campaign."
        fields={replyFields}
        {...(replyForm && replyForm !== "new"
          ? { initial: replyForm as unknown as Record<string, unknown> }
          : {})}
        onSubmit={async (values) => {
          await saveReply.mutateAsync(values);
        }}
      />

      <ConfirmDelete
        open={!!campaignDelete}
        onOpenChange={(v) => !v && setCampaignDelete(null)}
        label={campaignDelete?.name ?? ""}
        onConfirm={async () => {
          if (campaignDelete) await removeCampaign.mutateAsync(campaignDelete);
        }}
      />

      <ConfirmDelete
        open={!!replyDelete}
        onOpenChange={(v) => !v && setReplyDelete(null)}
        label={replyDelete?.lead_email ?? ""}
        onConfirm={async () => {
          if (replyDelete) await removeReply.mutateAsync(replyDelete);
        }}
      />
    </>
  );
}
