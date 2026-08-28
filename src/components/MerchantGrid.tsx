import { Merchant } from "@/lib/types";
import { MerchantCard } from "./MerchantCard";

export function MerchantGrid({
  merchants,
  heading,
  showSeeAll = false,
}: {
  merchants: Merchant[];
  heading: string;
  showSeeAll?: boolean;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold" style={{ color: "var(--kb-on-navy)" }}>
          {heading}
        </h2>
        {showSeeAll && (
          <button className="flex items-center gap-1 text-sm font-medium" style={{ color: "var(--kb-on-navy-soft)" }}>
            See All
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        )}
      </div>
      {merchants.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {merchants.map((m) => (
            <MerchantCard key={m.id} merchant={m} />
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-2xl border border-dashed p-8 text-center"
      style={{ borderColor: "var(--kb-navy-line)", color: "var(--kb-on-navy-soft)" }}
    >
      <p className="font-medium" style={{ color: "var(--kb-on-navy)" }}>
        No one here yet — try a different search or category.
      </p>
      <p className="mt-1 text-sm">New home cooks and hawkers join Kopi Boy every week.</p>
    </div>
  );
}
