import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Archive, Inbox as InboxIcon, Search, Send, Star, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteReply,
  insertReplyMessage,
  listCampaigns,
  listReplies,
  listReplyMessages,
  updateReply,
  type Reply,
} from "@/lib/api";
import { PageHeader, useScope } from "@/components/app/AppShell";
import { EmptyState, StatusBadge } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { dateTime, initials, relative } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox — Appoint Funnels CRM" },
      {
        name: "description",
        content: "Unified inbox for every campaign reply, with folders, classification and threaded replies.",
      },
      { property: "og:title", content: "Inbox — Appoint Funnels CRM" },
      { property: "og:description", content: "One inbox for all campaign conversations." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { campaign?: string; reply?: string } => ({
    ...(typeof search["campaign"] === "string" ? { campaign: search["campaign"] as string } : {}),
    ...(typeof search["reply"] === "string" ? { reply: search["reply"] as string } : {}),
  }),
  component: InboxPage,
});

const FOLDERS = [
  { key: "all", label: "All", icon: InboxIcon },
  { key: "inbox", label: "Inbox", icon: InboxIcon },
  { key: "interested", label: "Interested", icon: Star },
  { key: "meetings", label: "Meetings", icon: Target },
  { key: "archived", label: "Archived", icon: Archive },
];

const CLASSES = [
  "interested",
  "meeting_request",
  "question",
  "not_interested",
  "out_of_office",
  "other",
];

