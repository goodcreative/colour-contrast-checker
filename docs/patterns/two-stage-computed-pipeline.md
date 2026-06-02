---
title: Two-Stage Computed Pipeline
eyebrow: Pattern
lede: Contrast scoring (O(N²)) and compliance bucketing live in **two separate `computed()` layers** — so toggling AA ↔ AAA re-buckets cached scores instead of recomputing every ratio.
chips:
  - "Layer · state management"
  - "Stage 1 · `scoreAllPairs`"
  - "Stage 2 · `categorizePairs`"
category: state
tags:
  - reactivity
  - computed
  - performance
summary: Splitting scoring from bucketing into two chained computed properties means an AA/AAA toggle never re-runs colour maths — only the cheap second stage invalidates.
icon: |
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="8" width="7" height="8" rx="1.5" />
    <rect x="15" y="8" width="7" height="8" rx="1.5" />
    <path d="M9 12h4" />
    <path d="M11 10l2 2-2 2" />
  </svg>
---

## Problem statement

The contrast checker computes ratios for every unique pair of colours in a palette — O(N²) work. It also buckets those pairs into pass / partial-pass / fail based on the active compliance level (AA or AAA). If both operations live in a single computed property, every time the user toggles AA ↔ AAA the app re-runs all the contrast math, even though compliance thresholds have nothing to do with the raw ratios. On a large palette this makes the UI feel sluggish on a toggle that should be instant. The challenge is keeping the math and the bucketing separate without losing the convenience of a single result to render.

## Implementation in this codebase

The pipeline lives in the **state-management layer**: `colourStore.js` wires two `computed()` calls in sequence, backed by three pure functions in `contrastEngine.js` — `scoreColourPair` (the core atom), `scoreAllPairs` (stage 1), and `categorizePairs` (stage 2).

:::diagram
<svg viewBox="0 0 650 250" role="img" aria-label="Two-stage pipeline: scoreAllPairs feeds a cached scoredPairs value, which categorizePairs buckets; complianceMode feeds only the second stage.">
  <defs>
    <marker id="ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0 0L6 3L0 6Z" style="fill:var(--text-muted)" />
    </marker>
    <marker id="ara" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0 0L6 3L0 6Z" style="fill:var(--accent)" />
    </marker>
  </defs>

  <!-- inputs to stage 1 -->
  <rect x="80" y="20" width="150" height="46" rx="8" style="fill:var(--surface-alt);stroke:var(--border-strong)" />
  <text x="155" y="40" text-anchor="middle" font-size="12" style="fill:var(--text-muted)">swatches · contrastMode</text>
  <text x="155" y="56" text-anchor="middle" font-size="12" style="fill:var(--text-muted)">cvdMode · focusColour</text>
  <line x1="155" y1="66" x2="155" y2="98" style="stroke:var(--text-muted)" stroke-width="1.5" marker-end="url(#ar)" />

  <!-- complianceMode to stage 2 only -->
  <rect x="420" y="20" width="150" height="46" rx="8" style="fill:var(--accent-soft);stroke:var(--accent)" />
  <text x="495" y="42" text-anchor="middle" font-size="12.5" style="fill:var(--accent)">complianceMode</text>
  <text x="495" y="58" text-anchor="middle" font-size="11" style="fill:var(--accent)">AA ⇄ AAA · stage 2 only</text>
  <line x1="495" y1="66" x2="495" y2="98" style="stroke:var(--accent)" stroke-width="1.5" marker-end="url(#ara)" />

  <!-- stage 1 -->
  <rect x="80" y="100" width="150" height="60" rx="10" style="fill:var(--surface-alt);stroke:var(--border-strong)" />
  <text x="155" y="126" text-anchor="middle" font-size="13.5" font-family="var(--mono)" style="fill:var(--text)">scoreAllPairs()</text>
  <text x="155" y="145" text-anchor="middle" font-size="11.5" style="fill:var(--text-muted)">Stage 1 · scoring</text>

  <!-- cached scoredPairs -->
  <rect x="270" y="108" width="110" height="44" rx="22" style="fill:var(--good-soft);stroke:var(--good)" />
  <text x="325" y="126" text-anchor="middle" font-size="12.5" font-family="var(--mono)" style="fill:var(--good)">scoredPairs</text>
  <text x="325" y="142" text-anchor="middle" font-size="11" style="fill:var(--good)">cached</text>

  <!-- stage 2 -->
  <rect x="420" y="100" width="150" height="60" rx="10" style="fill:var(--surface-alt);stroke:var(--border-strong)" />
  <text x="495" y="126" text-anchor="middle" font-size="13.5" font-family="var(--mono)" style="fill:var(--text)">categorizePairs()</text>
  <text x="495" y="145" text-anchor="middle" font-size="11.5" style="fill:var(--text-muted)">Stage 2 · bucketing</text>

  <!-- horizontal flow -->
  <line x1="230" y1="130" x2="268" y2="130" style="stroke:var(--text-muted)" stroke-width="1.5" marker-end="url(#ar)" />
  <line x1="380" y1="130" x2="418" y2="130" style="stroke:var(--text-muted)" stroke-width="1.5" marker-end="url(#ar)" />

  <!-- output -->
  <line x1="495" y1="160" x2="495" y2="194" style="stroke:var(--text-muted)" stroke-width="1.5" marker-end="url(#ar)" />
  <rect x="420" y="196" width="150" height="42" rx="8" style="fill:var(--surface-alt);stroke:var(--border-strong)" />
  <text x="495" y="222" text-anchor="middle" font-size="12.5" font-family="var(--mono)" style="fill:var(--text)">{ pass, partial, fail }</text>
