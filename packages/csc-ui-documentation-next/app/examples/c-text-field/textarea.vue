<template>
  <div>
    <c-text-field
      v-model="description"
      hint="A rows value above 1 renders a textarea"
      label="Description"
      rows="4"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const description = ref('');
</script>
