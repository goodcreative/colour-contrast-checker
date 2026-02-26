<template>
  <header class="b_title">
    <FormEditTitle titleModel="titleText"></FormEditTitle>
  </header>
</template>

<script setup>
// Imports
import { reactive, computed, ref } from "vue";
import { useColourStore } from "@/stores/colourStore";
import FormEditTitle from "@/components/FormEditTitle.vue";

const colourStore = useColourStore();

// Data
const state = reactive({
  stateItem: [],
});

const props = defineProps({});

const titleText = computed(() => {
  return colourStore.paletteTitle;
});

const titleMode = computed(() => {
  if (props.titleText) {
    return "set";
  } else {
    return "empty";
  }
});

// Functions
// function functionName(){}
</script>

<style lang="scss" scoped>
.b_title {
  flex: 1 1 auto;
}
</style>
