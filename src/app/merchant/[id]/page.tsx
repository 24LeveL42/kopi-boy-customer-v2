import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MenuItemRow } from "@/components/MenuItemRow";
import { CategoryPill, RegisteredBadge } from "@/components/KitchenBadges";
import type { MerchantCategory } from "@/lib/types";

/**
 * Merchant profile route — updated for Feature #005 to render the real menu
 * (Feature #004 was never built as its own pass; a menu grid was added here
 * directly since #005 needs one to add items from). PayNow/checkout status
 * beyond "placed" is still Feature #006.
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
    .maybeSingle<{
      id: string;
      business_name: string;
      category: MerchantCategory;
      cuisine_type: string;
      neighbourhood: string;
      description: string | null;
      business_uen?: string | null;
    }>();

  if (!kitchen) notFound();

  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("id, name, price, photo_url")
    .eq("kitchen_id", id)
    .order("created_at", { ascending: true });

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
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <CategoryPill category={kitchen.category} />
          {kitchen.business_uen && <RegisteredBadge uen={kitchen.business_uen} showUen />}
        </div>
        <p className="mt-1" style={{ color: "var(--kb-on-navy-soft)" }}>
          {CUISINE_LABEL[kitchen.cuisine_type] ?? kitchen.cuisine_type} &middot; {kitchen.neighbourhood}
        </p>
        {kitchen.description && <p className="mt-4">{kitchen.description}</p>}

        <h2 className="mt-6 font-display text-lg font-semibold">Menu</h2>
        <div className="mt-3 space-y-2">
          {menuItems && menuItems.length > 0 ? (
            menuItems.map((item) => (
              <MenuItemRow key={item.id} kitchenId={kitchen.id} kitchenName={kitchen.business_name} item={item} />
            ))
          ) : (
            <p className="text-sm" style={{ color: "var(--kb-on-navy-soft)" }}>
              This kitchen hasn&apos;t added any menu items yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
