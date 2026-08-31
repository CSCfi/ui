// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { mdiTuneVariant } from '@mdi/js';
import { CButton, CIcon, CPopover, CSwitch } from '@cscfi/csc-ui-react';

export const Basic = () => {
  const [compact, setCompact] = useState(false);
  const [showIds, setShowIds] = useState(true);

  return (
    <div className="example-row">
      <CPopover heading="Display settings">
        <CButton slot="trigger" outlined>
          Display settings
          <CIcon path={mdiTuneVariant} />
        </CButton>

        <div className="example-grid">
          <CSwitch
            value={compact}
            onChangeValue={(event) => setCompact(event.detail as boolean)}
          >
            Compact rows
          </CSwitch>

          <CSwitch
            value={showIds}
            onChangeValue={(event) => setShowIds(event.detail as boolean)}
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
