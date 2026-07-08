// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiBellOutline, mdiEmailOutline } from '@mdi/js';

const styles = document.createElement('style');
styles.textContent = `
c-badge.success-badge::part(root) {
  background-color: var(--c-success-500);
}
`;
document.head.append(styles);

const row = document.createElement('div');
row.className = 'example-row';

const bellWrapper = document.createElement('span');
bellWrapper.style.position = 'relative';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const bellIcon = document.createElement('c-icon');
bellIcon.path = mdiBellOutline;
bellIcon.setAttribute('size', '32');

const bellBadge = document.createElement('c-badge');
bellBadge.textContent = '3';

bellWrapper.append(bellIcon, bellBadge);

const emailButton = document.createElement('c-icon-button');
emailButton.setAttribute('outlined', '');

const emailIcon = document.createElement('c-icon');
emailIcon.path = mdiEmailOutline;

const emailBadge = document.createElement('c-badge');
emailBadge.className = 'success-badge';
emailBadge.textContent = '1';

emailButton.append(emailIcon, emailBadge);

const button = document.createElement('c-button');
const buttonBadge = document.createElement('c-badge');
buttonBadge.textContent = '2';

button.append('Default', buttonBadge);

row.append(bellWrapper, emailButton, button);
document.body.append(row);
