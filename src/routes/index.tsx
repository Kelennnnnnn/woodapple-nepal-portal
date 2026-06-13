import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Search, Shield, Mountain, Users, Heart, Star, Calendar } from "lucide-react";
import heroImg from "@/assets/hero-mountains.jpg";
import { TourCard } from "@/components/tour-card";
import { featuredToursQuery } from "@/lib/tours";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Woodapple Tours and Travel — Experience Nepal with Local Experts" },
      { name: "description", content: "Hand-crafted Himalayan treks, cultural journeys and jungle safaris led by licensed Nepali guides." },
      { property: "og:title", content: "Experience Nepal with Local Experts" },
      { property: "og:description", content: "Hand-crafted Himalayan treks, cultural journeys and jungle safaris from Kathmandu." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(featuredToursQuery()),
  component: HomePage,
});

const trustPoints = [
  { icon: Shield, title: "Licensed & insured", body: "Government-registered tour operator with full liability cover for every traveler." },
  { icon: Mountain, title: "Local mountain guides", body: "All trips are led by NMA-certified guides who grew up in the Himalaya." },
  { icon: Users, title: "Small groups", body: "Maximum 10 travelers per departure for a more personal experience." },
  { icon: Heart, title: "Fair & ethical travel", body: "We pay above-market porter wages and partner only with locally owned lodges." },
];

const testimonials = [
  { name: "Sarah M.", country: "Australia", text: "Our Annapurna trek with Woodapple was the trip of a lifetime. The guides felt like family by day three.", rating: 5 },
  { name: "Liam K.", country: "Ireland", text: "Seamless from the airport pickup to the final farewell dinner. They thought of every detail.", rating: 5 },
  { name: "Yuki T.", country: "Japan", text: "Beautifully organized cultural tour. We saw a side of Kathmandu most tourists never reach.", rating: 5 },
];

const blogPosts = [
  { title: "Best time to trek to Everest Base Camp", date: "Mar 12, 2026", excerpt: "Spring and autumn windows compared — and the quiet shoulder weeks we love." },
  { title: "A first-timer's guide to Kathmandu", date: "Feb 28, 2026", excerpt: "Where to land, what to eat and how to spend your first 48 hours in the valley." },
  { title: "Packing for the Annapurna Circuit", date: "Feb 02, 2026", excerpt: "A pragmatic kit list from a guide with 200+ crossings of Thorong La." },
];

function HomePage() {
  const { data: tours } = useSuspenseQuery(featuredToursQuery());

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="Himalayan peaks at sunrise with prayer flags" width={1920} height={1080} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 sm:pt-40 lg:px-8 lg:pb-32 lg:pt-48">
          <div className="max-w-3xl text-[color:var(--cream)]">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--saffron)]" />
              Based in Kathmandu · Since 2012
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
              Experience Nepal<br />with Local Experts
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              Himalayan treks, ancient cities and wild jungles — designed and guided by people who call this country home.
            </p>

            <div className="mt-8 rounded-2xl bg-background/95 p-2 shadow-xl backdrop-blur sm:rounded-full">
              <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto] sm:gap-0">
                <label className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm sm:rounded-full">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input placeholder="Where? (Everest, Annapurna…)" className="w-full bg-transparent placeholder:text-muted-foreground focus:outline-none" />
                </label>
                <label className="flex items-center gap-2 border-t border-border px-4 py-3 text-sm sm:border-l sm:border-t-0">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <input placeholder="When? (Mar – May)" className="w-full bg-transparent placeholder:text-muted-foreground focus:outline-none" />
                </label>
                <Link to="/tours" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 sm:rounded-full">
                  Find a trip <ArrowRight className="h-4 w-4" />
                </Link>
              </form>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[color:var(--saffron)] text-[color:var(--saffron)]" />
                ))}
                <span className="ml-2">4.9 · 600+ reviews</span>
              </div>
              <div className="h-4 w-px bg-white/30" />
              <div>12+ years of guiding</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Featured journeys</div>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Hand-crafted tours across Nepal</h2>
          </div>
          <Link to="/tours" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            View all tours <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((t) => <TourCard key={t.id} tour={t} />)}
        </div>
      </section>

      <section className="bg-[color:var(--cream)] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Why Woodapple</div>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">The local, licensed way to see Nepal</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trustPoints.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl bg-background p-6 ring-1 ring-border/60">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Travelers say</div>
        <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Stories from the trail</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-2xl bg-card p-7 ring-1 ring-border/60">
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[color:var(--saffron)] text-[color:var(--saffron)]" />
                ))}
              </div>
              <blockquote className="mt-4 font-display text-lg leading-snug text-foreground">“{t.text}”</blockquote>
              <figcaption className="mt-5 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{t.name}</span> · {t.country}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="bg-[color:var(--cream)] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Latest from Nepal</div>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Notes from our guides</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {blogPosts.map((p) => (
              <a key={p.title} href="#" className="group block rounded-2xl bg-background p-6 ring-1 ring-border/60 transition hover:shadow-md">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{p.date}</div>
                <h3 className="mt-2 font-display text-xl font-semibold leading-snug group-hover:text-primary">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Read more <ArrowRight className="h-4 w-4" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-[color:var(--mountain)] px-8 py-14 text-mountain-foreground sm:px-14">
          <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto]">
            <div>
              <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">Dreaming of the Himalaya?</h2>
              <p className="mt-2 max-w-xl text-white/80">Tell us when you'd like to come and what you'd like to see. We'll send a custom itinerary within 24 hours.</p>
            </div>
            <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--saffron)] px-6 py-3 text-sm font-semibold text-[color:var(--foreground)] hover:opacity-90">
              Plan My Trip <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
