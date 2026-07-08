---
title: Hexagonal Architecture (Ports & Adapters)
eyebrow: Pattern
lede: The store names what it needs from the outside world as **ports**, then receives concrete **adapters** by injection — so browser globals never leak into business logic and tests swap in plain-object fakes.
chips:
  - "Layer · state management"
  - "Ports · URL · Storage · Persistence"
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

The pattern lives at the boundary of the **state-management layer**. The store defines what it needs from the outside world as port interfaces — a UrlPort and a StoragePort — and calls them through injected adapter objects rather than browser globals. The 2.0 work adds a third port, **PersistencePort**, defined the same way (covered at the end of this section).

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

```text the port interfaces
UrlPort:         getParam(key), getSearch(), setParams(params)
StoragePort:     load(key), save(key, value), remove(key)
PersistencePort: listProjects(), getProject(id), saveProject(p), deleteProject(id)   // async
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

### The third port: PersistencePort (2.0)

The 2.0 colour-management service needs to persist the domain aggregate — Projects and everything they own. Rather than reach for a backend client directly, it defines a `PersistencePort` interface (now in TypeScript, so the contract is *explicit* rather than convention) and follows the identical inject-a-port discipline. The production adapter will be Supabase-backed; the in-memory adapter is the test/dev counterpart:

```ts src/domain/persistencePort.ts
export interface PersistencePort {
  listProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  saveProject(project: Project): Promise<Project>;   // create or replace
  deleteProject(id: string): Promise<void>;
}
```

```ts src/adapters/inMemoryPersistenceAdapter.ts
export function createInMemoryPersistenceAdapter(seed: Project[] = []): InMemoryPersistenceAdapter {
  const store = new Map<string, Project>(seed.map((p) => [p.id, structuredClone(p)]));
  return {
    async listProjects() { return [...store.values()].map(structuredClone); },
    async getProject(id) { const p = store.get(id); return p ? structuredClone(p) : null; },
    async saveProject(project) { store.set(project.id, structuredClone(project)); return structuredClone(project); },
    async deleteProject(id) { store.delete(id); },
    snapshot() { return [...store.values()].map(structuredClone); },   // for assertions
  };
}
```

Two things differ from the URL/Storage ports, both deliberate:

- **`structuredClone` on every read and write.** The store holds live domain objects; handing out shared references would let a caller mutate the "persisted" copy. Deep-copying at the boundary makes the in-memory adapter behave like a real database round-trip, where nothing is shared.
- **The port currently leads its production adapter.** `PERSISTENCE_PORT_KEY` and the interface exist and are adapter-ready, but there is no Supabase adapter yet and `main.js` does *not* `provide()` it — wiring the in-memory adapter into the live app would mean nothing survives a refresh. The port is defined ahead of its consumer (the 2.0 domain store) on purpose: the domain can be built and tested against the fake before any backend exists. This is the pattern's payoff stated as a schedule — *interface first, real adapter later.*

:::callout
**Why define a port with no production adapter?** Because the interface is the cheap, stable part and the backend is the expensive, changeable part. Committing to the shape now lets every downstream consumer be written and tested immediately; the Supabase adapter slots in later without any of them changing.
:::

## Advantages

- **Testability** — swap real browser APIs for fast, deterministic in-memory fakes. Tests run in Node without jsdom globals.
- **Replaceability** — switching `localStorage` to `IndexedDB` or a server API means writing one new adapter; the store is untouched.
- **Clarity** — the port definition documents exactly what the store needs from the outside world. Any new I/O the store wants must be added to the port contract explicitly.
- **Symmetry** — the same pattern covers both reading (URL params on init) and writing (pushing state back to URL/storage). The store never has two separate strategies for the same boundary.
- **No module-level mutation** — adapters are injected per store instance via `inject()`, so tests are naturally isolated without a `setAdapters` reset in every `beforeEach`.

## Disadvantages

- **Indirection cost** — a simple `localStorage.getItem` call is now routed through an adapter. The extra layer is invisible in production but adds a file to open when tracing a data flow.
- **Implicit contracts (for the JS ports)** — the UrlPort and StoragePort interfaces are defined only by convention; nothing in plain JavaScript stops an adapter omitting a method until it's called at runtime. The 2.0 `PersistencePort` fixes this by being a real TypeScript `interface` — an adapter that misses a method fails to typecheck. Expect the older ports to gain the same treatment as the migration proceeds.
- **Test setup boilerplate** — every store test must call `createTestPinia` with the desired adapters. Forgetting it means `inject()` returns the lazy browser fallback, which throws in Node.

## Key files

- `src/adapters/browserUrlAdapter.js` — production UrlPort; delegates to `window.location` and `window.history`
- `src/adapters/browserStorageAdapter.js` — production StoragePort; delegates to `localStorage`
- `src/adapters/injectionKeys.ts` — `URL_PORT_KEY`, `STORAGE_PORT_KEY`, and the typed `PERSISTENCE_PORT_KEY: InjectionKey<PersistencePort>`; shared between `main.js`, `testAdapters.js`, and `colourStore.js`
- `src/adapters/testAdapters.js` — in-memory UrlPort and StoragePort for tests; includes the `createTestPinia` helper and `snapshot()` assertion helper
- `src/domain/persistencePort.ts` — the 2.0 PersistencePort interface (typed contract for the domain aggregate)
- `src/adapters/inMemoryPersistenceAdapter.ts` — deep-cloning in-memory PersistencePort; the dev/test counterpart to the future Supabase adapter, with a `snapshot()` helper
- `src/stores/colourStore.js` — consumes the URL and Storage ports via `inject()` with lazy browser fallbacks
- `src/main.js` — provides the URL and Storage production adapters before mounting the app (no PersistencePort adapter yet)
