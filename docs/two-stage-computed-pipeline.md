# Two-Stage Computed Pipeline

## Problem statement

The contrast checker computes ratios for every unique pair of colours in a palette — O(N²) work. It also buckets those pairs into pass / partial-pass / fail based on the active compliance level (AA or AAA). If both operations live in a single computed property, every time the user toggles AA ↔ AAA the app re-runs all the contrast math, even though compliance thresholds have nothing to do with the raw ratios. On a large palette this makes the UI feel sluggish on a toggle that should be instant. The challenge is keeping the math and the bucketing separate without losing the convenience of a single result to render.

## Implementation in this codebase

The pipeline lives in the **state management layer**: `colourStore.js` wires two `computed()` calls in sequence, backed by two pure functions in `buildCategorizedCombinations.js`.

**Stage 1 — scoring** (`buildScoredPairs`): iterates every unique pair, applies CVD simulation, and calls the contrast algorithm. Returns a flat array of `[colA, colB, ratio]` tuples. It depends on `swatches`, `contrastMode`, `cvdMode`, and `focusColour` — but deliberately *not* `complianceMode`.

```js
// src/composables/buildCategorizedCombinations.js
export function buildScoredPairs({ swatches, contrastMode, cvdMode, focusColour }) {
  // ...builds simMap, deduplicates pairs, calls calcFn for each...
  scored.push([pair[0], pair[1], ratio]);
  return scored;
}
```

**Stage 2 — bucketing** (`categorizeScoredPairs`): receives the scored array and splits it into `{ pass, largePass, fail }` using threshold values from `contrastConfig`. Runs no colour math. Depends on `complianceMode` (indirectly, via the thresholds lookup).

```js
export function categorizeScoredPairs({ scoredPairs, contrastMode, complianceLevel }) {
  for (const combo of scoredPairs) {
    const ratio = combo[2];
    if (ratio >= thresholds.max)      categories.pass.push(combo);
    else if (ratio >= thresholds.min) categories.largePass.push(combo);
    else                              categories.fail.push(combo);
  }
  // ...sort each bucket...
  return categories;
}
```

The store wires them as **two separate `computed()` calls**, which is the key to the caching benefit:

```js
// src/stores/colourStore.js  lines 116–136
const scoredPairs = computed(() =>
  buildScoredPairs({
    swatches: colourSwatches.value,
    contrastMode: contrastMode.value,
    cvdMode: cvdMode.value,
    focusColour: focusColour.value || null,
  })
);

const categorizedCombinations = computed(() =>
  categorizeScoredPairs({
    scoredPairs: scoredPairs.value,
    contrastMode: contrastMode.value,
    complianceLevel: complianceMode.value,  // ← only here
  })
);
```

Vue's reactivity system tracks which reactive values each `computed()` reads. Because `complianceMode` is only read by the second computed, toggling AA ↔ AAA only invalidates `categorizedCombinations` — `scoredPairs` stays cached. Adding or removing a colour invalidates `scoredPairs`, which cascades to `categorizedCombinations`.

A convenience wrapper `buildCategorizedCombinations` exists for callers that don't need the split caching (e.g., tests), but the store never uses it.

## Advantages

- **Compliance toggles are instant** — no colour math runs on AA/AAA switch regardless of palette size.
- **Dependency graph is explicit** — the comment on `scoredPairs` documents that `complianceMode` is intentionally absent. The reason is visible at the call site.
- **Pure functions are easy to test** — `buildScoredPairs` and `categorizeScoredPairs` take plain objects and return plain objects. No Vue reactivity, no store, no globals.
- **Stages compose cleanly** — a future stage (e.g., sorting by luminance) slots in between without touching the others.

## Disadvantages

- **Two call sites to keep in sync** — if someone adds a new input to the pipeline (say, a new simulation mode), they must add it to the right stage and understand which computed to invalidate.
- **Indirect dependency** — `categorizedCombinations` passes `contrastMode` to `categorizeScoredPairs` for the threshold lookup, even though stage 2 does no contrast calculation. This is a config-key dependency, not a math dependency, which can be confusing at first read.
- **Convenience wrapper can mislead** — `buildCategorizedCombinations` does both stages in one call. A developer who discovers it and uses it in the store would silently collapse the two-level cache.

## Key files

- [`src/composables/buildCategorizedCombinations.js`](../src/composables/buildCategorizedCombinations.js) — `buildScoredPairs`, `categorizeScoredPairs`, and the combined convenience wrapper
- [`src/stores/colourStore.js`](../src/stores/colourStore.js) — wires the two computed layers; lines 116–136 are the critical section
- [`src/config/contrastConfig.js`](../src/config/contrastConfig.js) — threshold values consumed by stage 2
- [`src/composables/calculateColourContrast.js`](../src/composables/calculateColourContrast.js) — WCAG ratio function called by stage 1
- [`src/composables/calculateAPCAContrast.js`](../src/composables/calculateAPCAContrast.js) — APCA contrast function called by stage 1
