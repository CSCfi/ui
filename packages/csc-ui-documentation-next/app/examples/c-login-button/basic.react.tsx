// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CLoginButton, CLoginButtons } from '@cscfi/csc-ui-next-react';
import { mdiAccountCircle, mdiSchool } from '@mdi/js';

// Stand-in provider logos; use your identity provider's logo url instead.
const logo = (path: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${path}" fill="#336b8e"/></svg>`,
  )}`;

export const Basic = () => (
  <div>
    <CLoginButtons>
      <CLoginButton src={logo(mdiSchool)} alt="Haka logo">
        Haka login
      </CLoginButton>

      <CLoginButton src={logo(mdiAccountCircle)} alt="CSC logo">
        CSC login
      </CLoginButton>
    </CLoginButtons>
  </div>
);
