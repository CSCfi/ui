import { CIcon, CIconButton, CTooltip } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiDownload, mdiTrashCanOutline } from '@mdi/js';

export const Basic = () => (
  <div className="example-row">
    <CTooltip text="Download the report as PDF">
      <CIconButton aria-label="Download" ghost slot="trigger">
        <CIcon path={mdiDownload} />
      </CIconButton>
    </CTooltip>

    <CTooltip position="bottom" text="Remove the report permanently">
      <CIconButton aria-label="Remove" ghost slot="trigger">
        <CIcon path={mdiTrashCanOutline} />
      </CIconButton>
    </CTooltip>
  </div>
);
