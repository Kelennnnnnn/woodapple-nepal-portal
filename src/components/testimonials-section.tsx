import { useQuery } from "@tanstack/react-query";
import { Star, UserRound } from "lucide-react";
import { testimonialsQuery } from "@/lib/settings";

export function TestimonialsSection() {
  const { data } = useQuery(testimonialsQuery({ featuredOnly: true }));
  const items = (data ?? []).slice(0, 6);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Travelers say</div>
      <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Stories from the trail</h2>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {items.map((t) => (
          <figure key={t.id} className="flex flex-col rounded-2xl bg-card p-7 ring-1 ring-border/60">
            <div className="flex gap-0.5">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-[color:var(--saffron)] text-[color:var(--saffron)]" />
              ))}
            </div>
            <blockquote className="mt-4 flex-1 font-display text-lg leading-snug text-foreground">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              {t.photo_url ? (
                <img src={t.photo_url} alt={t.name} className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <div className="grid h-11 w-11 place-items-center rounded-full bg-muted text-muted-foreground">
                  <UserRound className="h-5 w-5" />
                </div>
              )}
              <div className="text-sm">
                <div className="font-semibold text-foreground">{t.name}</div>
                <div className="text-muted-foreground">
                  {t.country}
                  {t.tour_title ? ` · ${t.tour_title}` : ""}
                </div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
