<template>
  <div>
    <c-radio-group
      v-model="plan"
      hint="You can change the plan later"
      label="Subscription plan"
    >
      <c-radio value="free">Free</c-radio>

      <c-radio value="pro">Pro</c-radio>

      <c-radio value="enterprise">Enterprise</c-radio>
    </c-radio-group>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const plan = ref('free');
</script>
