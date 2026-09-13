import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface OrderRow {
  id: string;
  kitchen_id: string;
  subtotal: number;
  status: string;
}

interface OrderItemRow {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

/**
 * Order confirmation — Feature #005. RLS on `orders` only lets a customer
 * read their own rows, so someone else's order id here just 404s rather
 * than leaking that the order exists.
 */
export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, kitchen_id, subtotal, status")
    .eq("id", id)
    .maybeSingle<OrderRow>();

  if (!order) notFound();

  const [{ data: kitchen }, { data: items }] = await Promise.all([
    supabase.from("kitchens").select("business_name").eq("id", order.kitchen_id).maybeSingle<{ business_name: string }>(),
    supabase.from("order_items").select("id, name, price, quantity").eq("order_id", id).order("id").returns<OrderItemRow[]>(),
  ]);

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6" style={{ background: "var(--kb-navy)", color: "var(--kb-on-navy)" }}>
      <div className="mx-auto max-w-sm">
        <div className="rounded-2xl bg-white p-6 text-center shadow-lg" style={{ color: "var(--kb-ink)" }}>
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "var(--kb-green-deep)" }}
          >
            <CheckIcon />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold">Order placed!</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--kb-ink-soft)" }}>
            {kitchen?.business_name ?? "The kitchen"} has received your order.
          </p>

          <div className="mt-5 space-y-2 text-left">
            {(items ?? []).map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.quantity}&times; {item.name}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div
            className="mt-4 flex justify-between border-t pt-3 font-semibold"
            style={{ borderColor: "var(--kb-cream)" }}
          >
            <span>Total</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>

          <Link
            href="/"
            className="mt-6 inline-block w-full rounded-xl py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(90deg, var(--kb-purple) 0%, var(--kb-green) 100%)" }}
          >
            Back to marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 12 9 17 20 6" />
    </svg>
  );
}
