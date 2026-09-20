# Customer notifications (in-app)

Live, in-app notifications for order activity: a bell with an unread badge on
every page, a toast when something happens while the app is open, and an inbox
at `/notifications`. Driven by Supabase Realtime.

**Not included (by decision):** web push / service worker, SMS, notifications
while the app is closed, and the timer-based nudges (payment reminder, kitchen
slow to accept, no rider found — these need `pg_cron`). Nothing arrives while
the tab is closed.

## What triggers a notification

The Partner app (cook/rider) changes order state, so notifications are created
by **database triggers**, not by this app — the Partner app needs no changes.

| Event | Fires when | Type |
|---|---|---|
| Order sent | `orders` row inserted | `order_placed` |
| Order accepted (+ PayNow hint if unpaid) | `order_status` → `accepted` | `order_accepted` |
| Order rejected | `order_status` → `rejected` | `order_rejected` |
| Payment received | `payment_status` → `paid` | `payment_received` |
| Food is ready | `preparation_status` → `ready` | `order_ready` |
| Rider on the way | `delivery_requests.status` → `accepted` | `rider_assigned` |
| Order delivered | `delivery_requests.status` → `completed` | `order_delivered` |
| Order cancelled | `order_status` → `cancelled` | `order_cancelled` |

Every branch is guarded by `IS DISTINCT FROM`, so re-saving an unchanged value
never re-notifies.

## Setup (once)

Run the last section of `docs/supabase-schema.sql` ("Customer notifications",
§21-24) in the Supabase SQL Editor. It's idempotent. It creates the
`notifications` table with RLS + minimal grants, adds `notifications`,
`orders` and `delivery_requests` to the `supabase_realtime` publication, and
installs the triggers.

## How it's wired

- `src/lib/notifications-context.tsx` — `NotificationsProvider`: on sign-in,
  subscribes to `postgres_changes` on `notifications` (filtered to the user),
  then fetches the latest 50 on `SUBSCRIBED` (also on reconnect, so anything
  missed while offline appears). Exposes list, unread count, toasts,
  `markRead` / `markAllRead`.
- `NotificationBell` (in `PageChrome`), `NotificationToasts`, `NotificationsInbox`.
- `src/components/OrderRealtimeRefresher.tsx` replaces the old
  `OrderStatusPoller`: the order page refreshes the instant its `orders` /
  `delivery_requests` rows change. If the channel can't connect it falls back to
  the old 5 s interval refresh so the page never silently goes stale.

## Security model

- `authenticated` can `SELECT` its own rows and `UPDATE` **only** `read_at`
  (column-level grant). No `INSERT`/`DELETE`; `anon` has nothing.
- Rows are written only by `SECURITY DEFINER` functions whose `EXECUTE` is
  revoked from `public`/`anon`/`authenticated`, so they can't be called (or
  forged) through the API.

## Live verification checklist (run after the SQL)

1. **Grants/RLS** — in the SQL Editor:
   ```sql
   select grantee, privilege_type from information_schema.role_table_grants
   where table_schema = 'public' and table_name = 'notifications'
     and grantee in ('anon', 'authenticated');          -- expect: authenticated / SELECT only
   select column_name from information_schema.column_privileges
   where table_schema = 'public' and table_name = 'notifications'
     and grantee = 'authenticated' and privilege_type = 'UPDATE';   -- expect: read_at only
   select tablename from pg_publication_tables
   where pubname = 'supabase_realtime' and schemaname = 'public'
     and tablename in ('notifications', 'orders', 'delivery_requests');  -- expect: all 3
   ```
2. **Live toast** — sign in to the customer app, keep any page open, place an
   order (you should see "Order sent" appear without refreshing). Then in the SQL
   Editor act as the cook:
   ```sql
   update public.orders set order_status = 'accepted', decided_at = now() where id = '<order id>';
   ```
   The toast, bell badge, inbox row **and** the order page's status line should
   all update within about a second, with no reload.
3. **Continue the lifecycle** the same way: `payment_status = 'paid'`,
   `preparation_status = 'ready'`, then update the order's `delivery_requests`
   row to `accepted` and `completed`.
4. **Isolation** — sign in as a second customer: they must see none of the first
   customer's notifications.
