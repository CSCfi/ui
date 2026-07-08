// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const tabs = document.createElement('c-tabs');
tabs.setAttribute('value', 'summary');

const summaryTab = document.createElement('c-tab');
summaryTab.setAttribute('value', 'summary');
summaryTab.textContent = 'Summary';

const membersTab = document.createElement('c-tab');
membersTab.setAttribute('value', 'members');
membersTab.textContent = 'Members';

const settingsTab = document.createElement('c-tab');
settingsTab.setAttribute('value', 'settings');
settingsTab.textContent = 'Settings';

const items = document.createElement('c-tab-items');
items.slot = 'items';

const summaryItem = document.createElement('c-tab-item');
summaryItem.setAttribute('value', 'summary');
const summaryText = document.createElement('p');
summaryText.textContent = 'Overview of the project and its recent activity.';
summaryItem.append(summaryText);

const membersItem = document.createElement('c-tab-item');
membersItem.setAttribute('value', 'members');
const membersText = document.createElement('p');
membersText.textContent = 'People with access to this project.';
membersItem.append(membersText);

const settingsItem = document.createElement('c-tab-item');
settingsItem.setAttribute('value', 'settings');
const settingsText = document.createElement('p');
settingsText.textContent = 'Project name, description and visibility.';
settingsItem.append(settingsText);

items.append(summaryItem, membersItem, settingsItem);
tabs.append(summaryTab, membersTab, settingsTab, items);
wrapper.append(tabs);
document.body.append(wrapper);
