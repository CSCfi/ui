<template>
  <div class="example-grid">
    <c-switch v-model="enabled">Notifications</c-switch>

    <span>Value: {{ enabled }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const enabled = ref(false);
</script>
