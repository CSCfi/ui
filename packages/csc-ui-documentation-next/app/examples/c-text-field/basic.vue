<template>
  <div>
    <c-text-field
      :value="name"
      hint="Shown on your public profile"
      label="Display name"
      @change-value="onChange"
    />

    <span>Value: {{ name }}</span>
  </div>
</template>

<script setup lang="ts">
const name = ref('');

const onChange = (event: Event) => {
  name.value = (event as CustomEvent<string>).detail;
};
</script>
