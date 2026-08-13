<template>
  <div class="example-grid">
    <c-switch v-model="enabled">Notifications</c-switch>

    <p>Value: {{ enabled }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const enabled = ref(false);
</script>
