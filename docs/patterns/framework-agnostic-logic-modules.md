---
title: Framework-Agnostic Logic Modules
eyebrow: Pattern
lede: Every piece of real computation lives in a plain JavaScript module with **zero Vue imports** — the store is the only place that wires that logic into reactivity.
chips:
  - "Layer · composables"
  - "Entry · `contrastEngine.ts`"
  - "Pure functions · no Vue"
category: shared
tags:
  - composables
  - pure-functions
  - testability
summary: Contrast maths, CVD simulation, and URL encoding are plain functions with no framework dependency — testable without mounting a single component.
icon: |
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="8 7 3 12 8 17" />
    <polyline points="16 7 21 12 16 17" />
    <line x1="13" y1="5" x2="11" y2="19" />
  </svg>
---

## Problem statement

A web app has two very different kinds of code mixed together. Some of it is *logic* — given two colours, what is their contrast ratio? Some of it is *plumbing* — when this value changes, re-render that part of the screen. Frameworks like Vue are brilliant at the plumbing, and it is tempting to let framework features creep into the logic: a contrast calculation that reads a `ref`, a colour converter that lives inside a component's `<script setup>`, a URL parser that reaches into the store.

The moment that happens, the logic can no longer be exercised on its own. To test "does pure black on pure white score 21:1?" you would have to mount a component, fake the browser, and wait for reactivity to settle — an enormous amount of ceremony to check a maths function. The logic also becomes impossible to reuse: a second feature that needs the same calculation has to drag the whole framework along with it. And reasoning about the code gets harder, because every function *might* secretly depend on some reactive value you cannot see in its signature.

The goal is a clean split: keep all the genuine computation in plain functions that take values in and return values out, and confine framework awareness to one thin layer.

## Implementation in this codebase

The split runs along a layer boundary. The **composable layer** (`src/composables/`) holds the logic as ordinary functions. The **state-management layer** (`src/stores/colourStore.js`) is the *only* place allowed to connect that logic to Vue's reactivity.

A composable here is just an exported function. It imports other plain modules and config constants — never `vue`. Most of the engine is now TypeScript (the 2.0 port), but "framework-agnostic" is unchanged: adding types made the signatures *more* honest, not more coupled. `simulateCVD` is representative: hex string in, simulated hex string out, the whole colour-science pipeline in between, and not a single reactive primitive.

```ts src/composables/simulateCVD.ts
export function simulateCVD(hex: string, cvdType: CVDType | string): string {
  if (!CVD_TYPES.includes(cvdType as CVDType) || cvdType === 'normal') return hex;
  const matrix = CVD_MATRICES[cvdType];
  if (!matrix) return hex;

  const [r, g, b] = hexToRGB(hex);          // hex → 8-bit RGB
  const rL = linearize(r);                  // remove sRGB gamma
  // ...matrix transform in linear space, clamp, re-apply gamma...
  return `#${toHex(compress(rS))}${toHex(compress(gS))}${toHex(compress(bS))}`;
}
```

The same discipline holds across the layer. `calculateColourContrast.ts` exports `contrastRatio(colour1, colour2)` — a number out, no state. `contrastEngine.ts` exports `scoreColourPair`, `scoreAllPairs`, and `categorizePairs` — arrays and objects in, arrays and objects out. `paletteUrlCodec.js` (still JS, pending its own port) exports `encodePaletteToParams` / `decodePaletteFromSearch` — it parses a query string with the standard `URLSearchParams`, but reads no `window` global and touches no store.

:::callout
**The rule:** if a file `import`s from `vue`, it is plumbing. If it doesn't, it is logic. In this codebase, everything under `src/composables/` is logic.
:::

The store is where the two worlds meet. It imports the plain functions and wraps their *calls* in `computed()`, so Vue knows to re-run them when inputs change. The logic itself never learns it is being observed.

:::compare
@bad Tempting — reach into reactivity from the logic
```ts logic now coupled to Vue + the store
// inside contrastEngine.ts
import { useColourStore } from '@/stores/colourStore';
export function scoreAllPairs() {
  const store = useColourStore();      // can't test without a Pinia instance
  return store.colourSwatches.map(/* ... */);
}
```
@good Actual — plain inputs, wired up in the store
```ts logic stays pure; store owns the wiring
// contrastEngine.ts — takes a plain array
export function scoreAllPairs(swatches, opts = {}) { /* ... */ }

// colourStore.js — the only file that knows about Vue + state
const scoredPairs = computed(() =>
  scoreAllPairs(colourSwatches.value, { mode: contrastMode.value })
);
```
:::

This is exactly why the test suite can cover the hard parts — contrast maths, CVD matrices, URL round-tripping — in plain unit-test files (`contrastEngine.spec.js`, `paletteUrlCodec.spec.js`) that import a function and assert on its return value, with no component mounting and no browser fakery.

## Advantages

- **Trivially testable.** A logic function is tested by importing it and checking outputs. No mounting, no jsdom, no Pinia setup — which is why the composable specs are the stable, fast core of the suite.
- **Honest signatures.** A function's parameters are its *entire* input. There are no hidden reactive dependencies, so you can reason about it locally.
- **Reusable and portable.** Any of these modules could be lifted into a different project — or a Node script, or a Web Worker — unchanged, because nothing ties them to Vue.
- **One place to understand reactivity.** All the "when X changes, recompute Y" wiring lives in the store, so the reactive graph is read in a single file.

## Disadvantages

- **Discipline, not enforcement.** Nothing in the build stops someone from importing `vue` into a composable; the boundary holds only by convention and review.
- **More wiring at the seam.** Because logic takes plain arguments, the store must explicitly pass each input (`mode`, `cvdMode`, `focusColour`) into every call rather than letting the function read it directly — more verbose call sites.
- **"Composable" is a slight misnomer.** These are plain function modules, not Vue composables in the `useX()`-returns-refs sense, which can briefly confuse developers expecting the latter.

## Key files

- `src/composables/contrastEngine.ts` — `scoreColourPair` / `scoreAllPairs` / `categorizePairs`; pure scoring and bucketing
- `src/composables/simulateCVD.ts` — colour-vision-deficiency simulation, hex in / hex out
- `src/composables/calculateColourContrast.ts` — WCAG 2.0 contrast-ratio maths
- `src/composables/paletteUrlCodec.js` — encode/decode palette state to and from query strings (still JS)
- `src/stores/colourStore.js` — the single layer that wires these functions into `computed()` reactivity
