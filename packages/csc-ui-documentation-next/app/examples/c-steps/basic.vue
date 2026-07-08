<template>
  <div>
    <c-steps v-model="step">
      <c-step>Choose resources</c-step>

      <c-step>Billing details</c-step>

      <c-step>Review</c-step>

      <c-step>Confirmation</c-step>
    </c-steps>

    <div class="example-row">
      <c-button outlined :disabled.prop="step === 1" @click="step--">
        Previous
      </c-button>

      <c-button :disabled.prop="step === 5" @click="step++">Next</c-button>
    </div>
  </div>
</template>

<script setup lang="ts">
const step = ref(1);
</script>
