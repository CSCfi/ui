// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CProgressCircle } from '@cscfi/csc-ui-react';

export const CenterContent = () => {
  return (
    <div>
      <CProgressCircle
        aria-label="Storage quota used"
        size={72}
        value={57}
        width={12}
      >
        57%
      </CProgressCircle>
    </div>
  );
};
