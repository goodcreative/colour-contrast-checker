<template>
  <div class="b_palette">
    <h4 class="b_palette__title">
      {{ paletteTitle }}
    </h4>
    <div class="b_palette__preview">
      <PaletteSelectorItemColourPreview
        v-for="colour in paletteColours"
        :colourHex="colour"
        :key="colour"
      ></PaletteSelectorItemColourPreview>
    </div>
    <div class="b_palette__actions">
      <FormAction
        :onClick="loadPalette"
        buttonLabel="Delete"
        :status="formMode"
        buttonMode="positive"
        buttonType="icon"
        ><IconEye></IconEye
      ></FormAction>
      <FormAction
        :onClick="deletePalette"
        buttonLabel="Delete"
        :status="formMode"
        buttonMode="negative"
        buttonType="icon"
        ><IconDustbin></IconDustbin
      ></FormAction>
    </div>
  </div>
</template>

<script setup>
// Imports
import { reactive, computed, ref } from "vue";
import { useColourStore } from "@/stores/colourStore";
import FormAction from "@/components/FormAction.vue";
import PaletteSelectorItemColourPreview from "@/components/PaletteSelectorItemColourPreview.vue";
import IconDustbin from "@/components/icons/IconDustbin.vue";
import IconEye from "@/components/icons/IconEye.vue";

const colourStore = useColourStore();

// Data
const state = reactive({
  stateItem: [],
});

const props = defineProps({
  paletteTitle: {
    type: String,
    required: true,
  },
  paletteColours: {
    type: Array,
    required: true,
  },
  paletteID: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["paletteLoaded"]);

const loadPalette = async () => {
  colourStore.loadLocalPalette(props.paletteID);

  emit("paletteLoaded");
};

const deletePalette = async () => {
  colourStore.deleteLocalPalette(props.paletteID);
};

// Functions
// function functionName(){}
</script>

<style lang="scss" scoped>
.b_palette {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-gap: 10px;
  padding: 15px;
  background: var(--clr-grey-1000);
  border-radius: var(--border-rad-small);
  box-shadow: var(--shadow-card);
  cursor: move;

  &__title {
    grid-column: 1;
  }

  &__preview {
    grid-column: 1;
    grid-row: 2;
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
  }

  &__actions {
    --b-icon-max-height: 24px;

    grid-column: 2;
    grid-row: span 2;
    display: flex;
    gap: 5px;
    align-items: center;
  }
}
</style>
