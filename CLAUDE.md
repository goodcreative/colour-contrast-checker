# Colour Contrast Checker

Web tool for testing colour contrast ratios against WCAG / APCA accessibility standards.
Vue 3 + Pinia + SCSS SPA. 2.0 reorients it into a colour-management service on the existing
engine — see `docs/2.0-design/`.

## Conventions

- Update `CHANGELOG.md` at the project root whenever changes are made.

## Agent skills

### Issue tracker

Issues and PRDs live as GitHub issues in `goodcreative/colour-contrast-checker` via the `gh`
CLI; external PRs are **not** a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical default label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`,
`ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context. Glossary + 2.0 ADRs under `docs/2.0-design/`; root `docs/adr/` for
system-wide decisions as they arise. See `docs/agents/domain.md`.
