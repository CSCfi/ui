import {
  CButton,
  CDivider,
  CIcon,
  CMenu,
  CMenuItem,
  CMenuLabel,
} from '@cscfi/csc-ui-react';
import { mdiChevronDown } from '@mdi/js';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [selected, setSelected] = useState<null | string>(null);

  return (
    <div className="example-row">
      <CMenu onSelect={(event) => setSelected(event.detail.value as string)}>
        <CButton outlined slot="trigger">
          Device
          <CIcon path={mdiChevronDown} />
        </CButton>

        <CMenuLabel>Type</CMenuLabel>

        <CMenuItem value="phone">Phone</CMenuItem>

        <CMenuItem value="tablet">Tablet</CMenuItem>

        <CMenuItem value="desktop">Desktop</CMenuItem>

        <CDivider />

        <CMenuItem danger value="forget">
          Forget this device
        </CMenuItem>
      </CMenu>

      <p>Selected: {selected ?? '—'}</p>
    </div>
  );
};
