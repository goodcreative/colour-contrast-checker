# Hexagonal Architecture (Ports & Adapters)

Coined by Alistair Cockburn. The central idea: your **application core** should be isolated from everything outside it — browsers, databases, APIs, filesystems — by a boundary of defined interfaces.

```
                    ┌─────────────────────────────┐
   Vue components ──┤                             ├── localStorage
   URL / Router  ──┤      APPLICATION CORE        ├── fetch / APIs
   Tests         ──┤    (Pinia store, business    ├── IndexedDB
   CLI / scripts ──┤          logic)              ├── sessionStorage
                    └─────────────────────────────┘
                         ▲               ▲
                    "driving"        "driven"
                      ports            ports
```

## Terminology

**Port** — an interface (a contract). Defines *what* operations exist, not *how* they work.

**Adapter** — a concrete implementation of a port for a specific technology.

**Driving ports** (left side) — things that *initiate* actions on your core. Vue components calling store actions are driving adapters.

**Driven ports** (right side) — things your core *calls out to*. URL, storage, external APIs. This is where your adapters live.

---

## In this codebase

The store defines what it needs via implicit interfaces:

```
UrlPort:     getParam(key), getSearch(), setParams(params)
StoragePort: load(key), save(key, value), remove(key)
```

The store doesn't care *how* these are fulfilled. It just calls them. Two adapters exist for each port:

```
UrlPort ──── browserUrlAdapter   → window.location / window.history
         └── inMemoryUrlAdapter  → plain URLSearchParams object (tests)

StoragePort ── browserStorageAdapter   → localStorage
            └── inMemoryStorageAdapter → plain JS object (tests)
```

The adapters are injected at startup (or test setup), so the store never imports `window` or `localStorage` directly.

| File | Purpose |
|---|---|
| `src/adapters/browserUrlAdapter.js` | Production — delegates to `window.location` / `window.history` |
| `src/adapters/browserStorageAdapter.js` | Production — delegates to `localStorage` |
| `src/adapters/testAdapters.js` | Testing — in-memory implementations with no browser globals needed |

---

## Why the pattern exists

Without it, your store might look like:

```js
// Hard to test — directly coupled to browser globals
function loadPalette(key) {
  const raw = localStorage.getItem(key);  // ← can't swap this out
  return JSON.parse(raw);
}
```

With it:

```js
// storage is injected — works in browser, tests, Node scripts, anything
function loadPalette(key, storage) {
  const raw = storage.load(key);
  return JSON.parse(raw);
}
```

The core benefits:

- **Testability** — swap real browser APIs for fast, deterministic in-memory fakes
- **Replaceability** — switch `localStorage` → `IndexedDB` → a server API by writing one new adapter, zero store changes
- **Clarity** — the port definition documents exactly what the core needs from the outside world

---

## The "hexagon" part

The shape is arbitrary — Cockburn drew it with six sides to suggest multiple ports around the perimeter. The real insight is the **symmetry**: the pattern applies equally to input (Vue components, URL params, CLI) and output (storage, APIs, the DOM). Both sides get ports and adapters.
