<template>
  <header class="b_pageHeader">
    <div class="b_pageHeader__inner">
      <div class="b_pageHeader__title u_row">
        <figure class="b_pageHeader__logo u_resMedia">
          <GoodLogo></GoodLogo>
        </figure>
        <h2 class="b_pageHeader__titleName">Colour Palette Contrast Checker</h2>
      </div>
    </div>
  </header>
</template>

<script setup>
// Imports
import GoodLogo from "@/components/icons/IconGoodLogo.vue";
</script>

<style lang="scss" scoped>
.b_pageHeader {
  grid-column: 1/-1;
  grid-row: 1;
  background: var(--clr-grey-000);
  gap: var(--size-small);
  position: relative;
  z-index: 110;
  border-right: 1px solid var(--clr-border);

  &__inner {
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: var(--size-large);
  }

  &__title {
    align-items: center;
    padding: calc(var(--main-spacing) / 1.5) var(--main-spacing)
      calc(var(--main-spacing) / 1.5);
  }

  &__logo {
    padding-inline-end: var(--size-medium);
    align-items: center;
    max-width: 80px;
  }

  &__titleName {
    color: var(--clr-grey-1000);
    font-weight: 500;
    font-size: 24px;
  }

  :deep([fill]) {
    fill: var(--clr-grey-1000);
  }
}
</style>
