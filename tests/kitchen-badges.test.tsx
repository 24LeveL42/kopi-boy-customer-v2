import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, within } from "@testing-library/react";
import { MerchantCard } from "@/components/MerchantCard";
import type { Merchant } from "@/lib/types";

function merchant(overrides: Partial<Merchant> = {}): Merchant {
  return {
    id: "k-1",
    name: "Ah Seng Char Kway Teow",
    category: "hawker",
    cuisine: "Chinese",
    neighbourhood: "Toa Payoh",
    blurb: "",
    rating: 0,
    ratingCount: 0,
    etaMinutes: 30,
    distanceKm: null,
    latitude: null,
    longitude: null,
    priceFrom: 5,
    heroImage: "/categories/hawkers.jpg",
    avatarImage: "/categories/hawkers.jpg",
    cuisineType: "chinese",
    menuHighlights: [{ name: "Char Kway Teow", price: 5 }],
    isNew: true,
    ...overrides,
  };
}

afterEach(cleanup);

describe("MerchantCard — category + registered-business badges", () => {
  it("shows the Registered business badge for a kitchen with an approved UEN", () => {
    const { container } = render(<MerchantCard merchant={merchant({ businessUen: "53123456X" })} />);
    expect(within(container).getByText("Hawker")).toBeInTheDocument();
    const badge = within(container).getByTestId("registered-badge");
    expect(badge).toHaveTextContent("Registered business");
    // The card keeps it short; the number itself is on the detail page.
    expect(badge).not.toHaveTextContent("53123456X");
  });

  it("shows no badge for a home cook (no UEN), only the Home Cook pill", () => {
    const { container } = render(<MerchantCard merchant={merchant({ category: "home-cook", businessUen: null })} />);
    expect(within(container).getByText("Home Cook")).toBeInTheDocument();
    expect(within(container).queryByTestId("registered-badge")).toBeNull();
  });

  it("doesn't trust the self-chosen category: a 'Hawker' kitchen without an approved UEN gets no badge", () => {
    const { container } = render(<MerchantCard merchant={merchant({ category: "hawker" })} />);
    expect(within(container).getByText("Hawker")).toBeInTheDocument();
    expect(within(container).queryByTestId("registered-badge")).toBeNull();
  });
});
