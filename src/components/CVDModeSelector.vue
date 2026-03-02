<template>
  <div class="b_cvdSelector">
    <h3 class="b_cvdSelector__title">{{ title }}</h3>
    <div class="b_cvdSelector__control">
      <button
        v-for="option in options"
        :key="option.value"
        class="b_cvdSelector__pill"
        :class="{ 'b_cvdSelector__pill--active': modelValue === option.value }"
        @click.prevent="emit('update:modelValue', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  options: { type: Array, required: true },
  modelValue: { type: String, required: true },
});

const emit = defineEmits(['update:modelValue']);
</script>

<style lang="scss" scoped>
.b_cvdSelector {
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
    display: flex;
    background: var(--clr-grey-1000);
    border-radius: var(--border-rad-large);
    box-shadow: var(--shadow-card);
    padding: 4px;
    gap: 2px;
  }

  &__pill {
    -webkit-appearance: none;
    appearance: none;
    border: none;
    background: none;
    cursor: pointer;
    padding: 6px 14px;
    border-radius: var(--border-rad-large);
    font: var(--heading-700);
    color: var(--clr-blue-200);
    transition: background var(--trans-short), color var(--trans-short);

    &--active {
      background: var(--clr-blue-200);
      color: var(--clr-grey-1000);
    }
  }
}
</style>
