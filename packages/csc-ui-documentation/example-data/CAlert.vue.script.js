
/**
 * Examples for CAlert.vue.
 * Automatically generated at 10/2/2023, 8:59:00 AM.
 *
 * ⚠️ DO NOT EDIT THESE MANUALLY AS THEY WILL BE OVERWRITTEN IN THE NEXT BUILD!
 */
export const basic = `import { CAlertType, CRadioGroupItem } from 'csc-ui';

const type = ref<CAlertType>(CAlertType.Info);

const types: CRadioGroupItem[] = [
  { value: '', label: 'Default' },
  { value: CAlertType.Info, label: 'Info' },
  { value: CAlertType.Success, label: 'Success' },
  { value: CAlertType.Warning, label: 'Warning' },
  { value: CAlertType.Error, label: 'Error' },
];
`;

