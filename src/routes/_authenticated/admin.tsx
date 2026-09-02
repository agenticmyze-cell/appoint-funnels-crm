import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  listAuditLogs,
  listCampaigns,
  listClients,
  logAudit,
  updateCampaign,
  type Campaign,
} from "@/lib/api";
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

  const { data: campaigns = [] } = useQuery({ queryKey: ["campaigns", null], queryFn: () => listCampaigns() });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: listClients });
  const { data: logs = [] } = useQuery({ queryKey: ["audit"], queryFn: listAuditLogs });

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
    </>
  );
}
