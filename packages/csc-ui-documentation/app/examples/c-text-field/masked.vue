<template>
  <div>
    <c-text-field
      v-model="phone"
      hint="5–12 digits after the country code"
      label="Phone"
      mask="+358 #####[#######]"
      type="tel"
    />

    <p>Value: {{ phone }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const phone = ref('');
</script>
