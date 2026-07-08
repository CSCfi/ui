// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const card = document.createElement('c-card');

const title = document.createElement('c-card-title');
title.append('Notifications');

const markAllRead = document.createElement('c-button');
markAllRead.slot = 'actions';
markAllRead.setAttribute('ghost', '');
markAllRead.setAttribute('size', 'small');
markAllRead.textContent = 'Mark all read';
title.append(markAllRead);

const content = document.createElement('c-card-content');
const message = document.createElement('p');
message.textContent = 'You have 3 unread notifications.';
content.append(message);

card.append(title, content);
wrapper.append(card);
document.body.append(wrapper);
