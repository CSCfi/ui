<docs>surface: canvas</docs>

<template>
  <div class="example-row">
    <c-button-group v-model="period" label="Billing period">
      <c-button value="monthly">Monthly</c-button>

      <c-button value="yearly">Yearly</c-button>
    </c-button-group>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const period = ref<string | null>('monthly');
</script>
