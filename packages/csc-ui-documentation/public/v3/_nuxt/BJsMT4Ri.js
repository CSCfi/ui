const e=`
import { ref } from 'vue';import { mdiClose, mdiMagnify } from '@mdi/js';

const clearableValue = ref('');

const onClear = () => {
  clearableValue.value = '';
};
`;export{e as default};
