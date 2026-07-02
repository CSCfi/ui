<template>
  <div class="example-row">
    <c-button @click="visible = true">Show backdrop</c-button>

    <c-backdrop v-if="visible" class="demo-backdrop" @click="visible = false" />
  </div>
</template>

<script setup lang="ts">
const visible = ref(false);
</script>

<style scoped>
/* c-backdrop is normally faded in and out by c-modal; reveal it for this
   demo and let a click on it dismiss it. */
.demo-backdrop::part(root) {
  opacity: 1;
  pointer-events: auto;
}
</style>
