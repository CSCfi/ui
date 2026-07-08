// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  CButton,
  CCard,
  CCardActions,
  CCardContent,
  CCardTitle,
} from '@cscfi/csc-ui-next-react';

export const Basic = () => (
  <div>
    <CCard>
      <CCardTitle>Project members</CCardTitle>

      <CCardContent>
        <p>Manage who has access to this project and what they can do.</p>
      </CCardContent>

      <CCardActions justify="end">
        <CButton text>Cancel</CButton>
        <CButton>Save</CButton>
      </CCardActions>
    </CCard>
  </div>
);
