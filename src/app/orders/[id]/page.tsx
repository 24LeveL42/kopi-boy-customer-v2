import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderRealtimeRefresher } from "@/components/OrderRealtimeRefresher";
import { CancelOrderButton } from "@/components/CancelOrderButton";

export interface OrderRow {
  id: string;
  kitchen_id: string;
  subtotal: number;
  order_status: string;
  payment_status: string;
  preparation_status: string;
  created_at: string;
  decided_at: string | null;
  ready_at: string | null;
}

interface OrderItemRow {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface DeliveryRequestRow {
  status: string;
  accepted_at: string | null;
  completed_at: string | null;
}

interface Stage {
  message: string;
  at: string | null;
  tone: "warning" | "success" | "danger";
}

/**
 * Picks the delivery_requests row that represents visible progress to the
 * customer. A cook-ready order can have zero, one, or several requests over
 * time (e.g. a rider releases it back to open — `release_requested` — and a
 * different rider accepts next), but the customer only ever needs to know
 * about the one that got completed, or failing that the one currently
 * accepted. Anything else (open/cancelled/release_requested) still reads as
 * "looking for a rider" from the customer's side.
 */
export function pickActiveDelivery(deliveries: DeliveryRequestRow[]): DeliveryRequestRow | null {
  return deliveries.find((d) => d.status === "completed") ?? deliveries.find((d) => d.status === "accepted") ?? null;
}

/**
 * Maps order_status/preparation_status/delivery_requests to the single-line
 * stage message + timestamp the customer sees, per the locked stage list:
 * placed -> accepted+preparing -> ready -> rider assigned -> delivered, with
 * cancelled/rejected as terminal branches off of "placed". These stay
 * separate DB columns (locked business rule, docs/feature-001.md) but the
 * customer just wants one clear sentence and a "since when".
 */
export function getStage(order: OrderRow, activeDelivery: DeliveryRequestRow | null): Stage {
  if (order.order_status === "cancelled") {
    return { message: "Order was cancelled", at: order.decided_at, tone: "danger" };
  }
  if (order.order_status === "rejected") {
    return { message: "Order was rejected", at: order.decided_at, tone: "danger" };
  }
  if (activeDelivery?.status === "completed") {
    return { message: "Delivered", at: activeDelivery.completed_at, tone: "success" };
  }
  if (activeDelivery?.status === "accepted") {
    return {
      message: "A rider has been assigned and is on the way to pick up your order",
      at: activeDelivery.accepted_at,
      tone: "success",
    };
  }
  if (order.preparation_status === "ready") {
    return { message: "Ready — looking for a rider", at: order.ready_at, tone: "success" };
  }
  if (order.order_status === "accepted") {
    return { message: "Order confirmed — cook is preparing your food", at: order.decided_at, tone: "warning" };
  }
  return { message: "Waiting for kitchen to accept", at: order.created_at, tone: "warning" };
}

function formatTimestamp(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-SG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

const STAGE_STYLE: Record<Stage["tone"], { background: string; color: string }> = {
  danger: { background: "rgba(239,68,68,0.12)", color: "var(--kb-danger)" },
  success: { background: "rgba(4,120,87,0.12)", color: "var(--kb-green-deep)" },
  warning: { background: "rgba(245,158,11,0.15)", color: "#92640A" },
};

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
 * Order confirmation — Feature #005, extended for cancellation + the full
 * status timeline. RLS on `orders` only lets a customer read their own rows,
 * so someone else's order id here just 404s rather than leaking that the
 * order exists.
 */
export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // select("*") rather than an explicit column list: `ready_at` is new (this
  // feature) and, on a project where docs/supabase-schema.sql's migration
  // hasn't been run yet, doesn't exist as a column at all — naming a
  // nonexistent column in an explicit select fails the whole query, whereas
  // `*` just omits it, so the page still works (minus that one timestamp)
  // until the migration is applied. Same pattern CookOrdersPanel already
  // uses in the Partner app.
  const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle<OrderRow>();

  if (!order) notFound();

  const [{ data: kitchen }, { data: items }, { data: deliveries }] = await Promise.all([
    supabase
      .from("kitchens")
      .select("business_name, paynow_type, paynow_value")
      .eq("id", order.kitchen_id)
      .maybeSingle<{ business_name: string; paynow_type: string | null; paynow_value: string | null }>(),
    supabase.from("order_items").select("id, name, price, quantity").eq("order_id", id).order("id").returns<OrderItemRow[]>(),
    supabase
      .from("delivery_requests")
      .select("status, accepted_at, completed_at")
      .eq("order_id", id)
      .order("created_at", { ascending: false })
      .returns<DeliveryRequestRow[]>(),
  ]);

  const activeDelivery = pickActiveDelivery(deliveries ?? []);
  const stage = getStage(order, activeDelivery);
  const stageTimestamp = formatTimestamp(stage.at);

  const isSettled =
    order.order_status === "cancelled" || order.order_status === "rejected" || activeDelivery?.status === "completed";

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6" style={{ background: "var(--kb-navy)", color: "var(--kb-on-navy)" }}>
      <OrderRealtimeRefresher orderId={order.id} isSettled={isSettled} />
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
            style={STAGE_STYLE[stage.tone]}
          >
            {stage.message}
          </p>
          {stageTimestamp && (
            <p className="mt-1 text-[11px]" style={{ color: "var(--kb-ink-soft)" }}>
              {stageTimestamp}
            </p>
          )}
          <p className="mt-1.5 text-xs" style={{ color: "var(--kb-ink-soft)" }}>
            {getPaymentMessage(order.payment_status, kitchen?.paynow_type ?? null, kitchen?.paynow_value ?? null)}
          </p>

          {order.order_status === "placed" && <CancelOrderButton orderId={order.id} />}

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
