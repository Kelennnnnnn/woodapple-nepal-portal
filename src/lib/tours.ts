import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TourCategory = "trekking" | "cultural" | "adventure" | "wildlife";

export type ItineraryDay = { day: number; title: string; description: string };
export type FaqItem = { q: string; a: string };

export type Tour = {
  id: string;
  title: string;
  slug: string;
  category: TourCategory;
  short_description: string;
  full_description: string;
  itinerary: ItineraryDay[];
  duration_days: number;
  price_usd: number;
  group_size: string;
  difficulty: string;
  best_season: string;
  included: string[];
  excluded: string[];
  faq: FaqItem[];
  images: string[];
  featured: boolean;
  created_at: string;
};

const mapTour = (row: any): Tour => ({
  ...row,
  price_usd: Number(row.price_usd),
  itinerary: Array.isArray(row.itinerary) ? row.itinerary : [],
  faq: Array.isArray(row.faq) ? row.faq : [],
  included: row.included ?? [],
  excluded: row.excluded ?? [],
  images: row.images ?? [],
});

export const toursListQuery = () =>
  queryOptions({
    queryKey: ["tours"],
    queryFn: async (): Promise<Tour[]> => {
      const { data, error } = await supabase
        .from("tours")
        .select("*")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapTour);
    },
  });

export const featuredToursQuery = () =>
  queryOptions({
    queryKey: ["tours", "featured"],
    queryFn: async (): Promise<Tour[]> => {
      const { data, error } = await supabase
        .from("tours")
        .select("*")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data ?? []).map(mapTour);
    },
  });

export const tourBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["tours", "slug", slug],
    queryFn: async (): Promise<Tour | null> => {
      const { data, error } = await supabase
        .from("tours")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data ? mapTour(data) : null;
    },
  });

export const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1486911278844-a81c5267e227?w=1600";
