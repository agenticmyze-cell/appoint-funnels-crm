import { Link } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import type { Campaign, Client } from "@/lib/api";
import { money, num } from "@/lib/format";
import { clickRateLabel, openRateLabel, replyRate } from "@/lib/metrics";
import { ProgressCell, StatusBadge } from "./primitives";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { pct } from "@/lib/format";

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
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left">
            <Th className="pl-4">Name</Th>
            {showClient && <Th>Client</Th>}
            <Th>Status</Th>
            <Th>Progress</Th>
            <Th align="right">Sent</Th>
            <Th align="right">Open %</Th>
            <Th align="right">Click %</Th>
            <Th align="right">Replied</Th>
            <Th align="right">Reply %</Th>
            <Th align="right">Opportunities</Th>
            <Th align="right">Value</Th>
            <Th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <tr key={c.id} className="border-b border-border last:border-b-0 hover:bg-muted/40">
              <td className="max-w-[240px] py-2.5 pl-4 pr-3">
                <Link
                  to="/campaigns/$id"
                  params={{ id: c.id }}
                  className="block truncate font-medium text-foreground hover:text-primary"
                >
                  {c.name}
                </Link>
                {c.metrics_mode === "manual" && (
                  <span className="mt-0.5 inline-block text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    Manual metrics
                  </span>
                )}
              </td>
              {showClient && (
                <td className="px-3 py-2.5 text-muted-foreground">{clientName(c.client_id)}</td>
              )}
              <td className="px-3 py-2.5">
                <StatusBadge status={c.status} />
              </td>
              <td className="px-3 py-2.5">
                <ProgressCell value={c.progress} />
              </td>
              <Td>{num(c.emails_sent)}</Td>
              <Td muted={!c.open_rate_enabled}>{openRateLabel(c)}</Td>
              <Td muted={!c.click_rate_enabled}>{clickRateLabel(c)}</Td>
              <Td>{num(c.total_replies)}</Td>
              <Td>{pct(replyRate(c))}</Td>
              <Td>{num(c.opportunities)}</Td>
              <Td>{money(c.opportunity_value)}</Td>
              <td className="pr-3">
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
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onDelete(c)}
                        >
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  align = "left",
  className,
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <th
      className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground ${
        align === "right" ? "text-right" : "text-left"
      } ${className ?? ""}`}
    >
      {children}
    </th>
  );
}

function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <td
      className={`num px-3 py-2.5 text-right ${muted ? "text-muted-foreground" : "text-foreground"}`}
    >
      {children}
    </td>
  );
}
