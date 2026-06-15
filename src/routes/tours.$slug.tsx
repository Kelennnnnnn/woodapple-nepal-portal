import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Clock, MapPin, Mountain, ArrowLeft, Check, X, Users, Calendar, ChevronDown } from "lucide-react";
import { tourBySlugQuery, FALLBACK_IMAGE } from "@/lib/tours";
import { InquiryForm } from "@/components/inquiry-form";
import { useCurrency } from "@/lib/currency";
import { DownloadItineraryButton } from "@/components/download-itinerary-button";
import { PageSpinner } from "@/components/page-spinner";

export const Route = createFileRoute("/tours/$slug")({
  loader: async ({ params, context }) => {
    const tour = await context.queryClient.ensureQueryData(tourBySlugQuery(params.slug));
    if (!tour) throw notFound();
    return tour;
  },
  head: ({ loaderData, params }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Woodapple Tours` },
          { name: "description", content: loaderData.short_description },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.short_description },
          { property: "og:image", content: loaderData.images[0] ?? FALLBACK_IMAGE },
          { property: "og:url", content: `/tours/${params.slug}` },
          { property: "og:type", content: "product" },
        ]
      : [],
    links: loaderData ? [{ rel: "canonical", href: `/tours/${params.slug}` }] : [],
    scripts: loaderData
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TouristTrip",
              name: loaderData.title,
              description: loaderData.short_description,
              image: loaderData.images.length ? loaderData.images : [FALLBACK_IMAGE],
              touristType: loaderData.category,
              itinerary: loaderData.itinerary.map((d) => ({
                "@type": "ItemList",
                name: `Day ${d.day}: ${d.title}`,
                description: d.description,
              })),
              offers: {
                "@type": "Offer",
                price: loaderData.price_usd,
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
              },
              provider: {
                "@type": "TravelAgency",
                name: "Woodapple Tours and Travel",
                address: "Kathmandu, Nepal",
              },
            }),
          },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-32 text-center">
      <h1 className="font-display text-3xl font-semibold">Tour not found</h1>
      <Link to="/tours" className="mt-4 inline-block text-primary hover:underline">Browse all tours</Link>
    </div>
  ),
  pendingComponent: () => <PageSpinner label="Loading tour…" />,
  component: TourDetail,
});

function TourDetail() {
  const { slug } = Route.useParams();
  const { data: tourData } = useSuspenseQuery(tourBySlugQuery(slug));
  const tour = tourData!;
  const [activeImg, setActiveImg] = useState(0);
  const { format } = useCurrency();
  const images = tour.images.length > 0 ? tour.images : [FALLBACK_IMAGE];

  return (
    <>
      <section className="border-b border-border bg-[color:var(--cream)]">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-28 sm:px-6 sm:pt-32 lg:px-8">
          <Link to="/tours" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> All tours
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
              {tour.category}
            </span>
            <span className="text-sm text-muted-foreground">{tour.best_season}</span>
          </div>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">
            {tour.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{tour.short_description}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Gallery */}
        <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
          <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
            <img src={images[activeImg]} alt={tour.title} className="h-full w-full object-cover" />
          </div>
          <div className="flex gap-3 overflow-x-auto sm:flex-col">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`h-20 w-28 shrink-0 overflow-hidden rounded-lg ring-2 transition sm:w-full ${
                  i === activeImg ? "ring-primary" : "ring-transparent hover:ring-border"
                }`}
              >
                <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-12">
            {/* Overview */}
            <div>
              <h2 className="font-display text-2xl font-semibold">Overview</h2>
              <p className="mt-3 text-base leading-relaxed text-foreground/85">{tour.full_description}</p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: Clock, label: "Duration", value: `${tour.duration_days} days` },
                  { icon: Mountain, label: "Difficulty", value: tour.difficulty },
                  { icon: Users, label: "Group size", value: tour.group_size },
                  { icon: Calendar, label: "Best season", value: tour.best_season },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl bg-card p-4 ring-1 ring-border/60">
                    <Icon className="h-4 w-4 text-primary" />
                    <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
                    <div className="text-sm font-semibold">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Itinerary */}
            {tour.itinerary.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-semibold">Day-by-day itinerary</h2>
                <div className="mt-4 divide-y divide-border rounded-2xl bg-card ring-1 ring-border/60">
                  {tour.itinerary.map((d) => (
                    <Accordion
                      key={d.day}
                      title={
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                            {d.day}
                          </span>
                          <span className="font-display text-base font-semibold">{d.title}</span>
                        </div>
                      }
                    >
                      <p className="text-sm leading-relaxed text-muted-foreground">{d.description}</p>
                    </Accordion>
                  ))}
                </div>
              </div>
            )}

            {/* Included / Excluded */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl bg-card p-6 ring-1 ring-border/60">
                <h3 className="font-display text-lg font-semibold">What's included</h3>
                <ul className="mt-4 space-y-2 text-sm">
                  {tour.included.map((i) => (
                    <li key={i} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-card p-6 ring-1 ring-border/60">
                <h3 className="font-display text-lg font-semibold">Not included</h3>
                <ul className="mt-4 space-y-2 text-sm">
                  {tour.excluded.map((i) => (
                    <li key={i} className="flex gap-2 text-muted-foreground">
                      <X className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* FAQ */}
            {tour.faq.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-semibold">Frequently asked questions</h2>
                <div className="mt-4 divide-y divide-border rounded-2xl bg-card ring-1 ring-border/60">
                  {tour.faq.map((f, i) => (
                    <Accordion key={i} title={<span className="text-left font-medium">{f.q}</span>}>
                      <p className="text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                    </Accordion>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky booking sidebar — becomes bottom bar on mobile */}
          <aside id="inquiry" className="h-fit rounded-2xl bg-card p-6 ring-1 ring-border/60 lg:sticky lg:top-24">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">From</div>
            <div className="font-display text-4xl font-semibold text-primary">{format(tour.price_usd)}</div>
            <div className="text-sm text-muted-foreground">per person, twin sharing</div>
            <div className="mt-4">
              <DownloadItineraryButton tour={tour} />
            </div>
            <div className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
              <Row label="Duration" value={`${tour.duration_days} days`} />
              <Row label="Difficulty" value={tour.difficulty} />
              <Row label="Group size" value={tour.group_size} />
              <Row label="Best season" value={tour.best_season} />
            </div>
            <div className="mt-6 border-t border-border pt-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MapPin className="h-4 w-4 text-primary" /> Inquire about this trip
              </div>
              <p className="mt-1 text-xs text-muted-foreground">No deposit needed. We respond within 12 hours.</p>
              <div className="mt-4">
                <InquiryForm tourId={tour.id} tourTitle={tour.title} />
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Mobile sticky bottom bar */}
      <div className="sticky bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">From</div>
            <div className="font-display text-xl font-semibold text-primary">{format(tour.price_usd)}</div>
          </div>
          <a
            href="#inquiry"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Inquire now
          </a>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function Accordion({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-muted/40"
      >
        <div className="min-w-0 flex-1">{title}</div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5 sm:pl-16">{children}</div>}
    </div>
  );
}
