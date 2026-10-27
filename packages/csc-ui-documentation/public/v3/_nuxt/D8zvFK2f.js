const e=`
import { type CSelectItem, type CToastMessage, CToastType } from '@cscfi/csc-ui';import { ref } from 'vue';

const toasts = ref<HTMLCToastsElement | null>(null);

const custom = ref(false);

const title = ref('');

const messageText = ref('A toast message');

const closeText = ref('');

const customContent = ref('');

const type = ref('info');

const duration = ref(6000);

const types: CSelectItem[] = [
  { name: 'Info', value: 'info' },
  { name: 'Success', value: 'success' },
  { name: 'Warning', value: 'warning' },
  { name: 'Error', value: 'error' },
];

const absolute = ref(false);

const persistent = ref(false);

const progress = ref(false);

const verticalOptions: CSelectItem[] = [
  { name: 'Top', value: 'top' },
  { name: 'Bottom', value: 'bottom' },
];

const vertical = ref('bottom');

const horizontalOptions: CSelectItem[] = [
  { name: 'Left', value: 'left' },
  { name: 'Center', value: 'center' },
  { name: 'Right', value: 'right' },
];

const horizontal = ref('right');

const onAddToast = () => {
  const message: CToastMessage = {
    type: type.value as CToastType,
    title: title.value,
    duration: duration.value,
    message: messageText.value,
    persistent: persistent.value,
    progress: progress.value,
    closeText: closeText.value,
  };

  toasts.value?.addToast(message);
};
`;export{e as default};
