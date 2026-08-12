// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  CButton,
  CLoginCard,
  CLoginCardActions,
  CLoginCardContent,
  CLoginCardTitle,
  CTextField,
} from '@cscfi/csc-ui-react';

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

        <CLoginCardActions>
          <CButton>Sign in</CButton>
        </CLoginCardActions>
      </CLoginCard>
    </div>
  );
};
