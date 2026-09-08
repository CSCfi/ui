<template>
  <div>
    <!-- In multiple mode the value is an array in pick order. Picked options
         show as tags inside the field; `max-tags` folds the rest into one
         "+N more" tag. Backspace in the closed field removes the last tag. -->
    <c-select
      v-model="countries"
      clearable
      hint="Pick as many as you like"
      label="Countries"
      max-tags="3"
      multiple
    >
      <c-option name="Finland" value="fi">Finland</c-option>

      <c-option name="Sweden" value="se">Sweden</c-option>

      <c-option name="Norway" value="no">Norway</c-option>

      <c-option name="Denmark" value="dk">Denmark</c-option>

      <c-option name="Iceland" value="is">Iceland</c-option>

      <c-option name="Estonia" value="ee">Estonia</c-option>
    </c-select>

    <p>Value: {{ countries.length ? countries.join(', ') : '[]' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const countries = ref<string[]>(['fi', 'se']);
</script>
