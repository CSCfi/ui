// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const tabs = document.createElement('c-tabs');
tabs.vertical = true;
tabs.value = 'profile';

const profileTab = document.createElement('c-tab');
profileTab.value = 'profile';
profileTab.textContent = 'Profile';

const securityTab = document.createElement('c-tab');
securityTab.value = 'security';
securityTab.textContent = 'Security';

const tokensTab = document.createElement('c-tab');
tokensTab.value = 'tokens';
tokensTab.textContent = 'API tokens';

const items = document.createElement('c-tab-items');
items.slot = 'items';

const profileItem = document.createElement('c-tab-item');
profileItem.value = 'profile';
const profileText = document.createElement('p');
profileText.textContent = 'Your name, email and avatar.';
profileItem.append(profileText);

const securityItem = document.createElement('c-tab-item');
securityItem.value = 'security';
const securityText = document.createElement('p');
securityText.textContent = 'Password and two-factor authentication.';
securityItem.append(securityText);

const tokensItem = document.createElement('c-tab-item');
tokensItem.value = 'tokens';
const tokensText = document.createElement('p');
tokensText.textContent = 'Personal access tokens for the API.';
tokensItem.append(tokensText);

items.append(profileItem, securityItem, tokensItem);
tabs.append(profileTab, securityTab, tokensTab, items);
wrapper.append(tabs);
document.body.append(wrapper);