function InboxPage() {
  const { clientId, isAdmin } = useScope();
  const qc = useQueryClient();
  const [folder, setFolder] = useState("all");
  const [q, setQ] = useState("");
  const search = useSearch({ from: "/_authenticated/inbox" });
  const navigate = useNavigate();
  const campaignFilter = search.campaign ?? "all";
  const [selectedId, setSelectedId] = useState<string | null>(search.reply ?? null);
  const [draft, setDraft] = useState("");

  const { data: replies = [] } = useQuery({
    queryKey: ["replies", clientId],
    queryFn: () => listReplies({ clientId: clientId ?? undefined }),
  });
  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns", clientId],
    queryFn: () => listCampaigns(clientId ?? undefined),
  });

  const list = useMemo(
    () =>
      replies.filter((r) => {
        const hay = `${r.lead_name ?? ""} ${r.lead_email} ${r.subject ?? ""} ${r.body ?? ""}`.toLowerCase();
        const inFolder =
          folder === "all"
            ? true
            : folder === "interested"
              ? r.classification === "interested"
              : folder === "meetings"
                ? r.classification === "meeting_request"
                : r.folder === folder;
        const inCampaign = campaignFilter === "all" || r.campaign_id === campaignFilter;
        return inCampaign && inFolder && (!q || hay.includes(q.toLowerCase()));
      }),
    [replies, folder, q, campaignFilter],
  );

  useEffect(() => {
    if (search.reply) setSelectedId(search.reply);
  }, [search.reply]);

  useEffect(() => {
    if (!selectedId && list.length) setSelectedId(list[0]!.id);
  }, [list, selectedId]);

  const selected = list.find((r) => r.id === selectedId) ?? null;

  const { data: messages = [] } = useQuery({
    queryKey: ["reply-messages", selected?.id],
    enabled: !!selected,
    queryFn: () => listReplyMessages(selected!.id),
  });

  const patch = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<Reply> }) => updateReply(id, values),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["replies"] }),
  });

  const send = useMutation({
    mutationFn: async () => {
      if (!selected || !draft.trim()) throw new Error("Write a reply first");
      await insertReplyMessage({
        reply_id: selected.id,
        direction: "outbound",
        body: draft.trim(),
        from_email: "team@appointfunnels.com",
        to_email: selected.lead_email,
      });
      setDraft("");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reply-messages"] });
      toast.success("Reply added to the thread");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteReply(id),
    onSuccess: () => {
      setSelectedId(null);
      qc.invalidateQueries({ queryKey: ["replies"] });
      toast.success("Conversation deleted");
    },
  });

  return (
    <>
      <PageHeader title="Inbox" description={`${list.length} conversation${list.length === 1 ? "" : "s"}`} />

      <div className="mb-3 flex flex-wrap gap-2">
        {[{ id: "all", name: "All campaigns" }, ...campaigns].map((c) => {
          const count =
            c.id === "all" ? replies.length : replies.filter((r) => r.campaign_id === c.id).length;
          const unread =
            c.id === "all"
              ? replies.filter((r) => !r.is_read).length
              : replies.filter((r) => r.campaign_id === c.id && !r.is_read).length;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSelectedId(null);
                navigate({
                  to: "/inbox",
                  search: c.id === "all" ? {} : { campaign: c.id },
                });
              }}
              className={cn(
                "min-w-[170px] rounded-lg border bg-card px-3 py-2 text-left transition-colors",
                campaignFilter === c.id
                  ? "border-primary bg-primary-soft/60"
                  : "border-border hover:border-primary/40",
              )}
            >
              <p className="truncate text-[12px] font-semibold text-foreground">{c.name}</p>
              <p className="num mt-0.5 text-[11px] text-muted-foreground">
                {count} replies{unread ? ` · ${unread} unread` : ""}
              </p>
            </button>
          );
        })}
      </div>

      <div className="panel grid h-[calc(100vh-8.5rem)] grid-cols-1 overflow-hidden lg:grid-cols-[190px_320px_1fr]">
        {/* folders */}
        <div className="hidden flex-col gap-0.5 border-r border-border p-2 lg:flex">
          {FOLDERS.map((f) => {
            const count =
              f.key === "all"
                ? replies.length
                : f.key === "interested"
                  ? replies.filter((r) => r.classification === "interested").length
                  : f.key === "meetings"
                    ? replies.filter((r) => r.classification === "meeting_request").length
                    : replies.filter((r) => r.folder === f.key).length;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => {
                  setFolder(f.key);
                  setSelectedId(null);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-[7px] text-[13px] font-medium",
                  folder === f.key
                    ? "bg-primary-soft text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <f.icon className="size-4" />
                {f.label}
                <span className="num ml-auto text-[11px]">{count}</span>
              </button>
            );
          })}
        </div>

        {/* list */}
        <div className="flex min-h-0 flex-col border-r border-border">
          <div className="relative border-b border-border p-2">
            <Search className="pointer-events-none absolute left-4.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-8 pl-8 text-[13px]"
              placeholder="Search conversations"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {list.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setSelectedId(r.id);
                  if (!r.is_read) patch.mutate({ id: r.id, values: { is_read: true } });
                }}
                className={cn(
                  "w-full border-b border-border px-3 py-2.5 text-left last:border-b-0",
                  selectedId === r.id ? "bg-primary-soft/60" : "hover:bg-muted/60",
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-bold text-muted-foreground">
                    {initials(r.lead_name ?? r.lead_email)}
                  </span>
                  <p
                    className={cn(
                      "min-w-0 flex-1 truncate text-[13px]",
                      r.is_read ? "font-medium text-foreground" : "font-bold text-foreground",
                    )}
                  >
                    {r.lead_name ?? r.lead_email}
                  </p>
                  <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                    {relative(r.received_at)}
                  </span>
                </div>
                <p className="mt-1 truncate text-[12px] font-medium text-foreground">{r.subject}</p>
                <p className="truncate text-[12px] text-muted-foreground">{r.body}</p>
                <div className="mt-1.5">
                  <StatusBadge status={r.classification} />
                </div>
              </button>
            ))}
            {!list.length && <EmptyState title="No conversations" description="Nothing in this folder." />}
          </div>
        </div>

        {/* conversation */}
        <div className="flex min-h-0 flex-col">
          {selected ? (
            <>
              <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-foreground">
                    {selected.subject}
                  </p>
                  <p className="truncate text-[12px] text-muted-foreground">
                    {selected.lead_name ? `${selected.lead_name} · ` : ""}
                    {selected.lead_email} ·{" "}
                    {campaigns.find((c) => c.id === selected.campaign_id)?.name ?? "No campaign"}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Select
                    value={selected.classification}
                    onValueChange={(v) =>
                      patch.mutate({ id: selected.id, values: { classification: v as Reply["classification"] } })
                    }
                  >
                    <SelectTrigger className="h-8 w-[170px] text-[12px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASSES.map((c) => (
                        <SelectItem key={c} value={c} className="capitalize">
                          {c.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      patch.mutate({
                        id: selected.id,
                        values: { folder: selected.folder === "archived" ? "inbox" : "archived" },
                      })
                    }
                  >
                    <Archive className="size-3.5" />
                    {selected.folder === "archived" ? "Unarchive" : "Archive"}
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => remove.mutate(selected.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-surface p-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "max-w-2xl rounded-lg border border-border p-3",
                      m.direction === "outbound" ? "ml-auto bg-primary-soft/70" : "bg-card",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[12px] font-semibold text-foreground">
                        {m.direction === "outbound" ? m.from_email ?? "You" : m.from_email ?? selected.lead_email}
                      </p>
                      <span className="text-[11px] text-muted-foreground">{dateTime(m.sent_at)}</span>
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">
                      {m.body}
                    </p>
                  </div>
                ))}
                {!messages.length && (
                  <div className="max-w-2xl rounded-lg border border-border bg-card p-3">
                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{selected.body}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-border p-3">
                <Textarea
                  rows={3}
                  placeholder={`Reply to ${selected.lead_name ?? selected.lead_email}…`}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <div className="mt-2 flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setDraft("")}>
                    Discard
                  </Button>
                  <Button size="sm" onClick={() => send.mutate()} disabled={send.isPending}>
                    <Send className="size-3.5" /> Send reply
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState title="Select a conversation" description="Pick a reply from the list to read the thread." />
          )}
        </div>
      </div>
    </>
  );
}
