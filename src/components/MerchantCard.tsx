import Image from "next/image";
import Link from "next/link";
import { Merchant } from "@/lib/types";

const CATEGORY_LABEL: Record<Merchant["category"], string> = {
  "home-cook": "Home Cook",
  hawker: "Hawker",
  bakery: "Bakery",
  "bulk-orders": "Bulk Orders",
  drinks: "Desserts & Drinks",
};

const CATEGORY_PILL: Record<Merchant["category"], { bg: string; fg: string }> = {
  "home-cook": { bg: "var(--kb-cat-homecook-bg)", fg: "var(--kb-cat-homecook-fg)" },
  hawker: { bg: "var(--kb-cat-hawker-bg)", fg: "var(--kb-cat-hawker-fg)" },
  bakery: { bg: "var(--kb-cat-bakery-bg)", fg: "var(--kb-cat-bakery-fg)" },
  "bulk-orders": { bg: "var(--kb-cat-bulkorders-bg)", fg: "var(--kb-cat-bulkorders-fg)" },
  drinks: { bg: "var(--kb-cat-drinks-bg)", fg: "var(--kb-cat-drinks-fg)" },
};

export function MerchantCard({ merchant }: { merchant: Merchant }) {
  const pill = CATEGORY_PILL[merchant.category];

  return (
    <Link
      href={`/merchant/${merchant.id}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5"
    >
      <div className="relative h-40 w-full sm:h-44">
        <Image
          src={merchant.heroImage}
          alt=""
          fill
          sizes="(min-width: 768px) 340px, 90vw"
          className="object-cover"
        />
        {/* Rating badge, top-right */}
        <span
          className="absolute right-2 top-2 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-white"
          style={{ background: "rgba(11,27,52,0.72)" }}
        >
          <StarIcon /> {merchant.rating.toFixed(1)}
        </span>
        {merchant.isNew && (
          <span
            className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
            style={{ background: "var(--kb-green-deep)" }}
          >
            New
          </span>
        )}
        {/* Location + distance badge, bottom-left */}
        <span
          className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-white"
          style={{ background: "rgba(11,27,52,0.72)" }}
        >
          <PinIcon /> {merchant.neighbourhood} &middot; {merchant.distanceKm} km
        </span>
      </div>

      <div className="p-3" style={{ color: "var(--kb-ink)" }}>
        <div className="flex items-center gap-2">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white shadow">
            <Image src={merchant.avatarImage} alt="" fill sizes="36px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold leading-tight">{merchant.name}</h3>
            <span
              className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{ background: pill.bg, color: pill.fg }}
            >
              {CATEGORY_LABEL[merchant.category]}
            </span>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11.5px] font-medium"
            style={{ background: "var(--kb-cream)", color: "var(--kb-ink)" }}
          >
            🔥 {merchant.menuHighlights[0]?.name}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11.5px] font-semibold"
            style={{ background: "#FDF3D9", color: "#8A6200" }}
          >
            💰 From ${merchant.priceFrom.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--kb-warn)" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M12 21s7-6.1 7-11a7 7 0 10-14 0c0 4.9 7 11 7 11z" />
    </svg>
  );
}
