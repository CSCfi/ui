
/**
 * Examples for CAlert.vue.
 * Automatically generated at 10/2/2023, 2:21:28 PM.
 *
 * ⚠️ DO NOT EDIT THESE MANUALLY AS THEY WILL BE OVERWRITTEN IN THE NEXT BUILD!
 */
export const basic = `import { CAlertType, CRadioGroupItem } from '@cscfi/csc-ui';

const type = ref<CAlertType>(CAlertType.Info);

const types: CRadioGroupItem[] = [
  { value: '', label: 'Default' },
  { value: CAlertType.Info, label: 'Info' },
  { value: CAlertType.Success, label: 'Success' },
  { value: CAlertType.Warning, label: 'Warning' },
  { value: CAlertType.Error, label: 'Error' },
];
`;

