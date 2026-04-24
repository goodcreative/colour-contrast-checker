# URL Codec

## Problem statement

The app encodes the entire palette state — colours, title, focus colour, contrast mode, CVD mode, compliance level — into URL query parameters so users can share a palette via a link. Without a dedicated module for this, URL encoding logic tends to leak into store actions and URL decoding tends to get tangled with validation, making both harder to test and easy to get wrong. Malformed URLs (hand-edited or from external links) must be handled safely: an unrecognised value for `contrastMode` should be silently ignored, not crash the store. The challenge is keeping all of this — encoding, decoding, and validation — in one testable place that the store can call without touching browser globals.

## Implementation in this codebase

The codec lives in the **composable layer** as a single module: `src/composables/paletteUrlCodec.js`. It exports two pure functions. "Pure" means: no side effects, no imports of browser globals, no store access. The functions take plain values in and return plain values out.

**Encoding** (`encodePaletteToParams`): takes the current palette state as named arguments and returns a plain object of query parameter key/value pairs. Colours are joined as a hyphen-separated hex string (hashes stripped). Empty values become `null`, which signals the URL adapter to delete that parameter rather than leave a blank `?title=` in the URL.

```js
// src/composables/paletteUrlCodec.js
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

**Decoding** (`decodePaletteFromSearch`): takes the raw URL search string (e.g. `?colours=ff0000-000000&contrastMode=apca`) and returns a typed, validated state object. Each field is validated before being returned:

- Colour segments are validated with `checkHexColourIsValid` — invalid hex values are filtered out silently.
- Mode values (`contrastMode`, `cvdMode`, `complianceMode`) are checked against the canonical arrays in `src/config/modes.js`; unrecognised values become `null`.

```js
export function decodePaletteFromSearch(search) {
  const params = new URLSearchParams(search.replace(/^\?/, ""));

  const coloursRaw = params.get("colours");
  const colours = coloursRaw
    ? coloursRaw.split("-").map(seg => "#" + seg).filter(checkHexColourIsValid)
    : [];

  const contrastRaw = params.get("contrastMode");
  const contrastMode = CONTRAST_MODES.includes(contrastRaw) ? contrastRaw : null;
  // ...same pattern for cvdMode, complianceMode...

  return { colours, title, focusColour, contrastMode, cvdMode, complianceMode };
}
```

The store calls both functions but never touches `URLSearchParams` directly:

```js
// src/stores/colourStore.js
function updateURLData() {
  _urlPort.setParams(encodePaletteToParams({ colours, title, ... }));
}

function loadPaletteFromQueryString() {
  const { colours, title, contrastMode, ... } = decodePaletteFromSearch(_urlPort.getSearch());
  // ...apply values to refs...
}
```

This separation means the codec can be unit-tested with raw strings — no browser, no store, no adapter needed.

## Advantages

- **Centralised serialisation** — the mapping between app state and URL shape is defined in exactly one file. Renaming a query parameter requires one change.
- **Validation at the boundary** — unrecognised or malformed values are rejected before they reach the store. The store never needs to guard against `contrastMode === "hack"`.
- **Pure functions are easy to test** — pass in a search string, assert the returned object. No mocking required.
- **Decoupled from the URL adapter** — the codec produces and consumes plain strings and objects; the adapter handles the actual `window.location` manipulation. The codec works equally well under test with no browser present.

## Disadvantages

- **Codec and URL adapter must agree on the params object shape** — the codec returns `{ colours, title, focus, contrastMode, cvdMode, complianceMode }`; the adapter must handle all those keys. This contract is implicit (no interface definition in plain JS).
- **Silent filtering can hide bugs** — invalid hex values are silently dropped rather than surfaced to the user. A corrupted shared link will load with fewer colours and no error message.
- **Hex format is fragile** — colours are serialised by stripping `#` and joining with `-`. A colour hex that somehow contained a `-` would corrupt the entire colour list. (This can't happen with valid hex strings, but it's worth knowing the delimiter is load-bearing.)

## Key files

- [`src/composables/paletteUrlCodec.js`](../src/composables/paletteUrlCodec.js) — `encodePaletteToParams` and `decodePaletteFromSearch`; the entire codec
- [`src/config/modes.js`](../src/config/modes.js) — canonical arrays used for enum validation in the decoder
- [`src/composables/checkHexColourIsValid.js`](../src/composables/checkHexColourIsValid.js) — hex validator used to filter colour segments
- [`src/adapters/browserUrlAdapter.js`](../src/adapters/browserUrlAdapter.js) — production adapter that receives the params object and writes to `window.history`
- [`src/adapters/testAdapters.js`](../src/adapters/testAdapters.js) — in-memory URL adapter used in tests
- [`src/stores/colourStore.js`](../src/stores/colourStore.js) — calls `encodePaletteToParams` in `updateURLData` and `decodePaletteFromSearch` in `loadPaletteFromQueryString`
