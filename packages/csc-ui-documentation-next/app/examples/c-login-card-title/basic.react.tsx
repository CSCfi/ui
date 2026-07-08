// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  CButton,
  CLoginCard,
  CLoginCardActions,
  CLoginCardContent,
  CLoginCardTitle,
} from '@cscfi/csc-ui-next-react';

export const Basic = () => {
  return (
    <div>
      <CLoginCard>
        <CLoginCardTitle>Sign in to My CSC</CLoginCardTitle>

        <CLoginCardContent>
          <p>Access your projects and services with your CSC account.</p>
        </CLoginCardContent>

        <CLoginCardActions>
          <CButton>Sign in</CButton>
        </CLoginCardActions>
      </CLoginCard>
    </div>
  );
};
