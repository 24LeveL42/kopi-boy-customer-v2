import Image from "next/image";
import { MerchantCategory } from "@/lib/types";

interface CategoryTile {
  id: MerchantCategory;
  label: string;
  image: string;
  wide?: boolean;
}

const TILES: CategoryTile[] = [
  { id: "home-cook", label: "Home cooks", image: "/categories/home-cooks.jpg" },
  { id: "hawker", label: "Hawkers", image: "/categories/hawkers.jpg" },
  { id: "bulk-orders", label: "Bulk Orders", image: "/categories/bulk-orders.jpg" },
  { id: "bakery", label: "Bakers", image: "/categories/bakers.jpg" },
  { id: "drinks", label: "Drinks and Desserts", image: "/categories/drinks-desserts.jpg", wide: true },
];

export function CategoryGrid({
  active,
  onSelect,
}: {
  active: MerchantCategory | "all";
  onSelect: (id: MerchantCategory | "all") => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3" role="tablist" aria-label="Merchant categories">
      {TILES.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(isActive ? "all" : t.id)}
            className={`relative h-24 overflow-hidden rounded-2xl text-left ${t.wide ? "col-span-2" : ""}`}
            style={{ outline: isActive ? "3px solid var(--kb-green)" : "none", outlineOffset: "-3px" }}
          >
            <Image
              src={t.image}
              alt=""
              fill
              sizes={t.wide ? "100vw" : "50vw"}
              className="object-cover"
            />
            <span
              className="absolute inset-x-0 top-0 py-1.5 text-center text-[13px] font-bold text-white"
              style={{ background: "var(--kb-purple)" }}
            >
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
