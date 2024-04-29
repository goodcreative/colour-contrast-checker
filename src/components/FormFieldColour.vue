<template>
  <div
    class="b_colourPicker"
    :class="{
      [`b_colourPicker--${fieldStatus}`]: status,
      [`b_colourPicker--icon`]: icon,
    }"
  >
    <div class="b_colourPicker__field">
      <input
        type="color"
        :id="id"
        class="b_colourPicker__input"
        v-model="state.colourValue"
        @input="updateValue"
      />
      <label class="b_colourPicker__label" :for="id"> {{ labelText }}</label>
    </div>
  </div>
</template>

<script setup>
// Imports
import { computed, reactive, onMounted } from "vue";

const state = reactive({
  colourValue: "#ffffff",
});

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
    required: false,
  },
  label: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: false,
  },
  placeholder: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: false,
  },
  showLabel: {
    type: Boolean,
    required: false,
    default: false,
  },
  mode: {
    type: String,
    required: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const updateValue = (event) => {
  state.colourValue = event.target.value;

  // if (fieldText.charAt(0) === "#" && props.mode === "hex") {
  //   fieldText = fieldText.substring(1);
  // }

  emit("update:modelValue", state.colourValue);
};

const labelText = computed(() => {
  return state.colourValue;
});

const fieldStatus = computed(() => {
  if (props.modelValue && props.status == "error") {
    return "error";
  } else {
    return "noError";
  }
});

// Functions
// function functionName(){}
</script>

<style lang="scss" scoped>
.b_colourPicker {
  $self: &;
  display: grid;
  grid-gap: var(--size-xsmall);

  ::placeholder {
    color: #999;
  }

  &__label {
    display: block;
  }

  &__label {
    font: var(--text-label-font, var(--heading-700));
    font-weight: 500;
    color: var(--clr-grey-100);
    display: var(--form-field-label-display, block);
    text-transform: uppercase;

    &:empty {
      display: none;
    }
  }

  &__field {
    border: 1px solid
      var(--form-field-border-clr, var(--clr-form-field-border));
    border-radius: var(--border-rad-outer);
    overflow: hidden;
    display: flex;
    gap: 12px;
    align-items: center;
    min-width: var(--form-field-min-width, auto);
  }

  &__fieldIcon,
  &__input {
    background-color: var(
      --form-field-background-clr,
      var(--clr-grey-1000)
    );
  }

  &__fieldIcon {
    display: flex;
    justify-items: center;
    align-items: center;
    padding: 4px 8px;
  }

  &__input {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 48px;
    height: 48px;
    font: var(--text-field-size, var(--text-code-400));
    outline: none;
    padding: 0;
    border: none;
    position: relative;
    border-radius: 50%;

    &::-webkit-color-swatch {
      border-radius: 50%;
      border: none;
      padding: 0;
      position: absolute;
      top: 4px;
      left: 4px;
      bottom: 4px;
      right: 4px;
      border: var(--swatch-sample-border-width, 1px) solid
        var(--swatch-sample-border-clr, rgba(0, 0, 0, 0.2));
    }

    &::-moz-color-swatch {
      border-radius: 50%;
      border: none;
      padding: 0;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      border: var(--swatch-sample-border-width, 1px) solid
        var(--swatch-sample-border-clr, rgba(0, 0, 0, 0.2));
    }
  }

  &--error {
    #{ $self }__field {
      border-color: var(--form-field-error-clr, var(--clr-red-400));
    }
  }

  &--icon {
    #{ $self }__fieldIcon {
      :deep([fill]) {
        fill: var(--form-field-icon-clr, var(--clr-grey-100));
      }
    }
  }
}
</style>
