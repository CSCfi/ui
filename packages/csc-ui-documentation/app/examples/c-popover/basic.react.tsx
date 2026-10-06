import { CButton, CIcon, CPopover, CSwitch } from '@cscfi/csc-ui-react';
import { mdiTuneVariant } from '@mdi/js';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [compact, setCompact] = useState(false);

  const [showIds, setShowIds] = useState(true);

  return (
    <div className="example-row">
      <CPopover heading="Display settings">
        <CButton outlined slot="trigger">
          Display settings
          <CIcon path={mdiTuneVariant} />
        </CButton>

        <div className="example-grid">
          <CSwitch
            onChangeValue={(event) => setCompact(event.detail as boolean)}
            value={compact}
          >
            Compact rows
          </CSwitch>

          <CSwitch
            onChangeValue={(event) => setShowIds(event.detail as boolean)}
            value={showIds}
          >
            Show identifiers
          </CSwitch>
        </div>
      </CPopover>

      <p>
        Compact: {String(compact)}, identifiers: {String(showIds)}
      </p>
    </div>
  );
};
