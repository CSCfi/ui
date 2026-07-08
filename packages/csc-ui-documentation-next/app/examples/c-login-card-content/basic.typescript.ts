// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const card = document.createElement('c-login-card');

const title = document.createElement('c-login-card-title');
title.textContent = 'Sign in to My CSC';

const content = document.createElement('c-login-card-content');

const intro = document.createElement('p');
intro.textContent = 'Access your projects and services with your CSC account.';

const username = document.createElement('c-text-field');
username.setAttribute('label', 'Username');
username.setAttribute('name', 'username');

const password = document.createElement('c-text-field');
password.setAttribute('label', 'Password');
password.setAttribute('name', 'password');
password.setAttribute('type', 'password');

content.append(intro, username, password);

const actions = document.createElement('c-login-card-actions');

const signIn = document.createElement('c-button');
signIn.textContent = 'Sign in';

actions.append(signIn);

card.append(title, content, actions);
wrapper.append(card);
document.body.append(wrapper);
