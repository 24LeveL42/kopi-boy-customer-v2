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

## Current status: Feature #003 (partial) — Auth done, live marketplace reads real kitchens

Done:
- Project foundation (Next.js, TypeScript, Tailwind, ESLint)
- Global design system (`src/app/globals.css` — brand tokens, no hard-coded
  hex outside that file)
- Responsive customer marketplace (`/`) — search, category filter, merchant
  grid, "Popular Near You" — **now reads real live kitchens from Supabase**
  via `src/lib/kitchens.ts`, not demo data (see `docs/feature-003.md`)
- Merchant profile route (`/merchant/[id]`) — reads the real `kitchens` row;
  full menu/cart/PayNow UI is still a later feature
- Auth: phone OTP (Vonage) + Google Sign-In, `/login`, `/account`
- Testing — Vitest + Testing Library, 11 passing tests on the search/filter
  logic (fixtures only, not tied to demo-data.ts)

Not done yet (by design — see build sequence):
- Cart/checkout, PayNow flow, delivery, ratings, complaints, admin —
  Features #005-#011. `rating`/`distanceKm`/`etaMinutes` on real merchants
  are fixed placeholders until #007 (delivery fee) and #009 (ratings) exist.

## Build sequence

001 Foundation + marketplace (done) -> 002 Auth + roles (done) -> 003
Merchant onboarding (kitchen/menu setup done in Partner app + live read here;
see `docs/feature-003.md`) -> 004 Merchant profile + menu -> 005 Cart + order
creation ->
006 Cook accept/reject + PayNow -> 007 Delivery fee engine -> 008 Rider
workflow -> 009 Ratings -> 010 Complaints + refunds -> 011 Admin Control
Center -> 012 Testing + deployment hardening.
