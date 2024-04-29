<template>
  <div
    class="b_action"
    :class="{
      [`b_action--${modeClass}`]: buttonMode,
      [`b_action--icon`]: isIconButton,
      [`b_action--disabled`]: isDisabled,
      [`b_action--iconFirst`]: iconFirst,
    }"
  >
    <button class="b_action__button" @click.prevent="onClick">
      <span class="b_action__label" v-if="hasVisibleLabel">{{
        buttonLabel
      }}</span>
      <slot></slot>
    </button>
  </div>
</template>

<script setup>
// Imports
import { reactive, computed, ref } from "vue";

// Data
const state = reactive({
  stateItem: [],
});

const props = defineProps({
  onClick: {
    type: Function,
    required: true,
  },
  buttonLabel: {
    type: String,
    required: true,
  },
  buttonMode: {
    type: String,
    required: true,
  },
  buttonType: {
    type: String,
    required: false,
  },
  isDisabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  iconFirst: {
    type: Boolean,
    required: false,
  },
});

const modeClass = computed(() => {
  return props.buttonMode;
});

const isIconButton = computed(() => {
  if (props.buttonType === "icon") {
    return true;
  }

  return false;
});

const isLargeIconButton = computed(() => {
  if (props.buttonType === "largeIcon") {
    return true;
  }

  return false;
});

const hasVisibleLabel = computed(() => {
  if (props.buttonType !== "icon") {
    return true;
  }

  return false;
});

// Functions
// function functionName(){}
</script>

<style lang="scss" scoped>
.b_action {
  $self: &;

  &__button {
    font: var(--formAction-font);
    padding: var(--formAction-padding, 0.6em 1em);
    border: none;
    background: var(--formAction-background, var(--clr-blue-200));
    color: var(--formAction-text, var(--clr-grey-1000));
    cursor: pointer;
    line-height: var(--formAction-lineheight, 1);
    transition: background-color var(--trans-short);
    border-radius: var(--formAction-bordrad, var(--border-rad-inner));
    width: var(--formAction-width, auto);
    height: var(--formAction-height, auto);
    white-space: nowrap;
    transition: all var(--trans-short);
    display: flex;
    align-items: center;
    gap: 12px;

    &:is(:hover) {
      background: var(--formAction-background-hov, var(--clr-blue-100));
    }

    ::deep(svg) {
      max-height: var(--button-icon-max-height, 24px);
    }
  }

  &__label {
    font-weight: 500;
  }

  &--icon {
    --formAction-padding: 0.35em;
    --formAction-lineheight: 0;
    --formAction-width: 34px;
    --formAction-height: 34px;
    --formAction-padding: 4px;
    --formAction-bordrad: 50%;

    #{ $self }__button {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  &--negative {
    --formAction-background: var(--clr-red-400);
    --formAction-background-hov: var(--clr-red-300);
  }

  &--positive,
  &--submit {
    --formAction-background: var(--clr-blue-200);
    --formAction-background-hov: var(--clr-blue-100);
  }

  &--utility {
    --formAction-background: var(--clr-grey-200);
    --formAction-background-hov: var(--clr-grey-100);
  }

  &--actionToggle {
    --formAction-background: transparent;
  }

  &--disabled {
    #{ $self }__button {
      opacity: 0.5;
      cursor: not-allowed;
      --formAction-background: var(--clr-grey-800);
      --formAction-background-hov: var(--clr-grey-800);
    }
  }

  &--iconFirst {
    span {
      order: 3;
    }

    #{ $self }__label {
      order: 3;
    }
  }
}
</style>
