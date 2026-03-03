<template>
  <div class="b_exportModal" v-show="isVisible">
    <div class="b_exportModal__content">
      <header class="b_exportModal__header">
        <h2 class="b_exportModal__title">Export Palette</h2>
        <button class="b_exportModal__close" @click.prevent="close">Close</button>
      </header>
      <div class="b_exportModal__body">
        <div class="b_exportModal__formats">
          <button
            v-for="fmt in formats"
            :key="fmt.value"
            class="b_exportModal__formatBtn"
            :class="{ 'b_exportModal__formatBtn--active': selectedFormat === fmt.value }"
            @click.prevent="selectedFormat = fmt.value"
          >
            {{ fmt.label }}
          </button>
        </div>
        <button class="b_exportModal__download" @click.prevent="download">Download</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useColourStore } from '@/stores/colourStore';
import { exportPaletteAsJSON } from '@/composables/exportPaletteAsJSON';
import { exportPaletteAsCSS } from '@/composables/exportPaletteAsCSS';
import { exportPaletteAsASE } from '@/composables/exportPaletteAsASE';
import { downloadFile } from '@/composables/downloadFile';

const colourStore = useColourStore();

const selectedFormat = ref('json');

const formats = [
  { value: 'json', label: 'JSON' },
  { value: 'css', label: 'CSS' },
  { value: 'ase', label: 'ASE' },
];

const isVisible = computed(() => colourStore.isExportModalOpen);

function close() {
  colourStore.closeExportModal();
}

function download() {
  const name = colourStore.paletteTitle || 'palette';
  const colours = colourStore.colourSwatches;

  if (selectedFormat.value === 'json') {
    downloadFile(`${name}.json`, exportPaletteAsJSON({ name, colours }), 'application/json');
  } else if (selectedFormat.value === 'css') {
    downloadFile(`${name}.css`, exportPaletteAsCSS({ name, colours }), 'text/css');
  } else if (selectedFormat.value === 'ase') {
    downloadFile(`${name}.ase`, exportPaletteAsASE({ name, colours }), 'application/octet-stream');
  }

  colourStore.closeExportModal();
}
</script>

<style lang="scss" scoped>
.b_exportModal {
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

  &__formats {
    display: flex;
    gap: var(--size-s);
  }

  &__formatBtn {
    appearance: none;
    border: 2px solid var(--clr-grey-700);
    background: var(--clr-grey-900);
    color: var(--clr-text-body);
    padding: 0.4em 0.8em;
    border-radius: var(--border-rad-inner);
    cursor: pointer;
    font: var(--body-300);
    transition: all var(--trans-short);

    &:hover {
      border-color: var(--clr-blue-200);
    }

    &--active {
      border-color: var(--clr-blue-200);
      background: var(--clr-blue-200);
      color: var(--clr-grey-1000);
    }
  }

  &__download {
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
