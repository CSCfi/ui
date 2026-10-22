// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CLoginButton, CLoginButtons } from '@cscfi/csc-ui-react';
import { mdiAccountCircle, mdiDomain, mdiSchool } from '@mdi/js';

// Stand-in provider logos; use your identity provider's logo url instead.
const logo = (path: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${path}" fill="#336b8e"/></svg>`,
  )}`;

export const Basic = () => (
  <div>
    <CLoginButtons>
      <CLoginButton alt="Haka logo" src={logo(mdiSchool)}>
        Haka login
      </CLoginButton>

      <CLoginButton alt="Virtu logo" src={logo(mdiDomain)}>
        Virtu login
      </CLoginButton>

      <CLoginButton alt="CSC logo" src={logo(mdiAccountCircle)}>
        CSC login
      </CLoginButton>
    </CLoginButtons>
  </div>
);
