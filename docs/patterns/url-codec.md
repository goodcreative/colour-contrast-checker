---
title: URL Codec
eyebrow: Pattern
lede: A single pure module owns the entire mapping between app state and the URL — encoding, decoding, and validation — so malformed shared links are sanitised at the boundary and the store never touches `URLSearchParams`.
chips:
  - "Layer · composables"
  - "Module · `paletteUrlCodec.js`"
  - "Pure · validates at the edge"
category: shared
tags:
  - serialisation
  - validation
  - pure-functions
summary: One module encodes palette state to query params and decodes/validates them back into a complete typed shape — unrecognised values fall back to defaults before they ever reach the store.
icon: |
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 13a5 5 0 0 0 7.07 0l2-2a5 5 0 1 0-7.07-7.07l-1.5 1.5" />
    <path d="M14 11a5 5 0 0 0-7.07 0l-2 2a5 5 0 1 0 7.07 7.07l1.5-1.5" />
  </svg>
---

## Problem statement

The app encodes the entire palette state — colours, title, focus colour, contrast mode, CVD mode, compliance level — into URL query parameters so users can share a palette via a link. Without a dedicated module for this, URL encoding logic tends to leak into store actions and URL decoding tends to get tangled with validation, making both harder to test and easy to get wrong. Malformed URLs (hand-edited or from external links) must be handled safely: an unrecognised value for `contrastMode` should be silently ignored, not crash the store. The challenge is keeping all of this — encoding, decoding, and validation — in one testable place the store can call without touching browser globals.

## Implementation in this codebase

The codec lives in the **composable layer** as a single module: `src/composables/paletteUrlCodec.js`. It exports two pure functions. "Pure" means no side effects, no imports of browser globals, no store access — plain values in, plain values out.

A named schema **`PaletteUrlState`** (JSDoc typedef) defines the decoder's return shape, and **`defaultPaletteUrlState()`** supplies canonical defaults. The decoder always returns a complete `PaletteUrlState` — missing or invalid fields fall back to these defaults rather than `null`, so callers can assign directly without null guards.

The two halves are mirror images — encode current state to params, decode raw search back to a validated state:

:::tabs
@tab Encode
```js src/composables/paletteUrlCodec.js
// state → query-param object (null = "delete this param")
export function encodePaletteToParams({ colours, title, focusColour, contrastMode, cvdMode, complianceMode }) {
  return {
    colours:  colours.length ? colours.map(c => c.replace("#", "")).join("-") : null,
    title:    title || null,
    focus:    focusColour ? focusColour.replace("#", "") : null,
    contrastMode,
    cvdMode,
    complianceMode,
  };
}
```
@tab Decode
```js src/composables/paletteUrlCodec.js
// raw search → complete, validated PaletteUrlState
export function decodePaletteFromSearch(search) {
  const defaults = defaultPaletteUrlState();
  const params = new URLSearchParams(search.replace(/^\?/, ""));

  const coloursRaw = params.get("colours");
  const colours = coloursRaw
    ? coloursRaw.split("-").map(seg => "#" + seg).filter(isValidHex)
    : defaults.colours;

  const contrastRaw = params.get("contrastMode");
  const contrastMode = CONTRAST_ALGORITHMS.includes(contrastRaw) ? contrastRaw : defaults.contrastMode;
  // ...same validate-or-default pattern for cvdMode, complianceMode...

  return { colours, title, focusColour, contrastMode, cvdMode, complianceMode };
}
```
:::

Each field is validated before being returned: colour segments are filtered through a hex regex (invalid hex dropped silently), and setting values are checked against the canonical arrays in `src/config/contrastSettings.ts` (`CONTRAST_ALGORITHMS`, `CVD_TYPES`, `COMPLIANCE_LEVELS` — renamed from the legacy `modes.js` constants to free the word *Mode* for the 2.0 theme-variant concept), falling back to the `defaultPaletteUrlState()` value for that field when unrecognised.

The store calls both functions but never touches `URLSearchParams` itself:

```js src/stores/colourStore.js
function updateURLData() {
  _urlPort.setParams(encodePaletteToParams({ colours, title, ... }));
}

function loadPaletteFromQueryString() {
  const state = decodePaletteFromSearch(_urlPort.getSearch());
  colourSwatches.value  = state.colours;
  paletteTitle.value    = state.title;
  contrastMode.value    = state.contrastMode;
  // ...assign directly, no null guards needed
}
```

:::callout
**Validation at the boundary:** by the time a value leaves `decodePaletteFromSearch`, it is guaranteed to be one of the canonical options. The store never has to defend against `contrastMode === "hack"` — the codec already replaced it with the default.
:::

This separation means the codec can be unit-tested with raw strings — no browser, no store, no adapter needed.

## Advantages

- **Centralised serialisation** — the mapping between app state and URL shape is defined in exactly one file. Renaming a query parameter is a one-line change.
- **Validation at the boundary** — unrecognised or malformed values are rejected before they reach the store. The store never needs to guard against bad enum values.
- **Pure functions are easy to test** — pass in a search string, assert the returned object. No mocking required.
- **Decoupled from the URL adapter** — the codec produces and consumes plain strings and objects; the adapter handles the actual `window.location` manipulation. The codec works equally well under test with no browser present.
- **Complete return value** — `decodePaletteFromSearch` always returns a full `PaletteUrlState`, so the store assigns fields directly without null checks.

## Disadvantages

- **Encoder→adapter contract is still implicit** — `encodePaletteToParams` returns `{ colours, title, focus, contrastMode, cvdMode, complianceMode }`; the adapter must handle all those keys, and nothing in plain JS enforces it. (`PaletteUrlState` formalises the decoder output, but the encoder output shape has no equivalent schema.)
- **Silent filtering can hide bugs** — invalid hex values are silently dropped rather than surfaced to the user. A corrupted shared link loads with fewer colours and no error message.
- **Hex format is fragile** — colours are serialised by stripping `#` and joining with `-`. A hex that somehow contained a `-` would corrupt the entire colour list. (It can't happen with valid hex, but the delimiter is load-bearing.)

## Key files

- `src/composables/paletteUrlCodec.js` — `defaultPaletteUrlState`, `encodePaletteToParams`, and `decodePaletteFromSearch`; the entire codec
- `src/config/contrastSettings.ts` — canonical arrays (`CONTRAST_ALGORITHMS` / `CVD_TYPES` / `COMPLIANCE_LEVELS`) used for enum validation in the decoder
- `src/adapters/browserUrlAdapter.js` — production adapter that receives the params object and writes to `window.history`
- `src/adapters/testAdapters.js` — in-memory URL adapter used in tests
- `src/stores/colourStore.js` — calls `encodePaletteToParams` in `updateURLData` and `decodePaletteFromSearch` in `loadPaletteFromQueryString`
