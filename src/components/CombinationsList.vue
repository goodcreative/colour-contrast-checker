<template>
  <div class="b_combinations u_flow">
    <div class="b_combinations__intro" v-if="passList.length">
      <figure class="b_combinations__introIcon u_resMedia">
        <IconResultPass></IconResultPass>
      </figure>
      <div class="b_combinations__introText u_prose u_measure">
        <h2>{{ passGroup.title }}</h2>
        <p><strong>{{ passGroup.threshold }}</strong></p>
        <p>{{ passGroup.description }}</p>
      </div>
    </div>
    <div
      class="b_combinations__list"
      :class="{ 'b_combinations__list--apca': isAPCA }"
      v-if="passList.length"
    >
      <ColourContrastWidget
        v-for="pair in passList"
        :primaryColour="pair[0]"
        :contrastColour="pair[1]"

        :key="`${pair[0]}-${pair[1]}`"
      ></ColourContrastWidget>
    </div>

    <div class="b_combinations__intro" v-if="largePassList.length">
      <figure class="b_combinations__introIcon u_resMedia">
        <IconResultPassLarge></IconResultPassLarge>
      </figure>
      <div class="b_combinations__introText u_prose u_measure">
        <h2>{{ largePassGroup.title }}</h2>
        <p><strong>{{ largePassGroup.threshold }}</strong></p>
        <p>{{ largePassGroup.description }}</p>
      </div>
    </div>
    <div
      class="b_combinations__list"
      :class="{ 'b_combinations__list--apca': isAPCA }"
      v-if="largePassList.length"
    >
      <ColourContrastWidget
        v-for="pair in largePassList"
        :primaryColour="pair[0]"
        :contrastColour="pair[1]"

        :key="`${pair[0]}-${pair[1]}`"
      ></ColourContrastWidget>
    </div>

    <div class="b_combinations__intro" v-if="failList.length">
      <figure class="b_combinations__introIcon u_resMedia">
        <IconResultFail></IconResultFail>
      </figure>
      <div class="b_combinations__introText u_prose u_measure">
        <h2>{{ failGroup.title }}</h2>
        <p><strong>{{ failGroup.threshold }}</strong></p>
        <p>{{ failGroup.description }}</p>
      </div>
    </div>
    <div
      class="b_combinations__list"
      :class="{ 'b_combinations__list--apca': isAPCA }"
      v-if="failList.length"
    >
      <ColourContrastWidget
        v-for="pair in failList"
        :primaryColour="pair[0]"
        :contrastColour="pair[1]"

        :key="`${pair[0]}-${pair[1]}`"
      ></ColourContrastWidget>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import ColourContrastWidget from "@/components/ColourContrastWidget.vue";
import IconResultPass from "@/components/icons/IconResultPass.vue";
import IconResultPassLarge from "@/components/icons/IconResultPassLarge.vue";
import IconResultFail from "@/components/icons/IconResultFail.vue";
import { useColourStore } from "@/stores/colourStore";

const colourStore = useColourStore();

const isAPCA = computed(() => colourStore.contrastMode === 'apca');
const passList = computed(() => colourStore.passColourCombinations);
const largePassList = computed(() => colourStore.largePassColourCombinations);
const failList = computed(() => colourStore.failColourCombinations);

const passGroup = computed(() => {
  const { min: rMin, max: rMax } = colourStore.complianceRatios;
  if (isAPCA.value) {
    return {
      title: 'Body text',
      threshold: `Lc ${rMax} or greater`,
      description: `Body copy, small text — meets APCA ${colourStore.complianceMode} standard.`,
    };
  }
  return {
    title: 'Pass',
    threshold: `Contrast ratio ${rMax}:1 or greater`,
    description: `Meets WCAG ${colourStore.complianceMode} contrast standard for all text sizes.`,
  };
});

const largePassGroup = computed(() => {
  const { min: rMin, max: rMax } = colourStore.complianceRatios;
  if (isAPCA.value) {
    return {
      title: 'Large text & UI',
      threshold: `Lc ${rMin}–${rMax - 0.1}`,
      description: `Headlines, UI components — meets APCA ${colourStore.complianceMode} for large text.`,
    };
  }
  return {
    title: 'Partial Pass',
    threshold: `Contrast ratio ${rMin}:1 to ${rMax - 0.01}:1`,
    description: `Meets WCAG ${colourStore.complianceMode} for bold text above 18px and all text above 24px.`,
  };
});

const failGroup = computed(() => {
  const { min: rMin } = colourStore.complianceRatios;
  if (isAPCA.value) {
    return {
      title: 'Not suitable',
      threshold: `Lc less than ${rMin}`,
      description: `Decorative use only — insufficient contrast for text.`,
    };
  }
  return {
    title: 'Fail',
    threshold: `Contrast ratio less than ${rMin}:1`,
    description: `Fails WCAG ${colourStore.complianceMode} standard for colour contrast.`,
  };
});
</script>

<style lang="scss" scoped>
.b_combinations {
  padding: var(--main-spacing);

  &__intro {
    display: flex;
    gap: 15px;
    --flow-space: calc(var(--size-l-xl) * 2);
  }

  &__introIcon {
    width: 40px;
    flex-shrink: 0;
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    align-items: flex-start;
    padding-inline-start: 55px;
    --flow-space: var(--size-l-xl);

    &--apca {
      grid-template-columns: 1fr;
    }
  }
}
</style>
