<template>
  <div class="b_cvdSelector">
    <div class="b_cvdSelector__controlContainer">
      <h3 class="b_cvdSelector__title">{{ title }}</h3>
      <div class="b_cvdSelector__control">
        <div
          v-for="option in options"
          :key="option.value"
          class="b_cvdSelector__pillWrapper"
        >
          <button
            class="b_cvdSelector__pill"
            :class="{ 'b_cvdSelector__pill--active': modelValue === option.value }"
            @click.prevent="emit('update:modelValue', option.value)"
          >
            {{ option.label }}
          </button>
          <div v-if="CVD_INFO[option.value]" class="b_cvdSelector__tooltip">
            <p class="b_cvdSelector__infoDesc">{{ CVD_INFO[option.value].description }}</p>
            <p v-if="CVD_INFO[option.value].prevalence" class="b_cvdSelector__infoStat">{{ CVD_INFO[option.value].prevalence }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
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
</script>

<style lang="scss" scoped>
.b_cvdSelector {
  padding: calc(var(--main-spacing) * 0.4) var(--main-spacing);
  background: var(--clr-grey-800);
  border-top: 1px solid var(--clr-grey-700);

  &__title {
    font: var(--heading-700);
    color: var(--clr-grey-100);
  }

  &__controlContainer {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  &__control {
    display: flex;
    background: var(--clr-grey-1000);
    border-radius: var(--border-rad-large);
    box-shadow: var(--shadow-card);
    padding: 8px;
    gap: 2px;
  }

  &__pillWrapper {
    position: relative;

    &:hover .b_cvdSelector__tooltip {
      opacity: 1;
    }
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

    &:is(:hover,:focus-visible,:active):not(.b_cvdSelector__pill--active) {
      background:var(--clr-grey-800);
    }

    &--active {
      background: var(--clr-blue-200);
      color: var(--clr-grey-1000);
    }
  }

  &__tooltip {
    position: absolute;
    top: calc(100% + 20px);
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    padding: 14px 16px;
    background: var(--clr-grey-900);
    border-radius: var(--border-rad-normal);
    filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.45));
    opacity: 0;
    transition: opacity var(--trans-long);
    pointer-events: none;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 6px;
    text-align: left;

    &::after {
      content: '';
      position: absolute;
      top: -9px;
      left: 50%;
      transform: translateX(-50%);
      border: 9px solid transparent;
      border-bottom-color: var(--clr-grey-900);
      border-top: none;
    }
  }

  &__infoDesc {
    font: var(--body-400);
    line-height: 1.5;
    color: var(--clr-grey-200);
  }

  &__infoStat {
    font: var(--body-300);
    line-height: 1.5;
    color: var(--clr-grey-600);
  }
}
</style>
