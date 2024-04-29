<template>
  <div class="b_page">
    <ThePageHeader></ThePageHeader>
    <section class="b_page__title">
      <PaletteSelector></PaletteSelector>
      <PaletteTitle></PaletteTitle>
    </section>
    <section class="b_page__list">
      <div class="b_page__listInner">
        <FormAddColourVue></FormAddColourVue>
        <SwatchList></SwatchList>
        <PaletteControls></PaletteControls>
      </div>
    </section>
    <main class="b_page__content">
      <ComplianceModeToggle></ComplianceModeToggle>
      <CombinationsList></CombinationsList>
    </main>
    <SampleModal></SampleModal>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import ThePageHeader from "@/components/ThePageHeader.vue";
import FormAddColourVue from "@/components/FormAddColour.vue";
import PaletteSelector from "@/components/PaletteSelector.vue";
import SwatchList from "@/components/SwatchList.vue";
import CombinationsList from "@/components/CombinationsList.vue";
import PaletteTitle from "@/components/PaletteTitle.vue";
import PaletteControls from "@/components/PaletteControls.vue";
import ComplianceModeToggle from "@/components/ComplianceModeToggle.vue";
import SampleModal from "@/components/SampleModal.vue";
import { useColourStore } from "@/stores/colourStore";

const colourStore = useColourStore();

onMounted(() => {
  colourStore.loadPaletteFromQueryString();
  colourStore.loadPalettesFromLocalStorage();
});
</script>

<style lang="scss">
body {
  font-family: var(--fontFamily-base);
  font-weight: 400;
  padding: 0;
  margin: 0;
  color: var(--clr-text-body);
  background: var(--clr-theme-background-light);
}

.b_page {
  display: grid;
  grid-template-columns: 340px 1fr;
  grid-template-rows: auto auto 1fr;
  gap: var(--size-m);
  min-height: 100vh;
  padding-block-end: var(--size-m);

  &__title {
    //background: var(--clr-grey-900);
    grid-column: 1 / -1;
    grid-row: 2;
    display: flex;
    justify-content: space-between;
    gap: var(--size-large);
    align-items: center;
    padding: calc(var(--main-spacing) / 2) var(--main-spacing);
  }

  &__list {
    background: var(--clr-grey-900);
    grid-column: 1;
    grid-row: 3;
    border-radius: 0 var(--size-s) var(--size-s) 0;
    position: relative;
    z-index: 1000;
  }

  &__listInner {
    position: sticky;
    top: 0;
    overflow-y: auto;
    max-height: calc(100vh - 20px);
  }

  &__content {
    background: var(--clr-grey-900);
    grid-column: 2;
    grid-row: 3;
    border-radius: var(--size-s) 0 0 var(--size-s);
  }
}
</style>
