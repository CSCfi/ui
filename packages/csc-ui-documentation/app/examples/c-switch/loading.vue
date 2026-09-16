<template>
  <div class="example-grid">
    <c-switch
      :disabled="pending"
      :loading="pending"
      :value="enabled"
      @change-value="onToggle"
    >
      Sync to cloud
    </c-switch>

    <p>{{ pending ? 'Saving…' : `Value: ${enabled}` }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const enabled = ref(false);

const pending = ref(false);

// Simulated round trip: `loading` shows the spinner in place of the handle
// and `disabled` refuses further input until the server has answered.
// `loading` alone does not block clicks.
const onToggle = (event: CustomEvent<boolean>) => {
  pending.value = true;

  window.setTimeout(() => {
    enabled.value = event.detail;
    pending.value = false;
  }, 1500);
};
</script>
