# Colour Contrast Checker - Code Styleguide

This document serves as the reference for development standards and best practices for the Colour Contrast Checker project.

## 1. Technology Stack

-   **Framework**: Vue 3 (Composition API)
-   **Build Tool**: Vite
-   **State Management**: Pinia
-   **Styling**: SCSS (Sass)
-   **Testing**: Vitest
-   **Linting/Formatting**: ESLint, Prettier

## 2. File Structure & Naming

### Directories
Follow the structure defined in `overview.md`.
-   `src/components/`: Vue components.
-   `src/composables/`: Reusable logic (start filenames with `use`, e.g., `useColor.js`).
-   `src/stores/`: Pinia stores.

### Naming Conventions
-   **Vue Components**: Use **PascalCase** for filenames and component names (e.g., `ColourSwatch.vue`, `SwatchList.vue`).
-   **JS/TS Files**: Use **camelCase** (e.g., `colourStore.js`, `main.js`).
-   **Variables/Functions**: Use **camelCase** (e.g., `const currentPalette`, `function calculateContrast()`).
-   **SCSS Variables**: Use **$clrPascalCase** for colors as seen in `_global-colours.scss` (e.g., `$clrDarkGrey`, `$clrPrimaryAccent`).

## 3. Vue Components

### Syntax
-   Use the **Composition API** with `<script setup>`.
-   Keep components small and focused (Single Responsibility Principle).

### Component Structure
Order the blocks as follows:
1.  `<template>`
2.  `<script setup>`
3.  `<style scoped lang="scss">`

#### Example
```vue
<template>
  <div class="swatch" :class="{ active: isActive }" @click="toggleActive">
    {{ color }}
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Props
const props = defineProps({
  color: {
    type: String,
    required: true
  }
});

// State
const isActive = ref(false);

// Logic
const toggleActive = () => {
  isActive.value = !isActive.value;
};
</script>

<style scoped lang="scss">
.swatch {
  /* styles */
}
</style>
```

## 4. CSS & SCSS

### Global Variables
-   Do not hardcode hex values. Use the variables defined in `src/assets/scss/base/global/_global-colours.scss`.
-   Example: `color: $clrAbBlack;` instead of `color: #000000;`.

### Scoping
-   Always use `scoped` styles in Vue components unless global styling is explicitly required.
-   Use SCSS nesting to reflect the HTML structure but avoid excessive nesting depth (max 3 levels recommended).

## 5. State Management (Pinia)

-   Stores should be defined in `src/stores/`.
-   Use `defineStore` with a unique name (e.g., `colourStore`).
-   Keep state flat where possible.
-   Use getters for derived state (e.g., calculating contrast ratios based on current colors).

## 6. Code Quality

-   **Linting**: Ensure code passes ESLint rules (`npm run lint`).
-   **Formatting**: Use Prettier for consistent formatting.
-   **Testing**: Write unit tests for logic-heavy components and composables using **Vitest**.
