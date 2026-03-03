<template>
  <div class="b_colourPreview" :style="{ backgroundColor: colourHex }"></div>
</template>

<script setup>
const props = defineProps({
  colourHex: {
    type: String,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.b_colourPreview {
  width: 20px;
  height: 20px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 50%;
}
</style>
