// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { mdiChevronDown } from '@mdi/js';
import {
  CButton,
  CDivider,
  CIcon,
  CMenu,
  CMenuItem,
  CMenuLabel,
} from '@cscfi/csc-ui-next-react';

export const Basic = () => {
  const [selected, setSelected] = useState<null | string>(null);

  return (
    <div className="example-row">
      <CMenu
        onSelect={(event) => setSelected(event.detail.value as string)}
      >
        <CButton slot="trigger" outlined>
          Device
          <CIcon path={mdiChevronDown} />
        </CButton>

        <CMenuLabel>Type</CMenuLabel>

        <CMenuItem value="phone">Phone</CMenuItem>

        <CMenuItem value="tablet">Tablet</CMenuItem>

        <CMenuItem value="desktop">Desktop</CMenuItem>

        <CDivider />

        <CMenuItem value="forget" danger>
          Forget this device
        </CMenuItem>
      </CMenu>

      <span>Selected: {selected ?? '—'}</span>
    </div>
  );
};
