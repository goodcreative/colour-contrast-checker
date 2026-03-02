<template>
  <!-- WCAG card -->
  <div v-if="!isAPCA" class="b_contrast" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <div class="b_contrast__pair">
      <div class="b_contrast__colour">
        <div
          class="b_contrast__sample b_contrast__sample--primary"
          :style="{ backgroundColor: activeColour1 }"
        ></div>
        <h3 class="b_contrast__colourHex">{{ primaryColour }}</h3>
      </div>
      <div class="b_contrast__colour">
        <div
          class="b_contrast__sample b_contrast__sample--secondary"
          :style="{ backgroundColor: activeColour2 }"
        ></div>
        <h3 class="b_contrast__colourHex">{{ contrastColour }}</h3>
      </div>
    </div>

    <div class="b_contrast__details">
      <div class="b_contrast__result">
        <component class="b_contrast__icon" :is="ratingIcon"></component>
        <p>
          {{ contrastRating }} <strong>{{ contrastLabel }}</strong>
        </p>
      </div>
    </div>
  </div>

  <!-- APCA card -->
  <div v-else class="b_contrast b_contrast--apca" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <div class="b_contrast__panel">
      <div
        class="b_contrast__panelSample"
        :style="{ backgroundColor: activeColour2, color: activeColour1 }"
      >
        <span class="b_contrast__panelText">AaBbCcDdEeFfGg</span>
      </div>

      <div class="b_contrast__panelDetails">
        <div class="b_contrast__panelHexes">
          <span class="b_contrast__panelHex">{{ primaryColour }}</span>
          <span class="b_contrast__panelOn">on {{ contrastColour }}</span>
        </div>
        <div class="b_contrast__panelMeta">
          <span class="b_contrast__panelLc">Lc {{ displayRatio }}</span>
          <span class="b_contrast__panelUseCase" :class="`b_contrast__panelUseCase--${primaryUseCase.toLowerCase()}`">{{ primaryUseCase }}</span>
        </div>
      </div>
    </div>

    <div class="b_contrast__panelDivider"></div>

    <div class="b_contrast__panel">
      <div
        class="b_contrast__panelSample"
        :style="{ backgroundColor: activeColour1, color: activeColour2 }"
      >
        <span class="b_contrast__panelText">AaBbCcDdEeFfGg</span>
      </div>
      <div class="b_contrast__panelDetails">
        <div class="b_contrast__panelHexes">
          <span class="b_contrast__panelHex">{{ contrastColour }}</span>
          <span class="b_contrast__panelOn">on {{ primaryColour }}</span>
        </div>
        <div class="b_contrast__panelMeta">
          <span class="b_contrast__panelLc">Lc {{ reverseRatio }}</span>
          <span class="b_contrast__panelUseCase" :class="`b_contrast__panelUseCase--${reverseUseCase.toLowerCase()}`">{{ reverseUseCase }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import IconResultPass from "@/components/icons/IconResultPass.vue";
import IconResultPassLarge from "@/components/icons/IconResultPassLarge.vue";
import IconResultFail from "@/components/icons/IconResultFail.vue";
import FormAction from "@/components/FormAction.vue";
import FieldIconPlus from "@/components/icons/FieldIconPlus.vue";
import apcaContrast from "@/composables/calculateAPCAContrast.js";
import calcContrastRatio from "@/composables/calculateColourContrast.js";
import { useColourStore } from "@/stores/colourStore";
const colourStore = useColourStore();

const props = defineProps({
  primaryColour: {
    type: String,
    required: true,
  },
  contrastColour: {
    type: String,
    required: true,
  },
  contrastRatio: {
    type: Number,
    required: true,
  },
});

const isAPCA = computed(() => colourStore.contrastMode === 'apca');

const isHovered = ref(false);

const simulatedPrimary = computed(() =>
  colourStore.simulatedSwatchMap.get(props.primaryColour) ?? props.primaryColour
);
const simulatedContrast = computed(() =>
  colourStore.simulatedSwatchMap.get(props.contrastColour) ?? props.contrastColour
);

const activeColour1 = computed(() => isHovered.value ? props.primaryColour : simulatedPrimary.value);
const activeColour2 = computed(() => isHovered.value ? props.contrastColour : simulatedContrast.value);

const displayRatio = computed(() => {
  if (isAPCA.value) return apcaContrast(activeColour1.value, activeColour2.value);
  return Math.round(calcContrastRatio(activeColour1.value, activeColour2.value) * 100) / 100;
});

const reverseRatio = computed(() =>
  isAPCA.value ? apcaContrast(activeColour2.value, activeColour1.value) : null
);

function getUseCaseLabel(ratio) {
  if (ratio >= colourStore.complianceRatios.max) return 'Body';
  if (ratio >= colourStore.complianceRatios.min) return 'Large';
  return 'Decorative';
}

const primaryUseCase = computed(() => getUseCaseLabel(displayRatio.value));
const reverseUseCase = computed(() =>
  reverseRatio.value !== null ? getUseCaseLabel(reverseRatio.value) : ''
);

const contrastLabel = computed(() =>
  colourStore.contrastMode === 'apca'
    ? `Lc ${displayRatio.value}`
    : `${displayRatio.value}:1`
);

const contrastRating = computed(() => {
  if (displayRatio.value < colourStore.complianceRatios.min) {
    return "Fail";
  } else if (displayRatio.value < colourStore.complianceRatios.max) {
    return "Partial";
  } else {
    return "Pass";
  }
});

const ratingIcon = computed(() => {
  if (displayRatio.value < colourStore.complianceRatios.min) {
    return IconResultFail;
  } else if (displayRatio.value < colourStore.complianceRatios.max) {
    return IconResultPassLarge;
  } else {
    return IconResultPass;
  }
});

function showSample() {
  colourStore.sampleColours = [props.primaryColour, props.contrastColour];
}
</script>

<style lang="scss" scoped>
.b_contrast {
  display: grid;
  justify-items: center;
  gap: 0;
  background: var(--clr-grey-1000);
  border-radius: var(--border-rad-outer);
  box-shadow: var(--shadow-card);
  overflow: hidden;

  &__pair {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    overflow: hidden;
    position: relative;
    padding:8px;
  }

  &__colour {
    display: grid;
    grid-gap: 6px;
    justify-items: center;
    grid-row: 1;
  }

  &__colourHex {
    font: var(--text-code-400);
  }

  &__sample {
    height: 48px;
    width: 100%;
  }

  &__icon {
    width: 24px;
    height: 24px;
    border: 1px solid var(--clr-grey-900);
    border-radius: 50px;
  }

  &__details {
    display: flex;
    gap: var(--size-s);
    margin: 14px 0 8px;
  }

  &__result {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 4px 12px 4px 4px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 45px;
    border: 1px solid rgba(0, 0, 0, 0.2);
  }

  // APCA dual-direction card
  &--apca {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-items: unset;
    position: relative;
  }

  &__panel {
    flex: 1;
    display: grid;
    grid-template-rows: auto auto auto;
    overflow: hidden;
    padding:6px;
  }

  &__panelSample {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding:10px 20px;
  }

  &__panelText {
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
  }

  &__panelDetails {
    display: flex;
    justify-content:center;
    gap:15px;
    padding:10px 20px;
    align-items: center;
  }

  &__panelMeta {
    display: flex;
    align-items: center;
    gap: 8px;
    padding:5px 5px 5px 10px;
    background:var(--clr-grey-800);
    border-radius:4px;
    border:1px solid rgba(0, 0, 0, 0.2);
  }

  &__panelLc {
    font: var(--heading-700);
    font-size: 13px;
    color: var(--clr-grey-200);
  }

  &__panelUseCase {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-radius: var(--border-rad-inner);
    padding: 2px 6px;

    &--body {
      color: #fff;
      background: var(--clr-badge-body);
    }

    &--large {
      color: #fff;
      background: var(--clr-badge-large);
    }

    &--decorative {
      color: #fff;
      background: var(--clr-badge-decorative);
    }
  }

  &__panelHexes {
    display: flex;
    gap: 6px;
    align-items: baseline;
  }

  &__panelHex,
  &__panelOn {
    font: var(--text-code-400);
    font-weight: 700;
    color: var(--clr-grey-200);
  }

  &__panelDivider {
    width: 1px;
    background: var(--clr-grey-800);
    flex-shrink: 0;
  }

  &__panelActions {
    position: absolute;
    top: 8px;
    right: 8px;
  }
}
</style>
