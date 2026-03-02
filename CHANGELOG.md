# Changelog

## [Unreleased] — 2026-03-02 · CVD Simulation

- **CVD simulation** — `simulateCVD(hex, type)` composable applies Machado 2009 3×3 matrices (protanopia, deuteranopia, tritanopia) in linear RGB space with proper sRGB gamma
- **`simulatedSwatchMap` computed** — store-level Map<originalHex → simulatedHex> shared by contrast calculations and display
- **Contrast calculations use simulated values** — `uniqueColourCombinations` looks up simulated hex before calling WCAG/APCA contrast functions
- **Swatch + widget display** — `ColourSwatch` and `ColourContrastWidget` render simulated background/foreground colours; hex labels always show original values
- **CVDModeSelector component** — 4-option pill toggle (Normal / Protanopia / Deuteranopia / Tritanopia) placed in the toggles bar
- **URL persistence** — `cvdMode` param serialised/deserialised via `getCVDModeFromURL`; 6 new unit tests

## [Unreleased] — 2026-02-27 · Codebase Optimisation

- **Dead code removal** — deleted obsolete composable, removed unused functions and commented-out blocks, removed unused reactive state from components
- **URL param consolidation** — four near-identical URL composables now share a single `getURLParam` utility
- **Toggle component consolidation** — `ComplianceModeToggle` and `ContrastModeToggle` unified into a shared `ModeToggle` base
- **SCSS token fixes** — removed duplicate shadow token, extracted hardcoded APCA badge colours and swatch border-radius to design tokens
- **Contrast config** — WCAG and APCA thresholds moved to a structured config object; store lookup simplified
- **Search utility modernised** — rewrote `SearchArrayByItemPropertyValue` using `Array.find()`; added null guards to palette load/delete operations
- **Prop validators** — added validators to enum-constrained props across four components
