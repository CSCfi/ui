// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CAlert } from '@cscfi/csc-ui-react';

export const Basic = () => {
  return (
    <div>
      <CAlert heading="Maintenance break" type="warning">
        The service will be unavailable on Saturday between 10:00 and 12:00.
      </CAlert>
    </div>
  );
};
