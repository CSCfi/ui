<template>
  <component-example name="status" rows>
    <template #title>Hint and error state</template>

    <c-text-field
      label="Hint and error "
      hint="This is a hint messsage"
      :valid="!hasErrors"
      validation="This is an error message"
      required
    />

    <c-switch v-model="hasErrors" v-control>Toggle error status</c-switch>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const hasErrors = ref(false);
</script>
