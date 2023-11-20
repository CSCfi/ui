<template>
  <component-example name="manual" rows>
    <template #title>Manual submitting</template>

    <div>
      <c-otp-input
        id="manual-submit-example"
        v-model="otp"
        v-control
        hint="Please enter your one time password"
        :length="5"
        :valid="isValid"
        :validation="errorMessage"
      />

      <c-button
        @click="onManualCompletion()"
        @keyup.enter="onManualCompletion()"
      >
        Submit
      </c-button>
    </div>

    <teleport to="body">
      <c-toasts ref="toasts" vertical="bottom" />
    </teleport>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CToastType } from '@cscfi/csc-ui';

const toasts = ref<HTMLCToastsElement | null>(null);

const otp = ref('');
const errorMessage = ref('');
const isValid = ref(true);

const onManualCompletion = () => {
  if (!otp.value) {
    errorMessage.value = 'Invalid OTP';
    isValid.value = false;

    toasts.value?.addToast({
      message: 'Invalid OTP',
      type: CToastType.Error,
      progress: true,
    });

    return;
  }

  errorMessage.value = '';
  isValid.value = true;

  toasts.value?.addToast({
    message: 'OTP: ' + otp.value,
    type: CToastType.Success,
    progress: true,
  });
};
</script>
