---
name: front-end-standards
description: Apply when writing or editing Vue components, SCSS/CSS, or JavaScript in this project to ensure adherence to the project's established coding conventions.
version: 1.0.0
---

# Colour Contrast Checker — Front-End Coding Standards

## Vue 3 Component Structure

### File Order
Always use this ordering within `.vue` files:
1. `<template>` first
2. `<script setup>` second
3. `<style lang="scss" scoped>` last

### Template Patterns

**Class binding** — use dynamic object syntax with template literals for modifier classes:
```vue
:class="{
  [`b_block--modifier`]: condition,
}"
```

**Attribute shorthand** — always use `:` not `v-bind:`, `@` not `v-on:`

**Events** — chain modifiers where needed: `@click.prevent`, `@submit.prevent`

**Named slots** — use `#` shorthand: `<template #slotName="{ prop }">`

**Dynamic components** — `<component :is="ComponentVar">`

### `<script setup>` Patterns

**Import order:**
1. Vue core (`reactive`, `computed`, `ref`, `onMounted`, etc.)
2. Child components (PascalCase imports)
3. Pinia store (`useColourStore`)
4. `storeToRefs` from `pinia`
5. Composables from `@/composables/`

**Store access pattern:**
```javascript
const colourStore = useColourStore();
const { someRef } = storeToRefs(colourStore); // storeToRefs only for reactive refs
```

**Props — always use object long-form with `type` and `required`:**
```javascript
const props = defineProps({
  colourHex: {
    type: String,
    required: true,
  },
  isDisabled: {
    type: Boolean,
    required: false,
    default: false,
  },
});
```

**State:**
- `reactive()` for related state grouped as an object
- `ref()` for standalone primitives (common in stores)

**Computed:** arrow functions only — `const foo = computed(() => ...)`

**Async functions:** async arrow functions with try/catch

### Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Component files | PascalCase | `ColourSwatch.vue` |
| Props | camelCase | `colourHex`, `buttonMode` |
| Emits | camelCase, `update:` prefix for v-model | `update:modelValue` |
| JS variables & functions | camelCase | `copyToClipboard`, `isFocus` |
| Composables | camelCase verb phrase | `calculateColourContrast.js` |

---

## SCSS / CSS Standards

### BEM Class Naming

All component classes use the `b_` block prefix:

| Level | Pattern | Example |
|-------|---------|---------|
| Block | `b_` prefix | `.b_swatch`, `.b_action` |
| Element | `__` separator | `.b_swatch__colour`, `.b_action__button` |
| Modifier | `--` separator | `.b_action--icon`, `.b_action--disabled` |

Use `$self: &` for cross-modifier element targeting in SCSS:
```scss
.b_block {
  $self: &;
  &--modifier {
    #{$self}__element { /* scoped to modifier */ }
  }
}
```

### Design Tokens — Never Hardcode Values

All colours, spacing, and typography must use CSS custom properties from `src/assets/scss/tokens/`.

**Colours** (`--clr-[name]-[shade]`):
- Greyscale: `--clr-grey-000` (black) → `--clr-grey-900` (near-white)
- Blues: `--clr-blue-100`, `--clr-blue-300`
- Reds: `--clr-red-400`
- Greens: `--clr-green-400`
- Accent alias: `--clr-accent` (= `--clr-blue-300`)

**Spacing / Size** (`--size-[scale]`): `xs`, `s`, `m`, `l`, `xl`

**Typography**: `--font-size-[scale]`, `--heading-[scale]`, `--body-[scale]`, `--text-code-[scale]`

**Borders**: `--border-rad-[size]` (e.g. `--border-rad-large`)

**Shadows**: `--shadow-[type]`

**Transitions**: `--trans-short`, `--trans-long`

**Component-scoped tokens**: Define per-component custom properties at the block root (e.g. `--swatch-size`, `--formAction-height`) to avoid hardcoded local values.

### SCSS Utility Functions
```scss
rem($px)            // converts px → rem
em($px)             // converts px → em
clamped($min, $max) // fluid responsive sizing
```

### Utility Classes (`u_` prefix)
Prefer these over one-off utility styles:
- `.u_flow` — vertical spacing between siblings
- `.u_pseudo` — pseudo-element base setup
- `.u_prose` — rich text / typography
- `.u_wrapper` — max-width container + centering
- `.u_grid`, `.u_row`, `.u_column` — layout primitives

### Scoped Styles
Every component style block **must** be scoped:
```vue
<style lang="scss" scoped>
```

---

## Quick-Reference Rules

1. **File order:** `<template>` → `<script setup>` → `<style lang="scss" scoped>`
2. **BEM strictly:** `.b_block__element--modifier` — no plain class names on component elements
3. **Tokens only:** zero hardcoded colours, spacing, or typography values
4. **Composition API only:** `<script setup>`, no Options API, no TypeScript
5. **All styles scoped:** `lang="scss" scoped` on every `<style>` block
6. **Path alias:** use `@/` for all `src/` imports
