# 0005 — Supabase as the backend

Status: accepted

## Context
2.0 needs persistence beyond LocalStorage+URL: store the relational, nested Project→Palette→
Colour model (value-per-mode, stable IDs pointing toward future aliasing joins), optional
user accounts, and token-link sharing where an unauthenticated visitor can read one Project
by an unguessable ID. Scale is solo/consultancy. Language decision is TypeScript end-to-end.

Options weighed: Supabase (preconfigured Postgres stack), Firebase (preconfigured Firestore/
document stack), hand-rolled server.

## Decision
Use **Supabase**.
- **Postgres** fits the relational, nested model and future aliasing joins — Firebase's
  document store fights exactly this axis.
- **Row-Level Security** expresses token-link sharing as one DB policy no code path can
  bypass — cleaner and safer than an app-code check (hand-rolled) or Firestore rules.
- **Auth** gives optional accounts nearly for free.
- **Edge Functions (TS/Deno)** host Figma OAuth + sync webhooks, keeping TS end-to-end.
- Almost no ops burden; generous free tier.

## Consequences
- ~80% of 2.0's plumbing (auth, DB, sharing, server surface) handed over; effort goes to
  colour management + Figma.
- New learning: Postgres + RLS policy authoring.
- Lock-in capped: core is portable Postgres and the whole stack is **self-hostable** (unlike
  Firebase). Convenience layers (client SDK, RLS syntax) are somewhat Supabase-shaped.
