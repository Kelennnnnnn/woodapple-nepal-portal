import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Globe2, HeartHandshake, Leaf } from "lucide-react";
import heroImg from "@/assets/tour-annapurna.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Woodapple Tours and Travel" },
      { name: "description", content: "Meet the licensed Kathmandu team behind Woodapple — Nepali guides building responsible Himalayan journeys since 2012." },
      { property: "og:title", content: "About Woodapple Tours" },
      { property: "og:description", content: "Meet the licensed Kathmandu team behind Woodapple Tours and Travel." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const values = [
  { icon: Award, title: "Licensed expertise", body: "Registered with the Nepal Tourism Board and TAAN, with NMA-certified mountain guides on every trek." },
  { icon: HeartHandshake, title: "Local first", body: "We hire locally, source locally and reinvest in the villages we walk through." },
  { icon: Leaf, title: "Lower impact", body: "Pack-in pack-out trekking, no single-use plastics on our trips and a tree planted for every traveler." },
  { icon: Globe2, title: "International standard", body: "English, French and Japanese speaking guides, 24/7 emergency response and full trip insurance support." },
];

function AboutPage() {
  return (
    <>
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="" width={1920} height={1080} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 to-black/65" />
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-32 text-[color:var(--cream)] sm:px-6 sm:pt-40 lg:px-8">
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--saffron)]">About us</div>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-6xl">
            A small Kathmandu team with a big love for Nepal
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            Woodapple was founded in 2012 by three friends who grew up trekking the trails we now guide. We've welcomed travelers from over 40 countries — one careful, considered trip at a time.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Our story</div>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Born in the Himalaya, made for you
            </h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>What began as a tiny office above a tea shop in Thamel is now a fully licensed tour operator — but the way we work hasn't changed. We still answer every inquiry personally, still walk every new trail before we put it on the website, and still believe a good guide is the difference between a trip and a memory.</p>
              <p>Over the past decade we've grown a network of guides, porters, lodge owners and drivers across Nepal — most of whom have been with us since the beginning. When you travel with Woodapple, you're traveling with their families too.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { k: "600+", v: "Happy travelers" },
              { k: "40+", v: "Countries hosted" },
              { k: "12 yrs", v: "Guiding experience" },
              { k: "4.9 ★", v: "Average review" },
            ].map((s) => (
              <div key={s.v} className="rounded-2xl bg-[color:var(--cream)] p-6">
                <div className="font-display text-4xl font-semibold text-primary">{s.k}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--cream)] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-primary">What we stand for</div>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Our values</h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {values.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl bg-background p-7 ring-1 ring-border/60">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">Ready to come visit?</h2>
        <p className="mt-3 text-muted-foreground">We'd love to hear what you're dreaming about.</p>
        <Link
          to="/contact"
          className="mt-6 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Plan My Trip
        </Link>
      </section>
    </>
  );
}
