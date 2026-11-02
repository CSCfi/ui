const t=`
import { ref } from 'vue';import { mdiEmail, mdiHome, mdiPhone } from '@mdi/js';
import { CToastType } from '@cscfi/csc-ui';

const toasts = ref<HTMLCToastsElement | null>(null);

const onItemClick = (title: string) => {
  toasts.value?.addToast({
    message: 'Item "' + title + '" was clicked',
    duration: 3000,
    type: CToastType.Success,
  });
};
`;export{t as default};
