import { mdiAccountCircle, mdiDomain, mdiSchool } from '@mdi/js';

// Stand-in provider logos; use your identity provider's logo url instead.
const logo = (path: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${path}" fill="#336b8e"/></svg>`,
  )}`;

const [hakaButton, virtuButton, cscButton] =
  document.querySelectorAll('c-login-button');

hakaButton!.src = logo(mdiSchool);
virtuButton!.src = logo(mdiDomain);
cscButton!.src = logo(mdiAccountCircle);
