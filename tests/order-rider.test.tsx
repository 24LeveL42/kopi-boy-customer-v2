import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { cleanup, render, within } from "@testing-library/react";
import OrderConfirmationPage, { type OrderRow, type DeliveryRequestRow } from "@/app/orders/[id]/page";
import { RiderCard, isTrustedPhotoUrl } from "@/components/RiderCard";

const SUPABASE = "https://proj.supabase.co";
const PHOTO = `${SUPABASE}/storage/v1/object/public/rider-photos/rider-1/me.jpg`;

const db = vi.hoisted(() => ({
  order: null as unknown,
  deliveries: [] as unknown[],
  rpcResult: { data: null, error: null } as { data: unknown; error: unknown },
  rpcCalls: [] as { fn: string; args: unknown }[],
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: { id: "customer-1" } } }),
    },
    rpc(fn: string, args: unknown) {
      db.rpcCalls.push({ fn, args });
      return Promise.resolve(db.rpcResult);
    },
    from(table: string) {
      const result = () => {
        if (table === "orders") return { data: db.order };
        if (table === "kitchens") return { data: { business_name: "Aunty May", paynow_type: null, paynow_value: null } };
        if (table === "order_items") return { data: [{ id: "i1", name: "Kopi", price: 2, quantity: 1 }] };
        return { data: db.deliveries };
      };
      const builder: Record<string, unknown> = {};
      for (const m of ["select", "eq", "order"]) builder[m] = () => builder;
      builder.maybeSingle = () => Promise.resolve(result());
      builder.returns = () => Promise.resolve(result());
      return builder;
    },
  }),
}));
vi.mock("@/components/OrderRealtimeRefresher", () => ({ OrderRealtimeRefresher: () => null }));
vi.mock("@/components/CancelOrderButton", () => ({ CancelOrderButton: () => null }));
vi.mock("@/components/OrderChat", () => ({ OrderChat: () => null }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("notFound"); } }));

function order(overrides: Partial<OrderRow> = {}): OrderRow {
  return {
    id: "order-1",
    kitchen_id: "kitchen-1",
    subtotal: 2,
    order_status: "accepted",
    payment_status: "unpaid",
    preparation_status: "ready",
    created_at: "2026-01-01T00:00:00.000Z",
    decided_at: "2026-01-01T00:05:00.000Z",
    ready_at: "2026-01-01T00:20:00.000Z",
    ...overrides,
  };
}

const accepted: DeliveryRequestRow = { status: "accepted", accepted_at: "2026-01-01T00:25:00.000Z", completed_at: null };
const completed: DeliveryRequestRow = { status: "completed", accepted_at: "2026-01-01T00:25:00.000Z", completed_at: "2026-01-01T00:40:00.000Z" };
const RIDER = { full_name: "Ahmad Rahman", photo_url: PHOTO };

