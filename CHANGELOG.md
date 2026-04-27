# Changelog

## [1.5.0] — 2026-04-27 · Replace module-global adapter injection with Vue provide/inject (closes #16)

### Added
- **`src/adapters/injectionKeys.js`** — `URL_PORT_KEY` / `STORAGE_PORT_KEY` symbols shared by store, main, and tests
- **`createTestPinia(urlAdapter, storageAdapter)`** helper in `testAdapters.js` — wires adapters via Vue provide before activating Pinia; replaces `setAdapters` + `setActivePinia` pair in all tests

### Changed
- **`colourStore.js`** — adapters resolved via `inject()` with lazy browser-adapter fallbacks; `setAdapters` export deleted; no module-global mutation
- **`main.js`** — `app.provide(URL_PORT_KEY, ...)` / `app.provide(STORAGE_PORT_KEY, ...)` before `app.use(createPinia())`
- **`colourStore.spec.js`** — all `beforeEach` and inline `setAdapters` calls replaced with `createTestPinia`; 3 new inject-wiring boundary tests added

### Removed
- `callsTo()` / `log` array from both in-memory adapters in `testAdapters.js` — never asserted on in any test
- `callsTo` tests deleted from `adapters.spec.js`

## [1.5.0] — 2026-04-27 · Remove shallow single-use utility composables (closes #15)

### Removed
- **`SearchArrayByItemPropertyValue.js`** — deleted; both call sites in `colourStore.js` inlined to `.find(p => p.id === id) ?? null`
- **`checkHexColourIsValid.js`** — deleted; moved as private `isValidHex` arrow function inside `paletteUrlCodec.js`
- Both files' spec files deleted; coverage retained via existing `paletteUrlCodec.spec.js` and `colourStore.spec.js`

## [1.5.0] — 2026-04-22 · Expand README Architecture section; remove Key Source Files

### Docs
- **`README.md`** — expanded Architecture with state management table, two-stage computed pipeline, persistence (URL + LocalStorage), ports-and-adapters pattern, configuration, and composables; removed redundant Key Source Files section

## [1.5.0] — 2026-04-22 · CVDModeSelector: move description text to hover tooltips

### Changed
- **`CVDModeSelector.vue`** — removed side-panel description text; each pill button now shows a hover tooltip above it with rounded corners, drop shadow, and a downward arrow marker

## [1.5.0] — 2026-04-22 · Expand README architecture and design system docs

### Docs
- **`README.md`** — added Architecture section (layout, state, data flow, composables, config, adapter pattern) and Design System section (token files, SCSS functions/utilities, import order, naming conventions)

## [1.5.0] — 2026-04-08 · Update README key source files

### Docs
- **`README.md`** — added `src/config/modes.js`, `src/composables/buildCategorizedCombinations.js`, and `src/composables/paletteUrlCodec.js` to Key Source Files table

## [1.5.0] — 2026-04-08 · Fix: jsdom environment not declared in vitest config

### Bug Fix
- **`vite.config.js`** — added `test: { environment: "jsdom" }`; previously jsdom was only passed as a CLI flag so component and adapter tests failed when run via `npx vitest run` directly

### Tests (262 passing, up from 188)
- **Fixed**: 74 component tests (`ColourSwatch`, `CombinationsList`, `CVDModeSelector`, `ColourContrastWidget`) — `document is not defined` resolved
- **Fixed**: 9 browser adapter tests — `window`/`localStorage is not defined` resolved

## [1.5.0] — 2026-04-08 · Issue #13: Centralise mode validation arrays into modes.js

### Refactor
- **`src/config/modes.js`** — new config file; exports `CONTRAST_MODES`, `CVD_MODES`, `COMPLIANCE_MODES`
- **`paletteUrlCodec.js`** — imports from `modes.js`; three inline `VALID_*` constants removed
- **`contrastConfig.js`** — imports `CONTRAST_MODES`/`COMPLIANCE_MODES`; object keys are computed from `modes.js`
- **`simulateCVD.js`** — imports `CVD_MODES`; used as primary input guard before matrix lookup

### Tests
- No changes required — constants were internal; all 188 existing tests continue to pass

