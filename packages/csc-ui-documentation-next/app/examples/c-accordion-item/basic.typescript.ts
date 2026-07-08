// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiAccountGroup, mdiCreditCardOutline, mdiDatabase } from '@mdi/js';

const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const accordion = document.createElement('c-accordion');

const items = [
  {
    heading: 'Project billing',
    value: 'billing',
    icon: mdiCreditCardOutline,
    text: 'Billing units are deducted monthly based on the resources in use.',
  },
  {
    heading: 'Members and roles',
    value: 'members',
    icon: mdiAccountGroup,
    text: 'Invite members by email and assign them a role in the project.',
  },
  {
    heading: 'Data storage',
    value: 'storage',
    icon: mdiDatabase,
    text: 'Allas object storage is available to every project by default.',
  },
];

for (const { heading, value, icon, text } of items) {
  const item = document.createElement('c-accordion-item');
  item.setAttribute('heading', heading);
  item.setAttribute('value', value);

  const itemIcon = document.createElement('c-icon');
  itemIcon.slot = 'icon';
  itemIcon.path = icon;

  const paragraph = document.createElement('p');
  paragraph.textContent = text;

  item.append(itemIcon, paragraph);
  accordion.append(item);
}

wrapper.append(accordion);
document.body.append(wrapper);
