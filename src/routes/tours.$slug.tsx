import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Clock, MapPin, Mountain, ArrowLeft, Check } from "lucide-react";
import { getTour, tours } from "@/data/tours";

export const Route = createFileRoute("/tours/$slug")({
  loader: ({ params }) => {
    const tour = getTour(params.slug);
    if (!tour) throw notFound();
    return { tour };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.tour.title} — Woodapple Tours` },
          { name: "description", content: loaderData.tour.short },
          { property: "og:title", content: loaderData.tour.title },
          { property: "og:description", content: loaderData.tour.short },
          { property: "og:image", content: loaderData.tour.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-32 text-center">
      <h1 className="font-display text-3xl font-semibold">Tour not found</h1>
      <Link to="/tours" className="mt-4 inline-block text-primary hover:underline">Browse all tours</Link>
    </div>
  ),
  component: TourDetail,
});

function TourDetail() {
  const { tour } = Route.useLoaderData();
  const related = tours.filter((t) => t.slug !== tour.slug).slice(0, 3);

  return (
    <>
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10">
          <img src={tour.image} alt={tour.title} width={1920} height={1080} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/40" />
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-32 text-[color:var(--cream)] sm:px-6 sm:pt-40 lg:px-8">
          <Link to="/tours" className="inline-flex items-center gap-1.5 text-sm opacity-90 hover:opacity-100">
            <ArrowLeft className="h-4 w-4" /> All tours
          </Link>
          <div className="mt-3 flex items-center gap-2 text-sm opacity-90">
            <MapPin className="h-4 w-4" /> {tour.region}
          </div>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-6xl">
            {tour.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">{tour.short}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            {[
              { icon: Clock, label: tour.duration },
              { icon: Mountain, label: tour.difficulty },
              { icon: MapPin, label: tour.region },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
                <Icon className="h-4 w-4" /> {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-12">
            <div>
              <h2 className="font-display text-2xl font-semibold">Trip highlights</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {tour.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-3 w-3" />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold">Day-by-day itinerary</h2>
              <ol className="mt-6 space-y-6 border-l border-border pl-6">
                {tour.itinerary.map((d) => (
                  <li key={d.day} className="relative">
                    <span className="absolute -left-[34px] top-0 grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {d.day}
                    </span>
                    <h3 className="font-display text-lg font-semibold">{d.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d.description}</p>
                  </li>
                ))}
                <li className="relative text-sm italic text-muted-foreground">
                  <span className="absolute -left-[30px] top-1 h-2 w-2 rounded-full bg-border" />
                  Full itinerary sent on inquiry.
                </li>
              </ol>
            </div>
          </div>

          <aside className="h-fit rounded-2xl bg-card p-6 ring-1 ring-border/60 lg:sticky lg:top-24">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">From</div>
            <div className="font-display text-4xl font-semibold text-primary">${tour.priceUSD}</div>
            <div className="text-sm text-muted-foreground">per person, twin sharing</div>
            <div className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span>{tour.duration}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Difficulty</span><span>{tour.difficulty}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Group size</span><span>2–10</span></div>
            </div>
            <Link
              to="/contact"
              className="mt-6 flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Inquire about this trip
            </Link>
            <p className="mt-3 text-center text-xs text-muted-foreground">No deposit needed to inquire</p>
          </aside>
        </div>
      </section>

      <section className="bg-[color:var(--cream)] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold">You may also like</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((t) => (
              <Link
                key={t.slug}
                to="/tours/$slug"
                params={{ slug: t.slug }}
                className="group overflow-hidden rounded-2xl bg-background ring-1 ring-border/60"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={t.image} alt={t.title} loading="lazy" width={1024} height={640} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold group-hover:text-primary">{t.title}</h3>
                  <div className="mt-1 text-sm text-muted-foreground">{t.duration} · From ${t.priceUSD}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
