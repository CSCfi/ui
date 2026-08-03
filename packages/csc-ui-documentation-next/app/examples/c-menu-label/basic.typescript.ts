import { mdiChevronDown } from '@mdi/js';

const status = document.querySelector('p')!;

document.querySelector('c-icon')!.path = mdiChevronDown;

document.querySelector('c-menu')!.addEventListener('select', (event) => {
  status.textContent = `Selected: ${event.detail.value}`;
});
