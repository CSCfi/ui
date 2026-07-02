<template>
  <div>
    <c-otp-input
      hint="Enter the 6-digit code we sent you"
      @changeValue="onChange"
    />

    <span>Code: {{ code ?? 'incomplete' }}</span>
  </div>
</template>

<script setup lang="ts">
const code = ref<string | null>(null);

const onChange = (event: Event) => {
  code.value = (event as CustomEvent<string | null>).detail;
};
</script>
