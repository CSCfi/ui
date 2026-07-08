// @ts-nocheck — documentation code sample; shown as text, never compiled here
const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const openButton = document.createElement('c-button');
openButton.textContent = 'Open modal';

const modal = document.createElement('c-modal');
modal.value = false;
modal.setAttribute('dismissable', '');

openButton.addEventListener('click', () => {
  modal.value = true;
});

modal.addEventListener('changeValue', () => {
  modal.value = false;
});

const card = document.createElement('c-card');

const title = document.createElement('c-card-title');
title.textContent = 'Delete project';

const content = document.createElement('c-card-content');
const message = document.createElement('p');
message.textContent = 'This action cannot be undone.';
content.append(message);

const actions = document.createElement('c-card-actions');
actions.setAttribute('justify', 'end');

const cancelButton = document.createElement('c-button');
cancelButton.setAttribute('text', '');
cancelButton.textContent = 'Cancel';
cancelButton.addEventListener('click', () => {
  modal.value = false;
});

const deleteButton = document.createElement('c-button');
deleteButton.setAttribute('danger', '');
deleteButton.textContent = 'Delete';
deleteButton.addEventListener('click', () => {
  modal.value = false;
});

actions.append(cancelButton, deleteButton);
card.append(title, content, actions);
modal.append(card);
row.append(openButton, modal);
document.body.append(row);
