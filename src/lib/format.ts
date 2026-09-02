export const DISABLED = "Disabled";

export function num(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0";
  return Number(value).toLocaleString("en-US");
}

export function money(value: number | null | undefined): string {
  const v = Number(value ?? 0);
  return `$${v.toLocaleString("en-US", { maximumFractionDigits: v % 1 === 0 ? 0 : 2 })}`;
}

export function pct(value: number | null | undefined, digits = 2): string {
  return `${Number(value ?? 0).toFixed(digits)}%`;
}

export function rate(part: number, total: number, digits = 2): string {
  if (!total) return `0.00%`;
  return `${((part / total) * 100).toFixed(digits)}%`;
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function shortDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function dateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relative(value: string | null | undefined): string {
  if (!value) return "—";
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return shortDate(value);
}

export function titleCase(value: string | null | undefined): string {
  if (!value) return "—";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
