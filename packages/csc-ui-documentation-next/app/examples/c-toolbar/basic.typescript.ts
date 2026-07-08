// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// The relative class keeps the toolbar in flow; by default it is fixed to the top of the viewport
const toolbar = document.createElement('c-toolbar');
toolbar.className = 'relative';

const logo = document.createElement('c-csc-logo');

const title = document.createElement('span');
title.textContent = 'My Service';

const spacer = document.createElement('c-spacer');

const logoutButton = document.createElement('c-button');
logoutButton.setAttribute('text', '');
logoutButton.textContent = 'Log out';

toolbar.append(logo, title, spacer, logoutButton);
wrapper.append(toolbar);
document.body.append(wrapper);
