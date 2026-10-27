const e=`
import { ref } from 'vue';import { CAlertType, type CRadioGroupItem } from '@cscfi/csc-ui';

const type = ref<CAlertType>(CAlertType.Info);

const types: CRadioGroupItem[] = [
  { value: '', name: 'Default' },
  { value: CAlertType.Info, name: 'Info' },
  { value: CAlertType.Success, name: 'Success' },
  { value: CAlertType.Warning, name: 'Warning' },
  { value: CAlertType.Error, name: 'Error' },
];
`;export{e as default};
