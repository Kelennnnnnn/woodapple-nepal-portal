import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CurrencyCode = "USD" | "AUD" | "EUR";
export type CurrencyRates = Record<CurrencyCode, number>;
export type TrustStats = {
  years_operating: number;
  happy_travelers: number;
  destinations: number;
  average_rating: number;
};

export const DEFAULT_RATES: CurrencyRates = { USD: 1, AUD: 1.52, EUR: 0.93 };
export const DEFAULT_TRUST: TrustStats = {
  years_operating: 12,
  happy_travelers: 6000,
  destinations: 45,
  average_rating: 4.9,
};

async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error || !data) return fallback;
  return { ...fallback, ...(data.value as object) } as T;
}

export const currencyRatesQuery = () =>
  queryOptions({
    queryKey: ["settings", "currency_rates"],
    queryFn: () => getSetting<CurrencyRates>("currency_rates", DEFAULT_RATES),
    staleTime: 5 * 60 * 1000,
  });

export const trustStatsQuery = () =>
  queryOptions({
    queryKey: ["settings", "trust_stats"],
    queryFn: () => getSetting<TrustStats>("trust_stats", DEFAULT_TRUST),
    staleTime: 5 * 60 * 1000,
  });

export type Testimonial = {
  id: string;
  name: string;
  country: string;
  tour_title: string;
  rating: number;
  quote: string;
  photo_url: string;
  featured: boolean;
  created_at: string;
};

export const testimonialsQuery = (opts: { featuredOnly?: boolean } = {}) =>
  queryOptions({
    queryKey: ["testimonials", opts.featuredOnly ? "featured" : "all"],
    queryFn: async (): Promise<Testimonial[]> => {
      let q = supabase.from("testimonials").select("*").order("created_at", { ascending: false });
      if (opts.featuredOnly) q = q.eq("featured", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Testimonial[];
    },
  });
