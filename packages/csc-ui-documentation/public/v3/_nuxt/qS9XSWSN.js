const e=`
import { ref } from 'vue';
const items = [
  { name: 'Radio 1', value: 'radio_one' },
  { name: 'Radio 2', value: 'radio_two' },
  { name: 'Radio 3', value: 'radio_three' },
];

const selectedInlineValue = ref(items[2].value);

const isValid = ref(true);
`;export{e as default};
