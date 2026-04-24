# Colour Contrast Checker

A Vue 3 tool for testing colour contrast ratios across a palette against WCAG 2.0 and APCA accessibility standards, with colour vision deficiency (CVD) simulation.

## Features

- Pairwise contrast ratio testing across an entire colour palette
- WCAG 2.0 and APCA contrast algorithm modes
- AA / AAA compliance level toggle
- Pass / Partial Pass (large text only) / Fail bucketing
- CVD simulation — protanopia, deuteranopia, tritanopia — affects both display and contrast calculations
- Focus mode: test one colour against all others
- Drag-and-drop swatch reordering
- Palette save/load via LocalStorage
- URL-based palette sharing

## Tech Stack

- **Vue 3** (Composition API, `<script setup>`) + **Vite**
- **Pinia** — state management
- **SCSS** — fully tokenized design system (`src/assets/scss/`)
- **Vitest** + Vue Test Utils — unit and component testing
- **apca-w3**, **colorjs.io**, **colorparsley** — contrast calculations
- **vuedraggable**, **@vuelidate**

## Architecture

### Component layout

`App.vue` is a two-column CSS Grid. The left sidebar (340px, sticky) contains palette management — `PaletteSelector`, `PaletteTitle`, `FormAddColour`, `SwatchList`, and `PaletteControls`. The right main panel (`1fr`) contains the mode controls and results — `ContrastModeToggle`, `ComplianceModeToggle`, a `PillToggle` that reveals `CVDModeSelector`, and `CombinationsList`.

### State management

All application state lives in a single Pinia store (`src/stores/colourStore.js`). Components hold no local data state. Key state refs:

| Ref | Purpose |
|---|---|
| `colourSwatches` | Array of hex strings forming the active palette |
| `contrastMode` | `'wcag'` or `'apca'` |
| `complianceMode` | `'AA'` or `'AAA'` |
| `cvdMode` | `'normal'`, `'protanopia'`, `'deuteranopia'`, `'tritanopia'` |
| `focusColour` | Hex string; when set, limits pairs to one colour vs all others |
| `palettes` | Saved palettes array, persisted to LocalStorage |
| `paletteTitle` | Current palette name |

### Computed pipeline

Contrast results flow through a two-stage computed chain, deliberately split to minimise re-computation:

**Stage 1 — `scoredPairs`** (`buildScoredPairs` in `src/composables/buildCategorizedCombinations.js`): generates all unique colour pairs (O(N²), reduced to O(N) when `focusColour` is set), runs `simulateCVD` on each hex, then calculates the contrast ratio via `calculateColourContrast` (WCAG) or `calculateAPCAContrast` (APCA). `complianceMode` is intentionally excluded from this computed's dependencies — toggling AA/AAA does not invalidate scored pairs.

**Stage 2 — `categorizedCombinations`** (`categorizeScoredPairs`): a cheap O(N) pass over the scored pairs that buckets each into `pass`, `largePass` (large text only), or `fail` using the thresholds from `src/config/contrastConfig.js`. Depends on `scoredPairs` and `complianceMode`. Each bucket is sorted descending by ratio.

`passColourCombinations`, `largePassColourCombinations`, and `failColourCombinations` are derived from `categorizedCombinations` and consumed by `CombinationsList`.

### Persistence

**URL** — `src/composables/paletteUrlCodec.js` is the single codec for URL serialisation. `encodePaletteToParams` converts the active palette state (colours, title, focus, modes) to query params, stripping `#` from hex values and returning `null` for empty fields so the adapter deletes those params. `decodePaletteFromSearch` parses the query string and validates every field against mode enums (`src/config/modes.js`) and `checkHexColourIsValid` before returning. The store keeps URL and state in sync via `updateURLData()` (called after every mutation) and `loadPaletteFromQueryString()` (called on init).

