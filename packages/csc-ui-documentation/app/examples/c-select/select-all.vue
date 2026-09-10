<template>
  <div>
    <!-- `select-all` pins a row at the top of the list that picks every
         enabled option, or unpicks them all once they are all picked. Its
         checkbox reads none, some or all; the disabled option is left alone. -->
    <c-select
      v-model="countries"
      clearable
      hint="Pick some, or all at once"
      label="Countries"
      max-tags="3"
      multiple
      select-all
    >
      <c-option name="Finland" value="fi">Finland</c-option>

      <c-option name="Sweden" value="se">Sweden</c-option>

      <c-option name="Norway" value="no">Norway</c-option>

      <c-option name="Denmark" value="dk">Denmark</c-option>

      <c-option name="Iceland" value="is">Iceland</c-option>

      <c-option name="Faroe Islands" value="fo" disabled>
        Faroe Islands
      </c-option>
    </c-select>

    <p>Value: {{ countries.length ? countries.join(', ') : '[]' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const countries = ref<string[]>(['fi']);
</script>
