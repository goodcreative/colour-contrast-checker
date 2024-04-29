<template>
  <div class="b_swatch" :class="{ focus: isFocus }">
    <div class="b_swatch__colour">
      <div
        class="b_swatch__sample u_pseudo"
        :style="{ backgroundColor: colourHex }"
        @click.prevent="setFocus"
      >
        <Transition>
          <div v-if="state.isCopying" class="b_swatch__copyMessage">
            Copied!
          </div>
        </Transition>
      </div>
    </div>
    <div class="b_swatch__details">
      <p>{{ colourHex }}</p>
      <div class="b_swatch__toolbar">
        <FormAction
          @click.prevent="copyToClipboard"
          buttonLabel="Copy"
          buttonMode="positive"
          buttonType="icon"
          ><IconCopy></IconCopy
        ></FormAction>

        <FormAction
          @click.prevent="deleteColour"
          buttonLabel="Delete"
          buttonMode="negative"
          buttonType="icon"
          ><IconDustbin></IconDustbin
        ></FormAction>
      </div>
    </div>
  </div>
</template>

<script setup>
// Imports
import { reactive, computed } from "vue";
import FormAction from "@/components/FormAction.vue";
import IconDustbin from "@/components/icons/IconDustbin.vue";
import IconCopy from "@/components/icons/IconCopy.vue";
import hexToRGB from "@/composables/hexToRGB.js";
import { useColourStore } from "@/stores/colourStore";
const colourStore = useColourStore();

// Data
const state = reactive({
  isEditing: false,
  isCopying: false,
  isFocus: false,
});

const props = defineProps({
  colourHex: {
    type: String,
    required: true,
  },
});

const deleteColour = async () => {
  colourStore.removeColour(props.colourHex);
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.colourHex);
    state.isCopying = true;

    setTimeout(() => {
      state.isCopying = false;
    }, 600);
    console.log("Content copied to clipboard");
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
};

const isFocus = computed(() => {
  const FOCUS_COLOUR = colourStore.focusColourGetSet;

  if (FOCUS_COLOUR === props.colourHex) {
    return true;
  } else {
    return false;
  }
});

const setFocus = async () => {
  if (isFocus.value) {
    colourStore.focusColourGetSet = "";
  } else {
    window.console.log(hexToRGB(props.colourHex));
    colourStore.focusColourGetSet = props.colourHex;
  }
};
</script>

<style lang="scss" scoped>
.b_swatch {
  $self: &;

  --formAction-background: var(--clr-grey-800);

  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 12px;
  padding: 8px 12px 8px 8px;
  background: var(--swatch-back, var(--clr-grey-1000));
  box-shadow: var(--shadow-card);
  border-radius: 40px var(--border-rad-small)
    var(--border-rad-small) 40px;
  cursor: move;

  &__colour {
    align-self: stretch;
    display: flex;
  }

  &__sample {
    width: var(--swatch-sample-size, 40px);
    height: var(--swatch-sample-size, 40px);
    display: inline-block;
    grid-column: 1;
    align-self: center;
    box-shadow: var(--swatch-sample-shadow);
    border: var(--swatch-sample-border-width, 1px) solid
      var(--swatch-sample-border-clr, rgba(0, 0, 0, 0.2));
    border-radius: 50%;
    position: relative;
    transform: scale(var(--swatch-sample-scale, 1))
      translate(var(--swatch-sample-translate, 0));
    z-index: 10;
    cursor: var(--swatch-sample-cursor, zoom-in);

    &:before {
      width: 5px;
      height: 12px;
      background: var(--swatch-sample-border-clr);
      bottom: 2px;
      right: 2px;
      transform: rotate(-45deg) translate(-3px, 9px);
      z-index: -1;
      border-radius: 3px;
    }
  }

  &__copyMessage {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translate(calc(100% + 8px), -50%);
    color: var(--clr-grey-100);
    background: var(--clr-grey-900);
    padding: 5px 10px;
    font: var(--text-code-400);
    border-radius: 3px;
  }

  .v-enter-active,
  .v-leave-active {
    transition: opacity 0.15s ease;
  }

  .v-enter-from,
  .v-leave-to {
    opacity: 0;
  }

  &__details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    grid-column: 2;

    p {
      color: var(--swatch-text);
      font: var(--text-code-400);
    }
  }

  &__toolbar {
    display: flex;
    grid-gap: 5px;
    opacity: 0;
    transition: opacity var(--trans-short);

    --b-icon-max-height: 24px;
  }

  &:is(:hover, :focus) {
    #{ $self }__toolbar {
      opacity: 1;
    }
  }

  &.focus {
    --swatch-text: var(--clr-grey-1000);
    --swatch-back: var(--clr-grey-200);
    --swatch-sample-border-clr: var(--clr-grey-1000);
    //--swatch-sample-translate: -3px, -3px;
    //--swatch-sample-scale: 0.9;
    --swatch-sample-border-width: 3px;
    --formAction-background: var(--clr-grey-300);
    --swatch-sample-shadow: inset 0 0 0 var(--swatch-shadow-thickness, 3px)
      var(--swatch-back);
    --swatch-sample-cursor: zoom-out;
  }
}
</style>
