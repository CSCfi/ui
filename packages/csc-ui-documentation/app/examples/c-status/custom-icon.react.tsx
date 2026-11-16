// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CIcon, CStatus } from '@cscfi/csc-ui-react';
import { mdiArchive } from '@mdi/js';

export const CustomIcon = () => (
  <div className="example-row">
    <CStatus marker="dot" type="info">
      <CIcon path={mdiArchive} slot="icon" />
      Archived
    </CStatus>
    <CStatus appearance="outlined" marker="icon">
      <CIcon path={mdiArchive} slot="icon" />
      Archived
    </CStatus>
  </div>
);
