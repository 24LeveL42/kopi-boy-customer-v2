"use client";

import Link from "next/link";
import { useNotifications } from "@/lib/notifications-context";
import { formatRelativeTime, notificationHref, type NotificationRow } from "@/lib/notifications";

/**
 * The /notifications inbox. Reads the same live list as the bell and toasts
 * (see NotificationsProvider), so a new notification appears here the moment
 * it's inserted — no refresh, no polling.
 */
export function NotificationsInbox() {
  const { status, notifications, unreadCount, markRead, markAllRead, reload } = useNotifications();

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6" style={{ background: "var(--kb-navy)", color: "var(--kb-on-navy)" }}>
      <div className="mx-auto max-w-sm">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: "var(--kb-navy-raised)", color: "var(--kb-on-navy)" }}
            >
              Mark all as read
            </button>
          )}
        </div>

        {(status === "idle" || status === "loading") && (
          <p className="mt-6 text-sm" style={{ color: "var(--kb-on-navy-soft)" }}>
            Loading…
          </p>
        )}

        {status === "signed-out" && (
          <div className="mt-6 rounded-2xl bg-white p-5 text-center shadow-lg" style={{ color: "var(--kb-ink)" }}>
            <p style={{ color: "var(--kb-ink-soft)" }}>Sign in to see updates about your orders.</p>
            <Link
              href="/login"
              className="mt-4 inline-block w-full rounded-xl py-3 text-sm font-semibold text-white"
              style={{ background: "linear-gradient(90deg, var(--kb-purple) 0%, var(--kb-green) 100%)" }}
            >
              Sign in
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="mt-6 rounded-2xl bg-white p-5 text-center shadow-lg" style={{ color: "var(--kb-ink)" }}>
            <p style={{ color: "var(--kb-danger)" }}>Couldn&apos;t load your notifications.</p>
            <button
              type="button"
              onClick={() => void reload()}
              className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold"
              style={{ background: "var(--kb-cream)", color: "var(--kb-ink)" }}
            >
              Try again
            </button>
          </div>
        )}

        {status === "ready" && notifications.length === 0 && (
          <div className="mt-6 rounded-2xl bg-white p-5 text-center shadow-lg" style={{ color: "var(--kb-ink)" }}>
            <p className="font-semibold">Nothing yet</p>
            <p className="mt-1 text-sm" style={{ color: "var(--kb-ink-soft)" }}>
              Updates about your orders — accepted, ready, rider on the way, delivered — will show up here.
            </p>
          </div>
        )}

        {status === "ready" && notifications.length > 0 && (
          <ul className="mt-4 space-y-2">
            {notifications.map((n) => (
              <li key={n.id}>
                <NotificationItem notification={n} onOpen={() => void markRead(n.id)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function NotificationItem({ notification: n, onOpen }: { notification: NotificationRow; onOpen: () => void }) {
  const href = notificationHref(n);
  const unread = !n.read_at;
  const content = (
    <>
      <span
        aria-hidden="true"
        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
        style={{ background: unread ? "var(--kb-purple)" : "transparent" }}
      />
      <span className="min-w-0 flex-1 text-left">
        <span className="flex items-baseline justify-between gap-2">
          <span className={`text-sm ${unread ? "font-bold" : "font-medium"}`}>{n.title}</span>
          <span className="shrink-0 text-[11px]" style={{ color: "var(--kb-ink-soft)" }}>
            {formatRelativeTime(n.created_at)}
          </span>
        </span>
        <span className="mt-0.5 block text-xs" style={{ color: "var(--kb-ink-soft)" }}>
          {n.body}
        </span>
        {unread && <span className="sr-only">Unread</span>}
      </span>
    </>
  );

  const className = "flex w-full items-start gap-2 rounded-2xl bg-white p-3 shadow-sm";
  const style = { color: "var(--kb-ink)", opacity: unread ? 1 : 0.8 };

  return href ? (
    <Link href={href} onClick={onOpen} className={className} style={style} data-testid="notification-item">
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onOpen} className={className} style={style} data-testid="notification-item">
      {content}
    </button>
  );
}
