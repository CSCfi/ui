<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

    <p>Automatic submitting</p>

    <c-otp-input
      id="basic-otp-example"
      v-model="otp1"
      v-control
      hint="Please enter your one time password"
      @completion="onComplete($event)"
    />

    <p>Manual submitting</p>

    <div>
      <c-otp-input
        id="basic-otp-example"
        v-model="otp2"
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
      <c-toasts ref="toasts" />
    </teleport>
  </component-example>
</template>

<script setup lang="ts">
// @example-start|basic
import { ref } from 'vue';
import { CToastType } from '@cscfi/csc-ui';

const toasts = ref<HTMLCToastsElement | null>(null);

const otp1 = ref('');

const onComplete = (event: CustomEvent) => {
  toasts.value?.addToast({
    message: `OTP: ${event.detail}`,
    duration: 3000,
    type: CToastType.Success,
  });
};

const otp2 = ref('');
const errorMessage = ref('');
const isValid = ref(true);

const onManualCompletion = () => {
  if (!otp2.value) {
    errorMessage.value = 'Invalid OTP';
    isValid.value = false;

    toasts.value?.addToast({
      message: 'Invalid OTP',
      type: CToastType.Error,
    });

    return;
  }

  errorMessage.value = '';
  isValid.value = true;

  toasts.value?.addToast({
    message: `OTP: ${otp2.value}`,
    type: CToastType.Success,
  });
};
// @example-end
</script>

<style lang="scss"></style>
