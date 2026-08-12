// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  CButton,
  CCard,
  CCardContent,
  CCardTitle,
} from '@cscfi/csc-ui-react';

export const Basic = () => (
  <div>
    <CCard>
      <CCardTitle>
        Notifications
        <CButton slot="actions" ghost size="small">
          Mark all read
        </CButton>
      </CCardTitle>

      <CCardContent>
        <p>You have 3 unread notifications.</p>
      </CCardContent>
    </CCard>
  </div>
);
