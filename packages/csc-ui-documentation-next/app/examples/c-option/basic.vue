<template>
  <div>
    <c-select
      :value.prop="country"
      clearable
      hint="Each c-option provides a name and a value"
      label="Country"
      placeholder="Choose a country"
      @change-value="onChange"
    >
      <c-option name="Finland" value="fi">Finland</c-option>

      <c-option name="Sweden" value="se">Sweden</c-option>

      <c-option name="Norway" value="no">Norway</c-option>

      <c-option name="Denmark" value="dk" disabled>Denmark</c-option>
    </c-select>

    <span>Value: {{ country ?? 'null' }}</span>
  </div>
</template>

<script setup lang="ts">
const country = ref<string | null>(null);

const onChange = (event: Event) => {
  country.value = (event as CustomEvent<string | null>).detail;
};
</script>
