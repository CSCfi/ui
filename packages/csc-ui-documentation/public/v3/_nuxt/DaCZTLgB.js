const t=`
import type { CRadioGroupItem, CTabsJustify } from '@cscfi/csc-ui';import { ref } from 'vue';

type Tab = 'tab1' | 'tab2' | 'tab3';

const tab = ref<Tab>('tab1');

const justifyTabs = ref<CTabsJustify>('start');

const options: CRadioGroupItem[] = [
  { value: 'start', name: 'Start' },
  { value: 'center', name: 'Center' },
  { value: 'end', name: 'End' },
  { value: 'stretch', name: 'Stretch' },
];
`;export{t as default};
