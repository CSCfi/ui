<template>
  <div>
    <c-number-field
      v-model="volume"
      :max="100"
      :min="0"
      :step="5"
      hint="0 to 100, in steps of 5"
      label="Volume"
    >
      <span slot="post">%</span>
    </c-number-field>

    <p>Value: {{ volume ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const volume = ref<null | number>(50);
</script>
