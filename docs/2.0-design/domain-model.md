# Colour Contrast Checker 2.0 — Domain Model & Glossary

Ubiquitous language for 2.0. Terms here are the intended TypeScript type names too.

## Hierarchy (decided)

```
Project → Palette → Colour
```

## Glossary

### Project
Top-level grouping. Holds one or more **Palettes**. Neutral term — often a client brand,
but not always (e.g. a theme exploration, an internal system). Likely the anchor for
sharing (token-link) and Figma-file mapping. _One Project ↔ one Figma file — tentative._

### Palette
An ordered collection of **Colours** with its own metadata (name, description, …).
Evolution of today's `{ id, title, colours[] }`, but `colours` become rich objects, not
hex strings.

### Mode
A named theme variant **owned by a Palette** (decided). **Arbitrary named set** (decided),
mirroring Figma variable-collection modes exactly — enabling near-copy two-way sync via the
isomorphism below. Each Colour holds one value per Mode. **First-class in the MVP.**
- Default optional set for new palettes: **Light + Dark** (a Palette may also be single/
  "Default" mode so simple cases stay simple).
- **Preset mode-sets (parked idea):** offer a short list the user can pick or override.
  Seeds: Light/Dark · **Standard/High-contrast** (on-theme for a contrast tool) ·
  multi-brand (Brand A/B) · platform (Web/iOS/Android) · density. Exact list TBD.

**Model ↔ Figma isomorphism (why placement is on the Palette):**
```
Project  →  Palette              →  Colour    (value per Mode)
File     →  Variable Collection  →  Variable  (value per Mode)
```
Modes belong to a Figma *collection*, so in our model they belong to the *Palette*.

> ⚠️ **Naming collision to resolve.** 1.0 already uses "modes" in `config/modes.js` for
> `CONTRAST_MODES` (wcag/apca), `CVD_MODES`, `COMPLIANCE_MODES` (AA/AAA). Our new theme-
> variant **Mode** (Light/Dark) overloads the word. Options: keep **Mode** for theme
> variants (matches Figma) and rename the others to *settings*/*algorithms*; or name theme
> variants **Theme**. TBD.

### Colour
The atomic unit. In 1.0 this is just a hex string. In 2.0 it carries context:
- `id` — stable, for future aliasing (decided)
- `value` — **one value per Mode** (see Mode). Each value canonical **sRGB, stored as a
  hex string**, but **format-flexible**: all I/O normalised through **colorjs.io** so it can
  accept/emit hex/rgb/hsl/oklch without a schema change. Wide-gamut/P3 deferred. (decided)
- `name` — **free-text descriptive label** ("Midnight Navy"), as in brand guidelines (decided)
- `roles` — **multi-select from a small controlled vocabulary** (decided). Functional, not
  descriptive: e.g. `background`, `text`, `border`, `accent`, `brand`, `surface`. Exact
  list TBD. Each role also carries a **foreground / background / both** classification
  (decided) — this drives prioritised results AND supplies APCA polarity. See ADR 0006.
- _possibly_ notes, modes, token binding — TBD

**Name vs roles:** name = *what the colour is* (descriptive); roles = *what it's for*
(functional). Both come straight from how brand guidelines label colour.

## Ownership (decided)
- A **Colour is owned by exactly one Palette** (composition, not aliasing).
- Every Colour has a **stable ID**, so a future semantic-token / aliasing layer can
  reference colours across palettes without a migration. Aliasing deferred, not precluded.

## Open modelling questions
- **Colour value representation:** hex only, or space-aware (needed for APCA/CVD/tokens)?
- **Role/use:** free-text label, controlled vocabulary, or full semantic-token roles?
- **Modes:** does a Colour/Palette carry light/dark (or more) modes?

## Superseded (1.0)
- `Palette = { id: number, title: string, colours: string[] }` — flat, hex-only, no
  Project tier, no per-colour metadata.
