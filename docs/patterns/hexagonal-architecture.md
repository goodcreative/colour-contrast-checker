---
title: Hexagonal Architecture (Ports & Adapters)
eyebrow: Pattern
lede: The store names what it needs from the outside world as **ports**, then receives concrete **adapters** by injection — so browser globals never leak into business logic and tests swap in plain-object fakes.
chips:
  - "Layer · state management"
  - "Ports · URL + Storage"
  - "Injected · no globals"
category: state
tags:
  - adapters
  - dependency-injection
  - testability
summary: The store reaches the URL and localStorage through injected port interfaces, so it can be tested with in-memory fakes and retargeted to new storage without touching logic.
icon: |
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12 2 21 7 21 17 12 22 3 17 3 7" />
    <circle cx="12" cy="12" r="3" />
  </svg>
---

## Problem statement

The store needs to read and write the browser URL and `localStorage`. If it calls `window.location` and `localStorage` directly, tests must either run in a real browser or stand up jsdom globals and carefully clean them up after each test. More subtly: the store becomes welded to a specific storage technology. Swapping `localStorage` for `sessionStorage`, or adding server-side rendering where neither exists, means hunting down every direct call and replacing it. The goal is a store that does its job without knowing or caring which technology sits behind "save this" or "read the URL" — so it can be tested with plain JavaScript objects and retargeted without touching business logic.

## Implementation in this codebase

The pattern lives at the boundary of the **state-management layer**. The store defines what it needs from the outside world as two implicit interfaces — a UrlPort and a StoragePort — and calls them through injected adapter objects rather than browser globals.

:::compare
@bad Tempting — the store reaches for browser globals directly
```js coupled to the browser; needs jsdom to test
// inside colourStore.js
function loadPalette() {
  const raw = localStorage.getItem('palette');   // real global
  const search = window.location.search;          // real global
  // ...test must fake window + localStorage and clean up after
}
```
@good Actual — the store calls injected ports
```js technology-agnostic; tests pass in fakes
const _urlPort     = inject(URL_PORT_KEY, ...);
const _storagePort = inject(STORAGE_PORT_KEY, ...);

function loadPalette() {
  const raw    = _storagePort.load('palette');    // some StoragePort
  const search = _urlPort.getSearch();            // some UrlPort
}
```
:::

**The ports** are the contracts the store depends on — just method shapes, no implementation:

```text the two port interfaces
UrlPort:     getParam(key), getSearch(), setParams(params)
StoragePort: load(key), save(key, value), remove(key)
```

**The adapters** implement those interfaces. The production adapters delegate to real browser APIs; the test adapter backs them with a plain object and adds a `snapshot()` helper for assertions:

:::tabs
@tab Production · URL
```js src/adapters/browserUrlAdapter.js
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
@tab Production · Storage
```js src/adapters/browserStorageAdapter.js
export function createBrowserStorageAdapter() {
  return {
    load(key)        { return localStorage.getItem(key); },
    save(key, value) { localStorage.setItem(key, value); },
    remove(key)      { localStorage.removeItem(key); },
  };
}
```
@tab Test · in-memory
```js src/adapters/testAdapters.js
export function createInMemoryStorageAdapter(seed = {}) {
  const store = { ...seed };
  return {
    load(key)        { return key in store ? store[key] : null; },
    save(key, value) { store[key] = value; },
    remove(key)      { delete store[key]; },
    snapshot()       { return { ...store }; },   // for assertions
  };
}

export function createTestPinia(urlAdapter, storageAdapter) {
  // creates a Vue app, provides both adapters under their injection keys,
  // installs Pinia, and returns the pinia instance
}
```
:::

**The store** uses Vue's `inject()` to receive its adapters, with lazy browser-adapter fallbacks so it still works without any `provide()` call in production:

```js src/stores/colourStore.js
const _urlPort     = inject(URL_PORT_KEY, () => createBrowserUrlAdapter(), true);
const _storagePort = inject(STORAGE_PORT_KEY, () => createBrowserStorageAdapter(), true);
```

:::callout
**The rule:** production `main.js` calls `app.provide(URL_PORT_KEY, …)` and `app.provide(STORAGE_PORT_KEY, …)` before mounting; a test's `beforeEach` calls `createTestPinia(createInMemoryUrlAdapter(), createInMemoryStorageAdapter())`. Either way the store just calls `inject()` and never touches `window` or `localStorage`.
:::

## Advantages

- **Testability** — swap real browser APIs for fast, deterministic in-memory fakes. Tests run in Node without jsdom globals.
- **Replaceability** — switching `localStorage` to `IndexedDB` or a server API means writing one new adapter; the store is untouched.
- **Clarity** — the port definition documents exactly what the store needs from the outside world. Any new I/O the store wants must be added to the port contract explicitly.
- **Symmetry** — the same pattern covers both reading (URL params on init) and writing (pushing state back to URL/storage). The store never has two separate strategies for the same boundary.
- **No module-level mutation** — adapters are injected per store instance via `inject()`, so tests are naturally isolated without a `setAdapters` reset in every `beforeEach`.

## Disadvantages

- **Indirection cost** — a simple `localStorage.getItem` call is now routed through an adapter. The extra layer is invisible in production but adds a file to open when tracing a data flow.
- **Implicit contracts** — the port interfaces are defined only by convention. Nothing in plain JavaScript prevents an adapter from omitting a method until it's called at runtime.
- **Test setup boilerplate** — every store test must call `createTestPinia` with the desired adapters. Forgetting it means `inject()` returns the lazy browser fallback, which throws in Node.

## Key files

- `src/adapters/browserUrlAdapter.js` — production UrlPort; delegates to `window.location` and `window.history`
- `src/adapters/browserStorageAdapter.js` — production StoragePort; delegates to `localStorage`
- `src/adapters/injectionKeys.js` — `URL_PORT_KEY` and `STORAGE_PORT_KEY` symbols; shared between `main.js`, `testAdapters.js`, and `colourStore.js`
- `src/adapters/testAdapters.js` — in-memory UrlPort and StoragePort for tests; includes the `createTestPinia` helper and `snapshot()` assertion helper
- `src/stores/colourStore.js` — consumes both ports via `inject()` with lazy browser fallbacks
- `src/main.js` — provides both production adapters before mounting the app
