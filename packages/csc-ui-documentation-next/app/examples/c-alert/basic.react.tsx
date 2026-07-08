// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CAlert } from '@cscfi/csc-ui-next-react';

export const Basic = () => {
  return (
    <div>
      <CAlert type="warning">
        <div slot="title">Maintenance break</div>
        The service will be unavailable on Saturday between 10:00 and 12:00.
      </CAlert>
    </div>
  );
};
