// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CLink } from '@cscfi/csc-ui-react';

export const Basic = () => {
  return (
    <div className="example-row">
      <CLink href="https://csc.fi">Default link</CLink>

      <CLink href="https://csc.fi" underline>
        Underlined link
      </CLink>

      <CLink href="https://csc.fi" target="_blank">
        Opens in a new tab
      </CLink>

      <CLink href="https://csc.fi" weight="400">
        Normal weight
      </CLink>
    </div>
  );
};
