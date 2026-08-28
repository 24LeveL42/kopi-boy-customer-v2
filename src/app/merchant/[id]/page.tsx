import Link from "next/link";
import { notFound } from "next/navigation";
import { MERCHANTS } from "@/lib/demo-data";

/**
 * Merchant profile route — routing scaffold only for Feature #001.
 * Full profile UI (menu, cart, PayNow flow) is Feature #004+.
 */
export default async function MerchantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const merchant = MERCHANTS.find((m) => m.id === id);
  if (!merchant) notFound();

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6" style={{ background: "var(--kb-navy)", color: "var(--kb-on-navy)" }}>
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm" style={{ color: "var(--kb-green)" }}>
          &larr; Back to marketplace
        </Link>
        <h1 className="mt-4 font-display text-2xl font-semibold">{merchant.name}</h1>
        <p className="mt-1" style={{ color: "var(--kb-on-navy-soft)" }}>
          {merchant.cuisine} · {merchant.neighbourhood}
        </p>
        <p className="mt-4">{merchant.blurb}</p>
        <div
          className="mt-6 rounded-xl border border-dashed p-4 text-sm"
          style={{ borderColor: "var(--kb-navy-line)", color: "var(--kb-on-navy-soft)" }}
        >
          Full menu, cart, and PayNow checkout land in Feature #004–#006. This
          route exists now so navigation and IDs are stable.
        </div>
      </div>
    </div>
  );
}
