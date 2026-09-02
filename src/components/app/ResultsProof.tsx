import type { Screenshot, Testimonial } from "@/lib/api";
import type { Totals } from "@/lib/metrics";
import { money, num } from "@/lib/format";
import { EmptyState, Section, StoredImage, useLightbox } from "./primitives";
import { Quote } from "lucide-react";

export function ResultsProof({
  clientName,
  screenshots,
  testimonial,
  totals,
}: {
  clientName: string;
  screenshots: Screenshot[];
  testimonial?: Testimonial;
  totals: Totals;
}) {
  const { open, node } = useLightbox();

  return (
    <Section title="Results & Proof" bodyClassName="p-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="label-caps">Campaign screenshots</p>
          {screenshots.length ? (
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {screenshots.slice(0, 6).map((s) => (
                <figure
                  key={s.id}
                  className="cursor-zoom-in overflow-hidden rounded-md border border-border bg-card"
                  onClick={() => open(s.image_url)}
                >
                  <StoredImage
                    path={s.image_url}
                    alt={s.title ?? "Campaign proof screenshot"}
                    className="h-28 w-full object-cover"
                  />
                  <figcaption className="border-t border-border px-2.5 py-1.5">
                    <p className="truncate text-[12px] font-semibold text-foreground">
                      {s.title ?? "Screenshot"}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">{s.description}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="mt-2 rounded-md border border-dashed border-border">
              <EmptyState title="No screenshots yet" description="Upload proof screenshots from the Screenshots page." />
            </div>
          )}

          <p className="label-caps mt-5">Performance summary</p>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Leads contacted" value={num(totals.leads)} />
            <Stat label="Emails sent" value={num(totals.sent)} />
            <Stat label="Replies" value={num(totals.replies)} />
            <Stat label="Opportunities" value={num(totals.opportunities)} />
            <Stat label="Meetings booked" value={num(totals.meetings)} />
            <Stat label="Pipeline value" value={money(totals.pipeline)} />
            <Stat label="Deals won" value={num(totals.won)} />
            <Stat label="Revenue" value={money(totals.revenue)} />
          </div>
        </div>

        <aside className="rounded-md border border-border bg-primary-soft/50 p-4">
          <p className="label-caps">Client testimonial</p>
          {testimonial ? (
            <>
              <Quote className="mt-3 size-5 text-primary" />
              <blockquote className="mt-2 text-[14px] leading-relaxed text-foreground">
                {testimonial.quote}
              </blockquote>
              <div className="mt-4 flex items-center gap-2.5">
                <StoredImage
                  path={testimonial.photo_url}
                  alt={testimonial.client_name ?? clientName}
                  className="size-9 rounded-full border border-border object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-foreground">
                    {testimonial.client_name ?? clientName}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {testimonial.company ?? testimonial.industry}
                  </p>
                </div>
              </div>
              {testimonial.result_headline && (
                <div className="mt-4 rounded-md border border-border bg-card p-3">
                  <p className="text-[13px] font-semibold text-foreground">
                    {testimonial.result_headline}
                  </p>
                  {testimonial.result_description && (
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      {testimonial.result_description}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="mt-3 text-[13px] text-muted-foreground">
              No testimonial recorded for {clientName} yet.
            </p>
          )}
        </aside>
      </div>
      {node}
    </Section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2.5">
      <p className="label-caps">{label}</p>
      <p className="num mt-1 text-[17px] font-semibold text-foreground">{value}</p>
    </div>
  );
}
