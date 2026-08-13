// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiAccount, mdiBellOutline, mdiCheckCircle } from '@mdi/js';
import { CIcon } from '@cscfi/csc-ui-react';

export const Basic = () => (
  <div className="example-row">
    <CIcon path={mdiAccount} />
    <CIcon path={mdiBellOutline} size={36} />
    <CIcon path={mdiCheckCircle} size={36} color="var(--c-success)" />
  </div>
);
