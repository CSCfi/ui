<template>
  <div>
    <c-text-field
      :value="description"
      hint="A rows value above 1 renders a textarea"
      label="Description"
      rows="4"
      @change-value="onChange"
    />
  </div>
</template>

<script setup lang="ts">
const description = ref('');

const onChange = (event: Event) => {
  description.value = (event as CustomEvent<string>).detail;
};
</script>
