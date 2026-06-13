import { Link } from "@tanstack/react-router";
import { Clock, MapPin } from "lucide-react";
import type { Tour } from "@/lib/tours";
import { FALLBACK_IMAGE } from "@/lib/tours";

const categoryLabel: Record<Tour["category"], string> = {
  trekking: "Trekking",
  cultural: "Cultural",
  adventure: "Adventure",
  wildlife: "Wildlife",
};

export function TourCard({ tour }: { tour: Tour }) {
  const img = tour.images[0] ?? FALLBACK_IMAGE;
  return (
    <Link
      to="/tours/$slug"
      params={{ slug: tour.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/60 transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={img}
          alt={tour.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 rounded-full bg-background/95 px-3 py-1 text-xs font-medium text-foreground">
          {categoryLabel[tour.category]}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{tour.difficulty} · {tour.best_season}</span>
        </div>
        <h3 className="mt-1.5 font-display text-xl font-semibold leading-snug text-foreground">
          {tour.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{tour.short_description}</p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-1.5 text-sm text-foreground/80">
            <Clock className="h-4 w-4" />
            {tour.duration_days} days
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">From</div>
            <div className="font-display text-lg font-semibold text-primary">${tour.price_usd}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
