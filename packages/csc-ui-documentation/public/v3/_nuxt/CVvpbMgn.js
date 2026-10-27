const t=`
import { ref } from 'vue';
type Tab = 'tab1' | 'tab2' | 'tab3' | 'tab4' | 'tab5';

const tab = ref<Tab>('tab1');
`;export{t as default};
