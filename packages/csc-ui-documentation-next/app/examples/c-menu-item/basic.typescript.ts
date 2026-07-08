// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiAccount, mdiChevronDown } from '@mdi/js';

const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const menu = document.createElement('c-menu');

const trigger = document.createElement('c-button');
trigger.slot = 'trigger';
trigger.text = true;

const accountIcon = document.createElement('c-icon');
accountIcon.path = mdiAccount;

const chevronIcon = document.createElement('c-icon');
chevronIcon.path = mdiChevronDown;

trigger.append(accountIcon, 'Account', chevronIcon);

const profileItem = document.createElement('c-menu-item');
profileItem.value = 'profile';
profileItem.textContent = 'View profile';

const billingItem = document.createElement('c-menu-item');
billingItem.value = 'billing';
billingItem.disabled = true;
billingItem.textContent = 'Billing (unavailable)';

const inviteItem = document.createElement('c-menu-item');
inviteItem.value = 'invite';
inviteItem.textContent = 'Invite teammate';

const divider = document.createElement('c-divider');

const deleteItem = document.createElement('c-menu-item');
deleteItem.value = 'delete';
deleteItem.danger = true;
deleteItem.textContent = 'Delete account';

menu.append(trigger, profileItem, billingItem, inviteItem, divider, deleteItem);

const status = document.createElement('span');
status.textContent = 'Selected: —';

menu.addEventListener('select', (event) => {
  status.textContent = `Selected: ${event.detail.value}`;
});

row.append(menu, status);
document.body.append(row);
