"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { placeOrder } from "@/lib/order-actions";

export function CartView({ isSignedIn }: { isSignedIn: boolean }) {
  const { cart, setQuantity, subtotal, clearCart } = useCart();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen px-4 py-8 sm:px-6" style={{ background: "var(--kb-navy)", color: "var(--kb-on-navy)" }}>
        <div className="mx-auto max-w-sm text-center">
          <h1 className="font-display text-xl font-bold">Your cart</h1>
          <p className="mt-4" style={{ color: "var(--kb-on-navy-soft)" }}>
            Your cart is empty.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(90deg, var(--kb-purple) 0%, var(--kb-green) 100%)" }}
          >
            Browse merchants
          </Link>
        </div>
      </div>
    );
  }

  function handlePlaceOrder() {
    if (!cart) return;
    setError(null);
    startTransition(async () => {
      try {
        const { orderId } = await placeOrder(
          cart.kitchenId,
          cart.items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity }))
        );
        clearCart();
        router.push(`/orders/${orderId}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong — please try again.");
      }
    });
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6" style={{ background: "var(--kb-navy)", color: "var(--kb-on-navy)" }}>
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-xl font-bold">Your cart</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--kb-on-navy-soft)" }}>
          {cart.kitchenName}
        </p>

        <div className="mt-5 space-y-3">
          {cart.items.map((item) => (
            <div
              key={item.menuItemId}
              className="flex items-center justify-between gap-3 rounded-xl bg-white p-3 shadow"
              style={{ color: "var(--kb-ink)" }}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{item.name}</p>
                <p className="text-sm" style={{ color: "var(--kb-ink-soft)" }}>
                  ${item.price.toFixed(2)} each
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  aria-label={`Decrease ${item.name} quantity`}
                  onClick={() => setQuantity(item.menuItemId, item.quantity - 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold"
                  style={{ background: "var(--kb-cream)" }}
                >
                  &minus;
                </button>
                <span className="w-4 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  aria-label={`Increase ${item.name} quantity`}
                  onClick={() => setQuantity(item.menuItemId, item.quantity + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: "var(--kb-green-deep)" }}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-6 flex items-center justify-between rounded-xl bg-white p-4 shadow"
          style={{ color: "var(--kb-ink)" }}
        >
          <span className="font-semibold">Subtotal</span>
          <span className="font-semibold">${subtotal.toFixed(2)}</span>
        </div>

        {isSignedIn ? (
          <>
            <button
              onClick={handlePlaceOrder}
              disabled={pending}
              className="mt-5 w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "linear-gradient(90deg, var(--kb-purple) 0%, var(--kb-green) 100%)" }}
            >
              {pending ? "Placing order…" : "Place order"}
            </button>
            {error && (
              <p className="mt-2 text-sm" style={{ color: "var(--kb-danger)" }}>
                {error}
              </p>
            )}
          </>
        ) : (
          <div className="mt-5 rounded-xl bg-white p-4 text-center shadow" style={{ color: "var(--kb-ink)" }}>
            <p style={{ color: "var(--kb-ink-soft)" }}>Sign in to place your order.</p>
            <Link
              href="/login"
              className="mt-3 inline-block w-full rounded-xl py-2.5 text-sm font-semibold text-white"
              style={{ background: "linear-gradient(90deg, var(--kb-purple) 0%, var(--kb-green) 100%)" }}
            >
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
