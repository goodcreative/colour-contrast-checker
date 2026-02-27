<template>
  <div class="b_modeToggle" :style="{ justifyContent: justify }">
    <h3 class="b_modeToggle__title">{{ title }}</h3>
    <button
      class="b_modeToggle__control"
      :class="{ 'b_modeToggle--right': isRight }"
      @click.prevent="toggle()"
    >
      <span class="b_modeToggle__label">{{ options[0].label }}</span>
      <span class="b_modeToggle__switch u_pseudo"></span>
      <span class="b_modeToggle__label">{{ options[1].label }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  title: { type: String, required: true },
  options: { type: Array, required: true },
  modelValue: { type: String, required: true },
  justify: { type: String, default: "flex-start" },
});

const emit = defineEmits(["update:modelValue"]);

const isRight = computed(() => props.modelValue === props.options[1].value);

const toggle = () => {
  const newVal =
    props.modelValue === props.options[0].value
      ? props.options[1].value
      : props.options[0].value;
  emit("update:modelValue", newVal);
};
</script>

<style lang="scss" scoped>
.b_modeToggle {
  padding: calc(var(--main-spacing) * 0.4) var(--main-spacing);
  display: flex;
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

  &--right {
    --switch-pill-left: calc(100% - 26px);
  }
}
</style>
