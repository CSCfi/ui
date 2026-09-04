<template>
  <div>
    <c-radio-group
      v-model="plan"
      hint="You can change the plan later"
      label="Subscription plan"
    >
      <div class="plan-option">
        <c-radio value="free">Free</c-radio>
      </div>

      <div class="plan-option">
        <c-radio value="pro">Pro</c-radio>
      </div>

      <div class="plan-option">
        <c-radio value="enterprise">Enterprise</c-radio>
      </div>
    </c-radio-group>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const plan = ref<'free' | 'pro' | 'enterprise'>('free');
</script>

<style>
/* The radios are ordinary light DOM: wrap them in your own layout markup and
   style it with your own CSS. Keep the label text inside the <c-radio> so the
   whole row stays click-associated. */
.plan-option {
  border: 1px solid var(--c-border);
  border-radius: 0.5rem;
  padding: 0 0.75rem;
}
</style>
