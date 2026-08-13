import { mdiAccount, mdiBell, mdiChevronRight, mdiCog } from '@mdi/js';

const icons = [mdiAccount, mdiBell, mdiChevronRight, mdiCog];

document.querySelectorAll('c-icon').forEach((icon, index) => {
  icon.path = icons[index]!;
});
