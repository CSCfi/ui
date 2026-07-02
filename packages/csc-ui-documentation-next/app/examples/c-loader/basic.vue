<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <c-button @click="loading = !loading">Toggle loader</c-button>

    <!-- The loader fills the nearest position: relative ancestor -->
    <div style="position: relative; height: 160px; width: 100%">
      <c-loader :visible.prop="loading" contentdelay="1">
        Loading resources
      </c-loader>
    </div>
  </div>
</template>

<script setup lang="ts">
const loading = ref(true);
</script>
