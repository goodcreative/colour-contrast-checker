<template>
  <div class="b_pillToggle">
    <button
      class="b_pillToggle__button"
      :class="{ 'b_pillToggle__button--open': modelValue }"
      @click="emit('update:modelValue', !modelValue)"
    >
      {{ label }}
      <svg class="b_pillToggle__icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M3 6l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  modelValue: { type: Boolean, required: true },
});

const emit = defineEmits(["update:modelValue"]);
</script>

<style lang="scss" scoped>
.b_pillToggle {
  padding: calc(var(--main-spacing) * 0.4) var(--main-spacing);
  display: flex;
  align-items: center;
  background: var(--clr-grey-800);

  &__button {
    appearance: none;
    border: none;
    background: var(--clr-blue-200);
    cursor: pointer;
    padding: 8px 16px;
    font: var(--body-300);
    font-weight: 700;
    color: var(--clr-grey-1000);
    border-radius: var(--border-rad-large);
    display: flex;
    align-items: center;
    gap: 6px;
    transition: background var(--trans-short);

    &:hover { background: var(--clr-blue-100); }
  }

  &__icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    transition: transform var(--trans-short);

    .b_pillToggle__button--open & {
      transform: rotate(-180deg);
    }
  }
}
</style>
