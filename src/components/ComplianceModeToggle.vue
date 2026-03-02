<template>
  <ModeToggle
    :title="label"
    :options="[{ label: 'AA', value: 'AA' }, { label: 'AAA', value: 'AAA' }]"
    :modelValue="colourStore.complianceMode"
    justify="flex-end"
    @update:modelValue="colourStore.complianceMode = $event"
  />
</template>

<script setup>
import { computed } from "vue";
import { useColourStore } from "@/stores/colourStore";
import ModeToggle from "@/components/ModeToggle.vue";

const colourStore = useColourStore();

const label = computed(() =>
  "Compliance"
);
</script>
