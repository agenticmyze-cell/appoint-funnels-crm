import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getSetting, saveSetting } from "@/lib/api";
import { PageHeader } from "@/components/app/AppShell";
import { EmptyState, Section } from "@/components/app/primitives";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Appoint Funnels CRM" },
      { name: "description", content: "Organization settings and default campaign metric behaviour." },
      { property: "og:title", content: "Settings — Appoint Funnels CRM" },
      { property: "og:description", content: "Configure your agency workspace defaults." },
    ],
  }),
  component: SettingsPage,
});

type Org = {
  name?: string;
  reply_to?: string;
  sending_domain?: string;
  default_open_rate?: boolean;
  default_click_rate?: boolean;
};

function SettingsPage() {
  const { data: session } = useSession();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["settings", "organization"], queryFn: () => getSetting("organization") });
  const [org, setOrg] = useState<Org>({});

  useEffect(() => {
    if (data?.value) setOrg(data.value as Org);
  }, [data]);

  const save = useMutation({
    mutationFn: () => saveSetting("organization", org as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  if (session && session.role !== "admin") {
    return <EmptyState title="Admins only" description="Settings are restricted to administrators." />;
  }

  return (
    <>
      <PageHeader title="Settings" description="Workspace identity and campaign metric defaults." />

      <div className="grid gap-3 lg:grid-cols-2">
        <Section title="Organization" bodyClassName="space-y-3 p-4">
          <Field label="Agency name">
            <Input
              className="h-9"
              value={org.name ?? ""}
              onChange={(e) => setOrg({ ...org, name: e.target.value })}
              placeholder="Appoint Funnels"
            />
          </Field>
          <Field label="Reply-to email">
            <Input
              className="h-9"
              value={org.reply_to ?? ""}
              onChange={(e) => setOrg({ ...org, reply_to: e.target.value })}
              placeholder="team@appointfunnels.com"
            />
          </Field>
          <Field label="Sending domain">
            <Input
              className="h-9"
              value={org.sending_domain ?? ""}
              onChange={(e) => setOrg({ ...org, sending_domain: e.target.value })}
              placeholder="mail.appointfunnels.com"
            />
          </Field>
        </Section>

        <Section title="Campaign metric defaults" bodyClassName="space-y-3 p-4">
          <Toggle
            label="Open rate tracking enabled by default"
            checked={org.default_open_rate ?? true}
            onChange={(v) => setOrg({ ...org, default_open_rate: v })}
          />
          <Toggle
            label="Click rate tracking enabled by default"
            checked={org.default_click_rate ?? true}
            onChange={(v) => setOrg({ ...org, default_click_rate: v })}
          />
          <p className="text-[12px] text-muted-foreground">
            Disabled metrics are never calculated and display as “Disabled” across dashboards.
          </p>
        </Section>
      </div>

      <div className="mt-3 flex justify-end">
        <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save settings"}
        </Button>
      </div>

      <div className="mt-3">
        <Section title="Your account" bodyClassName="p-4">
          <p className="text-[13px] text-foreground">{session?.fullName}</p>
          <p className="text-[12px] text-muted-foreground">{session?.email}</p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-primary">
            {session?.role}
          </p>
        </Section>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] font-semibold">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
