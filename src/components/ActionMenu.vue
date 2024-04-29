<template>
  <div class="b_actionMenu">
    <div class="b_actionMenu__toggle">
      <FormAction buttonType="icon" :onClick="toggleMenu">
        <IconActionToggle></IconActionToggle>
      </FormAction>
    </div>
    <div class="b_actionMenu__menu" v-if="isOpen">MENU</div>
  </div>
</template>

<script setup>
// Imports
import { reactive, computed, ref } from "vue";
import FormAction from "@/components/FormAction.vue";
import IconActionToggle from "./icons/IconActionToggle.vue";

// Data
const state = reactive({
  isOpen: false,
});

const toggleMenu = function () {
  state.isOpen = !state.isOpen;
};

const isOpen = computed(() => {
  return state.isOpen;
});

// Functions
// function functionName(){}
</script>

<style lang="scss" scoped>
.b_actionMenu {
  position: relative;

  &__toggle {
    --formAction-background: var(--clr-grey-1000);
    --formAction-background-hov: var(--clr-grey-900);
    --b-iconActionToggle-fill: var(--clr-grey-600);
  }

  &__menu {
    position: absolute;
    right: 0;
    bottom: 0;
    transform: translateY(calc(100% + 5px));
    z-index: 110;
    background: red;
    padding: 15px;
  }
}
</style>
