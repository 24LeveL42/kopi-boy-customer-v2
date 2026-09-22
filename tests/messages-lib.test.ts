import { describe, it, expect } from "vitest";
import { mergeMessages, normalizeMessageBody, MESSAGE_BODY_MAX_LENGTH } from "@/lib/messages";
import { makeMessage } from "./helpers/fake-messages-supabase";

describe("mergeMessages", () => {
  it("unions by id and sorts oldest first", () => {
    const a = makeMessage({ id: "a", created_at: "2026-09-20T10:00:00.000Z" });
    const b = makeMessage({ id: "b", created_at: "2026-09-20T11:00:00.000Z" });
    const c = makeMessage({ id: "c", created_at: "2026-09-20T09:00:00.000Z" });
    expect(mergeMessages([a, c], [b]).map((m) => m.id)).toEqual(["c", "a", "b"]);
  });

  it("de-duplicates a row that arrives both via fetch and live", () => {
    const row = makeMessage({ id: "a" });
    expect(mergeMessages([row], [row])).toHaveLength(1);
  });
});

describe("normalizeMessageBody", () => {
  it("trims whitespace", () => {
    expect(normalizeMessageBody("  hi there  ")).toBe("hi there");
  });

  it("rejects empty or whitespace-only text", () => {
    expect(normalizeMessageBody("")).toBeNull();
    expect(normalizeMessageBody("   ")).toBeNull();
  });

  it("rejects text over the body check constraint's limit", () => {
    expect(normalizeMessageBody("a".repeat(MESSAGE_BODY_MAX_LENGTH))).toBe("a".repeat(MESSAGE_BODY_MAX_LENGTH));
    expect(normalizeMessageBody("a".repeat(MESSAGE_BODY_MAX_LENGTH + 1))).toBeNull();
  });
});
