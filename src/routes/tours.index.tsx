import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";
import { TourCard } from "@/components/tour-card";
import { toursListQuery, type TourCategory } from "@/lib/tours";
import { PageSpinner } from "@/components/page-spinner";

const categories: { value: TourCategory | "all"; label: string }[] = [
  { value: "all", label: "All trips" },
  { value: "trekking", label: "Trekking" },
  { value: "cultural", label: "Cultural" },
  { value: "adventure", label: "Adventure" },
  { value: "wildlife", label: "Wildlife" },
];

const searchSchema = z.object({
  category: z.enum(["all", "trekking", "cultural", "adventure", "wildlife"]).catch("all"),
  duration: z.enum(["any", "short", "medium", "long"]).catch("any"),
  price: z.enum(["any", "under500", "500to1000", "over1000"]).catch("any"),
});

export const Route = createFileRoute("/tours/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "All Tours — Woodapple Tours and Travel" },
      { name: "description", content: "Browse our Himalayan treks, cultural tours, jungle safaris and spiritual journeys across Nepal." },
      { property: "og:title", content: "All Tours — Woodapple" },
      { property: "og:description", content: "Browse our Himalayan treks, cultural tours, jungle safaris and spiritual journeys across Nepal." },
      { property: "og:url", content: "/tours" },
    ],
    links: [{ rel: "canonical", href: "/tours" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(toursListQuery()),
  pendingComponent: () => <PageSpinner label="Loading tours…" />,
  component: ToursPage,
});

function ToursPage() {
  const { data: tours } = useSuspenseQuery(toursListQuery());
  const { category, duration, price } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const filtered = useMemo(() => {
    return tours.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (duration === "short" && t.duration_days > 5) return false;
      if (duration === "medium" && (t.duration_days < 6 || t.duration_days > 10)) return false;
      if (duration === "long" && t.duration_days < 11) return false;
      if (price === "under500" && t.price_usd >= 500) return false;
      if (price === "500to1000" && (t.price_usd < 500 || t.price_usd > 1000)) return false;
      if (price === "over1000" && t.price_usd <= 1000) return false;
      return true;
    });
  }, [tours, category, duration, price]);

  const update = (patch: Partial<{ category: typeof category; duration: typeof duration; price: typeof price }>) =>
    navigate({ search: (prev: typeof patch) => ({ ...prev, ...patch }) });

  return (
    <>
      <section className="border-b border-border bg-[color:var(--cream)]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Our tours</div>
          <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">Every trip, guided by a Nepali expert</h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            From a gentle Kathmandu valley walk to crossing 5,000m passes — pick a journey or ask us to design a custom one.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="grid gap-6 rounded-2xl bg-card p-5 ring-1 ring-border/60 sm:p-6 lg:grid-cols-[1fr_auto_auto]">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((c) => {
                const active = category === c.value;
                return (
                  <button
                    key={c.value}
                    onClick={() => update({ category: c.value })}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/80 hover:bg-muted/70"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
          <FilterSelect
            label="Duration"
            value={duration}
            onChange={(v) => update({ duration: v as typeof duration })}
            options={[
              { value: "any", label: "Any length" },
              { value: "short", label: "1–5 days" },
              { value: "medium", label: "6–10 days" },
              { value: "long", label: "11+ days" },
            ]}
          />
          <FilterSelect
            label="Price"
            value={price}
            onChange={(v) => update({ price: v as typeof price })}
            options={[
              { value: "any", label: "Any price" },
              { value: "under500", label: "Under $500" },
              { value: "500to1000", label: "$500 – $1,000" },
              { value: "over1000", label: "$1,000+" },
            ]}
          />
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filtered.length} of {tours.length} tour{tours.length === 1 ? "" : "s"}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">No tours match these filters.</p>
            <button
              onClick={() => navigate({ search: { category: "all", duration: "any", price: "any" } })}
              className="mt-3 text-sm font-semibold text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => <TourCard key={t.id} tour={t} />)}
          </div>
        )}
      </section>
    </>
  );
}

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-2 lg:min-w-[180px]">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
