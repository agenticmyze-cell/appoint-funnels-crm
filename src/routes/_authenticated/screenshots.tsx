import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  deleteScreenshot,
  listCampaigns,
  listClients,
  listScreenshots,
  upsertScreenshot,
  type Screenshot,
} from "@/lib/api";
import { PageHeader, useScope } from "@/components/app/AppShell";
import { EmptyState, Section, StoredImage, useLightbox } from "@/components/app/primitives";
import { ConfirmDelete, RecordDialog, type Field } from "@/components/app/RecordDialog";
import { Button } from "@/components/ui/button";
import { shortDate, titleCase } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/screenshots")({
  head: () => ({
    meta: [
      { title: "Screenshots — Appoint Funnels CRM" },
      { name: "description", content: "Upload and manage campaign proof screenshots per client." },
      { property: "og:title", content: "Screenshots — Appoint Funnels CRM" },
      { property: "og:description", content: "Proof screenshot library for client reporting." },
    ],
  }),
  component: ScreenshotsPage,
});

const CATEGORIES = ["campaign", "inbox", "analytics", "meeting", "revenue", "other"];

function ScreenshotsPage() {
  const { clientId, isAdmin } = useScope();
  const qc = useQueryClient();
  const { open, node } = useLightbox();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Screenshot | null>(null);
  const [deleting, setDeleting] = useState<Screenshot | null>(null);

  const { data: rows = [] } = useQuery({
    queryKey: ["screenshots", clientId],
    queryFn: () => listScreenshots(clientId ?? undefined),
  });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: listClients });
  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns", clientId],
    queryFn: () => listCampaigns(clientId ?? undefined),
  });

  const fields: Field[] = [
    { name: "image_url", label: "Image", type: "image", span: 2 },
    { name: "title", label: "Title", required: true },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: CATEGORIES.map((c) => ({ value: c, label: c })),
    },
    {
      name: "client_id",
      label: "Client",
      type: "select",
      options: clients.map((c) => ({ value: c.id, label: c.name })),
    },
    {
      name: "campaign_id",
      label: "Campaign",
      type: "select",
      options: campaigns.map((c) => ({ value: c.id, label: c.name })),
    },
    { name: "taken_on", label: "Taken on", type: "date" },
    { name: "sort_order", label: "Sort order", type: "number" },
    { name: "description", label: "Description", type: "textarea", span: 2 },
  ];

  const save = useMutation({
    mutationFn: async (v: Record<string, unknown>) => {
      if (!v["image_url"]) throw new Error("Upload an image first");
      return upsertScreenshot({
        ...(editing ? { id: editing.id } : {}),
        image_url: String(v["image_url"]),
        title: (v["title"] as string) || null,
        category: (v["category"] || "campaign") as Screenshot["category"],
        client_id: (v["client_id"] as string) || null,
        campaign_id: (v["campaign_id"] as string) || null,
        taken_on: (v["taken_on"] as string) || null,
        sort_order: Number(v["sort_order"] ?? 0),
        description: (v["description"] as string) || null,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["screenshots"] });
      toast.success("Screenshot saved");
    },
  });

  return (
    <>
      <PageHeader
        title="Screenshots"
        description={`${rows.length} proof asset${rows.length === 1 ? "" : "s"}`}
        actions={
          isAdmin ? (
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> Upload screenshot
            </Button>
          ) : null
        }
      />

      {rows.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((s) => (
            <figure key={s.id} className="panel overflow-hidden">
              <StoredImage
                path={s.image_url}
                alt={s.title ?? "Screenshot"}
                className="h-36 w-full cursor-zoom-in object-cover"
                onClick={() => open(s.image_url)}
              />
              <figcaption className="border-t border-border px-3 py-2">
                <p className="truncate text-[13px] font-semibold">{s.title ?? "Untitled"}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {titleCase(s.category)} · {shortDate(s.taken_on)}
                </p>
                {isAdmin && (
                  <div className="mt-2 flex gap-3">
                    <button className="text-[12px] font-semibold text-primary" onClick={() => setEditing(s)}>
                      Edit
                    </button>
                    <button
                      className="text-[12px] font-semibold text-destructive"
                      onClick={() => setDeleting(s)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <Section>
          <EmptyState title="No screenshots yet" description="Upload proof screenshots to use in client results." />
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
        title={editing ? "Edit screenshot" : "Upload screenshot"}
        fields={fields}
        initial={
          editing
            ? (editing as unknown as Record<string, unknown>)
            : { category: "campaign", client_id: clientId ?? "", sort_order: 0 }
        }
        onSubmit={async (v) => {
          await save.mutateAsync(v);
        }}
      />

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        label={deleting?.title ?? "screenshot"}
        onConfirm={async () => {
          if (deleting) await deleteScreenshot(deleting.id);
          qc.invalidateQueries({ queryKey: ["screenshots"] });
        }}
      />
      {node}
    </>
  );
}
