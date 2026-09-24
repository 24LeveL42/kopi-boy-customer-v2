/**
 * Order chat — shape + pure helpers. Rows come from the `messages` table
 * (Partner app's docs/supabase-messages.sql: sender is either the order's
 * customer or its assigned rider), written by whoever is chatting and read
 * live via Supabase Realtime. RLS (`order_chat_participant`) is the only
 * thing enforcing who can see/send a given order's rows — this app never
 * duplicates that check client-side, only mirrors its *visibility window*
 * (rider assigned, not yet delivered/cancelled/rejected) so the chat box
 * disappears from the UI at the same moment RLS would start rejecting it.
 */

export interface MessageRow {
  id: string;
  order_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

/** Matches the `messages.body` check constraint (docs/supabase-messages.sql). */
export const MESSAGE_BODY_MAX_LENGTH = 2000;

/** How many past messages a chat loads on open (newest are what matters if a thread ever got long). */
export const MESSAGE_FETCH_LIMIT = 200;

/**
 * Merges freshly-fetched rows into what's already in state. Realtime can
 * deliver a row before the initial fetch resolves (or the fetch can include
 * a row realtime already delivered), so union by id and sort oldest-first —
 * a chat reads top-to-bottom, unlike the notifications inbox.
 */
export function mergeMessages<T extends { id: string; created_at: string }>(existing: T[], incoming: T[]): T[] {
  const byId = new Map<string, T>();
  for (const m of existing) byId.set(m.id, m);
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort((a, b) =>
    a.created_at === b.created_at ? (a.id < b.id ? -1 : 1) : a.created_at < b.created_at ? -1 : 1
  );
}

/** Trims and validates a draft message the same way the `body` check constraint does. */
export function normalizeMessageBody(raw: string): string | null {
  const body = raw.trim();
  if (!body || body.length > MESSAGE_BODY_MAX_LENGTH) return null;
  return body;
}
