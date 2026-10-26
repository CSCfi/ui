<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <c-button @click="loading = !loading">Toggle loader</c-button>

    <!-- The loader fills the nearest position: relative ancestor -->
    <div style="position: relative; height: 160px; width: 100%">
      <c-loader :hide="!loading" content-delay="1000">
        Loading resources
      </c-loader>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const loading = ref(true);
</script>
