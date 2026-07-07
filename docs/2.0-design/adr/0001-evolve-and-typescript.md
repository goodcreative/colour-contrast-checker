# 0001 — Evolve around the engine; migrate to TypeScript

Status: accepted

## Context
1.0 is a static Vue 3 SPA. Its colour-science substrate — WCAG/APCA contrast, CVD
simulation, colour conversion — is correctness-critical and already covered by 76 passing
composable tests. 2.0 is a "significant rewrite and reorientation" into a colour-management
service, but explicitly sits *on top of* that existing contrast functionality.

## Decision
Evolve, not greenfield. Preserve the proven contrast/CVD/APCA composables as the engine;
re-architect the app shell + data layer around them. Separately, migrate the codebase from
JavaScript to TypeScript as part of 2.0 — the new domain model is expressed as TS types.

## Consequences
- Keep tested colour-science code; spend rewrite effort on what's new (persistence, naming/
  roles, modes, Figma, sharing).
- **TS migration sequencing (decided): hybrid, engine-first.** (1) enable TS with `allowJs`;
  (2) port `composables/*` engine to `.ts` with real types, keep tests green; (3) define the
  domain model as TS types; (4) build the new store/data-layer/UI in TS on top; (5) let
  legacy JS fall away as replaced. Never blocked on a big-bang conversion.
- Requires the engine to be cleanly liftable from Vue/Pinia coupling; verify before heavy
  surgery. **VERIFIED:** `src/composables/*` (contrastEngine, calculate*Contrast, simulateCVD,
  hexToRGB) import nothing from Vue/Pinia — pure functions (hex/array in, results out). Clean
  lift confirmed; ideal first TS-port target.
