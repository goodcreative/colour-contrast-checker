# 0004 — First-class arbitrary modes, owned by the Palette

Status: accepted

## Context
Modes (Light/Dark and beyond) are Figma variables' defining feature: a variable collection
has modes, and each variable holds a value per mode. Modes also carry standalone value
(theming) beyond Figma. They are, however, a large complexity multiplier — every Colour
becomes a value-per-mode, contrast must be computed per mode, and the UI switches modes.

## Decision
Modes are **first-class in the MVP**, an **arbitrary named set** (not a fixed Light/Dark
pair), **owned by the Palette**. Each Colour holds one value per Mode.
- New palettes default to an optional **Light + Dark** set; a Palette may also be single/
  "Default" mode so simple cases stay simple.
- **Preset mode-sets** (Light/Dark, Standard/High-contrast, multi-brand, platform, density)
  are a parked idea — pick-or-define — exact list TBD.

Placement on the Palette follows the model↔Figma isomorphism:
```
Project → Palette             → Colour   (value per Mode)
File    → Variable Collection → Variable (value per Mode)
```
Modes belong to a Figma *collection*, so here they belong to the *Palette*.

## Consequences
- Bigger MVP (roughly doubles model/UI surface) accepted in exchange for real theming and
  near-copy two-way Figma variable sync.
- Arbitrary naming matches Figma exactly and avoids a fixed-pair dead end.
- User carries a little mode-management burden; mitigated by sensible defaults.
