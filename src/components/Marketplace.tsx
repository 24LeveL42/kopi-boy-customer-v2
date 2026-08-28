"use client";

import { useMemo, useState } from "react";
import { CUISINES } from "@/lib/demo-data";
import { Merchant, MerchantCategory, CuisineType } from "@/lib/types";
import { SearchBar } from "./SearchBar";
import { CategoryGrid } from "./CategoryGrid";
import { CuisineFilter } from "./CuisineFilter";
import { MerchantGrid } from "./MerchantGrid";
import { TopBar } from "./TopBar";
import { LogoCard } from "./LogoCard";
import { CartButton } from "./CartButton";
import { BottomNav } from "./BottomNav";

export function filterMerchants(
  merchants: Merchant[],
  query: string,
  category: MerchantCategory | "all",
  cuisine: CuisineType | "all" = "all"
): Merchant[] {
  const q = query.trim().toLowerCase();
  return merchants.filter((m) => {
    if (category !== "all" && m.category !== category) return false;
    if (cuisine !== "all" && m.cuisineType !== cuisine) return false;
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.cuisine.toLowerCase().includes(q) ||
      m.neighbourhood.toLowerCase().includes(q) ||
      m.menuHighlights.some((item) => item.name.toLowerCase().includes(q))
    );
  });
}

export function Marketplace({ merchants }: { merchants: Merchant[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<MerchantCategory | "all">("all");
  const [cuisine, setCuisine] = useState<CuisineType | "all">("all");

  const filtered = useMemo(
    () => filterMerchants(merchants, query, category, cuisine),
    [merchants, query, category, cuisine]
  );

  const popular = useMemo(
    () => [...merchants].sort((a, b) => b.rating - a.rating).slice(0, 6),
    [merchants]
  );

  const isBrowsing = query.trim() !== "" || category !== "all" || cuisine !== "all";

  return (
    <div className="min-h-screen pb-28" style={{ background: "var(--kb-navy)" }}>
      <div className="mx-auto max-w-md space-y-4 px-4 pt-4 sm:max-w-lg sm:px-6">
        <TopBar />
        <LogoCard />
        <SearchBar value={query} onChange={setQuery} />
        <CategoryGrid active={category} onSelect={setCategory} />
        <CuisineFilter cuisines={CUISINES} active={cuisine} onSelect={setCuisine} />
      </div>

      <main className="mx-auto max-w-md space-y-8 px-4 py-6 sm:max-w-lg sm:px-6">
        {isBrowsing ? (
          <MerchantGrid
            merchants={filtered}
            heading={category === "all" ? `Results for "${query || cuisineLabel(cuisine)}"` : categoryLabel(category)}
          />
        ) : (
          <>
            <MerchantGrid merchants={popular} heading="🔥 Popular Near You" showSeeAll />
            <MerchantGrid merchants={merchants} heading="All Cooks & Stalls" />
          </>
        )}
      </main>

      <CartButton count={2} />
      <BottomNav />
    </div>
  );
}

function categoryLabel(id: MerchantCategory) {
  const labels: Record<MerchantCategory, string> = {
    "home-cook": "Home Cooks",
    hawker: "Hawkers",
    bakery: "Bakery",
    "bulk-orders": "Bulk Orders",
    drinks: "Desserts & Drinks",
  };
  return labels[id];
}

function cuisineLabel(id: CuisineType | "all") {
  return CUISINES.find((c) => c.id === id)?.label ?? "";
}
