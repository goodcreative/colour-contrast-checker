<template>
  <header class="b_title">
    <FormEditTitle titleModel="titleText"></FormEditTitle>
  </header>
</template>

<script setup>
// Imports
import { computed } from "vue";
import { useColourStore } from "@/stores/colourStore";
import FormEditTitle from "@/components/FormEditTitle.vue";

const colourStore = useColourStore();

const titleText = computed(() => {
  return colourStore.paletteTitle;
});
</script>

<style lang="scss" scoped>
.b_title {
  flex: 1 1 auto;
}
</style>
