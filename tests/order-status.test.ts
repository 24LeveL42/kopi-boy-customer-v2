import { describe, it, expect } from "vitest";
import { getStage, pickActiveDelivery, type OrderRow, type DeliveryRequestRow } from "@/app/orders/[id]/page";

function order(overrides: Partial<OrderRow> = {}): OrderRow {
  return {
    id: "order-1",
    kitchen_id: "kitchen-1",
    subtotal: 10,
    order_status: "placed",
    payment_status: "unpaid",
    preparation_status: "not_started",
    created_at: "2026-01-01T00:00:00.000Z",
    decided_at: null,
    ready_at: null,
    ...overrides,
  };
}

describe("getStage", () => {
  it("shows 'waiting for kitchen' while placed, timestamped at created_at", () => {
    const stage = getStage(order(), null);
    expect(stage.message).toBe("Waiting for kitchen to accept");
    expect(stage.at).toBe("2026-01-01T00:00:00.000Z");
    expect(stage.tone).toBe("warning");
  });

  it("shows 'confirmed / preparing' once accepted, regardless of not_started vs preparing", () => {
    const decidedAt = "2026-01-01T00:05:00.000Z";
    for (const preparation_status of ["not_started", "preparing"] as const) {
      const stage = getStage(order({ order_status: "accepted", decided_at: decidedAt, preparation_status }), null);
      expect(stage.message).toBe("Order confirmed — cook is preparing your food");
      expect(stage.at).toBe(decidedAt);
    }
  });

  it("shows 'ready — looking for a rider' timestamped at ready_at", () => {
    const readyAt = "2026-01-01T00:20:00.000Z";
    const stage = getStage(
      order({ order_status: "accepted", decided_at: "2026-01-01T00:05:00.000Z", preparation_status: "ready", ready_at: readyAt }),
      null
    );
    expect(stage.message).toBe("Ready — looking for a rider");
    expect(stage.at).toBe(readyAt);
    expect(stage.tone).toBe("success");
  });

  it("shows the rider-assigned message once a delivery request is accepted", () => {
    const acceptedAt = "2026-01-01T00:25:00.000Z";
    const delivery: DeliveryRequestRow = { status: "accepted", accepted_at: acceptedAt, completed_at: null };
    const stage = getStage(order({ order_status: "accepted", preparation_status: "ready" }), delivery);
    expect(stage.message).toBe("A rider has been assigned and is on the way to pick up your order");
    expect(stage.at).toBe(acceptedAt);
  });

  it("shows 'Delivered' once a delivery request is completed", () => {
    const completedAt = "2026-01-01T00:40:00.000Z";
    const delivery: DeliveryRequestRow = { status: "completed", accepted_at: "2026-01-01T00:25:00.000Z", completed_at: completedAt };
    const stage = getStage(order({ order_status: "accepted", preparation_status: "ready" }), delivery);
    expect(stage.message).toBe("Delivered");
    expect(stage.at).toBe(completedAt);
  });

  it("shows 'Order was cancelled' as a terminal state, timestamped at decided_at", () => {
    const decidedAt = "2026-01-01T00:02:00.000Z";
    const stage = getStage(order({ order_status: "cancelled", decided_at: decidedAt }), null);
    expect(stage.message).toBe("Order was cancelled");
    expect(stage.at).toBe(decidedAt);
    expect(stage.tone).toBe("danger");
  });

  it("shows 'Order was rejected' as a terminal state, timestamped at decided_at", () => {
    const decidedAt = "2026-01-01T00:02:00.000Z";
    const stage = getStage(order({ order_status: "rejected", decided_at: decidedAt }), null);
    expect(stage.message).toBe("Order was rejected");
    expect(stage.at).toBe(decidedAt);
    expect(stage.tone).toBe("danger");
  });
});

describe("pickActiveDelivery", () => {
  it("prefers a completed request over an accepted one", () => {
    const completed: DeliveryRequestRow = { status: "completed", accepted_at: "t1", completed_at: "t2" };
    const accepted: DeliveryRequestRow = { status: "accepted", accepted_at: "t3", completed_at: null };
    expect(pickActiveDelivery([accepted, completed])).toBe(completed);
  });

  it("falls back to an accepted request when nothing is completed", () => {
    const accepted: DeliveryRequestRow = { status: "accepted", accepted_at: "t1", completed_at: null };
    const open: DeliveryRequestRow = { status: "open", accepted_at: null, completed_at: null };
    expect(pickActiveDelivery([open, accepted])).toBe(accepted);
  });

  it("ignores open/cancelled/release_requested rows and returns null", () => {
    const rows: DeliveryRequestRow[] = [
      { status: "open", accepted_at: null, completed_at: null },
      { status: "cancelled", accepted_at: null, completed_at: null },
      { status: "release_requested", accepted_at: "t1", completed_at: null },
    ];
    expect(pickActiveDelivery(rows)).toBeNull();
  });

  it("returns null for an empty list", () => {
    expect(pickActiveDelivery([])).toBeNull();
  });
});
