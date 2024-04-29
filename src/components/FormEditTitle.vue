<template>
  <div class="b_titleForm">
    <div class="b_titleForm__field">
      <FormFieldText
        placeholder="Add a title for your colour palette..."
        v-model="colourStore.listTitle"
        id="titleField"
        label="This palette is"
        showLabel="true"
        @keyup="submitForm"
      ></FormFieldText>
    </div>
    <!-- <div class="b_titleForm__action">
      <FormAction
        buttonLabel="Update title"
        :onClick="submitForm"
        :status="formMode"
        buttonMode="submit"
        :isDisabled="formDisabled"
      ></FormAction>
    </div> -->
  </div>
</template>

<script setup>
// Imports
import { reactive, computed, ref, onMounted } from "vue";
import FormFieldText from "@/components/FormFieldText.vue";
//import FormAction from "@/components/FormAction.vue";

import { useColourStore } from "@/stores/colourStore";
const colourStore = useColourStore();

const state = reactive({
  titleValue: "",
  formMode: "default",
});

const formDisabled = computed(() => {
  return colourStore.isTitleUpdated;
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
