# Roadmap

## R1. Form validation UI feedback in FormAddColour

**File:** `src/components/FormAddColour.vue`

`:status` on `FormFieldColour` is hardwired to `"default"` — invalid hex is silently rejected.
`@vuelidate` is already a dependency but unused here.

**Goal:** Real-time validation — show error state + message on invalid hex.
Wire `vuelidate` or the existing `checkHexColourIsValid` composable into the form's reactive state
and surface it in `FormFieldColour`'s error slot.

---

## R2. CSS export from palette

**No existing files — new feature**

**Goal:** "Export" button in `PaletteControls` that downloads a `.css` file of CSS custom
properties from the current palette:

```css
:root {
  --colour-1: #1a2b3c;
  --colour-2: #ff6600;
}
```

Leverages existing colour swatch data from the store.
Could extend to Tailwind config JSON or SCSS variable format.
