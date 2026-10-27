const e=`
import { ref } from 'vue';
const items = [
  { name: 'Radio 1', value: 'radio_one' },
  { name: 'Radio 2', value: 'radio_two' },
  { name: 'Radio 3', value: 'radio_three' },
];

const selectedItem = ref(items[0]);

const selectedItemValue = ref(items[1].value);
`;export{e as default};