</svg>
:::

**Stage 1 — scoring** (`scoreAllPairs`): iterates every unique pair and calls `scoreColourPair` for each. Returns a flat array of `{ fgHex, bgHex, score, simulatedFg, simulatedBg }` objects. It depends on `swatches`, `contrastMode`, `cvdMode`, and `focusColour` — but deliberately *not* `complianceMode`.

```js src/composables/contrastEngine.js
export function scoreAllPairs(swatches, opts = {}) {
  const { mode = 'wcag', cvdMode = 'normal', focusColour = null } = opts;
  // ...deduplicates pairs, calls scoreColourPair for each...
  result.push({ fgHex, bgHex, score, simulatedFg, simulatedBg });
  return result;
}
```

**Stage 2 — bucketing** (`categorizePairs`): receives the scored array and splits it into `{ pass, partial, fail }` using threshold values from `contrastConfig`. Runs no colour math. Depends on `complianceMode` (indirectly, via the thresholds lookup).

```js src/composables/contrastEngine.js
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

Wiring them as **two separate `computed()` calls** — rather than one — is the entire point:

:::compare
@bad One computed — recomputes everything on an AA/AAA toggle
```js complianceMode now invalidates the colour maths too
const categorizedCombinations = computed(() => {
  const scored = scoreAllPairs(colourSwatches.value, { /* ... */ });   // O(N²) re-run
  return categorizePairs(scored, { complianceLevel: complianceMode.value });
});
// toggling AA ↔ AAA re-runs scoreAllPairs for no reason
```
@good Two computeds — the toggle only re-runs the cheap stage
```js src/stores/colourStore.js · lines 108–122
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
:::

:::callout
**Why it works:** Vue tracks which reactive values each `computed()` reads. Because `complianceMode` is read *only* by the second computed, toggling AA ↔ AAA invalidates `categorizedCombinations` alone — `scoredPairs` stays cached. Adding or removing a colour invalidates `scoredPairs`, which then cascades to `categorizedCombinations`.
:::

`scoreColourPair` is also used directly by `ColourContrastWidget` for single-pair display, ensuring the widget and the list always compute the same score under CVD.

## Advantages

- **Compliance toggles are instant** — no colour math runs on an AA/AAA switch regardless of palette size.
- **Dependency graph is explicit** — the comment on `scoredPairs` documents that `complianceMode` is intentionally absent. The reason is visible at the call site.
- **Pure functions are easy to test** — `scoreAllPairs` and `categorizePairs` take plain values and return plain objects. No Vue reactivity, no store, no globals.
- **Stages compose cleanly** — a future stage (e.g. sorting by luminance) slots in between without touching the others.

## Disadvantages

- **Two call sites to keep in sync** — adding a new input to the pipeline (say, a new simulation mode) means adding it to the right stage and understanding which computed to invalidate.
- **Indirect dependency** — `categorizedCombinations` passes `mode` to `categorizePairs` for the threshold lookup even though stage 2 does no contrast calculation. This is a config-key dependency, not a math dependency, which can confuse at first read.

## Key files

- `src/composables/contrastEngine.js` — `scoreColourPair`, `scoreAllPairs`, and `categorizePairs`
- `src/stores/colourStore.js` — wires the two computed layers; lines 108–122 are the critical section
- `src/config/contrastConfig.js` — threshold values consumed by stage 2
