# Changelog

## [Unreleased] — 2026-02-27 · Codebase Optimisation

- **Dead code removal** — deleted obsolete composable, removed unused functions and commented-out blocks, removed unused reactive state from components
- **URL param consolidation** — four near-identical URL composables now share a single `getURLParam` utility
- **Toggle component consolidation** — `ComplianceModeToggle` and `ContrastModeToggle` unified into a shared `ModeToggle` base
- **SCSS token fixes** — removed duplicate shadow token, extracted hardcoded APCA badge colours and swatch border-radius to design tokens
- **Contrast config** — WCAG and APCA thresholds moved to a structured config object; store lookup simplified
- **Search utility modernised** — rewrote `SearchArrayByItemPropertyValue` using `Array.find()`; added null guards to palette load/delete operations
- **Prop validators** — added validators to enum-constrained props across four components
