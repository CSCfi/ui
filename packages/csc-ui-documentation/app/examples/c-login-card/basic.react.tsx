// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  CButton,
  CLink,
  CLoginCard,
  CLoginCardActions,
  CLoginCardContent,
  CLoginCardTitle,
  CTextField,
} from '@cscfi/csc-ui-react';

// Stand-in artwork; use your service's own image url as `src` instead.
const artwork = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#006778"/><stop offset="1" stop-color="#1c3d5a"/></linearGradient></defs><rect width="600" height="800" fill="url(#g)"/><circle cx="470" cy="170" r="170" fill="#fff" fill-opacity=".14"/><circle cx="120" cy="660" r="230" fill="#fff" fill-opacity=".08"/></svg>',
)}`;

export const Basic = () => {
  return (
    <div>
      <CLoginCard src={artwork} backgroundPosition="50% 0%">
        <CLoginCardTitle>Sign in to My CSC</CLoginCardTitle>

        <CLoginCardContent>
          <p>Access your projects and services with your CSC account.</p>

          <CTextField label="Username" name="username" />

          <CTextField label="Password" name="password" type="password" />
        </CLoginCardContent>

        <CLoginCardActions justify="space-between">
          <CButton size="large">Sign in</CButton>

          <CLink href="https://csc.fi" underline>
            Forgot password?
          </CLink>
        </CLoginCardActions>
      </CLoginCard>
    </div>
  );
};
