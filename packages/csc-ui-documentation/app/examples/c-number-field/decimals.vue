<template>
  <div>
    <c-number-field
      v-model="price"
      :decimals="2"
      :min="0"
      fixed-decimals
      hint="Up to two decimals"
      label="Price"
    >
      <span slot="post">€</span>
    </c-number-field>

    <p>Value: {{ price ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const price = ref<number | null>(1234.5);
</script>
