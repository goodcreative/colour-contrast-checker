# 0003 — Colours owned by Palette, with stable IDs (defer aliasing)

Status: accepted

## Context
Two models for how Colours relate to Palettes: **owned** (a Colour lives in exactly one
Palette) vs **referenced/aliased** (Colours are first-class, Palettes reference them — the
design-token primitive→semantic pattern). Aliasing is powerful but the single biggest
complexity multiplier (dedup, dangling references, sync) and only pays off once seriously in
semantic-token territory, which is not yet committed.

## Decision
A Colour is **owned by exactly one Palette** (composition). Every Colour gets a **stable
ID** so a future aliasing/semantic-token layer can reference colours across palettes without
a migration. Aliasing is deferred, not precluded.

## Consequences
- Simple schema and Figma sync for the MVP; matches how 1.0 and most users think.
- Stable IDs keep the aliasing door open — a reference layer can later sit on top of owned
  primitives.
- Duplicating a colour into two palettes creates two independent copies (acceptable for MVP).
