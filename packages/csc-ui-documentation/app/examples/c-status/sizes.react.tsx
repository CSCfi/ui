// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CStatus } from '@cscfi/csc-ui-react';

export const Sizes = () => (
  <div className="example-row">
    <CStatus marker="icon" size="small" type="success">
      Small
    </CStatus>
    <CStatus marker="icon" type="success">
      Default
    </CStatus>
    <CStatus marker="icon" size="large" type="success">
      Large
    </CStatus>
  </div>
);
