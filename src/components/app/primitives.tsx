import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { signedUrl } from "@/lib/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { titleCase } from "@/lib/format";
import { ImageOff } from "lucide-react";

/* -------------------------- status badge -------------------------- */

const TONE = {
  neutral: "bg-muted text-muted-foreground border-border",
  blue: "bg-primary-soft text-primary border-primary/20",
  positive: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/15 text-warning-foreground border-warning/30",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  dark: "bg-foreground text-background border-transparent",
} as const;

type Tone = keyof typeof TONE;

const STATUS_TONE: Record<string, Tone> = {
  active: "blue",
  draft: "neutral",
  paused: "dark",
  completed: "positive",
  archived: "neutral",
  inactive: "neutral",
  error: "danger",
  new: "neutral",
  contacted: "neutral",
  opened: "blue",
  replied: "blue",
  interested: "blue",
  meeting_booked: "blue",
  meeting_completed: "positive",
  opportunity: "blue",
  won: "positive",
  lost: "danger",
  qualified: "blue",
  proposal: "blue",
  negotiation: "warning",
  not_interested: "danger",
  question: "neutral",
  meeting_request: "blue",
  out_of_office: "neutral",
  other: "neutral",
  live: "positive",
  manual: "neutral",
};

export function StatusBadge({
  status,
  className,
  tone,
}: {
  status: string | null | undefined;
  className?: string;
  tone?: Tone;
}) {
  const key = (status ?? "").toLowerCase();
  const resolved = tone ?? STATUS_TONE[key] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-[3px] text-[11px] font-semibold leading-none whitespace-nowrap",
        TONE[resolved],
        className,
      )}
    >
      {titleCase(status ?? "—")}
    </span>
  );
}

/* -------------------------- progress -------------------------- */

export function ProgressCell({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="w-20">
      <div className="num text-[13px] font-semibold text-foreground">{v}%</div>
      <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-border">
        <div
          className={cn("h-full rounded-full", v >= 100 ? "bg-success" : "bg-primary")}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}

/* -------------------------- kpi card -------------------------- */

export function KpiCard({
  label,
  value,
  sub,
  muted,
  divider,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  muted?: boolean;
  divider?: boolean;
}) {
  return (
    <div className="panel px-4 py-3.5">
      <div className="label-caps">{label}</div>
      <div className={cn("mt-2 flex items-center", divider ? "gap-3" : "gap-2")}>
        <span
          className={cn(
            "num font-semibold leading-none tracking-tight",
            muted ? "text-[20px] text-muted-foreground" : "text-[26px] text-foreground",
          )}
        >
          {value}
        </span>
        {sub && divider ? <span aria-hidden className="h-6 w-px shrink-0 bg-border" /> : null}
        {sub ? (
          <span
            className={cn(
              "num text-muted-foreground",
              divider ? "text-[15px] font-medium" : "text-xs",
            )}
          >
            {sub}
          </span>
        ) : null}
      </div>
    </div>
  );
}


/* -------------------------- section -------------------------- */

export function Section({
  title,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("panel", className)}>
      {title || actions ? (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-foreground">
            {title}
          </h2>
          {actions}
        </header>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/* -------------------------- empty state -------------------------- */

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted">
        <ImageOff className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/* -------------------------- stored image -------------------------- */

export function StoredImage({
  path,
  alt,
  className,
  onClick,
}: {
  path: string | null | undefined;
  alt: string;
  className?: string;
  onClick?: () => void;
}) {
  const { data } = useQuery({
    queryKey: ["signed", path],
    enabled: !!path,
    staleTime: 30 * 60_000,
    queryFn: () => signedUrl(path as string),
  });

  if (!path) {
    return (
      <div className={cn("flex items-center justify-center bg-muted", className)}>
        <ImageOff className="size-4 text-muted-foreground" />
      </div>
    );
  }
  if (!data) return <div className={cn("animate-pulse bg-muted", className)} />;
  return <img src={data} alt={alt} className={className} onClick={onClick} loading="lazy" />;
}

export function useLightbox() {
  const [path, setPath] = useState<string | null>(null);
  const node = (
    <Dialog open={!!path} onOpenChange={(o) => !o && setPath(null)}>
      <DialogContent className="max-w-5xl overflow-hidden p-0">
        {path ? <StoredImage path={path} alt="Proof screenshot" className="w-full" /> : null}
      </DialogContent>
    </Dialog>
  );
  return { open: setPath, node };
}
