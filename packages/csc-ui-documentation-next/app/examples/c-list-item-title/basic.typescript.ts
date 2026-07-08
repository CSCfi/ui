// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const list = document.createElement('c-list');

const profileItem = document.createElement('c-list-item');
const profileTitle = document.createElement('c-list-item-title');
profileTitle.textContent = 'Profile';
profileItem.append(profileTitle);

const notificationsItem = document.createElement('c-list-item');
notificationsItem.setAttribute('active', '');
const notificationsTitle = document.createElement('c-list-item-title');
notificationsTitle.textContent = 'Notifications';
notificationsItem.append(notificationsTitle);

const settingsItem = document.createElement('c-list-item');
const settingsTitle = document.createElement('c-list-item-title');
settingsTitle.textContent = 'Settings';
settingsItem.append(settingsTitle);

list.append(profileItem, notificationsItem, settingsItem);
wrapper.append(list);
document.body.append(wrapper);
