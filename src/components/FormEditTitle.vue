<template>
  <div class="b_titleForm">
    <div class="b_titleForm__field">
      <FormFieldText
        placeholder="Add a title for your colour palette..."
        v-model="colourStore.paletteTitle"
        id="titleField"
        label="This palette is"
        :showLabel="true"
        @keyup="submitForm"
      ></FormFieldText>
    </div>
  </div>
</template>

<script setup>
// Imports
import { computed } from "vue";
import FormFieldText from "@/components/FormFieldText.vue";

import { useColourStore } from "@/stores/colourStore";
const colourStore = useColourStore();

const formDisabled = computed(() => {
  return colourStore.isTitleUnchanged;
});

const submitForm = async () => {
  if (!formDisabled.value) {
    colourStore.updatePaletteTitle();
  }
};

// Functions
// function functionName(){}
</script>

<style lang="scss" scoped>
.b_titleForm {
  --text-field-back: transparent;
  --text-field-size: var(--heading-1000);
  --text-field-pd: 0;
  --form-field-border-clr: transparent;
  --form-field-min-width: 400px;
  --formAction-font: var(--body-300);
  --formAction-padding: 0.4em 0.65em;

  display: flex;
  flex-direction: column;
  gap: 10px;

  &__field {
    flex: 1 1 100%;
    order: 2;
  }

  &__action {
    order: 3;
  }
}
</style>
