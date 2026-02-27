<template>
  <svg
    class="b_iconActionToggle b_icon"
    width="5"
    height="21"
    viewBox="0 0 5 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="2.5" cy="10.5" r="2.5" fill="#343434" />
    <circle cx="2.5" cy="2.5" r="2.5" fill="#343434" />
    <circle cx="2.5" cy="18.5" r="2.5" fill="#343434" />
  </svg>
</template>

<style lang="scss" scoped>
.b_icon {
  max-width: var(--b-icon-max-width);
  max-height: var(--b-icon-max-height);
}

.b_iconActionToggle {
  [fill] {
    fill: var(--b-iconActionToggle-fill);
  }
}
</style>
