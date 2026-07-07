# 0002 — Three-tier hierarchy: Project → Palette → Colour

Status: accepted

## Context
1.0's model is flat and hex-only: `Palette = { id, title, colours: string[] }`. No grouping
above palette, no per-colour context. The user works at consultancy scale (multiple clients/
brands, but also non-brand uses like theme explorations). Sharing and Figma sync both need a
natural anchor unit.

## Decision
Three tiers: **Project → Palette → Colour**. The top tier is named **Project** — a neutral
term, not always a client brand.

## Consequences
- Gives sharing a unit (token-link can target a Project or a Palette) and Figma a mapping
  anchor (Project ↔ Figma file).
- Adding the parent tier now avoids a painful data migration later.
- Slightly more ceremony than flat Palette→Colour for single-brand users; judged worth it.
