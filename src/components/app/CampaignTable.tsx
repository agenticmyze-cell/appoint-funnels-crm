import { Link } from "@tanstack/react-router";
import { MoreHorizontal, Play } from "lucide-react";
import type { Campaign, Client } from "@/lib/api";
import { money, num, pct } from "@/lib/format";
import { replyRate } from "@/lib/metrics";
import { ProgressCell, StatusBadge } from "./primitives";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CampaignTable({
  campaigns,
  clients,
  showClient = true,
  onEdit,
  onDelete,
}: {
  campaigns: Campaign[];
  clients?: Client[] | undefined;
  showClient?: boolean | undefined;
  onEdit?: ((c: Campaign) => void) | undefined;
  onDelete?: ((c: Campaign) => void) | undefined;
}) {
  const clientName = (id: string) => clients?.find((c) => c.id === id)?.name ?? "—";

  return (
    <div className="space-y-2.5 p-3">
      <div className="hidden items-center gap-3 px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground lg:flex">
        <span className="w-5" />
        <span className="min-w-0 flex-1">Name</span>
        <span className="w-24">Status</span>
        <span className="w-20">Progress</span>
        <span className="w-20 text-right">Sent</span>
        <span className="w-20 text-right">Click</span>
        <span className="w-28 text-right">Replied</span>
        <span className="w-32 text-right">Opportunities</span>
        <span className="w-16" />
      </div>

      {campaigns.map((c) => (
        <div
          key={c.id}
          className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-3 py-4 shadow-sm transition-colors hover:border-border-strong"
        >
          <Checkbox className="w-5" aria-label={`Select ${c.name}`} />

          <div className="min-w-0 flex-1">
            <Link
              to="/campaigns/$id"
              params={{ id: c.id }}
              className="block truncate text-[14px] font-semibold text-foreground hover:text-primary"
            >
              {c.name}
            </Link>
            {showClient && (
              <span className="text-[12px] text-muted-foreground">{clientName(c.client_id)}</span>
            )}
          </div>

          <div className="w-24">
            <StatusBadge status={c.status} />
          </div>
          <div className="w-20">
            <ProgressCell value={c.progress} />
          </div>
          <div className="num w-20 text-right text-[13px] font-medium">{num(c.emails_sent)}</div>
          <div
            className={`num w-20 text-right text-[13px] font-medium ${
              c.click_rate_enabled ? "" : "text-muted-foreground"
            }`}
          >
            {c.click_rate_enabled ? num(c.unique_clicks) : "—"}
          </div>
          <div className="num w-28 text-right text-[13px] font-medium">
            {num(c.total_replies)}{" "}
            <span className="text-muted-foreground">| {pct(replyRate(c), 2)}</span>
          </div>
          <div className="num w-32 text-right text-[13px] font-medium">
            {num(c.opportunities)}{" "}
            <span className="text-muted-foreground">| {money(c.opportunity_value)}</span>
          </div>

          <div className="flex w-16 items-center justify-end gap-1">
            <Link
              to="/campaigns/$id"
              params={{ id: c.id }}
              className="flex size-7 items-center justify-center rounded-md text-success hover:bg-muted"
              title="Open campaign"
            >
              <Play className="size-4" />
            </Link>
            {onEdit || onDelete ? (
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
                  {onEdit && <DropdownMenuItem onClick={() => onEdit(c)}>Edit</DropdownMenuItem>}
                  {onDelete && (
                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(c)}>
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
