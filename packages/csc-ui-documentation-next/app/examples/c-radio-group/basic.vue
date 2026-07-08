<template>
  <div>
    <c-radio-group
      :value="plan"
      hint="You can change the plan later"
      label="Subscription plan"
      @change-value="onChange"
    >
      <c-radio value="free">Free</c-radio>

      <c-radio value="pro">Pro</c-radio>

      <c-radio value="enterprise">Enterprise</c-radio>
    </c-radio-group>
  </div>
</template>

<script setup lang="ts">
const plan = ref('free');

const onChange = (event: Event) => {
  plan.value = (event as CustomEvent<string>).detail;
};
</script>
