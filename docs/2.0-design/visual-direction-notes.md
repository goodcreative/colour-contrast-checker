# 2.0 Visual Direction — Working Notes

Scratch notes for issue #20 (Explore visual direction & establish design foundation).
Captures the starting-point analysis before the design track proper. Not a decision record —
ADRs still own decisions.

## Sources

- **Issue #20** — exploratory, owner-gated. Deliverables: diverge on visual language → pick a
  direction; refreshed **design tokens** (colour/type/space/elevation/radius); core
  **primitives** (button, field, swatch, panel, nav shell); **app-shell** that hosts the new IA
  (Projects / Palettes / Modes / roles / results / sharing). Hands off to a prototyping track.
- **Starting-point artifact** — `file:///Users/jamieboyd/Good/Projects/wattage/docs/performance/2026-06-29/html/wattage.html`
  (a performance-report HTML doc). Owner likes its colours, typography, and several components.
- **Figma** — `https://www.figma.com/design/z5PHVXIv0kJ5zlyn9bkla4/Colour-Contrast-2.0-UI-Design?node-id=2-2&m=dev`
  **Styleguide built (2026-07-08).** Node `2:2` "UI Elements" now holds a visual foundations
  styleguide harvested from the Wattage artifact: header + Colour (surfaces/ink, semantic
  pass/partial/fail triad w/ base·light·border·rail, severity, 7-hue category+tint) + Typography
  (scale specimen + typefaces) + Primitives (button, segmented control, meta-chip, badges,
  rail-track) + Shape & Space (radius, layout metrics, spacing). Frame is a vertical auto-layout,
  1440 wide, ~3200 tall. Font substitutions: `system-ui → Inter`, `SF Mono → Roboto Mono`.
  A **second frame `17:2`** "UI Elements — Current App Tokens" sits to the right — the same
  styleguide structure built from the app's live SCSS tokens (`src/assets/scss/tokens/`) + real
  components (pill button, switch ModeToggle, `.b_contrast` card; Inter + Fira Code), for
  side-by-side keep/ditch comparison.
  A **third frame `25:2`** "UI Elements — 2.0 Hybrid" (right of `17:2`, built 2026-07-09) is the
  **locked direction** resolving that comparison. Cloned from Wattage `2:2`, then overridden per a
  section-by-section keep/ditch walkthrough:
  - **Kept from Wattage:** warm-neutral surfaces/ink (`#fafaf9`/`#ffffff`/`#efeeea`/`#1a1a18`/
    `#5a5a55`/`#e5e4e0`); type scale specimen; Roboto Mono; 8px + full-pill radius; flat elevation
    (borders over shadows, no shadow system); 268/960 layout; 8px spacing; button (8px rect);
    segmented control; meta-chip; rail-track; 7-hue category palette; severity scale.
  - **Grafted from the app:** accent `#00A3FF`; semantic triad **pass `#3D930F` / partial
    `#3392E9` / fail `#EE495B`** with light/border/rail tints re-derived (mix-with-white 0.12 /
    0.36 / 0.42). Badges + rail-track (bands + partial marker/value) recoloured to follow the blue
    partial token. Semantic swatch tokens named uniformly `pass`/`partial`/`fail` (not
    Wattage's `good`/`ni`/`poor`).
  - **Role tags (adapted):** Wattage's 7-hue *category* palette (web-resource types) repurposed as
    the ADR 0006 **role** vocabulary — `background`/`surface` (bg) · `text`/`border`/`accent`/
    `brand` (fg/both) — hues kept as chip identities; the 7th (slate) held as a **reserve** slot
    for a future role (likely `icon`). fg/bg classification drives the default result pairing.
  - **Known tension:** accent `#00A3FF` and partial `#3392E9` are near-neighbour blues; the blue
    partial also weakens the rail-track's traffic-light read — owner chose token-consistency
    (green/blue/red rail) over the severity gradient. Revisit if it reads muddy in context.
  **Not yet promoted to Figma variables/tokens** — swatches are static; binding the palette to a
  variable collection (Light/Dark modes) is the next design step.
  Figma is a **scratchpad we build into**, not a source of truth we sync from — the Wattage
  artifact remains the reference foundation.
  Access note: write path is the **remote** `plugin:figma:figma` server (`mcp.figma.com`, tool
  `use_figma`); the local Dev Mode server (`127.0.0.1:3845`) is read-only. Both are named `figma`
  in the picker — enable the `plugin:`-namespaced one to write.

## Wattage artifact — foundation to harvest

### Palette (warm-neutral, not cool grey — the standout)
- Paper `#fafaf9` bg · `#ffffff` surface · `#efeeea` warm sidebar · `#1a1a18` warm near-black ink
- Muted text `#5a5a55` · border `#e5e4e0`
- Single accent `#3a5cff` (indigo-blue)
- **Semantic triad** good/needs-improvement/poor = green·amber·red, each with `-light` tint +
  `-border` → maps directly onto CCC **pass / partial / fail**
  - good `#1f7a3a` / ni `#b45309` / poor `#dc2626` (+ light + border variants)
  - severity accents also: high `#dc2626` · medium `#d97706` · low `#2563eb`
- **7-hue category palette**, each hue paired with a wash tint (base = identity, tint = chip
  wash) → natural fit for **role tags**:
  Images `#3a5cff` · Font `#7c3aed` · Document `#0891b2` · Stylesheet `#db2777` ·
  Script `#ea580c` · Media `#0d9488` · Other `#64748b`

### Typography
- Sans: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- Mono: `'SF Mono', 'Fira Code', Consolas, monospace` — used for values/codes (great for hex)
- Uppercase letter-spaced **kickers/labels** (11–13px, weight 700, tracking ~0.05–0.08em)
- Editorial, data-dense; tabular-nums on all numeric values

### Space / shape
- `--radius: 8px`; chips/pills use `9999px`; sidebar 268px; content max 960px

### Components that transfer ~1:1 to 2.0
| Wattage component | 2.0 use |
|---|---|
| Fixed left sidebar + centered content + mobile drawer | **App-shell** for Projects → Palettes nav |
| Segmented control (`.seg` / `.seg-btn`) | **Mode** switch (Light/Dark), WCAG↔APCA, AA↔AAA |
| Folder tabs (`.tabrow` / `.atab`) | per-Mode / per-view tabs |
| Scope toggle (All / Fewer) | the **"show all combinations"** escape hatch |
| **Rail track** — good/ni/poor bands + marker dot | contrast **result viz**: ratio vs AA/AAA thresholds (near purpose-built) |
| Split pills (coloured seg + neutral seg) | colour metadata / **role tags** |
| `cat-icon` / `heading-icon` chips | role & section iconography |
| Collapsible `details` rows (`.res`) | **Colour list** rows within a Palette |
| Coloured `finding-id` / badge | pass / fail badges |
| `meta-chip` (key/value) | colour name · format · mode metadata |

## Mapping to 2.0 IA (from domain-model.md)

`Project → Palette → Colour`; Colour carries name + roles + value-per-**Mode**. Roles carry
fg/bg/both classification → drives prioritised results + APCA polarity (ADR 0006).

- **Sidebar** = Project / Palette navigation
- **Content** = active Palette: Mode segmented control at top → colour list → prioritised results
- **Rail-track** component ≈ purpose-built for plotting a contrast ratio on AA/AAA threshold bands
- On-theme synergy: a contrast tool styled in a warm-neutral system that itself passes cleanly

## Naming collision to keep in view
Domain **Mode** (theme variant, Light/Dark, mirrors Figma collection modes) overloads 1.0's
`config/modes.js` (`CONTRAST_MODES` wcag/apca, `CVD_MODES`, `COMPLIANCE_MODES` AA/AAA). TBD —
see domain-model.md. Affects how the segmented controls get labelled in the shell.

## Open questions for the owner
- Deliverable shape: a **design-direction doc** (tokens + IA + primitive inventory) for sign-off
  first, vs. a **living styleguide/prototype** reworked on the Wattage foundation to iterate on.
  (Existing `docs/styleguide/index.html` is a candidate scaffold to rework.)
- Is Figma the **source of truth** we sync to, or a **scratchpad** we harvest from?

## Next action
Restart Claude Code → read Figma `node-id=2-2` (frames + variables) via local Dev Mode server →
reconcile Figma layout ideas with the Wattage foundation → propose token set + primitive plan.
