const e=`
import { ref } from 'vue';import { mdiServer } from '@mdi/js';

type Tab = {
  label: string;
  value: number;
  disabled: boolean;
};

const currentTab = ref('');

const selectedTab = ref(1);

const selectionText = ref('Tab "One" selected');

const tabs: Tab[] = [
  { label: 'One', value: 1, disabled: false },
  { label: 'Two', value: 2, disabled: false },
  { label: 'Three', value: 3, disabled: false },
  { label: 'Four', value: 4, disabled: true },
  { label: 'Five', value: 5, disabled: false },
  { label: 'Six', value: 6, disabled: false },
];

const selectTab = (tab: Tab) => {
  selectedTab.value = tab.value;
  selectionText.value = 'Tab "' + tab.label + '" selected';
};
`;export{e as default};
