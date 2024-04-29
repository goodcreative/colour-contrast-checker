<template>
  <div class="b_contrast">
    <div class="b_contrast__pair">
      <div class="b_contrast__colour">
        <div
          class="b_contrast__sample--primary b_contrast__sample"
          :style="{ backgroundColor: primaryColour }"
        ></div>
        <h3 class="b_contrast__colourHex">{{ primaryColour }}</h3>
      </div>
      <div class="b_contrast__colour">
        <div
          class="b_contrast__sample--secondary b_contrast__sample"
          :style="{ backgroundColor: contrastColour }"
        ></div>
        <h3 class="b_contrast__colourHex">{{ contrastColour }}</h3>
      </div>
    </div>

    <div class="b_contrast__details">
      <div class="b_contrast__result">
        <component class="b_contrast__icon" :is="ratingIcon"></component>
        <p>
          {{ contrastRating }} <strong>{{ contrastRatio }}</strong>
        </p>
      </div>

      <FormAction
        @click.prevent="showSample"
        :status="formMode"
        buttonMode="utility"
        buttonType="icon"
        ><FieldIconPlus></FieldIconPlus>
      </FormAction>
    </div>
  </div>
</template>

<script setup>
// Imports
import { computed } from "vue";
import IconResultPass from "@/components/icons/IconResultPass.vue";
import IconResultPassLarge from "@/components/icons/IconResultPassLarge.vue";
import IconResultFail from "@/components/icons/IconResultFail.vue";
import FormAction from "@/components/FormAction.vue";
import FieldIconPlus from "@/components/icons/FieldIconPlus.vue";
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

const contrastRating = computed(() => {
  if (props.contrastRatio < 3) {
    return "Fail";
  } else if (
    props.contrastRatio >= colourStore.complianceRatios.min &&
    props.contrastRatio < colourStore.complianceRatios.max
  ) {
    return "Partial";
  } else {
    return "Pass";
  }
});

const ratingIcon = computed(() => {
  if (props.contrastRatio < 3) {
    return IconResultFail;
  } else if (
    props.contrastRatio >= colourStore.complianceRatios.min &&
    props.contrastRatio < colourStore.complianceRatios.max
  ) {
    return IconResultPassLarge;
  } else {
    return IconResultPass;
  }
});

function showSample() {
  const sampleColourArray = [];
  sampleColourArray.push(props.primaryColour);
  sampleColourArray.push(props.contrastColour);

  colourStore.sampleColoursGetSet = sampleColourArray;
}

// Functions
// function functionName(){}
</script>

<style lang="scss" scoped>
.b_contrast {
  display: grid;
  justify-items: center;
  gap: 0;
  /* padding: 4px; */
  background: var(--clr-grey-1000);
  /* border: 3px solid #ccc; */
  border-radius: var(--border-rad-small);
  box-shadow: var(--shadow-card);
  overflow: hidden;

  $self: &;

  &__pair {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    /* border-radius: 8px; */
    overflow: hidden;
    position: relative;
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
    height: 60px;
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
    margin: 20px 0 10px;
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

  &__sampleAction {
    border: none;
    background: var(--clr-grey-1000);
    grid-row: 1;
    grid-column: 1 / -1;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
