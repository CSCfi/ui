// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiDownload, mdiTrashCanOutline } from '@mdi/js';
import { CIcon, CIconButton, CTooltip } from '@cscfi/csc-ui-react';

export const Basic = () => (
  <div className="example-row">
    <CTooltip text="Download the report as PDF">
      <CIconButton slot="trigger" aria-label="Download" ghost>
        <CIcon path={mdiDownload} />
      </CIconButton>
    </CTooltip>

    <CTooltip text="Remove the report permanently" position="bottom">
      <CIconButton slot="trigger" aria-label="Remove" ghost>
        <CIcon path={mdiTrashCanOutline} />
      </CIconButton>
    </CTooltip>
  </div>
);
