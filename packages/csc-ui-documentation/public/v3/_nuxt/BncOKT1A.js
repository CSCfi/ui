const e=`
import { ref } from 'vue';import { CToastType } from '@cscfi/csc-ui';

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
`;export{e as default};
