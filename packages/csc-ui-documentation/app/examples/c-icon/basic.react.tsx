import { CIcon } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiAccount, mdiBellOutline, mdiCheckCircle } from '@mdi/js';

export const Basic = () => (
  <div className="example-row">
    <CIcon path={mdiAccount} />
    <CIcon path={mdiBellOutline} size={36} />
    <CIcon color="var(--c-success)" path={mdiCheckCircle} size={36} />
  </div>
);
