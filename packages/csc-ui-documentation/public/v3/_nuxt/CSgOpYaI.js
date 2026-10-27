const e=`
import { ref } from 'vue';
import type { CSelectItem } from '@cscfi/csc-ui';

const blendModes: CSelectItem[] = [
  { value: 'normal', name: 'normal' },
  { value: 'multiply', name: 'multiply' },
  { value: 'screen', name: 'screen' },
  { value: 'overlay', name: 'overlay' },
  { value: 'darken', name: 'darken' },
  { value: 'lighten', name: 'lighten' },
  { value: 'color-dodge', name: 'color-dodge' },
  { value: 'color-burn', name: 'color-burn' },
  { value: 'hard-light', name: 'hard-light' },
  { value: 'soft-light', name: 'soft-light' },
  { value: 'difference', name: 'difference' },
  { value: 'exclusion', name: 'exclusion' },
  { value: 'hue', name: 'hue' },
  { value: 'saturation', name: 'saturation' },
  { value: 'color', name: 'color' },
  { value: 'luminosity', name: 'luminosity' },
];

const blendMode = ref(blendModes[1]);

const showOverlay = ref(true);
`;export{e as default};
