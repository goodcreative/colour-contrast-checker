<template>
  <div class="b_importModal" v-show="isVisible">
    <div class="b_importModal__content">
      <header class="b_importModal__header">
        <h2 class="b_importModal__title">Import Palette</h2>
        <button class="b_importModal__close" @click.prevent="close">Close</button>
      </header>
      <div class="b_importModal__body">
        <input
          type="file"
          accept=".json"
          class="b_importModal__input"
          @change="onFileChange"
        />
        <p v-if="errorMessage" class="b_importModal__error">{{ errorMessage }}</p>
        <ModeToggle
          class="b_importModal__modeToggle"
          title="Import mode"
          :options="modeOptions"
          v-model="importMode"
        />
        <button class="b_importModal__confirm" @click.prevent="confirm">Import</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useColourStore } from '@/stores/colourStore';
import ModeToggle from '@/components/ModeToggle.vue';
import { importPaletteFromJSON } from '@/composables/importPaletteFromJSON';

const colourStore = useColourStore();

const importMode = ref('replace');
const errorMessage = ref('');
const parsedData = ref(null);

const modeOptions = [
  { value: 'replace', label: 'Replace' },
  { value: 'merge', label: 'Merge' },
];

const isVisible = computed(() => colourStore.isImportModalOpen);

function close() {
  colourStore.closeImportModal();
}

function onFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      parsedData.value = importPaletteFromJSON(e.target.result);
      errorMessage.value = '';
    } catch (err) {
      errorMessage.value = err.message;
      parsedData.value = null;
    }
  };
  reader.readAsText(file);
}

function confirm() {
  if (!parsedData.value) return;
  colourStore.importPalette(parsedData.value, importMode.value);
  colourStore.closeImportModal();
}
</script>

<style lang="scss" scoped>
.b_importModal {
  position: fixed;
  z-index: 1100;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;

  &__content {
    background: var(--clr-grey-1000);
    border-radius: var(--border-rad-large);
    min-width: 320px;
    max-width: 480px;
    width: 90vw;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--size-m);
    border-bottom: 1px solid var(--clr-grey-800);
  }

  &__title {
    font: var(--heading-500);
    color: var(--clr-text-body);
    margin: 0;
  }

  &__close {
    appearance: none;
    border: none;
    background: var(--clr-red-400);
    color: var(--clr-grey-1000);
    padding: 0.4em 0.65em;
    border-radius: var(--border-rad-inner);
    cursor: pointer;
    font: var(--body-300);

    &:hover {
      background: var(--clr-red-300);
    }
  }

  &__body {
    padding: var(--size-m);
    display: flex;
    flex-direction: column;
    gap: var(--size-m);
  }

  &__input {
    color: var(--clr-text-body);
  }

  &__error {
    color: var(--clr-red-300);
    font: var(--body-300);
    margin: 0;
  }

  &__confirm {
    appearance: none;
    border: none;
    background: var(--clr-blue-200);
    color: var(--clr-grey-1000);
    padding: 0.6em 1em;
    border-radius: var(--border-rad-inner);
    cursor: pointer;
    font: var(--body-300);
    font-weight: 500;
    align-self: flex-start;

    &:hover {
      background: var(--clr-blue-100);
    }
  }
}
</style>
