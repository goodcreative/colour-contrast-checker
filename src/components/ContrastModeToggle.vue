<template>
  <div class="b_contrastModeToggle">
    <h3 class="b_contrastModeToggle__title">Contrast Algorithm</h3>
    <button
      class="b_contrastModeToggle__control"
      :class="modeClass"
      @click.prevent="toggle()"
    >
      <span class="b_contrastModeToggle__label">WCAG</span>
      <span class="b_contrastModeToggle__switch u_pseudo"></span>
      <span class="b_contrastModeToggle__label">APCA</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useColourStore } from "@/stores/colourStore";
const colourStore = useColourStore();

const modeClass = computed(() =>
  colourStore.contrastMode === 'apca'
    ? 'b_contrastModeToggle--apca'
    : 'b_contrastModeToggle--wcag'
);

const toggle = () =>
  colourStore.setContrastMode(
    colourStore.contrastMode === 'wcag' ? 'apca' : 'wcag'
  );
</script>

<style lang="scss" scoped>
.b_contrastModeToggle {
  padding: calc(var(--main-spacing) * 0.4) var(--main-spacing);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 15px;
  background: var(--clr-grey-800);

  &__title {
    font: var(--heading-700);
    color: var(--clr-grey-100);
  }

  &__control {
    -webkit-appearance: none;
    appearance: none;
    border: none;
    background: none;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 10px 20px;
    background: var(--clr-grey-1000);
    border-radius: var(--border-rad-large);
    box-shadow: var(--shadow-card);
  }

  &__label {
    font: var(--heading-700);
    color: var(--clr-blue-200);
  }

  &__switch {
    width: 50px;
    height: 30px;
    border-radius: 20px;
    background: var(--clr-grey-900);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);

    &:after {
      width: 22px;
      height: 22px;
      background: var(--clr-blue-200);
      border-radius: 15px;
      top: 50%;
      transform: translateY(-50%);
      left: var(--switch-pill-left, 4px);
      transition: all var(--trans-short);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
    }
  }

  &--apca {
    --switch-pill-left: calc(100% - 26px);
  }
}
</style>
