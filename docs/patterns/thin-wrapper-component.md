---
title: Thin-Wrapper Component
eyebrow: Pattern
lede: One self-contained base component owns **all** of a widget's markup, styling, and logic; per-use-site wrappers add nothing but the store binding and a few hard-coded options.
chips:
  - "Layer · components"
  - "Base · `ModeToggle`"
  - "Wrappers · ~10 lines"
category: client
tags:
  - components
  - composition
  - reuse
summary: ModeToggle owns every pixel of the toggle UI; ComplianceModeToggle and ContrastModeToggle are minimal declarative wrappers that bind it to the store.
icon: |
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2.5" />
    <rect x="8" y="8" width="8" height="8" rx="1.5" />
  </svg>
---

## Problem statement

A UI widget — here, a binary toggle switch — is needed in two places with almost identical appearance but different labels, different option values, and different store bindings. The obvious approaches both have costs. Duplicating the component means two copies of the same template and CSS to keep in sync. Cramming both use cases into one "smart" component means a tangle of conditional props and internal store imports that make the component hard to reuse or test in isolation. The goal is a single source of rendering truth that stays ignorant of the rest of the app, paired with the smallest possible wiring layer at each use site.

## Implementation in this codebase

The pattern splits responsibility across two tiers in the **component layer**.

**The base component** (`ModeToggle.vue`) owns all template markup, all SCSS, and all toggle logic. It accepts a generic `options` array and a `modelValue` string, emits `update:modelValue` (Vue's v-model contract), and has no knowledge of the store. It is fully self-contained and could drop into a different project unchanged.

```vue src/components/ModeToggle.vue
<script setup>
const props = defineProps({
  title:      { type: String, required: true },
  options:    { type: Array,  required: true },   // [{ label, value }, { label, value }]
  modelValue: { type: String, required: true },
  justify:    { type: String, default: "flex-start" },
});
const emit = defineEmits(["update:modelValue"]);

const isRight = computed(() => props.modelValue === props.options[1].value);
const toggle  = () => emit("update:modelValue",
  props.modelValue === props.options[0].value
    ? props.options[1].value
    : props.options[0].value
);
</script>
```

**The thin wrappers** (`ComplianceModeToggle.vue`, `ContrastModeToggle.vue`) are ~10-line files. Each one imports the store, imports `ModeToggle`, hard-codes the two option objects, and forwards store state and the store action through `modelValue` / `@update:modelValue`. No logic, no CSS.

The contrast between a wrapper that stays thin and one that quietly grows logic is the whole discipline:

:::compare
@bad Drift — logic and styling leak back into the wrapper
```vue ComplianceModeToggle.vue — now a second source of truth
<template>
  <div class="toggle" :class="{ active: isAAA }" @click="flip">
    <span>{{ store.complianceMode }}</span>
  </div>
</template>
<script setup>
const isAAA = computed(() => store.complianceMode === 'AAA');
function flip() { store.setComplianceMode(isAAA.value ? 'AA' : 'AAA'); }
</script>
<style scoped>.toggle { /* duplicated styling */ }</style>
```
@good Thin — declarative configuration of the base
```vue src/components/ComplianceModeToggle.vue
<template>
  <ModeToggle
    :title="label"
    :options="[{ label: 'AA', value: 'AA' }, { label: 'AAA', value: 'AAA' }]"
    :modelValue="colourStore.complianceMode"
    justify="flex-end"
    @update:modelValue="colourStore.setComplianceMode($event)"
  />
</template>
```
:::

Note what is *not* in the good version: no `<script setup>` logic beyond importing the store, no SCSS, no emit definitions. The wrapper is declarative configuration, not a component in any meaningful sense.

:::callout
**The litmus test:** if a wrapper imports the store and contains no template logic, no `computed`, and no `<style>`, it is thin. The moment it grows any of those, it has become a second source of rendering truth — exactly what the base component exists to prevent.
:::

**When not to use the base:** `CVDModeSelector.vue` is a four-option pill segmented control — a different widget entirely. It does not wrap `ModeToggle`, and shouldn't. The pattern applies only when the UI shape genuinely matches the base component.

## Advantages

- **Single source of truth for appearance** — all toggle styling lives in `ModeToggle.vue`. A spacing or colour change applies everywhere automatically.
- **Base component is independently testable** — mount `ModeToggle` with any options array and assert toggle behaviour without involving the store.
- **Wrappers are trivially readable** — the entire contract between the store and the toggle is visible in ~5 lines of template. No hunting through conditional logic.
- **Adding a third toggle is cheap** — copy a wrapper file, change the option values and store binding, done.

## Disadvantages

- **One extra file per use case** — for very simple apps a wrapper file can feel like overhead. The payoff grows with the number of instances.
- **Props must stay stable** — if `ModeToggle` ever needs a new required prop, all wrapper files must be updated. With two wrappers this is trivial; with ten it becomes a refactor.
- **Pattern relies on convention** — nothing in Vue enforces that wrappers stay thin. A developer under time pressure might add logic directly to a wrapper, eroding the separation over time.

## Key files

- `src/components/ModeToggle.vue` — base component; all rendering and toggle logic live here
- `src/components/ComplianceModeToggle.vue` — thin wrapper for the AA/AAA compliance toggle
- `src/components/ContrastModeToggle.vue` — thin wrapper for the WCAG/APCA contrast-mode toggle
- `src/components/CVDModeSelector.vue` — four-option pill selector; intentionally does *not* use the base toggle
