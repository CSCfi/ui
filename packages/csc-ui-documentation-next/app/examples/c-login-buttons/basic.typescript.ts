// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiAccountCircle, mdiDomain, mdiSchool } from '@mdi/js';

// Stand-in provider logos; use your identity provider's logo url instead.
const logo = (path: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${path}" fill="#336b8e"/></svg>`,
  )}`;

const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const buttons = document.createElement('c-login-buttons');

const haka = document.createElement('c-login-button');
haka.src = logo(mdiSchool);
haka.setAttribute('alt', 'Haka logo');
haka.textContent = 'Haka login';

const virtu = document.createElement('c-login-button');
virtu.src = logo(mdiDomain);
virtu.setAttribute('alt', 'Virtu logo');
virtu.textContent = 'Virtu login';

const csc = document.createElement('c-login-button');
csc.src = logo(mdiAccountCircle);
csc.setAttribute('alt', 'CSC logo');
csc.textContent = 'CSC login';

buttons.append(haka, virtu, csc);
wrapper.append(buttons);
document.body.append(wrapper);
