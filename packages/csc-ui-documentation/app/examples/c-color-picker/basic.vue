<template>
  <div>
    <c-color-picker
      v-model="color"
      hint="Type any CSS colour or open the picker"
      label="Colour"
      clearable
    />

    <p>Value: {{ color ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const color = ref<null | string>('#1f6feb');
</script>
