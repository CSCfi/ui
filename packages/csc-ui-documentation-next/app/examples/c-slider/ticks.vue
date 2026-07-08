<template>
  <div>
    <c-slider
      :value.prop="cores"
      label="CPU cores"
      labels
      max="8"
      min="0"
      segments="8"
      step="1"
      ticks
      unit=""
      @change-value="onChange"
    />
  </div>
</template>

<script setup lang="ts">
const cores = ref(2);

const onChange = (event: Event) => {
  cores.value = (event as CustomEvent<number>).detail;
};
</script>
