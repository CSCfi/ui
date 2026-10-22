<template>
  <div>
    <c-number-field v-model="count" hint="A whole number" label="Population" />

    <p>Value: {{ count ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const count = ref<null | number>(null);
</script>
