// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiAccount, mdiBell, mdiCog } from '@mdi/js';

const items = [
  { icon: mdiAccount, label: 'Profile' },
  { icon: mdiBell, label: 'Notifications' },
  { icon: mdiCog, label: 'Settings' },
];

let selected = 'Profile';

const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const list = document.createElement('c-list');
list.setAttribute('bordered', '');

const listItems = items.map((item) => {
  const listItem = document.createElement('c-list-item');
  listItem.setAttribute('ripple', '');
  listItem.active = selected === item.label;

  const icon = document.createElement('c-icon');
  icon.slot = 'pre';
  icon.path = item.icon;

  const title = document.createElement('c-list-item-title');
  title.textContent = item.label;

  listItem.append(icon, title);

  listItem.addEventListener('click', () => {
    selected = item.label;

    listItems.forEach((el, index) => {
      el.active = items[index].label === selected;
    });
  });

  return listItem;
});

list.append(...listItems);
wrapper.append(list);
document.body.append(wrapper);
