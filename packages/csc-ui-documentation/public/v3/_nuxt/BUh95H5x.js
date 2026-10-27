const e=`
import { mdiStar } from '@mdi/js';import type { CRadioGroupItem, CRowAlign, CRowJustify } from '@cscfi/csc-ui';

const justifyItems: CRadioGroupItem[] = [
  { name: 'Start', value: 'start' },
  { name: 'End', value: 'end' },
  { name: 'Center', value: 'center' },
  { name: 'Space between', value: 'space-between' },
  { name: 'Space around', value: 'space-around' },
];

const alignItems: CRadioGroupItem[] = [
  { name: 'Start', value: 'start' },
  { name: 'End', value: 'end' },
  { name: 'Center', value: 'center' },
];

const align = ref<CRowAlign>('start');

const justify = ref<CRowJustify>('start');
`;export{e as default};