## [1.5.0] — 2026-04-08 · Issue #12: Centralise URL palette encoding/decoding into paletteUrlCodec

### Refactor
- **`paletteUrlCodec.js`** — new composable with `encodePaletteToParams` and `decodePaletteFromSearch`; encode/decode format owned in one place
- **`colourStore.js`** — `updateURLData` delegates to `encodePaletteToParams`; `loadPaletteFromQueryString` uses `decodePaletteFromSearch` directly from `_urlPort.getSearch()`; `formatPaletteQueryString` removed; fake-origin `'http://localhost/' +` hack eliminated
- **Deleted**: `parsePaletteFromURL.js` and its spec (absorbed into codec)

### Tests (188 passing, up from 166)
- **New**: `paletteUrlCodec.spec.js` — 10 encode tests + 27 decode tests (migrated from `parsePaletteFromURL.spec.js`) + round-trip test
- **Deleted**: `parsePaletteFromURL.spec.js`
- **Unchanged**: all store tests

## [1.5.0] — 2026-04-08 · Issue #11: Split combination scoring and bucketing stages

### Refactor
- **`buildCategorizedCombinations.js`** — extracted `buildScoredPairs` and `categorizeScoredPairs` as named exports; wrapper delegates to both (signature unchanged)
- **`colourStore.js`** — two-stage computed chain: `scoredPairs` (O(N²), cached) + `categorizedCombinations` (O(N) bucketing); `complianceMode` toggles no longer trigger contrast recalculation

### Tests (90 passing, up from 59)
- **New**: 15 tests for `buildScoredPairs` — pair generation, dedup, focus filtering, CVD, rounding
- **New**: 16 tests for `categorizeScoredPairs` — synthetic scored pairs, WCAG/APCA AA/AAA boundaries, sort order; no colour math
- **Unchanged**: all 20 `buildCategorizedCombinations` tests and 39 store tests

## [1.5.0] — 2026-04-06 · Issue #10: Encapsulate persistence inside colourStore

### Refactor
- **`colourStore.js`** — added `swatchOrderChanged()`, `paletteOrderChanged()`, `init()`; removed `updateURLData` and `updateLocalStorage` from public API
- **`SwatchList.vue`** — calls `swatchOrderChanged()` instead of `updateURLData()` after drag-reorder
- **`PaletteSelector.vue`** — calls `paletteOrderChanged()` instead of `updateLocalStorage()` after archive reorder
- **`App.vue`** — `onMounted` now calls single `init()` instead of two separate load functions

### Tests
- No changes required — no tests referenced the removed public functions by name

## [1.5.0] — 2026-04-06 · Issue #9: Extract combination logic into composable

### Refactor
- **`buildCategorizedCombinations.js`** — new composable; pure function owning pair generation, dedup, CVD simulation, contrast calculation, threshold bucketing, and sorting
- **`colourStore.js`** — replaced ~80 lines of computed logic with single `buildCategorizedCombinations()` call; removed `uniqueColourCombinations` from public API; removed `compare` helper and unused `contrastRatio`/`apcaContrast` imports

### Tests (166 passing, up from 146)
- **New**: 20 boundary tests for `buildCategorizedCombinations` — WCAG AA/AAA bucketing, APCA bucketing, dedup, focus filtering, CVD simulation, sorting, rounding, edge cases
- **Migrated**: 4 store tests updated to use `passColourCombinations`/`failColourCombinations` instead of removed `uniqueColourCombinations`

## [1.5.0] — 2026-03-16 · Issue #2: Fix CVD bucketing bug

### Bug Fix
- **`colourStore` CVD bucketing** — `uniqueColourCombinations` now uses simulated hex values (via `simulatedSwatchMap`) for ratio calculation; previously CVD mode was applied to display colours but not to pass/fail bucketing, so categories were wrong in CVD mode

### Tests (200 passing, up from 198)
- **New**: `colourStore` CVD bucketing — verifies normal mode bucket and that protanopia shifts red/white from largePass → pass

## [1.5.0] — 2026-03-05 · Code Review: Bugs, Tests & Optimisations

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

## [1.5.0] — 2026-03-03 · Bug Fixes & Dead Code Cleanup

