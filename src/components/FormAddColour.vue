<template>
  <div class="b_addColour">
    <form action="" class="b_addColour__form u_flow" @keyup="createPreview">
      <h3 class="b_addColour__title">Pick a colour</h3>

      <fieldset class="b_addColour__fieldset">
        <FormFieldColour
          id="textfield"
          label="Add Colour Hex"
          icon="hex"
          :status="formMode"
          v-model="state.colourValue"
        ></FormFieldColour>
        <FormAction
          :onClick="submitForm"
          buttonLabel="Add"
          :status="formMode"
          buttonMode="submit"
          ><FieldIconPlus></FieldIconPlus>
        </FormAction>
      </fieldset>
    </form>
  </div>
</template>

<script setup>
// Imports
import { reactive, computed } from "vue";
import FormFieldColour from "@/components/FormFieldColour.vue";
import FormAction from "@/components/FormAction.vue";
import FieldIconPlus from "@/components/icons/FieldIconPlus.vue";
import { useColourStore } from "@/stores/colourStore";

const colourStore = useColourStore();

// Data
const state = reactive({
  colourValue: "#FFFFFF",
  formMode: "default",
});

const formMode = computed(() => {
  return state.formMode;
});

const submitForm = async () => {
  let colourHex = state.colourValue;
  colourStore.addColour(colourHex.toUpperCase());
  state.formMode = "default";
};

// Functions
// function functionName(){}
</script>

<style lang="scss" scoped>
.b_addColour {
  padding: calc(var(--main-spacing) * 1) var(--main-spacing)
    calc(var(--main-spacing) / 2);

  &__form {
    --form-field-border-clr: transparent;
    --text-label-font: var(--text-code-400);
    --form-field-error-clr: transparent;
    --form-field-icon-clr: var(--clr-grey-100);
  }

  &__title {
    padding: 1px 5px 5px;
  }

  &__fieldset {
    --flow-space: 7px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    max-width: 400px;
    margin: 0;
    border: none;
    border-radius: 28px var(--border-rad-outer)
      var(--border-rad-outer) 28px;
    background-color: var(--clr-grey-1000);
    padding: 4px 12px 4px 4px;
    box-shadow: var(--shadow-card);
  }

  &__preview {
    flex: 0 0 30px;
    width: 30px;
    height: 30px;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2);
    border-radius: 50%;
  }
}
</style>
