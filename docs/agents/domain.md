# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the
codebase. **Layout: single-context.**

## Before exploring, read these

- **`CONTEXT.md`** at the repo root (if present).
- **`docs/adr/`** — root architectural decisions (if present).
- **`docs/2.0-design/adr/`** — the 2.0 reorientation's ADRs currently live here, feature-scoped,
  alongside `docs/2.0-design/README.md` (MVP scope) and `docs/2.0-design/domain-model.md`
  (glossary / ubiquitous language). Read these when working on 2.0.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest
creating them upfront. `/domain-modeling` (reached via `/grill-with-docs` and
`/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo:

```
/
├── CONTEXT.md                         ← lazily created by /domain-modeling
├── docs/adr/                          ← root/system-wide decisions (as they arise)
├── docs/2.0-design/                   ← 2.0 design capture (current work)
│   ├── README.md                      ← MVP scope + decisions
│   ├── domain-model.md                ← glossary / ubiquitous language
│   └── adr/                           ← 2.0 ADRs (0001–0006)
└── src/
```

## Use the glossary's vocabulary

When output names a domain concept (issue title, refactor proposal, hypothesis, test name), use
the term as defined in the glossary (`docs/2.0-design/domain-model.md` for 2.0 work, or
`CONTEXT.md`). Don't drift to synonyms the glossary explicitly avoids (e.g. the Mode naming
collision flagged in `domain-model.md`).

If a concept isn't in the glossary yet, that's a signal — either you're inventing language the
project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0004 (first-class modes) — but worth reopening because…_
