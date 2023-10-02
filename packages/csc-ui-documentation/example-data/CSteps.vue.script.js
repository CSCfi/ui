
/**
 * Examples for CSteps.vue.
 * Automatically generated at 10/2/2023, 2:21:28 PM.
 *
 * ⚠️ DO NOT EDIT THESE MANUALLY AS THEY WILL BE OVERWRITTEN IN THE NEXT BUILD!
 */
export const basic = `import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

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
`;

export const mobile = `import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

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
`;

