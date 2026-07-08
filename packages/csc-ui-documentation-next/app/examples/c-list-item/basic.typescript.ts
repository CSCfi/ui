// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiAccount, mdiBell, mdiChevronRight, mdiCog } from '@mdi/js';

const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const list = document.createElement('c-list');

const profileItem = document.createElement('c-list-item');
profileItem.hoverable = true;

const profileIcon = document.createElement('c-icon');
profileIcon.slot = 'pre';
profileIcon.path = mdiAccount;

const profileTitle = document.createElement('c-list-item-title');
profileTitle.textContent = 'Profile';

profileItem.append(profileIcon, profileTitle);

const notificationsItem = document.createElement('c-list-item');
notificationsItem.active = true;

const notificationsIcon = document.createElement('c-icon');
notificationsIcon.slot = 'pre';
notificationsIcon.path = mdiBell;

const notificationsTitle = document.createElement('c-list-item-title');
notificationsTitle.textContent = 'Notifications';

const notificationsChevron = document.createElement('c-icon');
notificationsChevron.slot = 'post';
notificationsChevron.path = mdiChevronRight;

notificationsItem.append(notificationsIcon, notificationsTitle, notificationsChevron);

const settingsItem = document.createElement('c-list-item');
settingsItem.disabled = true;

const settingsIcon = document.createElement('c-icon');
settingsIcon.slot = 'pre';
settingsIcon.path = mdiCog;

const settingsTitle = document.createElement('c-list-item-title');
settingsTitle.textContent = 'Settings';

settingsItem.append(settingsIcon, settingsTitle);

list.append(profileItem, notificationsItem, settingsItem);
wrapper.append(list);
document.body.append(wrapper);
