<template>
  <div>
    <c-otp-input
      v-model="code"
      label="OTP"
      hint="Enter the 6-digit code we sent you"
    />

    <span>Code: {{ code ?? 'incomplete' }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const code = ref<string>();
</script>
