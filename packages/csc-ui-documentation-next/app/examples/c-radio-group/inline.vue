<template>
  <div>
    <c-radio-group
      v-model="frequency"
      hide-details
      inline
      label="Email frequency"
    >
      <c-radio value="daily">Daily</c-radio>

      <c-radio value="weekly">Weekly</c-radio>

      <c-radio value="never">Never</c-radio>
    </c-radio-group>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const frequency = ref('weekly');
</script>
