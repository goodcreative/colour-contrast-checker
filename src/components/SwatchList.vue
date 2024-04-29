<template>
  <draggable
    class="b_swatchList u_flow"
    v-model="colours"
    @start="drag = true"
    @end="drag = false"
    @change="listOrderUpdated"
    item-key="element"
  >
    <template #item="{ element }">
      <ColourSwatch :colourHex="element"></ColourSwatch>
    </template>
  </draggable>
</template>

<script setup>
// Imports
import { reactive, computed, ref } from "vue";
import { useColourStore } from "@/stores/colourStore";
import ColourSwatch from "@/components/ColourSwatch.vue";
import draggable from "vuedraggable";
import { storeToRefs } from "pinia";

const colourStore = useColourStore();

const { colours } = storeToRefs(colourStore);
const { updateURLData } = colourStore;

const listOrderUpdated = function () {
  updateURLData();
};
</script>

<style lang="scss" scoped>
.b_swatchList {
  --flow-space: 10px;
  padding: calc(var(--main-spacing) / 2) var(--main-spacing);
}
</style>
