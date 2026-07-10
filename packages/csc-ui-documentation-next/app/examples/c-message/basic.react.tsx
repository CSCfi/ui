// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CMessage } from '@cscfi/csc-ui-next-react';

export const Basic = () => {
  return (
    <div className="example-row">
      <CMessage hint="Use your organization email address" />

      <CMessage valid={false} errorMessage="Email is required" />
    </div>
  );
};
