"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelOrder } from "@/lib/order-actions";

/**
 * Server Actions invoked outside a <form> must be wrapped in startTransition
 * (see node_modules/next/dist/docs/01-app/02-guides/server-actions.md) —
 * without it, a thrown error doesn't reach this component's try/catch as a
 * normal rejection; it surfaces as an uncaught Server Components render
 * error instead, which crashes the whole page. Same pattern CartView
 * already uses for placeOrder().
 */
export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCancel() {
    if (!window.confirm("Cancel this order? The kitchen won't prepare it.")) return;
    setError(null);
    startTransition(async () => {
      try {
        await cancelOrder(orderId);
        router.refresh();
      } catch (e) {
        // The guard in cancelOrder() can legitimately fire if the kitchen
        // decided in the time since this page last polled — refresh either
        // way so the stage message and this button catch up to reality
        // instead of leaving a stale "Cancel order" button next to the error.
        setError(e instanceof Error ? e.message : "Couldn't cancel this order.");
        router.refresh();
      }
    });
  }

  return (
    <div className="mt-4">
      {error && (
        <p className="mb-2 rounded-xl px-3 py-2 text-xs" style={{ background: "rgba(239,68,68,0.12)", color: "var(--kb-danger)" }}>
          {error}
        </p>
      )}
      <button
        onClick={handleCancel}
        disabled={isPending}
        className="w-full rounded-xl border py-2.5 text-sm font-semibold disabled:opacity-60"
        style={{ borderColor: "var(--kb-danger)", color: "var(--kb-danger)" }}
      >
        {isPending ? "Cancelling…" : "Cancel order"}
      </button>
    </div>
  );
}
