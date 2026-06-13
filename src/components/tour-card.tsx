import { Link } from "@tanstack/react-router";
import { Clock, MapPin } from "lucide-react";
import type { Tour } from "@/data/tours";

export function TourCard({ tour }: { tour: Tour }) {
  return (
    <Link
      to="/tours/$slug"
      params={{ slug: tour.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/60 transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={tour.image}
          alt={tour.title}
          loading="lazy"
          width={1024}
          height={768}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 rounded-full bg-background/95 px-3 py-1 text-xs font-medium text-foreground">
          {tour.difficulty}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{tour.region}</span>
        </div>
        <h3 className="mt-1.5 font-display text-xl font-semibold leading-snug text-foreground">
          {tour.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{tour.short}</p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-1.5 text-sm text-foreground/80">
            <Clock className="h-4 w-4" />
            {tour.duration}
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">From</div>
            <div className="font-display text-lg font-semibold text-primary">${tour.priceUSD}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
