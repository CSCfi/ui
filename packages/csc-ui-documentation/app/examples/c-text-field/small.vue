<template>
  <div style="display: flex; align-items: flex-start; gap: 16px">
    <c-text-field v-model="query" label="Search" size="small" />

    <c-button size="small">Search</c-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const query = ref('');
</script>
