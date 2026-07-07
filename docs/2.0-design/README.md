# Colour Contrast Checker 2.0 — Design Exploration

Living document. Capturing possibilities for a significant rewrite and reorientation.
Nothing here is committed; this is a scratchpad for direction, scope, and open questions.

## What 1.0 is today
- Pairwise contrast testing across a palette (WCAG 2.0 ratios)
- WCAG AA/AAA toggle, APCA mode
- Pass / Partial (large text) / Fail categorisation
- Focus mode (one colour vs all)
- Drag-and-drop swatch reordering
- Palette save/load via LocalStorage + URL sharing
- CVD simulation (protanopia/deuteranopia/tritanopia)
- Vue 3 + Pinia + SCSS, no backend

## 2.0 Vision

**From static utility → colour management service.** 1.0 is a static utility: you enter
colours laboriously, get comprehensive-but-overwhelming results, with no context and no
easy way to maintain palettes as living resources. 2.0 reframes the app as a **colour
management tool sitting on top of the existing contrast-checking engine** — the contrast
checker becomes a layer underneath, not the whole product.

### What it is
- A colour management tool where contrast checking is a substrate, not the headline
- Palettes as ongoing, maintainable resources (not just URL-encoded state)

### What it does
- Adds **context** to palettes: colour names, organisation, intended uses
- Makes palettes **persistent and maintainable** over time
- **Service-based** functionality (implies persistence/backend beyond LocalStorage+URL)
- **Integrations** — design tools (Figma) and AI tools (Claude)

### Who it's for
- Roughly the **same audience** as 1.0 — no major shift. Designers/teams working with
  colour, now able to treat palettes as ongoing systems rather than one-off checks.

## Pain points in 1.0 driving 2.0
- Laborious colour entry
- Results comprehensive but overwhelming; no prioritisation/context
- No colour names, no organisation, no notion of *use*
- Palettes hard to maintain as ongoing resources (URL state is fragile)
- No integration with design tools (Figma) or AI tools (Claude)

## Decisions so far
- **Frame:** **evolve around the existing contrast engine**, not greenfield. Preserve the
  proven WCAG/APCA/CVD composables; re-architect the app shell + data layer around them.
- **Language:** **migrate JS → TypeScript** as part of 2.0. Types become the domain model.
- **Hierarchy:** three tiers — **Project → Palette → Colour**. Top tier named *Project*
  (neutral; not always tied to a client brand). See `domain-model.md`.
- **Backend:** **Supabase** — preconfigured Postgres-based stack (auth + auto-API + RLS +
  TS edge functions). Chosen over Firebase (relational fit + aliasing future) and a
  hand-rolled server (ops burden). Self-host escape hatch caps lock-in. See `adr/`.
- **Sharing / auth:** **anonymous-first, account-optional.** Supabase anonymous auth gives
  first-time visitors a real owned identity with no signup; signing up **upgrades/links**
  that identity, carrying all data across. Accounts add cross-device + many-project
  management, they don't gate basic use. Matches the share-link ethos.
- **Sharing:** shareable links via a hard-to-guess token ID. **Read-only** (owner keeps
  edit; RLS: token matches → SELECT only). **Shareable at both Project and Palette level**
  (each gets its own token). Edit-links + collaborative editing **deferred** past MVP.
- **Figma:** **two-way sync via a Figma plugin** (not REST). The Variables REST API is
  Enterprise-only for both read and write; the Plugin API does mode-aware variable read/
  write on any plan, and the audience isn't Enterprise. Plugin authenticates to Supabase,
  pulls Palette colours+modes into a Figma variable collection and pushes edits back.
  REST is a possible later add-on for Enterprise users.
- **Figma conflict model:** app (Supabase Project) is the **system of record**. Sync is
  **explicit + directional** — separate *Push to Figma* / *Pull from Figma*, each with a
  **diff preview** before applying. No background/auto-merge; last-writer-wins but visible.
  Ambient sync + field-level merge deferred.
- **Claude:** **deferred entirely from MVP.** Governing principle when it returns: *math for
  numeric jobs (contrast, nearest-passing remediation), Claude for linguistic/semantic jobs
  (naming, role inference, plain-language explanation).* Lead fast-follow candidate:
  assisted naming + role-tagging on import. No MVP scope depends on AI.
- **Design tokens:** no internal token *graph* in MVP (aliasing deferred; roles are a small
  vocab, not semantic tokens). **Token export IS in the MVP: CSS custom properties**
  (modes via `data-theme`/`prefers-color-scheme`) **+ W3C DTCG JSON** (one standard format;
  Style Dictionary consumes it → Tailwind/iOS/Android downstream for free). Per-platform
  exporters deferred.
- **Audience:** roughly unchanged.

## MVP Scope (synthesised from the grill)

**The core loop:** create/import a palette → name colours + tag roles (with fg/bg) →
organise into Projects, with modes → see prioritised contrast results → sync with Figma →
share a read-only link → export tokens.

**In the MVP**
- Evolve on the existing pure engine; migrate to TypeScript (hybrid, engine-first).
- Domain: Project → Palette → Colour. Colour = id + value(per-mode, sRGB/format-flexible) +
  name + roles(multi, fg/bg/both).
- Arbitrary named **Modes** on the Palette (default Light+Dark; single-mode allowed).
- **Supabase** backend: Postgres + auth + RLS + edge functions.
- **Anonymous-first**, account-optional, upgrade-on-signup.
- **Read-only** token-link sharing at Project and Palette level.
- **Prioritised results** via role fg/bg classification; focus mode + show-all retained.
- **Two-way Figma sync via a plugin**: explicit directional Push/Pull with diff preview;
  app is system of record.
- **Token export:** CSS custom properties + W3C DTCG JSON.

**Deferred (fast-follows)**
- Colour aliasing / semantic-token graph (stable IDs already reserve for it).
- Claude features (assisted naming + role-tagging is the lead candidate).
- Edit-links + collaborative editing; ambient/auto Figma sync + field-level merge.
- REST-based Figma sync (Enterprise only); per-platform token exporters.
- Palette versioning.

## Open Questions (detail-level, for PRD/build)
- Exact role vocabulary + each role's fg/bg/both default.
- Mode **naming collision** with existing `config/modes.js` — rename which? (see domain-model)
- Mode **preset** sets to offer (Light/Dark, Standard/High-contrast, …).
- Frontend hosting/deploy target for the 2.0 SPA.
- Migration of any existing user data (1.0 LocalStorage/URL palettes) — needed?

## Themes / Directions (for future, beyond MVP)
- Palette versioning / history
- Full semantic-token pipeline (aliasing)
- AI: brief-to-palette generation, plain-language accessibility advice
- Realtime collaboration

## Out of Scope
-
