# Colour Contrast Checker Overview

This document provides a high-level overview of the Colour Contrast Checker application codebase.

## Project Purpose

The "colour-contrast-checker" is a web-based tool designed to help designers and developers test colour palettes for accessibility. It calculates the contrast ratio between colours, determines WCAG (Web Content Accessibility Guidelines) compliance (AA and AAA levels), and allows users to build, save, and share colour palettes.

## Tech Stack

The project is a single-page application built with the following technologies:

-   **Framework:** [Vue 3](https://vuejs.org/)
-   **Build Tool:** [Vite](https://vitejs.dev/)
-   **State Management:** [Pinia](https://pinia.vuejs.org/)
-   **Styling:** [Sass (SCSS)](https://sass-lang.com/)
-   **Unit Testing:** [Vitest](https://vitest.dev/) with [jsdom](https://github.com/jsdom/jsdom)
-   **Linting:** [ESLint](https://eslint.org/)
-   **Code Formatting:** [Prettier](https://prettier.io/)

Key libraries for color calculations include:
- `colorjs.io`: A powerful color conversion and manipulation library.
- `apca-w3`: For calculating APCA (Accessible Perceptual Contrast Algorithm) contrast.
- `colorparsley`: A lightweight color parsing library.

## Project Structure

The project follows a standard Vue 3 application structure.

-   `public/`: Contains static assets that are copied directly to the `dist` directory.
-   `src/`: The main source code directory.
    -   `assets/`: Contains static assets like images and global stylesheets. The SCSS structure is modular and well-organized.
    -   `components/`: Contains all the Vue components. Components are granular and single-purpose, promoting reusability.
    -   `composables/`: Houses reusable composition functions, encapsulating specific logic (e.g., color calculations, URL parsing).
    -   `stores/`: Contains the Pinia store(s) for state management.
    -   `App.vue`: The root Vue component.
    -   `main.js`: The entry point of the application, where the Vue app is initialized and plugins are mounted.
-   `index.html`: The main HTML file, where the Vue application is mounted.
-   `package.json`: Defines project metadata, dependencies, and scripts.
-   `vite.config.js`: The configuration file for Vite.

## Architecture and Core Concepts

### State Management

The application's state is centrally managed by a Pinia store defined in `src/stores/colourStore.js`. This store is the single source of truth for:

-   The current color palette.
-   User-saved palettes (stored in `localStorage`).
-   The selected WCAG compliance mode (`AA` or `AAA`).
-   The "focus" color, used to show contrasts against a single color.
-   Computed properties that automatically calculate color-pair combinations and their contrast ratios.

### Component-Based Architecture

The UI is broken down into a hierarchy of Vue components. Key components include:

-   `App.vue`: The main application layout, orchestrating the major sections of the UI.
-   `ColourContrastWidget.vue`: A high-level component that likely composes other components to form the main widget.
-   `SwatchList.vue` and `ColourSwatch.vue`: For displaying the list of colors in the current palette.
-   `CombinationsList.vue`: Displays the calculated contrast ratios for pairs of colors.
-   `FormAddColour.vue`: A form for adding new colors to the palette.
-   `PaletteSelector.vue`: Allows users to switch between saved palettes.

### Data Flow and Logic

1.  **Initialization:** On application load (`App.vue`'s `onMounted` hook), the `colourStore` is initialized. It attempts to load a palette from the URL query string and any saved palettes from the browser's `localStorage`.
2.  **User Interaction:**
    -   Users add or remove colors, which triggers actions in the `colourStore`.
    -   The store updates its state (the `colourSwatches` array).
3.  **Reactivity:** Pinia's and Vue's reactivity systems ensure that any changes to the state are automatically reflected in the UI.
    -   Computed properties in the `colourStore` (e.g., `uniqueColourCombinations`, `passColourCombinations`) are re-evaluated whenever the `colourSwatches` array changes.
    -   Components that depend on this state (like `CombinationsList.vue`) re-render to display the updated contrast information.
4.  **Data Persistence:**
    -   The current palette state (colors, title) is continuously synchronized with the URL query string, allowing users to share their palettes via URL.
    -   Users can explicitly save/archive a palette, which commits it to `localStorage` via the `palettes` array in the store.

## How to Run the Application

1.  Install dependencies: `npm install`
2.  Run the development server: `npm run dev`
3.  Build for production: `npm run build`
4.  Run unit tests: `npm run test:unit`
5.  Lint and format code: `npm run lint`
