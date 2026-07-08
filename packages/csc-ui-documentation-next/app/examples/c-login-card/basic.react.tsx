// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  CButton,
  CLink,
  CLoginCard,
  CLoginCardActions,
  CLoginCardContent,
  CLoginCardTitle,
  CTextField,
} from '@cscfi/csc-ui-next-react';

export const Basic = () => {
  return (
    <div>
      <CLoginCard>
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
