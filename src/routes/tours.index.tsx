import { createFileRoute } from "@tanstack/react-router";
import { tours } from "@/data/tours";
import { TourCard } from "@/components/tour-card";

export const Route = createFileRoute("/tours/")({
  head: () => ({
    meta: [
      { title: "All Tours — Woodapple Tours and Travel" },
      { name: "description", content: "Browse our Himalayan treks, cultural tours, jungle safaris and spiritual journeys across Nepal." },
      { property: "og:title", content: "All Tours — Woodapple" },
      { property: "og:description", content: "Browse our Himalayan treks, cultural tours, jungle safaris and spiritual journeys across Nepal." },
    ],
  }),
  component: ToursPage,
});

function ToursPage() {
  return (
    <>
      <section className="border-b border-border bg-[color:var(--cream)]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Our tours</div>
          <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
            Every trip, guided by a Nepali expert
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            From a gentle Kathmandu valley walk to crossing 5,000m passes — pick a journey or ask us to design a custom one.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((t) => <TourCard key={t.slug} tour={t} />)}
        </div>
      </section>
    </>
  );
}
