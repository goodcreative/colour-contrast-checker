---
title: Architecture Patterns — Colour Contrast Checker
eyebrow: Colour Contrast Checker
heading: Architecture Patterns
lede: Seven recurring decisions that shape how this Vue 3 + Pinia contrast checker is organised — read these before adding a feature or tracing a bug.
chips:
  - "Vue 3 · Pinia · TS"
  - "7 patterns"
  - "Pure logic · injected I/O"
intro: |
  These docs capture the load-bearing structure of the codebase: where computation lives, how the store reaches the outside world, and how the UI stays consistent. They explain the *why* behind each decision, not just the shape of the code.
section_eyebrow: Index
section_heading: Patterns covered
footer_right: Index
---

# Software Patterns

- [Hexagonal Architecture](hexagonal-architecture.md) — how the store is isolated from browser globals via port/adapter interfaces, enabling clean testing and replaceability
- [Two-Stage Computed Pipeline](two-stage-computed-pipeline.md) — why contrast scoring and compliance bucketing are split into two separate `computed()` layers to avoid redundant O(N²) work on AA/AAA toggles
- [Thin-Wrapper Component](thin-wrapper-component.md) — how `ModeToggle` owns all toggle UI while `ComplianceModeToggle` and `ContrastModeToggle` are minimal store-binding wrappers
- [URL Codec](url-codec.md) — pure encode/decode module that centralises all URL serialisation and validates incoming params before they reach the store
- [Framework-Agnostic Logic Modules](framework-agnostic-logic-modules.md) — why all real computation lives in plain Vue-free functions, with the store as the only layer that wires them into reactivity
- [Incremental TypeScript Migration](incremental-typescript-migration.md) — how `allowJs` plus a Vite `.js`→`.ts` resolver let the engine port to TypeScript one file at a time without touching callers or tests
- [Domain Types as Ubiquitous Language](domain-types-ubiquitous-language.md) — how the 2.0 domain vocabulary (Project/Palette/Colour/Mode/Role) is written once as TypeScript types so the design docs and the code share the same compiler-checked terms
