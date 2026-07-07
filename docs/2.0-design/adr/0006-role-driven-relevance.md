# 0006 — Roles carry fg/bg classification; drive prioritised results

Status: accepted

## Context
1.0's core UX complaint: it shows every N×N contrast pair, most meaningless, so results are
"comprehensive but overwhelming." 2.0 gives colours roles; roles can fix this if the app
knows which colours are *content* (sit on something) vs *surfaces* (content sits on them).
Separately, APCA is polarity-sensitive (dark-on-light ≠ light-on-dark) and needs a direction.

## Decision
Every role in the controlled vocabulary carries a **foreground / background / both**
classification (e.g. `text`,`icon`,`border`,`accent`,`brand` → fg; `background`,`surface` →
bg; some → both). The default results view shows only **foreground-role × background-role**
pairs. Escape hatches retained: an explicit **"show all combinations"** toggle and 1.0's
**focus mode** for arbitrary pair inspection.

## Consequences
- Overwhelm reduced by default; results show what a designer actually ships.
- fg/bg classification doubles as **APCA polarity** — roles make results both relevant and
  directionally correct, for free.
- Role vocabulary is not a flat tag list; each entry also has a fg/bg/both attribute.
- Users retain full manual control via focus mode + show-all; defaults never lock them out.
