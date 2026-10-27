const e=`
import { ref } from 'vue';import { mdiServer } from '@mdi/js';

type TabItem = {
  label: string;
  value: string;
  disabled: boolean;
};

const currentTabItem = ref('');

const selectedTabItem = ref('tab6');

const selectionItemText = ref('Tab "Six" selected');

const tabsItems: TabItem[] = [
  { label: 'One', value: 'tab1', disabled: true },
  { label: 'Two', value: 'tab2', disabled: false },
  { label: 'Three', value: 'tab3', disabled: false },
  { label: 'Four', value: 'tab4', disabled: true },
  { label: 'Five', value: 'tab5', disabled: false },
  { label: 'Six', value: 'tab6', disabled: false },
];

const selectTabItem = (tab: TabItem) => {
  selectedTabItem.value = tab.value;
  selectionItemText.value = 'Tab "' + tab.label + '" selected';
};
`;export{e as default};
