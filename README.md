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

## Key Source Files

| File | Purpose |
|---|---|
| `src/stores/colourStore.js` | All app state, computed combos, palette ops |
| `src/config/contrastConfig.js` | WCAG/APCA thresholds — single source of truth |
| `src/composables/calculateColourContrast.js` | WCAG 2.0 contrast ratio logic |
| `src/composables/simulateCVD.js` | CVD simulation (Machado 2009 matrices) |
| `src/components/CombinationsList.vue` | Pass/partial/fail contrast combination display |
| `src/assets/scss/` | Tokenized design system (tokens, base, utilities, functions) |
| `src/adapters/` | Injectable ports for browser URL and Storage APIs |

## Testing

```sh
npm run test:unit
```

Tests cover the Pinia store, composables, and key components using Vitest + Vue Test Utils with a jsdom environment. The adapter pattern (`src/adapters/`) allows browser globals (URL, LocalStorage) to be replaced with test doubles.
