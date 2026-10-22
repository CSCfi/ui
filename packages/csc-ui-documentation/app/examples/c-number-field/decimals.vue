<template>
  <div>
    <c-number-field
      v-model="price"
      :decimals="2"
      :min="0"
      hint="Up to two decimals"
      label="Price"
      fixed-decimals
    >
      <span slot="post">€</span>
    </c-number-field>

    <p>Value: {{ price ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const price = ref<null | number>(1234.5);
</script>
