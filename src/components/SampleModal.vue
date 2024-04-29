<template>
  <div class="b_sample" v-show="isVisible">
    <div class="b_sample__content">
      <header class="b_sample__header">
        <!-- {{ colourStore.isSampleMode }} {{ colourPair }} -->
        <FormAction
          @click.prevent="closeSample"
          buttonLabel="Close"
          :status="formMode"
          buttonMode="negative"
          ><FieldIconCross></FieldIconCross>
        </FormAction>
        <FormAction
          @click.prevent="flipColours"
          buttonLabel="Flip Colours"
          :status="formMode"
          buttonMode="submit"
        >
        </FormAction>
      </header>

      <section class="b_sample__type u_prose">
        <p class="b_sample__typeLine--level0 b_sample__typeLine">
          ABCDEDFabcdefg12345
        </p>
        <p class="b_sample__typeLine--level1 b_sample__typeLine">
          ABCDEDFabcdefg12345
        </p>
        <p class="b_sample__typeLine--level2 b_sample__typeLine">
          ABCDEDFabcdefg12345
        </p>
        <p class="b_sample__typeLine--level3 b_sample__typeLine">
          ABCDEDFabcdefg12345
        </p>
        <p class="b_sample__typeLine--level4 b_sample__typeLine">
          ABCDEDFabcdefg12345
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
// Imports
import FieldIconCross from "@/components/icons/FieldIconCross.vue";
import FormAction from "@/components/FormAction.vue";

import { reactive, computed } from "vue";
import { useColourStore } from "@/stores/colourStore";
const colourStore = useColourStore();

// Data
const state = reactive({
  flipped: false,
});

const colourPair = computed(() => {
  return colourStore.sampleColoursGetSet;
});

const firstColour = computed(() => {
  if (state.flipped) {
    return colourPair.value[1];
  }
  return colourPair.value[0];
});

const secondColour = computed(() => {
  if (state.flipped) {
    return colourPair.value[0];
  }
  return colourPair.value[1];
});

const isVisible = computed(() => {
  return colourStore.isSampleMode;
});

function closeSample() {
  colourStore.sampleColoursGetSet = [];
}

function flipColours() {
  state.flipped = !state.flipped;
}
</script>
<style lang="scss" scoped>
.b_sample {
  --firstColour: v-bind("firstColour");
  --secondColour: v-bind("secondColour");

  position: fixed;
  z-index: 1100;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  padding: var(--size-m);
  display: flex;
  justify-content: center;
  align-items: center;

  &__content {
    max-width: 90vw;
    max-height: 90vh;
    color: var(--clr-text-body);
    background: var(--clr-grey-1000);
  }

  &__header {
    padding: var(--size-m);
  }

  &__type {
    color: var(--firstColour);
    background: var(--secondColour);
    padding: var(--size-l);
  }

  &__typeLine {
    &--level0 {
      font-size: 128px;
    }

    &--level1 {
      font-size: 72px;
    }

    &--level2 {
      font-size: 48px;
    }

    &--level3 {
      font-size: 36px;
    }

    &--level4 {
      font-size: 24px;
    }
  }
}
</style>
