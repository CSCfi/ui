// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const card = document.createElement('c-card');

const title = document.createElement('c-card-title');
title.textContent = 'Project members';

const content = document.createElement('c-card-content');
const description = document.createElement('p');
description.textContent =
  'Manage who has access to this project and what they can do.';
content.append(description);

const actions = document.createElement('c-card-actions');
actions.justify = 'end';

const cancelButton = document.createElement('c-button');
cancelButton.text = true;
cancelButton.textContent = 'Cancel';

const saveButton = document.createElement('c-button');
saveButton.textContent = 'Save';

actions.append(cancelButton, saveButton);
card.append(title, content, actions);
wrapper.append(card);
document.body.append(wrapper);
