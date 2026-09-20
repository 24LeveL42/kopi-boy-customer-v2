/**
 * Customer notifications — shape + pure helpers. Rows come from the
 * `notifications` table (docs/supabase-schema.sql, sections 21-24), written
 * only by database triggers when an order/delivery changes; the app only
 * reads them (live, via Supabase Realtime) and flips `read_at`.
 */

export type NotificationType =
  | "order_placed"
  | "order_accepted"
  | "order_rejected"
  | "payment_received"
  | "order_ready"
  | "rider_assigned"
  | "order_delivered"
  | "order_cancelled";

export interface NotificationRow {
  id: string;
  user_id: string;
  order_id: string | null;
  type: NotificationType;
  title: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

/** How many notifications the inbox/bell keeps in memory (newest first). */
export const NOTIFICATION_LIMIT = 50;

/**
 * Merges freshly-fetched rows into what's already in state. Realtime can
 * deliver a row before the initial fetch resolves (or the fetch can include
 * a row realtime already delivered), so union by id, let the incoming copy
 * win (it's the newer read_at), sort newest-first and cap.
 */
export function mergeNotifications(existing: NotificationRow[], incoming: NotificationRow[]): NotificationRow[] {
  const byId = new Map<string, NotificationRow>();
  for (const n of existing) byId.set(n.id, n);
  for (const n of incoming) byId.set(n.id, n);
  return [...byId.values()]
    .sort((a, b) => (a.created_at === b.created_at ? (a.id < b.id ? 1 : -1) : a.created_at < b.created_at ? 1 : -1))
    .slice(0, NOTIFICATION_LIMIT);
}

export function countUnread(notifications: NotificationRow[]): number {
  return notifications.reduce((n, item) => (item.read_at ? n : n + 1), 0);
}

/** Where tapping a notification goes: its order, or nowhere for order-less ones. */
export function notificationHref(n: Pick<NotificationRow, "order_id">): string | null {
  return n.order_id ? `/orders/${n.order_id}` : null;
}

/** "Just now" / "5 min ago" / "3 h ago" / "2 d ago" / "5 Sep". */
export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(0, Math.floor((now - then) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d ago`;
  return new Date(then).toLocaleDateString("en-SG", { day: "numeric", month: "short" });
}
