# Docs

- [Hexagonal Architecture](hexagonal-architecture.md) — how the store is isolated from browser globals via port/adapter interfaces, enabling clean testing and replaceability
- [Two-Stage Computed Pipeline](two-stage-computed-pipeline.md) — why contrast scoring and compliance bucketing are split into two separate `computed()` layers to avoid redundant O(N²) work on AA/AAA toggles
- [Thin-Wrapper Component](thin-wrapper-component.md) — how `ModeToggle` owns all toggle UI while `ComplianceModeToggle` and `ContrastModeToggle` are minimal store-binding wrappers
- [URL Codec](url-codec.md) — pure encode/decode module that centralises all URL serialisation and validates incoming params before they reach the store
