import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Merchant profile route — routing scaffold, updated for Feature #003 to
 * read the real `kitchens` row instead of demo data. Full profile UI
 * (menu grid, cart, PayNow flow) is still Feature #004+.
 */
export default async function MerchantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: kitchen } = await supabase
    .from("kitchens")
    .select("*")
    .eq("id", id)
    .eq("is_live", true)
    .maybeSingle();

  if (!kitchen) notFound();

  const CUISINE_LABEL: Record<string, string> = {
    chinese: "Chinese",
    halal: "Halal",
    indian: "Indian",
    western: "Western",
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6" style={{ background: "var(--kb-navy)", color: "var(--kb-on-navy)" }}>
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm" style={{ color: "var(--kb-green)" }}>
          &larr; Back to marketplace
        </Link>
        <h1 className="mt-4 font-display text-2xl font-semibold">{kitchen.business_name}</h1>
        <p className="mt-1" style={{ color: "var(--kb-on-navy-soft)" }}>
          {CUISINE_LABEL[kitchen.cuisine_type] ?? kitchen.cuisine_type} &middot; {kitchen.neighbourhood}
        </p>
        {kitchen.description && <p className="mt-4">{kitchen.description}</p>}
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
