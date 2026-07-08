---
title: Incremental TypeScript Migration
eyebrow: Pattern
lede: JavaScript and TypeScript coexist file-by-file — `allowJs` lets the two live side by side, and a tiny Vite resolver rewrites `.js` import specifiers to a ported `.ts` sibling, so a module gains types without any of its callers (or tests) changing a line.
chips:
  - "Layer · build + tooling"
  - "Mechanism · `js-to-ts-resolver`"
  - "Migration · engine-first"
category: shared
tags:
  - typescript
  - build
  - migration
summary: The engine is being ported to TypeScript one file at a time; `allowJs` plus a Vite `resolveId` shim mean `.js` imports keep resolving after a module becomes `.ts`, so no big-bang rewrite and the existing tests stay untouched.
icon: |
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 7h9" />
    <path d="M9 3l4 4-4 4" />
    <path d="M20 17h-9" />
    <path d="M15 13l-4 4 4 4" />
  </svg>
---

## Problem statement

The codebase started as plain JavaScript and is moving to TypeScript for the 2.0 work — but a codebase of any size cannot stop and convert every file in one commit. That "big-bang" rewrite is the thing to avoid: it is one enormous, unreviewable change, it blocks all other work while it is in flight, and if it introduces a bug there is no small diff to bisect. What you want instead is to convert **one file at a time**, keep the app shippable after every step, and leave the existing test suite green throughout.

Two obstacles stand in the way. First, the whole app has to *agree* to let the two languages mix — the type-checker and the build must both accept a project where some files are `.js` and some are `.ts`. Second, and more subtly: when you rename `simulateCVD.js` to `simulateCVD.ts`, every file that wrote `import simulateCVD from './simulateCVD.js'` now points at a filename that no longer exists. Bundlers and test runners do **not** automatically try `.ts` when a `.js` file is missing — so the naïve rename breaks every import site at once, including a pile of test files you were trying not to touch. The goal is a setup where a module can flip to TypeScript and its callers never notice.

## Implementation in this codebase

The pattern lives in the **build-and-tooling layer** — two small pieces of configuration, not application code.

**First, let the languages mix.** `tsconfig.json` sets `allowJs: true`, so a `.ts` module can import a still-untyped `.js` module and vice versa; the project type-checks as one unit. A `typecheck` script runs `vue-tsc` over everything, and Vite already transpiles `.ts` out of the box.

```jsonc tsconfig.json (the load-bearing flags)
{
  "compilerOptions": {
    "allowJs": true,      // JS and TS coexist — no big-bang conversion
    "checkJs": false,     // don't type-check the JS that hasn't been ported yet
    "strict": true,       // full strictness for the code that HAS been ported
    "noEmit": true        // Vite does the emitting; tsc only checks
  }
}
```

**Second, bridge the extension gap.** A ~10-line Vite plugin intercepts every import ending in `.js`; if a sibling `.ts` file exists, it resolves to that instead. This is the piece that makes the file-by-file rename invisible to callers:

```js vite.config.js
function jsToTsResolver() {
  return {
    name: "js-to-ts-resolver",
    enforce: "pre",                       // run before Vite's own resolver
    async resolveId(source, importer, options) {
      if (!source.endsWith(".js")) return null;            // not our concern
      const tsSource = source.slice(0, -3) + ".ts";        // foo.js → foo.ts
      const resolved = await this.resolve(tsSource, importer, { ...options, skipSelf: true });
      return resolved || null;            // found a .ts sibling? use it. else fall through
    },
  };
}

export default defineConfig({ plugins: [jsToTsResolver(), vue()], /* ... */ });
```

:::callout
**Why the resolver, not a find-and-replace?** The existing engine tests import the modules under test with `.js` extensions. A requirement of the port was that those spec files stay *literally unchanged* and green — proof that the port preserved behaviour. Rewriting every import to `.ts` would have edited the very tests meant to be the safety net. The resolver moves the fix into one config file instead of hundreds of call sites.
:::

With both pieces in place, porting a module is a three-step move that touches only that module:

:::compare
@bad Big-bang — rename everything, fix every import, hope the tests still pass
```text one giant unreviewable diff
git mv src/composables/*.js → *.ts        # dozens of files
# now every import './x.js' is broken
# edit every caller AND every *.spec.js
# 200+ line diff, no way to bisect a regression
```
@good Incremental — one file, callers untouched
```text a small, reviewable diff per module
git mv simulateCVD.js simulateCVD.ts       # 1 file
# add real types inside it
# callers still import './simulateCVD.js' — resolver redirects to .ts
# its spec still imports '.js' and still passes
```
:::

The migration runs **engine-first**: the pure, well-tested composables (`hexToRGB`, `simulateCVD`, `calculateColourContrast`, `contrastEngine`) went first because they have the strongest test coverage and no framework entanglement, so types could be added with the safety net at its tightest. Stores and components — where Vue's own typing gets involved — come later. Files still in JavaScript (`paletteUrlCodec.js`, the store, the adapters that haven't moved) keep working the entire time.

## Advantages

- **Small, reviewable steps.** Each port is one file plus its types — easy to review, easy to revert, easy to bisect if something regresses.
- **Always shippable.** The app builds and the suite passes after every single step; there is no broken interim state.
- **Tests double as proof.** Because spec files are untouched, a green run after a port is direct evidence the types changed nothing about behaviour.
- **Types where they pay off first.** Engine-first means the most-reused, most-critical maths gets real signatures before anything else.

## Disadvantages

- **A little build magic.** The resolver is invisible until it isn't: a developer who greps for `simulateCVD.ts` won't find the `import './simulateCVD.js'` that loads it. This doc exists partly to point at that.
- **Mixed extensions during the transition.** For a while the tree has both `.js` and `.ts` in the same folder; you have to know which is which. The state is temporary but real.
- **`checkJs: false` leaves a blind spot.** Un-ported JS is not type-checked at all, so type errors there surface only once the file is converted.
- **Two type-check passes to remember.** `npm run typecheck` (vue-tsc) is separate from the Vite build; the build can succeed while types are broken, so CI must run both.

## Key files

- `tsconfig.json` — `allowJs` / `checkJs: false` / `strict`; the config that lets JS and TS share one project
- `vite.config.js` — the `jsToTsResolver` plugin that redirects `.js` specifiers to `.ts` siblings
- `package.json` — the `typecheck` script (`vue-tsc --noEmit`) and the `typescript` / `vue-tsc` dev dependencies
- `src/composables/*.ts` — the ported engine (the first wave of the migration)
- `src/composables/paletteUrlCodec.js` — a representative not-yet-ported module that still works alongside the `.ts` files
