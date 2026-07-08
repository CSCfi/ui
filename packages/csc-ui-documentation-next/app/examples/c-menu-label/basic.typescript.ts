// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiChevronDown } from '@mdi/js';

const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const menu = document.createElement('c-menu');

const trigger = document.createElement('c-button');
trigger.slot = 'trigger';
trigger.outlined = true;

const chevronIcon = document.createElement('c-icon');
chevronIcon.path = mdiChevronDown;

trigger.append('Settings', chevronIcon);

const accountLabel = document.createElement('c-menu-label');
accountLabel.textContent = 'Account';

const profileItem = document.createElement('c-menu-item');
profileItem.value = 'profile';
profileItem.textContent = 'Profile';

const notificationsItem = document.createElement('c-menu-item');
notificationsItem.value = 'notifications';
notificationsItem.textContent = 'Notifications';

const divider = document.createElement('c-divider');

const workspaceLabel = document.createElement('c-menu-label');
workspaceLabel.textContent = 'Workspace';

const membersItem = document.createElement('c-menu-item');
membersItem.value = 'members';
membersItem.textContent = 'Members';

const billingItem = document.createElement('c-menu-item');
billingItem.value = 'billing';
billingItem.textContent = 'Billing';

menu.append(
  trigger,
  accountLabel,
  profileItem,
  notificationsItem,
  divider,
  workspaceLabel,
  membersItem,
  billingItem,
);

const status = document.createElement('span');
status.textContent = 'Selected: —';

menu.addEventListener('select', (event) => {
  status.textContent = `Selected: ${event.detail.value}`;
});

row.append(menu, status);
document.body.append(row);
