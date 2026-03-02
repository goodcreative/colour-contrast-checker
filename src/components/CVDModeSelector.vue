<template>
  <div class="b_cvdSelector">
    <div class="b_cvdSelector__controlContainer">
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
    <div v-if="activeInfo" class="b_cvdSelector__info">
      <p class="b_cvdSelector__infoDesc">{{ activeInfo.description }}</p>
      <p v-if="activeInfo.prevalence" class="b_cvdSelector__infoStat">{{ activeInfo.prevalence }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  options: { type: Array, required: true },
  modelValue: { type: String, required: true },
});

const emit = defineEmits(['update:modelValue']);

const CVD_INFO = {
  normal: {
    description: 'Simulating standard trichromatic colour vision.',
    prevalence: null,
  },
  protanopia: {
    description: 'Absent red (L-cone) sensitivity — reds appear dark; red–green confusion is common.',
    prevalence: 'Affects ~1% of males.',
  },
  deuteranopia: {
    description: 'Absent green (M-cone) sensitivity — the most common form of colour vision deficiency.',
    prevalence: 'Affects ~1% of males; red–green CVD overall affects ~8% of males, ~0.5% of females.',
  },
  tritanopia: {
    description: 'Absent blue (S-cone) sensitivity — blues and yellows are confused.',
    prevalence: 'Affects ~0.003% of people (approx. 1 in 30,000).',
  },
};

const activeInfo = computed(() => CVD_INFO[props.modelValue] ?? null);
</script>

<style lang="scss" scoped>
.b_cvdSelector {
  padding: calc(var(--main-spacing) * 0.4) var(--main-spacing);
  display: flex;
  align-items: start;
  gap: 35px;
  background: var(--clr-grey-800);
  border-top: 1px solid var(--clr-grey-700);

  &__title {
    font: var(--heading-700);
    color: var(--clr-grey-100);
  }

  &__controlContainer {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap:20px;
  }

  &__control {
    display: flex;
    background: var(--clr-grey-1000);
    border-radius: var(--border-rad-large);
    box-shadow: var(--shadow-card);
    padding: 8px;
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

  &__info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: left;
  }

  &__infoDesc {
    font: var(--body-400);
    color: var(--clr-grey-200);
  }

  &__infoStat {
    font: var(--body-300);
    color: var(--clr-grey-600);
  }
}

</style>
