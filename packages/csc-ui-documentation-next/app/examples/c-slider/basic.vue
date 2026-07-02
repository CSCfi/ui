<template>
  <div>
    <c-slider :value.prop="volume" label="Volume" @changeValue="onChange" />

    <span>Value: {{ volume }} %</span>
  </div>
</template>

<script setup lang="ts">
const volume = ref(40);

const onChange = (event: Event) => {
  volume.value = (event as CustomEvent<number>).detail;
};
</script>
