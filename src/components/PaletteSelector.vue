<template>
  <div class="b_paletteSelector" :class="{ 'b_paletteSelector--open': isOpen }">
    <div class="b_paletteSelector__toggle">
      <FormAction
        :onClick="toggleArchive"
        buttonLabel="Archive"
        :status="formMode"
        iconFirst="true"
        ><IconArchive></IconArchive
      ></FormAction>
    </div>
    <Transition>
      <div class="b_paletteSelector__archive" v-if="state.isOpen">
        <div class="b_paletteSelector__add">
          <FormAction
            :onClick="addPalette"
            buttonLabel="Add current palette to the archive"
            :status="formMode"
            buttonMode="submit"
            :isDisabled="!canArchive"
            iconFirst="true"
            ><FieldIconPlus></FieldIconPlus>
          </FormAction>
        </div>

        <!-- <div class="b_paletteSelector__list">
          <PaletteSelectorItem
            v-for="palette in savedPalettes"
            :paletteTitle="palette.title"
            :paletteColours="palette.colours"
            :paletteID="palette.id"
            :key="palette.id"
            @palette-loaded="toggleArchive"
          ></PaletteSelectorItem>
        </div> -->

        <draggable
          class="b_paletteSelector__list"
          v-model="palettesGetSet"
          @start="drag = true"
          @end="drag = false"
          @change="palettesOrderUpdated"
          item-key="getElementKey(element)"
        >
          <template #item="{ element }">
            <PaletteSelectorItem
              :paletteTitle="element.title"
              :paletteColours="element.colours"
              :paletteID="element.id"
              @palette-loaded="toggleArchive"
            ></PaletteSelectorItem>
          </template>
        </draggable>
      </div>
    </Transition>
  </div>
</template>

<script setup>
// Imports
import { reactive, computed, ref } from "vue";
import draggable from "vuedraggable";
import FormAction from "@/components/FormAction.vue";
import FieldIconPlus from "@/components/icons/FieldIconPlus.vue";
import IconArchive from "@/components/icons/IconArchive.vue";
import PaletteSelectorItem from "@/components/PaletteSelectorItem.vue";
import { useColourStore } from "@/stores/colourStore";
import { storeToRefs } from "pinia";

const colourStore = useColourStore();

const { palettesGetSet } = storeToRefs(colourStore);
const { updateLocalStorage } = colourStore;

// Data
const state = reactive({
  isOpen: false,
});

const addPalette = async () => {
  if (canArchive.value) {
    colourStore.addPaletteToLocalStorage();
  }
};

const canArchive = computed(() => {
  if (colourStore.paletteCanBeArchived) {
    return true;
  }

  return false;
});

const isOpen = computed(() => {
  return state.isOpen;
});

const toggleArchive = async () => {
  state.isOpen = !state.isOpen;
};

const palettesOrderUpdated = function () {
  updateLocalStorage();
};

// Functions
// function functionName(){}
</script>

<style lang="scss" scoped>
.b_paletteSelector {
  order: 3;
  width: 100vw;
  max-width: 400px;
  position: relative;
  display: grid;
  align-self: end;
  padding: var(--size-small) 0;
  z-index: 100;

  &__toggle {
    justify-self: end;
    --button-icon-max-height: 12px;
  }

  &__archive {
    display: grid;
    width: 100vw;
    max-width: 400px;
    position: absolute;
    bottom: -5px;
    right: 0;
    background: var(--clr-grey-1000);
    transform: translateY(100%);
    border: 1px solid var(--clr-grey-800);
    box-shadow: var(--shadow-card);
    border-radius: var(--border-rad-outer);
  }

  &__list {
    width: 100%;
    display: grid;
    grid-gap: 10px;
    background: var(--clr-grey-900);
    border-top: 1px solid var(--clr-grey-800);
    border-radius: 0 0 var(--border-rad-outer)
      var(--border-rad-outer);

    &:not(:empty) {
      padding: 15px;
    }
  }

  &__add {
    --form-button-width: auto;
    --form-button-height: auto;
    --formAction-background: var(--clr-red-400);
    --formAction-background-hov: var(--clr-red-300);
    //--formAction-padding: 0.4em 0.65em;
    //--formAction-font: var(--body-300);
    padding: 15px;
    justify-self: center;
  }

  &--open {
    --formAction-background: var(--clr-red-400);
    --formAction-background-hov: var(--clr-red-400);
  }

  .v-enter-active,
  .v-leave-active {
    transition: opacity 0.15s ease;
  }

  .v-enter-from,
  .v-leave-to {
    opacity: 0;
  }
}
</style>
