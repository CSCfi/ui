// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CCheckbox } from '@cscfi/csc-ui-react';

export const States = () => (
  <div className="example-row">
    <CCheckbox hideDetails>Unchecked</CCheckbox>
    <CCheckbox checked hideDetails>
      Checked
    </CCheckbox>
    <CCheckbox indeterminate hideDetails>
      Indeterminate
    </CCheckbox>
    <CCheckbox disabled hideDetails>
      Disabled
    </CCheckbox>
    <CCheckbox checked disabled hideDetails>
      Checked and disabled
    </CCheckbox>
  </div>
);
