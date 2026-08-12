import { mdiAccount, mdiChevronDown } from '@mdi/js';

const [accountIcon, chevronIcon] = document.querySelectorAll('c-icon');

accountIcon!.path = mdiAccount;

chevronIcon!.path = mdiChevronDown;

const status = document.querySelector('p')!;

document.querySelector('c-menu')!.addEventListener('select', (event) => {
  status.textContent = `Selected: ${event.detail.value}`;
});
