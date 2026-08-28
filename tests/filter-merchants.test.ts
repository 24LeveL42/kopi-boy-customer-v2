import { describe, it, expect } from "vitest";
import { filterMerchants } from "@/components/Marketplace";
import { Merchant } from "@/lib/types";

const merchants: Merchant[] = [
  {
    id: "1",
    name: "Auntie Lakshmi's Kitchen",
    category: "home-cook",
    cuisine: "South Indian, home-cooked",
    cuisineType: "indian",
    neighbourhood: "Toa Payoh",
    blurb: "",
    rating: 4.9,
    ratingCount: 10,
    etaMinutes: 30,
    distanceKm: 1,
    priceFrom: 6,
    heroImage: "",
    avatarImage: "",
    menuHighlights: [{ name: "Fish Head Curry", price: 9 }],
  },
  {
    id: "2",
    name: "Wei Jie Claypot Rice",
    category: "hawker",
    cuisine: "Chinese, claypot",
    cuisineType: "chinese",
    neighbourhood: "Ang Mo Kio",
    blurb: "",
    rating: 4.7,
    ratingCount: 5,
    etaMinutes: 40,
    distanceKm: 2,
    priceFrom: 7,
    heroImage: "",
    avatarImage: "",
    menuHighlights: [{ name: "Claypot Chicken Rice", price: 7 }],
  },
  {
    id: "3",
    name: "Kak Nur's Nasi Lemak",
    category: "home-cook",
    cuisine: "Malay, home-cooked",
    cuisineType: "muslim",
    neighbourhood: "Bedok",
    blurb: "",
    rating: 4.8,
    ratingCount: 8,
    etaMinutes: 30,
    distanceKm: 1.8,
    priceFrom: 5,
    heroImage: "",
    avatarImage: "",
    menuHighlights: [{ name: "Nasi Lemak Ayam Goreng", price: 6.5 }],
  },
];

describe("filterMerchants", () => {
  it("returns all merchants when query is empty, category and cuisine are 'all'", () => {
    expect(filterMerchants(merchants, "", "all")).toHaveLength(3);
  });

  it("filters by category", () => {
    const result = filterMerchants(merchants, "", "hawker");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("matches on merchant name, case-insensitive", () => {
    const result = filterMerchants(merchants, "lakshmi", "all");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("matches on neighbourhood", () => {
    const result = filterMerchants(merchants, "ang mo kio", "all");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("matches on menu item name", () => {
    const result = filterMerchants(merchants, "claypot chicken", "all");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("combines category and query filters", () => {
    expect(filterMerchants(merchants, "claypot", "home-cook")).toHaveLength(0);
  });

  it("returns empty array when nothing matches", () => {
    expect(filterMerchants(merchants, "durian pancake", "all")).toHaveLength(0);
  });

  it("filters by cuisine type", () => {
    const result = filterMerchants(merchants, "", "all", "muslim");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });

  it("combines category and cuisine filters", () => {
    const result = filterMerchants(merchants, "", "home-cook", "indian");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("returns empty when category matches but cuisine does not", () => {
    expect(filterMerchants(merchants, "", "home-cook", "chinese")).toHaveLength(0);
  });

  it("combines query and cuisine filters", () => {
    const result = filterMerchants(merchants, "nasi", "all", "muslim");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });
});
