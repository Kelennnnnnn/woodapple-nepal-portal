import { useQuery } from "@tanstack/react-query";
import { Award, Calendar, Globe2, Star } from "lucide-react";
import { trustStatsQuery, DEFAULT_TRUST } from "@/lib/settings";

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k+`;
  return `${n}+`;
}

export function TrustBar() {
  const { data } = useQuery(trustStatsQuery());
  const s = data ?? DEFAULT_TRUST;
  const items = [
    { icon: Calendar, value: `${s.years_operating}+`, label: "Years in operation" },
    { icon: Award, value: fmt(s.happy_travelers), label: "Happy travelers" },
    { icon: Globe2, value: `${s.destinations}+`, label: "Destinations covered" },
    { icon: Star, value: s.average_rating.toFixed(1), label: "Average rating" },
  ];
  return (
    <section className="border-y border-border bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-6 px-4 py-8 sm:grid-cols-4 sm:px-6 lg:px-8">
        {items.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-2xl font-semibold leading-none">{value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
