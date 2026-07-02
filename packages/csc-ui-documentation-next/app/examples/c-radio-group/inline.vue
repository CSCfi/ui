<template>
  <div>
    <c-radio-group
      :value="frequency"
      hide-details
      inline
      label="Email frequency"
      @changeValue="onChange"
    >
      <c-radio value="daily">Daily</c-radio>
      <c-radio value="weekly">Weekly</c-radio>
      <c-radio value="never">Never</c-radio>
    </c-radio-group>
  </div>
</template>

<script setup lang="ts">
const frequency = ref('weekly');

const onChange = (event: Event) => {
  frequency.value = (event as CustomEvent<string>).detail;
};
</script>