async function renderPage(o: OrderRow, deliveries: DeliveryRequestRow[], rpcData: unknown = [RIDER]) {
  db.order = o;
  db.deliveries = deliveries;
  db.rpcResult = { data: rpcData, error: null };
  const ui = await OrderConfirmationPage({ params: Promise.resolve({ id: o.id }) });
  return render(ui);
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", SUPABASE);
  db.rpcCalls = [];
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("/orders/[id] — rider card", () => {
  it("shows 'Your rider: {name}' with their photo once the delivery is accepted", async () => {
    const { container } = await renderPage(order(), [accepted]);
    const card = within(container).getByTestId("rider-card");
    expect(card).toHaveTextContent("Your rider: Ahmad Rahman");
    const img = within(card).getByAltText("Photo of Ahmad Rahman") as HTMLImageElement;
    expect(decodeURIComponent(img.getAttribute("src")!)).toContain(PHOTO);
    expect(db.rpcCalls).toEqual([{ fn: "get_order_rider", args: { p_order_id: "order-1" } }]);
  });

  it("keeps showing the rider after delivery is completed", async () => {
    const { container } = await renderPage(order(), [completed]);
    expect(within(container).getByTestId("rider-card")).toHaveTextContent("Your rider: Ahmad Rahman");
  });

  it("appears on the same render where the delivery flips open -> accepted", async () => {
    const before = await renderPage(order(), [{ status: "open", accepted_at: null, completed_at: null }]);
    expect(within(before.container).queryByTestId("rider-card")).toBeNull();
    cleanup();
    const after = await renderPage(order(), [accepted]);
    expect(within(after.container).getByTestId("rider-card")).toBeInTheDocument();
  });

  const NO_RIDER: [string, OrderRow, DeliveryRequestRow[]][] = [
    ["placed", order({ order_status: "placed", preparation_status: "not_started", decided_at: null, ready_at: null }), []],
    ["preparing", order({ preparation_status: "preparing", ready_at: null }), []],
    ["ready, delivery open", order(), [{ status: "open", accepted_at: null, completed_at: null }]],
    ["rider released it back", order(), [{ status: "release_requested", accepted_at: "t", completed_at: null }]],
    ["cancelled (even with a lingering accepted delivery)", order({ order_status: "cancelled" }), [accepted]],
    ["rejected (even with a lingering accepted delivery)", order({ order_status: "rejected" }), [accepted]],
  ];
  for (const [name, o, deliveries] of NO_RIDER) {
    it(`shows no rider and doesn't ask for one: ${name}`, async () => {
      const { container } = await renderPage(o, deliveries);
      expect(within(container).queryByTestId("rider-card")).toBeNull();
      expect(db.rpcCalls).toEqual([]);
    });
  }

  it("still renders the whole page (no rider card) if the rider lookup errors or returns nothing", async () => {
    for (const data of [null, []]) {
      const { container } = await renderPage(order(), [accepted], data);
      expect(within(container).queryByTestId("rider-card")).toBeNull();
      expect(within(container).getByText("A rider has been assigned and is on the way to pick up your order", { selector: "p" })).toBeInTheDocument();
      expect(within(container).getByRole("heading", { level: 1 })).toHaveTextContent("Order placed!");
      cleanup();
    }
  });

  it("never renders rider contact details, even if the lookup returned them", async () => {
    const leaky = [{ ...RIDER, phone: "91234567", contact_number: "98765432" }];
    const { container } = await renderPage(order(), [accepted], leaky);
    expect(container.textContent).not.toMatch(/91234567|98765432/);
  });
});

describe("RiderCard", () => {
  it("falls back to an initial when there is no photo", () => {
    const { container } = render(<RiderCard rider={{ full_name: "ahmad", photo_url: null }} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container).toHaveTextContent("A");
    expect(container).toHaveTextContent("Your rider: ahmad");
  });

  it("copes with a missing name", () => {
    const { container } = render(<RiderCard rider={{ full_name: null, photo_url: PHOTO }} />);
    expect(container.querySelector("p")!.textContent).toBe("Your rider");
    expect(container.querySelector("img")).not.toBeNull();
  });

  it("does not render a photo from an untrusted URL (falls back to the initial)", () => {
    const { container } = render(<RiderCard rider={{ full_name: "Ahmad", photo_url: "https://evil.example.com/x.png" }} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container).toHaveTextContent("A");
  });
});

describe("isTrustedPhotoUrl", () => {
  beforeEach(() => vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", SUPABASE));
  afterEach(() => vi.unstubAllEnvs());

  it("accepts only this project's public storage URLs", () => {
    expect(isTrustedPhotoUrl(PHOTO)).toBe(true);
    expect(isTrustedPhotoUrl(null)).toBe(false);
    expect(isTrustedPhotoUrl("")).toBe(false);
    expect(isTrustedPhotoUrl("not a url")).toBe(false);
    expect(isTrustedPhotoUrl("https://evil.example.com/storage/v1/object/public/a.png")).toBe(false);
    expect(isTrustedPhotoUrl(`${SUPABASE}/storage/v1/object/sign/private/a.png`)).toBe(false);
    expect(isTrustedPhotoUrl(`${SUPABASE}.evil.com/storage/v1/object/public/a.png`)).toBe(false);
    expect(isTrustedPhotoUrl("http://proj.supabase.co/storage/v1/object/public/a.png")).toBe(false);
  });

  it("rejects everything when the Supabase URL isn't configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect(isTrustedPhotoUrl(PHOTO)).toBe(false);
  });
});
