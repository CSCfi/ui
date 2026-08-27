<template>
  <div>
    <c-select v-model="country" label="Country" size="small">
      <c-option name="Finland" value="fi">Finland</c-option>

      <c-option name="Sweden" value="se">Sweden</c-option>

      <c-option name="Norway" value="no">Norway</c-option>
    </c-select>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const country = ref<string | null>('fi');
</script>
