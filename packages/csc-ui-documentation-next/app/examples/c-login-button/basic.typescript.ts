// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiAccountCircle, mdiSchool } from '@mdi/js';

// Stand-in provider logos; use your identity provider's logo url instead.
const logo = (path: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${path}" fill="#336b8e"/></svg>`,
  )}`;

const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const buttons = document.createElement('c-login-buttons');

const hakaButton = document.createElement('c-login-button');
hakaButton.src = logo(mdiSchool);
hakaButton.alt = 'Haka logo';
hakaButton.textContent = 'Haka login';

const cscButton = document.createElement('c-login-button');
cscButton.src = logo(mdiAccountCircle);
cscButton.alt = 'CSC logo';
cscButton.textContent = 'CSC login';

buttons.append(hakaButton, cscButton);
wrapper.append(buttons);
document.body.append(wrapper);
