"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelOrder } from "@/lib/order-actions";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    if (!window.confirm("Cancel this order? The kitchen won't prepare it.")) return;
    setBusy(true);
    setError(null);
    try {
      await cancelOrder(orderId);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't cancel this order.");
      setBusy(false);
    }
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
        disabled={busy}
        className="w-full rounded-xl border py-2.5 text-sm font-semibold disabled:opacity-60"
        style={{ borderColor: "var(--kb-danger)", color: "var(--kb-danger)" }}
      >
        {busy ? "Cancelling…" : "Cancel order"}
      </button>
    </div>
  );
}
