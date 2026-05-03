# Hexagonal Architecture (Ports & Adapters)

## Problem statement

The store needs to read and write the browser URL and `localStorage`. If it calls `window.location` and `localStorage` directly, tests must either run in a real browser or set up jsdom globals and carefully clean up after each test. More subtly: the store becomes coupled to a specific storage technology. Swapping `localStorage` for `sessionStorage`, or adding server-side rendering where neither exists, requires hunting for every direct call and replacing it. The goal is a store that does its job without knowing or caring which technology sits behind "save this" or "read the URL" — so it can be tested with plain JavaScript objects and retargeted without touching business logic.

## Implementation in this codebase

The pattern lives at the boundary of the **state management layer**. The store defines what it needs via two implicit interfaces — a UrlPort and a StoragePort — and calls them through injected adapter objects rather than browser globals.

**The ports** (interfaces):

```
UrlPort:     getParam(key), getSearch(), setParams(params)
StoragePort: load(key), save(key, value), remove(key)
```

**The production adapters** implement these interfaces against real browser APIs:

```js
// src/adapters/browserUrlAdapter.js
export function createBrowserUrlAdapter() {
  return {
    getSearch() { return window.location.search; },
    setParams(params) {
      const url = new URL(window.location.href);
      for (const [key, value] of Object.entries(params)) {
        value === null ? url.searchParams.delete(key) : url.searchParams.set(key, value);
      }
      window.history.replaceState(history.state, '', url);
    },
    // ...
  };
}
```

```js
// src/adapters/browserStorageAdapter.js
export function createBrowserStorageAdapter() {
  return {
    load(key)        { return localStorage.getItem(key); },
    save(key, value) { localStorage.setItem(key, value); },
    remove(key)      { localStorage.removeItem(key); },
  };
}
```

**The test adapters** in `testAdapters.js` implement the same interfaces with plain JS objects and expose a `snapshot()` helper for assertions. `createTestPinia` wires them into an isolated Pinia instance for store tests:

```js
// src/adapters/testAdapters.js
export function createInMemoryStorageAdapter(seed = {}) {
  const store = { ...seed };
  return {
    load(key)        { return key in store ? store[key] : null; },
    save(key, value) { store[key] = value; },
    remove(key)      { delete store[key]; },
    snapshot()       { return { ...store }; },
  };
}

export function createTestPinia(urlAdapter, storageAdapter) {
  // creates a Vue app, provides both adapters under their injection keys,
  // installs Pinia, and returns the pinia instance
}
```

**The store** uses Vue's `inject()` to receive its adapters, with lazy browser adapter fallbacks so it works without any `provide()` call in production:

```js
// src/stores/colourStore.js
const _urlPort     = inject(URL_PORT_KEY, () => createBrowserUrlAdapter(), true);
const _storagePort = inject(STORAGE_PORT_KEY, () => createBrowserStorageAdapter(), true);
```

The production `main.js` calls `app.provide(URL_PORT_KEY, ...)` and `app.provide(STORAGE_PORT_KEY, ...)` before mounting. A test's `beforeEach` calls `createTestPinia(createInMemoryUrlAdapter(), createInMemoryStorageAdapter())` and the store never touches `window` or `localStorage`.

## Advantages

- **Testability** — swap real browser APIs for fast, deterministic in-memory fakes. Tests run in Node without jsdom globals.
- **Replaceability** — switching `localStorage` to `IndexedDB` or a server API means writing one new adapter; the store is untouched.
- **Clarity** — the port definition documents exactly what the store needs from the outside world. Any new I/O the store wants must be added to the port contract explicitly.
- **Symmetry** — the same pattern covers both reading (URL params on init) and writing (pushing state back to URL/storage). The store never has two separate strategies for the same boundary.
- **No module-level mutation** — adapters are injected per store instance via `inject()`, so tests are naturally isolated without needing a `setAdapters` reset in every `beforeEach`.

## Disadvantages

- **Indirection cost** — a simple `localStorage.getItem` call is now routed through an adapter. The extra layer is invisible in production but adds a file to open when tracing a data flow.
- **Implicit contracts** — the port interfaces are defined only by convention. Nothing in plain JavaScript prevents an adapter from omitting a method until it's called at runtime.
- **Test setup boilerplate** — every store test must call `createTestPinia` with the desired adapters. Forgetting it means `inject()` returns the lazy browser fallback, which will throw in Node.

## Key files

- [`src/adapters/browserUrlAdapter.js`](../src/adapters/browserUrlAdapter.js) — production UrlPort; delegates to `window.location` and `window.history`
- [`src/adapters/browserStorageAdapter.js`](../src/adapters/browserStorageAdapter.js) — production StoragePort; delegates to `localStorage`
- [`src/adapters/injectionKeys.js`](../src/adapters/injectionKeys.js) — `URL_PORT_KEY` and `STORAGE_PORT_KEY` symbols; shared between `main.js`, `testAdapters.js`, and `colourStore.js`
- [`src/adapters/testAdapters.js`](../src/adapters/testAdapters.js) — in-memory UrlPort and StoragePort for tests; includes `createTestPinia` helper and `snapshot()` assertion helper
- [`src/stores/colourStore.js`](../src/stores/colourStore.js) — consumes both ports via `inject()` with lazy browser fallbacks
- [`src/main.js`](../src/main.js) — provides both production adapters before mounting the app
