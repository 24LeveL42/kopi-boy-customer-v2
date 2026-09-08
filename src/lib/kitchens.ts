import { createClient } from "@/lib/supabase/server";
import { Merchant } from "@/lib/types";

interface KitchenRow {
  id: string;
  business_name: string;
  category: Merchant["category"];
  cuisine_type: Merchant["cuisineType"];
  neighbourhood: string;
  description: string | null;
  hero_image: string | null;
}

interface MenuItemRow {
  id: string;
  kitchen_id: string;
  name: string;
  price: number;
  photo_url: string | null;
}

const CUISINE_LABEL: Record<Merchant["cuisineType"], string> = {
  chinese: "Chinese",
  halal: "Halal",
  indian: "Indian",
  western: "Western",
};

const CATEGORY_FALLBACK_IMAGE: Record<Merchant["category"], string> = {
  "home-cook": "/categories/home-cooks.jpg",
  hawker: "/categories/hawkers.jpg",
  bakery: "/categories/bakers.jpg",
  "bulk-orders": "/categories/bulk-orders.jpg",
  drinks: "/categories/drinks-desserts.jpg",
};

/**
 * Real merchants for the marketplace — Feature #003.
 *
 * Distance/ETA aren't modeled yet (no geolocation feature exists), so they're
 * fixed placeholders here rather than computed. Ratings are all zero with
 * `isNew: true` since Feature #009 (ratings) hasn't shipped — replace both
 * of these when those features land. `demo-data.ts` (Feature #001) is no
 * longer used for the live home page; kept only for the test fixtures.
 */
export async function getLiveMerchants(): Promise<Merchant[]> {
  const supabase = await createClient();

  const { data: kitchens } = await supabase
    .from("kitchens")
    .select("*")
    .eq("is_live", true)
    .returns<KitchenRow[]>();

  if (!kitchens || kitchens.length === 0) return [];

  const { data: items } = await supabase
    .from("menu_items")
    .select("*")
    .in(
      "kitchen_id",
      kitchens.map((k) => k.id)
    )
    .order("created_at", { ascending: true })
    .returns<MenuItemRow[]>();

  return kitchens.map((k) => {
    const kitchenItems = (items ?? []).filter((i) => i.kitchen_id === k.id);
    const prices = kitchenItems.map((i) => i.price);
    const image = k.hero_image ?? CATEGORY_FALLBACK_IMAGE[k.category];

    return {
      id: k.id,
      name: k.business_name,
      category: k.category,
      cuisine: CUISINE_LABEL[k.cuisine_type],
      neighbourhood: k.neighbourhood,
      blurb: k.description ?? "",
      rating: 0,
      ratingCount: 0,
      etaMinutes: 30,
      distanceKm: 0,
      priceFrom: prices.length > 0 ? Math.min(...prices) : 0,
      heroImage: image,
      avatarImage: image,
      cuisineType: k.cuisine_type,
      menuHighlights: kitchenItems.slice(0, 2).map((i) => ({ name: i.name, price: i.price })),
      isNew: true,
    };
  });
}
