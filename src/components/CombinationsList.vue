<template>
  <div class="b_combinations u_flow">
    <div class="b_combinations__intro" v-if="passList.length">
      <figure class="b_combinations__introIcon u_resMedia">
        <IconResultPass></IconResultPass>
      </figure>
      <div class="b_combinations__introText u_prose u_measure">
        <h2>Pass</h2>
        <p>
          <strong
            >Contrast value {{ colourStore.complianceRatios.max }} or
            greater</strong
          >
        </p>
        <p>
          Colour combinations meeting
          <strong>WCAG {{ colourStore.complianceModeGetSet }}</strong> contrast
          standard for all text sizes.
        </p>
      </div>
    </div>
    <div class="b_combinations__list" v-if="passList.length">
      <ColourContrastWidget
        v-for="(pair, index) in passList"
        :primaryColour="pair[0]"
        :contrastColour="pair[1]"
        :contrastRatio="pair[2]"
        :key="index"
      ></ColourContrastWidget>
    </div>
    <div class="b_combinations__intro" v-if="largePassList.length">
      <figure class="b_combinations__introIcon u_resMedia">
        <IconResultPassLarge></IconResultPassLarge>
      </figure>
      <div class="b_combinations__introText u_prose u_measure">
        <h2>Partial Pass</h2>
        <p>
          <strong
            >Contrast value between {{ colourStore.complianceRatios.min }} and
            {{ colourStore.complianceRatios.max - 0.01 }}</strong
          >
        </p>
        <p>
          Colour combinations meeting
          <strong>WCAG {{ colourStore.complianceModeGetSet }}</strong> contrast
          standard for bold text above 18px and all text above 24px.
        </p>
      </div>
    </div>
    <div class="b_combinations__list" v-if="largePassList.length">
      <ColourContrastWidget
        v-for="(pair, index) in largePassList"
        :primaryColour="pair[0]"
        :contrastColour="pair[1]"
        :contrastRatio="pair[2]"
        :key="index"
      ></ColourContrastWidget>
    </div>
    <div class="b_combinations__intro" v-if="failList.length">
      <figure class="b_combinations__introIcon u_resMedia">
        <IconResultFail></IconResultFail>
      </figure>
      <div class="b_combinations__introText u_prose u_measure">
        <h2>Fail</h2>
        <p>
          <strong
            >Contrast value less than
            {{ colourStore.complianceRatios.min }}</strong
          >
        </p>
        <p>
          Colour combinations fail
          <strong>WCAG {{ colourStore.complianceModeGetSet }}</strong> standard
          for colour contrast.
        </p>
      </div>
    </div>
    <div class="b_combinations__list" v-if="failList.length">
      <ColourContrastWidget
        v-for="(pair, index) in failList"
        :primaryColour="pair[0]"
        :contrastColour="pair[1]"
        :contrastRatio="pair[2]"
        :key="index"
      ></ColourContrastWidget>
    </div>
  </div>
</template>

<script setup>
// Imports
import { reactive, computed, ref } from "vue";
import ColourContrastWidget from "@/components/ColourContrastWidget.vue";
import IconResultPass from "@/components/icons/IconResultPass.vue";
import IconResultPassLarge from "@/components/icons/IconResultPassLarge.vue";
import IconResultFail from "@/components/icons/IconResultFail.vue";
import { useColourStore } from "@/stores/colourStore";

const colourStore = useColourStore();

// Data

const passList = computed(() => {
  return colourStore.passColourCombinations;
});

const largePassList = computed(() => {
  return colourStore.largePassColourCombinations;
});

const failList = computed(() => {
  return colourStore.failColourCombinations;
});

// Functions
// function functionName(){}
</script>

<style lang="scss" scoped>
.b_combinations {
  padding: calc(var(--main-spacing) * 1);

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
    gap: 25px;
    align-items: flex-start;
    padding-inline-start: 55px;
    --flow-space: var(--size-l-xl);
  }
}
</style>
