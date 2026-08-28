# Kopi Boy 2.0

Singapore food-delivery marketplace for home cooks, hawkers, and small food
businesses — zero food-order commission. Full business model in
[`/docs/feature-001.md`](./docs/feature-001.md).

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Vitest + Testing
Library. Supabase (Postgres/Auth/Storage) and Vercel hosting come in with
Feature #002+ per the build sequence below.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm test         # vitest, single run
npm run lint
```

## Current status: Feature #001 — Foundation + Customer Marketplace

Done:
- Project foundation (Next.js, TypeScript, Tailwind, ESLint)
- Global design system (`src/app/globals.css` — brand tokens, no hard-coded
  hex outside that file)
- Responsive customer marketplace (`/`) — search, category filter, merchant
  grid, "Popular Near You"
- Merchant cards + basic merchant profile route (`/merchant/[id]`) — routing
  scaffold, full profile UI is a later feature
- Demo data (`src/lib/demo-data.ts`) — clearly marked as demo, not a backend
- Testing foundation — Vitest + Testing Library, 7 passing tests on the
  search/filter logic

Not done yet (by design — see build sequence):
- Auth/roles, merchant onboarding, cart/checkout, PayNow flow, delivery,
  ratings, complaints, admin — Features #002-#011

## Build sequence

001 Foundation + marketplace (done) -> 002 Auth + roles -> 003 Merchant
onboarding -> 004 Merchant profile + menu -> 005 Cart + order creation ->
006 Cook accept/reject + PayNow -> 007 Delivery fee engine -> 008 Rider
workflow -> 009 Ratings -> 010 Complaints + refunds -> 011 Admin Control
Center -> 012 Testing + deployment hardening.