**LocalStorage** — Saved palettes are serialised to LocalStorage as a JSON array. `addPaletteToLocalStorage`, `loadLocalPalette`, `deleteLocalPalette`, and `paletteOrderChanged` manage the palette library; `paletteIDCounter` provides stable IDs.

**Initialisation** — `colourStore.init()` is called in `App.vue`'s `onMounted`. It loads URL state first, then LocalStorage.

### Ports and adapters

Browser globals are isolated behind two injectable interfaces in `src/adapters/`, following the hexagonal architecture (ports and adapters) pattern:

| Port | Production adapter | Test double |
|---|---|---|
| `UrlPort` | `createBrowserUrlAdapter()` — wraps `window.location` and `history.replaceState` | `createInMemoryUrlAdapter()` — in-memory URLSearchParams with a call log |
| `StoragePort` | `createBrowserStorageAdapter()` — wraps `localStorage` | `createInMemoryStorageAdapter()` — in-memory object store with a call log |

The store exports `setAdapters(urlPort, storagePort)`. Tests inject doubles in `beforeEach`; production uses the browser adapters by default. Both test doubles expose `snapshot()` and `callsTo(name)` for assertions.

### Configuration

`src/config/contrastConfig.js` is the single source of truth for all contrast thresholds:

| Algorithm | Level | Pass (full) | Partial pass (large text) |
|---|---|---|---|
| WCAG 2.0 | AA | ≥ 4.5:1 | ≥ 3:1 |
| WCAG 2.0 | AAA | ≥ 7:1 | ≥ 4.5:1 |
| APCA | AA | Lc ≥ 60 | Lc ≥ 45 |
| APCA | AAA | Lc ≥ 75 | Lc ≥ 60 |

`src/config/modes.js` exports `CONTRAST_MODES`, `CVD_MODES`, and `COMPLIANCE_MODES` — used for URL validation in the codec and for UI enumeration in toggle components.

### Composables

| File | Responsibility |
|---|---|
| `calculateColourContrast.js` | WCAG 2.0 relative luminance and contrast ratio |
| `calculateAPCAContrast.js` | APCA Lc value via apca-w3 |
| `simulateCVD.js` | Machado 2009 matrix transform in linear RGB |
| `buildCategorizedCombinations.js` | Two-stage scored-pairs pipeline |
| `paletteUrlCodec.js` | URL encode/decode with validation |
| `hexToRGB.js`, `checkHexColourIsValid.js` | Colour format utilities |

### Styling

Components use BEM-style class names with SCSS scoped per component; all values reference global design tokens (`src/assets/scss/tokens/`).

---

## Project Setup

```sh
npm install
```

```sh
npm run dev       # dev server with hot-reload
npm run build     # production bundle
npm run preview   # preview built output (port 4173)
npm run test:unit # run all unit tests
npm run lint      # ESLint + Prettier
```

## URL Parameters

Palette state is serialised to URL query params for sharing:

| Parameter | Values | Description |
|---|---|---|
| `contrastMode` | `wcag` \| `apca` | Contrast algorithm |
| `cvdMode` | `normal` \| `protanopia` \| `deuteranopia` \| `tritanopia` | CVD simulation |
| `title` | string | Palette name |
| `focus` | hex string | Focused colour |

## Contrast Thresholds

| Algorithm | Level | Pass threshold | Partial pass (large text) |
|---|---|---|---|
| WCAG 2.0 | AA | ≥ 4.5:1 | ≥ 3:1 |
| WCAG 2.0 | AAA | ≥ 7:1 | ≥ 4.5:1 |
| APCA | AA | Lc ≥ 60 | Lc ≥ 45 |
| APCA | AAA | Lc ≥ 75 | Lc ≥ 60 |

All threshold values are defined in `src/config/contrastConfig.js`.

## Testing

```sh
npm run test:unit
```

Tests cover the Pinia store, composables, and key components using Vitest + Vue Test Utils with a jsdom environment. The adapter pattern (`src/adapters/`) allows browser globals (URL, LocalStorage) to be replaced with test doubles.