- **Bug fix** — `hexToRGB` alpha path pushed a string instead of a number; 8-digit hex inputs now return correct numeric RGBA arrays
- **Rename** — `isTitleUpdated` → `isTitleUnchanged` in store + consumer (name implied opposite of actual semantics)
- **Debug artifact** — removed `background: red` from `ActionMenu` dropdown
- **Dead code removal** — unused imports (`hexToRGB`, `FormAction`, `FieldIconPlus`, `onMounted`), unused props (`contrastRatio`), commented-out template/code blocks, scaffolded `state`/`props`/`reactive`/`computed`/`ref` boilerplate across 8 components
- **Micro-cleanup** — `checkHexColourIsValid` simplified to direct return; duplicate `border-radius` removed from `PaletteSelectorItemColourPreview`

## [1.5.0] — 2026-03-03 · R2 Component Test Suite

- **6 new spec files** — `checkHexColourIsValid`, `calculateColourContrast`, `CVDModeSelector`, `ColourSwatch`, `ColourContrastWidget`, `CombinationsList`
- **130 tests passing** across 10 spec files (up from 41 in 4 files)
- **`@pinia/testing@0.1.7`** installed for `createTestingPinia` in component tests
- Component tests use real store computeds driven by `colourSwatches` state rather than computed overrides
- jsdom-specific: hex inline styles are read back as `rgb()`, navigator is getter-only (patched via `Object.defineProperty` on `.clipboard`)

## [1.5.0] — 2026-03-02 · Code optimisations

- **Stable v-for keys** — `CombinationsList` uses composite `pair[0]-pair[1]` keys instead of index; fixes stale DOM on swatch reorder
- **FormAction cleanup** — removed redundant `modeClass` computed and verbose boolean computeds; deleted unused `isLargeIconButton`
- **Dead state removed** — stripped `state = reactive({ stateItem: [] })` boilerplate from `AppHeader`, `PaletteTitle`, `PaletteSelectorItem`; removed unused `isEditing`/`isFocus` from `ColourSwatch` state
- **ROADMAP.md** — added roadmap with form validation, component tests, and CSS export features

## [1.5.0] — 2026-03-02 · CVD Simulation

- **CVD simulation** — `simulateCVD(hex, type)` composable applies Machado 2009 3×3 matrices (protanopia, deuteranopia, tritanopia) in linear RGB space with proper sRGB gamma
- **`simulatedSwatchMap` computed** — store-level Map<originalHex → simulatedHex> shared by contrast calculations and display
- **Contrast calculations use simulated values** — `uniqueColourCombinations` looks up simulated hex before calling WCAG/APCA contrast functions
- **Swatch + widget display** — `ColourSwatch` and `ColourContrastWidget` render simulated background/foreground colours; hex labels always show original values
- **CVDModeSelector component** — 4-option pill toggle (Normal / Protanopia / Deuteranopia / Tritanopia) placed in collapsible "More options" panel (`PillToggle`)
- **URL persistence** — `cvdMode` param serialised/deserialised via `getCVDModeFromURL`; 6 new unit tests
- **Auto-reset on panel close** — closing "More options" resets CVD mode to Normal so stale simulations don't persist invisibly
- **Sticky toggles bar** — toggles row is `position: sticky; top: 0` so mode controls remain visible while scrolling results

## [1.5.0] — 2026-02-27 · Codebase Optimisation

- **Dead code removal** — deleted obsolete composable, removed unused functions and commented-out blocks, removed unused reactive state from components
- **URL param consolidation** — four near-identical URL composables now share a single `getURLParam` utility
- **Toggle component consolidation** — `ComplianceModeToggle` and `ContrastModeToggle` unified into a shared `ModeToggle` base
- **SCSS token fixes** — removed duplicate shadow token, extracted hardcoded APCA badge colours and swatch border-radius to design tokens
- **Contrast config** — WCAG and APCA thresholds moved to a structured config object; store lookup simplified
- **Search utility modernised** — rewrote `SearchArrayByItemPropertyValue` using `Array.find()`; added null guards to palette load/delete operations
- **Prop validators** — added validators to enum-constrained props across four components
