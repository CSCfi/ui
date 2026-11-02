const e=`
import { ref } from 'vue';import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

const step = ref(1);

const min = 1;

const max = 5;

const move = (direction: string) => {
  if (direction === '>' && step.value < max) {
    step.value += 1;
  }

  if (direction === '<' && step.value > min) {
    step.value -= 1;
  }
};
`;export{e as default};
