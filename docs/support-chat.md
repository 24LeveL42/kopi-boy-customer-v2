# Support chat (customer ↔ HQ) + order history cap

## Support chat

A "Report an issue" button on `/orders/[id]` opens a chat with Kopi Boy HQ
about that order, with optional photo evidence. Same Realtime pattern as the
[rider chat](messages.md), with two differences:

- **Who:** the order's customer and **any** admin (checked with
  `public.user_has_role('admin')`, the Partner schema's canonical role check),
  not one assigned rider. Cooks and riders can't see it.
- **No window:** the thread is open at every stage and stays readable after
  delivery/cancellation. It's the record of the complaint. If a thread already
  exists, the chat starts expanded when the order page loads.

### Schema (`docs/supabase-schema.sql` §25–26, owned by this repo)

- `public.complaint_messages`: `id`, `order_id`, `sender_id`, `body`,
  `photo_path` (nullable), `created_at`. `body` may be empty only when a photo
  is attached. `photo_path` must sit under the message's own order folder.
- `complaint_thread_participant(order_id)` (`SECURITY DEFINER`): the caller is
  an admin (`user_has_role('admin')`) or the order's customer. §25 carries an
  idempotent copy of `user_has_role` so it also runs before the Partner script. SELECT and INSERT both require it, and
  INSERT also requires `sender_id = auth.uid()`. There's no UPDATE/DELETE
  policy or grant, so messages are immutable.
- Grants: `authenticated` has `SELECT, INSERT` only. `anon` has nothing.
- Added to the `supabase_realtime` publication.
- Bucket `complaint-photos` is **private**, 5 MB, images only. Keys are
  `<order_id>/<uploader_id>/<uuid>.<ext>`. Thread participants can read. Uploads
  must also go in the uploader's own sub-folder. There's no update/delete. The
  app renders photos through 1-hour signed URLs.

The column is `photo_path`, not `photo_url`: in a private bucket there is no
permanent URL to store.

**Admin side:** the Boss app's `/complaints` lists every thread grouped by
customer, with "Needs reply" (newest message is the customer's) sorted first,
and `/complaints/<order id>` shows the full conversation with photos and a
reply box. Both gate on `user_has_role('admin')` and use the same Realtime
pattern, so an HQ reply reaches this app's `SupportChat` through its existing
`order_id` subscription. Nothing changes on this side.

## Order history cap + Orders tab (§27–28)

A customer's order-history list shows at most their **10 newest orders**.
Older orders are **archived, not deleted**: `orders.customer_archived_at` is
stamped. Cook, rider, admin, and the complaint thread are unaffected. Deleting
the rows would cascade-wipe `order_items`, `delivery_requests`, the rider chat,
and complaint threads (verified below).

Archiving is a **list filter, not an access rule**. The order still belongs to
the customer, so `/orders/<id>` opens normally by direct link, for example from
an old notification. The history list is the **Orders tab** (`/orders`,
`src/app/orders/page.tsx`, linked from the bottom nav and the side menu). It
shows the customer's 10 newest non-archived orders, newest first, with the
same status line as the order page:

```ts
supabase.from("orders").select("*, kitchens(business_name), delivery_requests(...)")
  .eq("customer_id", user.id).is("customer_archived_at", null)
  .order("created_at", { ascending: false }).limit(10)
```

Any other customer-facing list of orders must apply the same filter. Until
§27 has been run on a project the column doesn't exist (error `42703`), and
the tab falls back to the unfiltered newest 10. Nothing is archived yet at that
point, so it's the same list.

- **Mechanism:** an `AFTER INSERT` trigger on `orders`, so no pg_cron. The count
  only changes on insert, so there's nothing to schedule. The migration also
  runs a one-off backfill.
- **Only settled orders are archived** (cancelled, rejected, or delivered). An
  in-flight order never leaves the list. It gets archived on the next insert
  after it settles.
- **Tamper-proof:** a `BEFORE UPDATE` trigger ignores changes to
  `customer_archived_at` from `anon`/`authenticated`, so a cook can't drop an
  order from a customer's history and a customer can't un-archive one.

## What was verified before shipping

`docs/supabase-schema.sql` + the Partner's `supabase-messages.sql` were run
(twice, to prove idempotency) on a local Postgres (PGlite) with stand-ins for
Supabase's `auth.uid()`, `storage.objects`/`foldername`, the API roles and the
Realtime publication. 51 checks passed, run as real `authenticated`/`anon`
sessions: thread isolation, no impersonation, cook/rider/anon locked out,
immutability, grants, publication membership, all storage upload/read rules,
archive selection, tamper protection, cancel/accept flows still working, no
extra notifications, and clean cascades on order/user deletion. The UI is
covered by `tests/support-chat-live.test.tsx` and `tests/cart.test.tsx`.

That run doesn't cover the real Supabase Storage API or the Realtime server,
so run the checklist below once on the live project.

## Live checklist (after running §25–28 in the SQL Editor)

1. **Grants / publication / bucket**
   ```sql
   select grantee, privilege_type from information_schema.role_table_grants
   where table_schema = 'public' and table_name = 'complaint_messages'
     and grantee in ('anon', 'authenticated');
   -- expect exactly: authenticated/INSERT, authenticated/SELECT

   select tablename from pg_publication_tables
   where pubname = 'supabase_realtime' and tablename = 'complaint_messages';
   -- expect 1 row

   select id, public, file_size_limit from storage.buckets where id = 'complaint-photos';
   -- expect public = false, 5242880

   select tgname from pg_trigger
   where tgrelid = 'public.orders'::regclass
     and tgname in ('archive_old_orders_on_insert', 'protect_customer_archived_at');
   -- expect 2 rows
   ```
2. **Realtime, live:** open `/orders/<id>` as the customer and tap
   **Report an issue**. In the SQL Editor, post as an admin:
   ```sql
   insert into public.complaint_messages (order_id, sender_id, body)
   values ('<order id>', '<admin profile id>', 'Hi, HQ here — what happened?');
   ```
   It should appear on the left, labelled "Kopi Boy Support", within about a
   second and without a reload.
3. **Customer send + photo:** send a text, then a photo with no text. Both
   should come back via the Realtime echo, and the photo should render. Check
   `storage.objects` for a new `complaint-photos` row under
   `<order id>/<customer id>/`.
4. **Isolation:** signed in as a different customer, open the first
   customer's `/orders/<id>`. It should 404, and
   `supabase.from('complaint_messages').select()` should return 0 rows.
5. **No cutoff:** cancel or complete the order and reload. The support chat
   should still be there and still accept messages.
6. **History cap:** for a test customer with more than 10 settled orders,
   ```sql
   select count(*) filter (where customer_archived_at is null) as visible,
          count(*) as total
   from public.orders where customer_id = '<customer id>';
   -- expect visible = 10 (plus any still-in-flight older ones), total unchanged
   ```
7. **Orders tab:** as that customer, open `/orders`. It should list exactly
   the `visible` orders from step 6, newest first, capped at 10.
8. **Archived order still opens by link:** as that customer, open
   `/orders/<an archived order id>` (or tap its old notification). It should
   load normally, not 404.
