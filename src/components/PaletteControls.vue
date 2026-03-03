<template>
  <div class="b_controls">
    <div class="b_controls__import">
      <FormAction
        :onClick="openImport"
        buttonLabel="Import"
        buttonMode="positive"
      ></FormAction>
    </div>
    <template v-if="paletteIsNotEmpty">
      <div class="b_controls__export">
        <FormAction
          :onClick="openExport"
          buttonLabel="Export"
          buttonMode="utility"
        ></FormAction>
      </div>
      <div class="b_controls__clear">
        <FormAction
          :onClick="clearPalette"
          buttonLabel="Clear palette"
          buttonMode="negative"
        ></FormAction>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useColourStore } from "@/stores/colourStore";
import FormAction from "@/components/FormAction.vue";

const colourStore = useColourStore();

const paletteIsNotEmpty = computed(() => colourStore.colourSwatches.length > 0);

function clearPalette() { colourStore.clearPalette(); }
function openExport() { colourStore.openExportModal(); }
function openImport() { colourStore.openImportModal(); }
</script>

<style lang="scss" scoped>
.b_controls {
  display: flex;
  gap: var(--size-s);
  padding: calc(var(--main-spacing) / 2) var(--main-spacing);

  &__export,
  &__import,
  &__clear {
    --formAction-padding: 0.4em 0.65em;
    --formAction-font: var(--body-300);
  }

  &__clear {
    --formAction-background: var(--clr-red-400);
    --formAction-background-hov: var(--clr-red-300);
    margin-left: auto;
  }
}
</style>
