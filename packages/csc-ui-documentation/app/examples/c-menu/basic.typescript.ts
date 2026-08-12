import { mdiChevronDown } from '@mdi/js';

document.querySelector('c-icon')!.path = mdiChevronDown;

const status = document.querySelector('p')!;

document.querySelector('c-menu')!.addEventListener('select', (event) => {
  status.textContent = `Selected: ${event.detail.value}`;
});
