<template>
  <component-example name="manual" rows>
    <template #title>Manual submit and reset</template>

    <div>
      <c-otp-input
        id="manual-submit-example"
        ref="otpInput"
        v-model="otp"
        v-control
        hint="Please enter your one time password"
        :length="5"
        :valid="isValid"
        :validation="errorMessage"
      />

      <c-row gap="8">
        <c-button outlined @click="onReset()" @keyup.enter="onReset()">
          Reset
        </c-button>

        <c-button
          @click="onManualCompletion()"
          @keyup.enter="onManualCompletion()"
        >
          Submit
        </c-button>
      </c-row>
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

const otpInput = ref<HTMLCOtpInputElement | null>(null);

const otp = ref('');
const errorMessage = ref('');
const isValid = ref(true);

const onReset = () => {
  otpInput.value?.reset();
};

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
