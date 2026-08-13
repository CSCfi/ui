import { mdiAccountGroup, mdiCreditCardOutline, mdiDatabase } from '@mdi/js';

const icons = [mdiCreditCardOutline, mdiAccountGroup, mdiDatabase];

document.querySelectorAll('c-icon').forEach((icon, index) => {
  icon.path = icons[index]!;
});
