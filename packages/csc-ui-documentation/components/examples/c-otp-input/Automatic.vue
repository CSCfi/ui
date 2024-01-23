<template>
  <component-example name="automatic" rows>
    <template #title>Automatic submit</template>

    <c-otp-input
      id="automatic-submit-example"
      v-model="otp"
      v-control
      hint="Please enter your one time password"
      @completion="onComplete($event)"
    />

    <teleport to="body">
      <c-toasts ref="toasts" vertical="top" />
    </teleport>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CToastType } from '@cscfi/csc-ui';

const toasts = ref<HTMLCToastsElement | null>(null);

const otp = ref('');

const onComplete = (event: CustomEvent) => {
  toasts.value?.addToast({
    message: 'OTP: ' + event.detail,
    duration: 3000,
    type: CToastType.Success,
  });
};
</script>
