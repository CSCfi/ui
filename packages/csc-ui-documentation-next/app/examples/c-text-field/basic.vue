<template>
  <div>
    <c-text-field
      v-model="name"
      hint="Shown on your public profile"
      label="Display name"
    />

    <span>Value: {{ name }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const name = ref('');
</script>
