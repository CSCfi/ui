// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CIcon, CIconButton } from '@cscfi/csc-ui-react';
import { mdiMagnify } from '@mdi/js';

export const Sizes = () => (
  <div className="example-row">
    <CIconButton size="x-small">
      <CIcon path={mdiMagnify} />
    </CIconButton>

    <CIconButton size="small">
      <CIcon path={mdiMagnify} />
    </CIconButton>

    <CIconButton>
      <CIcon path={mdiMagnify} />
    </CIconButton>
  </div>
);
