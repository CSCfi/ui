<template>
  <div>
    <c-select
      :value.prop="country"
      clearable
      hint="c-select renders its option list with an internal c-dropdown"
      label="Country"
      placeholder="Choose a country"
      @changeValue="onChange"
    >
      <c-option name="Finland" value="fi">Finland</c-option>
      <c-option name="Sweden" value="se">Sweden</c-option>
      <c-option name="Norway" value="no">Norway</c-option>
      <c-option name="Denmark" value="dk">Denmark</c-option>
    </c-select>
  </div>
</template>

<script setup lang="ts">
const country = ref<string | null>(null);

const onChange = (event: Event) => {
  country.value = (event as CustomEvent<string | null>).detail;
};
</script>
