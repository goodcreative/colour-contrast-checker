---
title: Domain Types as Ubiquitous Language
eyebrow: Pattern
lede: The 2.0 domain vocabulary — Project, Palette, Colour, Mode, Role — is written down once as TypeScript types, so the words the design docs use and the words the code uses are literally the same symbols, and the compiler enforces the decisions the ADRs made.
chips:
  - "Layer · domain"
  - "Entry · `domain/types.ts`"
  - "DDD · language in the type system"
category: shared
tags:
  - typescript
  - domain-modeling
  - types
summary: The colour-management domain is modelled as a small set of TypeScript interfaces plus controlled vocabularies (const-array unions and a role list), turning the ubiquitous language of the design docs into compiler-checked code.
icon: |
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
  </svg>
---

## Problem statement

The 2.0 work reorients the app from a single-palette contrast checker into a colour-management service, and that reorientation is described in a stack of design documents: a domain model, a glossary, six ADRs. Those documents introduce precise words — a **Project** owns **Palettes**, a **Palette** owns **Colours** and declares **Modes**, a **Colour** carries functional **Roles** and one value per Mode. The danger, when a domain is only written in prose, is *drift*: the code grows its own slightly-different vocabulary. One file calls it a "theme," another a "variant," a third a "mode"; a colour's roles are a loose array of arbitrary strings that nobody validates; the classification rule an ADR carefully decided ("text and icon are foreground, surface is background") lives only in someone's memory. Six months later nobody can tell whether the code still means what the docs say.

The fix that domain-driven design proposes is a **ubiquitous language**: one set of terms shared by the design docs and the code, with no translation layer between them. The challenge is making that more than an aspiration — making the shared language something a machine checks, so it *cannot* silently drift.

## Implementation in this codebase

The pattern lives in a dedicated **domain layer** (`src/domain/`) that holds no logic and no framework code — only the vocabulary, expressed as types. It sits below everything: stores, adapters, and components all import *from* it, and it imports from nothing but itself.

**The aggregate as nested interfaces.** `types.ts` writes the ownership hierarchy the domain model describes directly as TypeScript. The nesting *is* the ownership rule — a Colour lives inside a Palette lives inside a Project — and every field carries the design doc's intent as a doc comment:

```ts src/domain/types.ts
export interface Colour {
  id: string;                          // stable — survives renames/re-tagging
  name: string;                        // "Midnight Navy"
  roles: string[];                     // role ids from the controlled vocabulary
  values: Record<string, HexColour>;   // one value per Mode, keyed by Mode id
}

export interface Palette {
  id: string;
  name: string;
  modes: Mode[];                       // theme variants this Palette declares
  colours: Colour[];
}

export interface Project { id: string; name: string; palettes: Palette[]; }
```

**Closed sets as const-array unions.** Where the domain has a fixed set of allowed values, one declaration produces *both* the runtime list (for validation) and the compile-time type (for safety). This is the idiom that keeps the two from disagreeing:

```ts src/config/contrastSettings.ts
export const CONTRAST_ALGORITHMS = ["wcag", "apca"] as const;
export type ContrastAlgorithm = (typeof CONTRAST_ALGORITHMS)[number];   // "wcag" | "apca"
```

The array is what the URL codec loops over to reject bad input; the type is what stops any other file assigning `"hcag"` to an algorithm field. Add `"apca3"` to the array and the union widens automatically — you cannot update one without the other.

:::callout
**One declaration, two guarantees.** `as const` freezes the array into literal values; `(typeof X)[number]` reads their union back out as a type. Runtime validation and compile-time checking are then provably the same set — there is no second list to keep in sync.
:::

**Controlled vocabulary with a safe lookup.** Roles are not free-form strings — they come from a fixed list, and each one carries the foreground/background classification that **ADR 0006** decided. The vocabulary and its rules live in one file, with the ADR cited so the code and the decision stay tied together:

```ts src/domain/roles.ts
// Classifications follow ADR 0006: text, icon, border, accent, brand → foreground;
// background, surface → background. ("both" is reserved by the type for future roles.)
export const ROLE_VOCABULARY: readonly Role[] = [
  { id: "background", label: "Background", classification: "background" },
  { id: "text",       label: "Text",       classification: "foreground" },
  // ...
];

const ROLE_BY_ID = new Map(ROLE_VOCABULARY.map((r) => [r.id, r]));

export function getRole(id: string): Role | null {
  return ROLE_BY_ID.get(id) ?? null;    // repo convention: lookups return null, not undefined
}
```

**A repository over the aggregate.** Persisting the domain is expressed against these types too: `PersistencePort` reads and writes whole `Project` objects, so the storage boundary speaks the same language as everything else (it is injected exactly like the URL and Storage ports — see [Hexagonal Architecture](hexagonal-architecture.md)).

```ts src/domain/persistencePort.ts
export interface PersistencePort {
  getProject(id: string): Promise<Project | null>;
  saveProject(project: Project): Promise<Project>;
  // ...
}
```

## Advantages

- **The docs and the code share symbols.** "Palette owns Colours" in the domain model is `Palette { colours: Colour[] }` in the type. Reading one teaches you the other; there is no glossary-to-code translation to get wrong.
- **Decisions become compiler-enforced.** ADR 0006's classification rule is data the type-checker guards. Misclassifying a role, or inventing a fourth classification, fails to compile.
- **Closed sets can't drift.** The const-union idiom makes the validation list and the type provably identical — impossible to widen one and forget the other.
- **One place to evolve the language.** A new domain concept, or a renamed one, changes here and propagates outward through type errors that show every call site that must follow.

## Disadvantages

- **Types describe shape, not all invariants.** `roles: string[]` types the field but does not itself guarantee each string is a real role id — that still needs a runtime check against `ROLE_IDS`. The type narrows the mistakes, it does not eliminate them.
- **Discipline to keep ADRs and code aligned.** The comment citing ADR 0006 is a convention; nothing forces someone changing the vocabulary to revisit the ADR. The link holds by review, not by tooling.
- **Ahead of its consumers.** These types were written before the store and UI that will use them, so today they are partly a promise. Their real payoff arrives as the 2.0 slices are built against them.

## Key files

- `src/domain/types.ts` — the aggregate: `Project` → `Palette` → `Colour`, plus `Mode`, `Role`, `RoleClassification`, `HexColour`
- `src/domain/roles.ts` — the controlled role vocabulary, its classifications (per ADR 0006), and the null-returning `getRole` lookup
- `src/config/contrastSettings.ts` — the const-array-union idiom for the contrast settings (`CONTRAST_ALGORITHMS`, `CVD_TYPES`, `COMPLIANCE_LEVELS`)
- `src/domain/persistencePort.ts` — the repository interface expressed over the `Project` aggregate
- `docs/2.0-design/` — the domain model, glossary, and ADRs these types make executable
