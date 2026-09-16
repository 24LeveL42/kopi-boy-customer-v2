import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderStatusPoller } from "@/components/OrderStatusPoller";

interface OrderRow {
  id: string;
  kitchen_id: string;
  subtotal: number;
  order_status: string;
  payment_status: string;
  preparation_status: string;
}

interface OrderItemRow {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

/**
 * Maps order_status/preparation_status to the single-line stage message the
 * customer sees. These are deliberately separate DB columns (locked business
 * rule, docs/feature-001.md) but the customer just wants one clear sentence.
 */
function getStageMessage(orderStatus: string, preparationStatus: string): string {
  if (orderStatus === "rejected") return "Kitchen declined this order";
  if (orderStatus === "placed") return "Waiting for kitchen to accept";
  if (preparationStatus === "ready") return "Ready — looking for a rider";
  if (preparationStatus === "preparing") return "Cook is preparing your food";
  return "Kitchen accepted your order";
}

function getPaynowInstruction(paynowType: string | null, paynowValue: string | null): string | null {
  if (!paynowType || !paynowValue) return null;
  return paynowType === "mobile" ? `Pay via PayNow to +65 ${paynowValue}` : `Pay via PayNow to UEN ${paynowValue}`;
}

function getPaymentMessage(
  paymentStatus: string,
  paynowType: string | null,
  paynowValue: string | null
): string {
  if (paymentStatus === "paid") return "Payment received";
  const paynowInstruction = getPaynowInstruction(paynowType, paynowValue);
  return paynowInstruction
    ? `Payment pending — ${paynowInstruction} once accepted`
    : "Payment pending — pay the cook via PayNow once accepted";
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
    .select("id, kitchen_id, subtotal, order_status, payment_status, preparation_status")
    .eq("id", id)
    .maybeSingle<OrderRow>();

  if (!order) notFound();

  const isSettled =
    order.order_status === "rejected" ||
    (order.preparation_status === "ready" && order.payment_status === "paid");

  const [{ data: kitchen }, { data: items }] = await Promise.all([
    supabase
      .from("kitchens")
      .select("business_name, paynow_type, paynow_value")
      .eq("id", order.kitchen_id)
      .maybeSingle<{ business_name: string; paynow_type: string | null; paynow_value: string | null }>(),
    supabase.from("order_items").select("id, name, price, quantity").eq("order_id", id).order("id").returns<OrderItemRow[]>(),
  ]);

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6" style={{ background: "var(--kb-navy)", color: "var(--kb-on-navy)" }}>
      <OrderStatusPoller isSettled={isSettled} />
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

          <p
            className="mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold"
            style={
              order.order_status === "rejected"
                ? { background: "rgba(239,68,68,0.12)", color: "var(--kb-danger)" }
                : order.preparation_status === "ready"
                  ? { background: "rgba(4,120,87,0.12)", color: "var(--kb-green-deep)" }
                  : { background: "rgba(245,158,11,0.15)", color: "#92640A" }
            }
          >
            {getStageMessage(order.order_status, order.preparation_status)}
          </p>
          <p className="mt-1.5 text-xs" style={{ color: "var(--kb-ink-soft)" }}>
            {getPaymentMessage(order.payment_status, kitchen?.paynow_type ?? null, kitchen?.paynow_value ?? null)}
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
