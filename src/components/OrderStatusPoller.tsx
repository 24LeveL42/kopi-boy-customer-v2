"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * The order confirmation page is a Server Component that only fetches order
 * status once, at request time — nothing tells an already-open tab to look
 * again after the cook accepts/prepares/marks the order ready. This polls
 * `router.refresh()` (same pattern as SignOutButton) so the page picks up
 * DB changes without a manual reload. Stops once the order is settled.
 */
export function OrderStatusPoller({ isSettled, intervalMs = 5000 }: { isSettled: boolean; intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    if (isSettled) return;
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [isSettled, intervalMs, router]);

  return null;
}
