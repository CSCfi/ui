// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const card = document.createElement('c-login-card');

const title = document.createElement('c-login-card-title');
title.textContent = 'Sign in to My CSC';

const content = document.createElement('c-login-card-content');
const description = document.createElement('p');
description.textContent =
  'Access your projects and services with your CSC account.';
content.append(description);

const actions = document.createElement('c-login-card-actions');
actions.setAttribute('justify', 'space-between');

const signIn = document.createElement('c-button');
signIn.setAttribute('size', 'large');
signIn.textContent = 'Sign in';

const forgotPassword = document.createElement('c-link');
forgotPassword.setAttribute('href', 'https://csc.fi');
forgotPassword.setAttribute('underline', '');
forgotPassword.textContent = 'Forgot password?';

actions.append(signIn, forgotPassword);
card.append(title, content, actions);
wrapper.append(card);
document.body.append(wrapper);
