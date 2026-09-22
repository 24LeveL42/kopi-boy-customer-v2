import { vi } from "vitest";
import type { MessageRow } from "@/lib/messages";
import { FakeChannel } from "./fake-supabase";

export function makeMessage(overrides: Partial<MessageRow> = {}): MessageRow {
  return {
    id: "m-1",
    order_id: "order-1",
    sender_id: "customer-1",
    body: "Hello!",
    created_at: "2026-09-20T10:00:00.000Z",
    ...overrides,
  };
}

export interface RecordedInsert {
  table: string;
  values: Record<string, unknown>;
}

/**
 * Minimal fake of the supabase-js surface OrderChat touches: channel()/
 * removeChannel(), and from('messages') select().eq().order().limit() /
 * insert().
 */
export function createFakeMessagesSupabase(opts: { rows?: MessageRow[] } = {}) {
  const state = {
    rows: opts.rows ?? [],
    selectError: null as { message: string } | null,
    insertError: null as { message: string } | null,
    selects: 0,
    inserts: [] as RecordedInsert[],
  };
  const channels: FakeChannel[] = [];

  const client = {
    channel: (name: string) => {
      const ch = new FakeChannel(name);
      channels.push(ch);
      return ch;
    },
    removeChannel: vi.fn(),
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: async () => {
              state.selects++;
              return state.selectError
                ? { data: null, error: state.selectError }
                : { data: [...state.rows], error: null };
            },
          }),
        }),
      }),
      insert: async (values: Record<string, unknown>) => {
        state.inserts.push({ table, values });
        return { error: state.insertError };
      },
    }),
  };

  return { client, state, channels };
}
