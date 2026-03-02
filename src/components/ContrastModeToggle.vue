<template>
  <ModeToggle
    title="Algorithm"
    :options="[{ label: 'WCAG', value: 'wcag' }, { label: 'APCA', value: 'apca' }]"
    :modelValue="colourStore.contrastMode"
    @update:modelValue="colourStore.setContrastMode($event)"
  />
</template>

<script setup>
import { useColourStore } from "@/stores/colourStore";
import ModeToggle from "@/components/ModeToggle.vue";

const colourStore = useColourStore();
</script>
