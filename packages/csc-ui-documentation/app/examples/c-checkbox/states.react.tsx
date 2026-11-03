// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CCheckbox } from '@cscfi/csc-ui-react';

export const States = () => (
  <div className="example-row">
    <CCheckbox hideMessage>Unchecked</CCheckbox>
    <CCheckbox checked hideMessage>
      Checked
    </CCheckbox>
    <CCheckbox hideMessage indeterminate>
      Indeterminate
    </CCheckbox>
    <CCheckbox disabled hideMessage>
      Disabled
    </CCheckbox>
    <CCheckbox checked disabled hideMessage>
      Checked and disabled
    </CCheckbox>
  </div>
);
