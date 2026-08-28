/**
 * Domain types — Feature #001 scope.
 *
 * Only what the customer marketplace needs to render is modeled here.
 * Order/payment/delivery/rating state machines from the handover doc
 * (sections 24) are intentionally NOT modeled yet — they belong to
 * Features #005–#010. Do not expand this file to cover them early;
 * add a new file per feature so this stays a marketplace-only model.
 */

export type MerchantCategory = "home-cook" | "hawker" | "bulk-orders" | "bakery" | "drinks";

export type CuisineType = "chinese" | "halal" | "indian" | "western";

export interface CuisineDef {
  id: CuisineType | "all";
  label: string;
}

export interface CategoryDef {
  id: MerchantCategory | "all";
  label: string;
}

export interface MenuHighlight {
  name: string;
  price: number; // SGD
}

export interface Merchant {
  id: string;
  name: string;
  category: MerchantCategory;
  cuisine: string;
  neighbourhood: string;
  blurb: string;
  rating: number; // 0-5
  ratingCount: number;
  etaMinutes: number;
  distanceKm: number;
  priceFrom: number; // SGD, cheapest menu item
  heroImage: string;
  avatarImage: string;
  cuisineType: CuisineType;
  menuHighlights: MenuHighlight[];
  isNew?: boolean;
}
