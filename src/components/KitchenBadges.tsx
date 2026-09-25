import type { MerchantCategory } from "@/lib/types";

export const CATEGORY_LABEL: Record<MerchantCategory, string> = {
  "home-cook": "Home Cook",
  hawker: "Hawker",
  bakery: "Bakery",
  "bulk-orders": "Vegetarian",
  drinks: "Desserts & Drinks",
};

const CATEGORY_PILL: Record<MerchantCategory, { bg: string; fg: string }> = {
  "home-cook": { bg: "var(--kb-cat-homecook-bg)", fg: "var(--kb-cat-homecook-fg)" },
  hawker: { bg: "var(--kb-cat-hawker-bg)", fg: "var(--kb-cat-hawker-fg)" },
  bakery: { bg: "var(--kb-cat-bakery-bg)", fg: "var(--kb-cat-bakery-fg)" },
  "bulk-orders": { bg: "var(--kb-cat-bulkorders-bg)", fg: "var(--kb-cat-bulkorders-fg)" },
  drinks: { bg: "var(--kb-cat-drinks-bg)", fg: "var(--kb-cat-drinks-fg)" },
};

/** The kitchen's own category, as the cook chose it — not a verified claim. */
export function CategoryPill({ category }: { category: MerchantCategory }) {
  const pill = CATEGORY_PILL[category];
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: pill.bg, color: pill.fg }}
    >
      {CATEGORY_LABEL[category]}
    </span>
  );
}

/**
 * Shown only when the kitchen has a business_uen, which the database copies
 * from the cook's HQ-approved application and never takes from the cook
 * (Partner app's docs/supabase-schema.sql section 27). That's what makes it a
 * trust signal, unlike the self-chosen category. `showUen` adds the number
 * itself so a customer can look it up on ACRA BizFile.
 */
export function RegisteredBadge({ uen, showUen = false }: { uen: string; showUen?: boolean }) {
  return (
    <span
      data-testid="registered-badge"
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: "var(--kb-green-deep)", color: "white" }}
      title={`Registered business · UEN ${uen}`}
    >
      <CheckIcon /> Registered business{showUen && <span className="font-medium opacity-90">· UEN {uen}</span>}
    </span>
  );
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
