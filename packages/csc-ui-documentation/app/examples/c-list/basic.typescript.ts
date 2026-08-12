import { mdiAccount, mdiBell, mdiCog } from '@mdi/js';

const icons = [mdiAccount, mdiBell, mdiCog];

const items = document.querySelectorAll('c-list-item');

items.forEach((item, index) => {
  item.querySelector('c-icon')!.path = icons[index]!;

  item.addEventListener('click', () => {
    items.forEach((other) => (other.active = other === item));
  });
});
