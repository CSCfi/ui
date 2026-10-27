const t=`
import { ref } from 'vue';import { CToastType } from '@cscfi/csc-ui';

const toasts = ref<HTMLCToastsElement | null>(null);

const otp = ref('');

const onComplete = (event: CustomEvent) => {
  toasts.value?.addToast({
    message: 'OTP: ' + event.detail,
    duration: 3000,
    type: CToastType.Success,
  });
};
`;export{t as default};
