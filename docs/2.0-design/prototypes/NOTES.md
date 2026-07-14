# PROTOTYPE — 2.0 Role Canvas

**Throwaway.** Delete or fold the winner into real code once a direction is chosen.

## Question

The 2.0 canvas is the primary screen (replacing 1.0's N×N pairs list). Colours are individual,
grouped by **role**. But contrast is a **relationship** between two colours — a role-organized
layout makes the colours legible while hiding the relationships. **How should the canvas
re-surface the fg×bg relationships without the matrix's noise?** (see ../conceptual-thoughts.md)

## Run

**Just open `canvas.html` in a browser** — double-click it, or drag it onto a browser window. No
server, no build. `?variant=A|B|C` selects the starting variant; ← / → (or the floating bar) switch.

Everything is in the one file: the sample Light-mode palette and the **hardcoded WCAG-AA ratios**
(precomputed from the engine's formula — all 45 pairs). Nothing runs live, so it can't break the
way the Vite version did. APCA is out of scope for this layout prototype.

## Variants (structurally different by design)

- **A — Role Lanes.** Roles as lanes; each foreground swatch carries inline pass/partial/fail dots
  vs every background. Select two → glance-line connector + floating ratio. *Everything visible at
  once; relationships summarised per-swatch.*
- **B — Background Stages.** Background colours become painted panels; foregrounds render as real
  text/UI on them. *Canvas = live preview; you read contrast in situ (best for APCA/realism).*
- **C — Relationship Graph.** Bipartite backgrounds↔foregrounds; edges coloured by result, fails
  faded. *Relationships are first-class; hover to isolate, click two to inspect.*

## What to feel for

- Does spatial role-grouping actually beat the list, or fight you?
- Which makes the **default** fg×bg story readable at a glance vs on demand?
- Which best absorbs the **creation/role-assignment** flow (drag into zones) and the **realistic
  preview** later — i.e. which is the best host for the downstream ideas?
- Likely outcome (per the skill): "lane summary from A + in-situ preview from B" or similar hybrid.

## Verdict

**No variant wins outright** (owner review, 2026-07-14). None was compelling enough to build on.
Takeaways carried forward:
- **Keep a persistent display of the colour swatches** — a swatch-forward layout is wanted.
  **A (Role Lanes)** got closest to this.
- **A's pair-selection is a poor experience** — clicking two swatches to inspect a relationship is
  clumsy; don't carry that interaction forward. The fg×bg relationship needs a better mechanism.

Owner moving to **manual design** for now rather than iterating these prototypes. Prototypes kept
for reference, not superseded by a chosen winner.
