# Changelog

## [Unreleased] — 2026-03-16 · Issue #2: Fix CVD bucketing bug

### Bug Fix
- **`colourStore` CVD bucketing** — `uniqueColourCombinations` now uses simulated hex values (via `simulatedSwatchMap`) for ratio calculation; previously CVD mode was applied to display colours but not to pass/fail bucketing, so categories were wrong in CVD mode

### Tests (200 passing, up from 198)
- **New**: `colourStore` CVD bucketing — verifies normal mode bucket and that protanopia shifts red/white from largePass → pass

## [Unreleased] — 2026-03-05 · Code Review: Bugs, Tests & Optimisations

### Bug Fixes
- **`relativeLum()` crash** — `colour` var scoped inside `if` block but used outside; moved declaration, added TypeError for non-string input
- **`setContrastMode()` JSDoc** — copy-paste error said "Sets the focus colour"
- **`PaletteTitle.vue`** — dead `titleMode` computed referencing non-existent prop removed
- **`ColourContrastWidget.vue`** — dead `showSample()` function removed
- **`FormFieldText.vue`** — `IconComponent` returned `false` instead of `null` for invalid `<component :is>`

### Code Quality
- **URL history** — `pushState` → `replaceState` to stop spamming browser history on every change
- **URL params** — empty `title=` and `focus=` no longer pollute query string
- **`SampleModal.vue`** — direct store mutation replaced with `closeSample()` action; `reactive` → `ref`
- **`ActionMenu.vue`** — replaced `reactive` + `computed` wrapper with single `ref`; removed unused imports
- **`calculateColourContrast.js`** — `var` → `const/let`
- **Store** — `Object.assign([], ...)` → spread `[...arr]`
- **SCSS tokens** — hardcoded `#fff` (badge text) → `--clr-badge-text`; `#999` (placeholder) → `--clr-grey-600`

### Tests (156 passing, up from 76)
- **New**: `hexToRGB.spec.js` — 3/6/8-digit hex, with/without `#`, alpha channel
- **New**: `getURLParam.spec.js` — param extraction, missing params, empty values, URL encoding
- **Edge cases added**: `calculateColourContrast` (non-string TypeError), `colourStore` (`clearPalette`, `closeSample`, `formatPaletteQueryString`)

## [Unreleased] — 2026-03-03 · Bug Fixes & Dead Code Cleanup

- **Bug fix** — `hexToRGB` alpha path pushed a string instead of a number; 8-digit hex inputs now return correct numeric RGBA arrays
- **Rename** — `isTitleUpdated` → `isTitleUnchanged` in store + consumer (name implied opposite of actual semantics)
- **Debug artifact** — removed `background: red` from `ActionMenu` dropdown
- **Dead code removal** — unused imports (`hexToRGB`, `FormAction`, `FieldIconPlus`, `onMounted`), unused props (`contrastRatio`), commented-out template/code blocks, scaffolded `state`/`props`/`reactive`/`computed`/`ref` boilerplate across 8 components
- **Micro-cleanup** — `checkHexColourIsValid` simplified to direct return; duplicate `border-radius` removed from `PaletteSelectorItemColourPreview`

## [Unreleased] — 2026-03-03 · R2 Component Test Suite

- **6 new spec files** — `checkHexColourIsValid`, `calculateColourContrast`, `CVDModeSelector`, `ColourSwatch`, `ColourContrastWidget`, `CombinationsList`
- **130 tests passing** across 10 spec files (up from 41 in 4 files)
- **`@pinia/testing@0.1.7`** installed for `createTestingPinia` in component tests
- Component tests use real store computeds driven by `colourSwatches` state rather than computed overrides
- jsdom-specific: hex inline styles are read back as `rgb()`, navigator is getter-only (patched via `Object.defineProperty` on `.clipboard`)

## [Unreleased] — 2026-03-02 · Code optimisations

- **Stable v-for keys** — `CombinationsList` uses composite `pair[0]-pair[1]` keys instead of index; fixes stale DOM on swatch reorder
- **FormAction cleanup** — removed redundant `modeClass` computed and verbose boolean computeds; deleted unused `isLargeIconButton`
- **Dead state removed** — stripped `state = reactive({ stateItem: [] })` boilerplate from `AppHeader`, `PaletteTitle`, `PaletteSelectorItem`; removed unused `isEditing`/`isFocus` from `ColourSwatch` state
- **ROADMAP.md** — added roadmap with form validation, component tests, and CSS export features

## [Unreleased] — 2026-03-02 · CVD Simulation

- **CVD simulation** — `simulateCVD(hex, type)` composable applies Machado 2009 3×3 matrices (protanopia, deuteranopia, tritanopia) in linear RGB space with proper sRGB gamma
- **`simulatedSwatchMap` computed** — store-level Map<originalHex → simulatedHex> shared by contrast calculations and display
- **Contrast calculations use simulated values** — `uniqueColourCombinations` looks up simulated hex before calling WCAG/APCA contrast functions
- **Swatch + widget display** — `ColourSwatch` and `ColourContrastWidget` render simulated background/foreground colours; hex labels always show original values
- **CVDModeSelector component** — 4-option pill toggle (Normal / Protanopia / Deuteranopia / Tritanopia) placed in collapsible "More options" panel (`PillToggle`)
- **URL persistence** — `cvdMode` param serialised/deserialised via `getCVDModeFromURL`; 6 new unit tests
- **Auto-reset on panel close** — closing "More options" resets CVD mode to Normal so stale simulations don't persist invisibly
- **Sticky toggles bar** — toggles row is `position: sticky; top: 0` so mode controls remain visible while scrolling results

## [Unreleased] — 2026-02-27 · Codebase Optimisation

- **Dead code removal** — deleted obsolete composable, removed unused functions and commented-out blocks, removed unused reactive state from components
- **URL param consolidation** — four near-identical URL composables now share a single `getURLParam` utility
- **Toggle component consolidation** — `ComplianceModeToggle` and `ContrastModeToggle` unified into a shared `ModeToggle` base
- **SCSS token fixes** — removed duplicate shadow token, extracted hardcoded APCA badge colours and swatch border-radius to design tokens
- **Contrast config** — WCAG and APCA thresholds moved to a structured config object; store lookup simplified
- **Search utility modernised** — rewrote `SearchArrayByItemPropertyValue` using `Array.find()`; added null guards to palette load/delete operations
- **Prop validators** — added validators to enum-constrained props across four components
