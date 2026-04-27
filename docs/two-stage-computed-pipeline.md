# Two-Stage Computed Pipeline

## Problem statement

The contrast checker computes ratios for every unique pair of colours in a palette — O(N²) work. It also buckets those pairs into pass / partial-pass / fail based on the active compliance level (AA or AAA). If both operations live in a single computed property, every time the user toggles AA ↔ AAA the app re-runs all the contrast math, even though compliance thresholds have nothing to do with the raw ratios. On a large palette this makes the UI feel sluggish on a toggle that should be instant. The challenge is keeping the math and the bucketing separate without losing the convenience of a single result to render.

## Implementation in this codebase

The pipeline lives in the **state management layer**: `colourStore.js` wires two `computed()` calls in sequence, backed by three pure functions in `contrastEngine.js` — `scoreColourPair` (the core atom), `scoreAllPairs` (stage 1), and `categorizePairs` (stage 2).

**Stage 1 — scoring** (`scoreAllPairs`): iterates every unique pair and calls `scoreColourPair` for each. Returns a flat array of `{ fgHex, bgHex, score, simulatedFg, simulatedBg }` objects. It depends on `swatches`, `contrastMode`, `cvdMode`, and `focusColour` — but deliberately *not* `complianceMode`.

```js
// src/composables/contrastEngine.js
export function scoreAllPairs(swatches, opts = {}) {
  const { mode = 'wcag', cvdMode = 'normal', focusColour = null } = opts;
  // ...deduplicates pairs, calls scoreColourPair for each...
  result.push({ fgHex, bgHex, score, simulatedFg, simulatedBg });
  return result;
}
```

**Stage 2 — bucketing** (`categorizePairs`): receives the scored array and splits it into `{ pass, partial, fail }` using threshold values from `contrastConfig`. Runs no colour math. Depends on `complianceMode` (indirectly, via the thresholds lookup).

```js
export function categorizePairs(scoredPairs, opts = {}) {
  for (const pair of scoredPairs) {
    if (pair.score >= thresholds.max)      categories.pass.push(pair);
    else if (pair.score >= thresholds.min) categories.partial.push(pair);
    else                                   categories.fail.push(pair);
  }
  // ...sort each bucket...
  return categories;
}
```

The store wires them as **two separate `computed()` calls**, which is the key to the caching benefit:

```js
// src/stores/colourStore.js  lines 108–122
const scoredPairs = computed(() =>
  scoreAllPairs(colourSwatches.value, {
    mode: contrastMode.value,
    cvdMode: cvdMode.value,
    focusColour: focusColour.value || null,
  })
);

const categorizedCombinations = computed(() =>
  categorizePairs(scoredPairs.value, {
    mode: contrastMode.value,
    complianceLevel: complianceMode.value,  // ← only here
  })
);
```

Vue's reactivity system tracks which reactive values each `computed()` reads. Because `complianceMode` is only read by the second computed, toggling AA ↔ AAA only invalidates `categorizedCombinations` — `scoredPairs` stays cached. Adding or removing a colour invalidates `scoredPairs`, which cascades to `categorizedCombinations`.

`scoreColourPair` is also used directly by `ColourContrastWidget` for single-pair display, ensuring the widget and the list always compute the same score under CVD.

## Advantages

- **Compliance toggles are instant** — no colour math runs on AA/AAA switch regardless of palette size.
- **Dependency graph is explicit** — the comment on `scoredPairs` documents that `complianceMode` is intentionally absent. The reason is visible at the call site.
- **Pure functions are easy to test** — `scoreAllPairs` and `categorizePairs` take plain values and return plain objects. No Vue reactivity, no store, no globals.
- **Stages compose cleanly** — a future stage (e.g., sorting by luminance) slots in between without touching the others.

## Disadvantages

- **Two call sites to keep in sync** — if someone adds a new input to the pipeline (say, a new simulation mode), they must add it to the right stage and understand which computed to invalidate.
- **Indirect dependency** — `categorizedCombinations` passes `mode` to `categorizePairs` for the threshold lookup, even though stage 2 does no contrast calculation. This is a config-key dependency, not a math dependency, which can be confusing at first read.

## Key files

- [`src/composables/contrastEngine.js`](../src/composables/contrastEngine.js) — `scoreColourPair`, `scoreAllPairs`, and `categorizePairs`
- [`src/stores/colourStore.js`](../src/stores/colourStore.js) — wires the two computed layers; lines 108–122 are the critical section
- [`src/config/contrastConfig.js`](../src/config/contrastConfig.js) — threshold values consumed by stage 2
