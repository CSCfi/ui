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

trigger.append('Device', chevronIcon);

const label = document.createElement('c-menu-label');
label.textContent = 'Type';

const phoneItem = document.createElement('c-menu-item');
phoneItem.value = 'phone';
phoneItem.textContent = 'Phone';

const tabletItem = document.createElement('c-menu-item');
tabletItem.value = 'tablet';
tabletItem.textContent = 'Tablet';

const desktopItem = document.createElement('c-menu-item');
desktopItem.value = 'desktop';
desktopItem.textContent = 'Desktop';

const divider = document.createElement('c-divider');

const forgetItem = document.createElement('c-menu-item');
forgetItem.value = 'forget';
forgetItem.danger = true;
forgetItem.textContent = 'Forget this device';

menu.append(trigger, label, phoneItem, tabletItem, desktopItem, divider, forgetItem);

const status = document.createElement('span');
status.textContent = 'Selected: —';

menu.addEventListener('select', (event) => {
  status.textContent = `Selected: ${event.detail.value}`;
});

row.append(menu, status);
document.body.append(row);
