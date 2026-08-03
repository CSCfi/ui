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
      <CMenu onSelect={(event) => setSelected(event.detail.value as string)}>
        <CButton slot="trigger" outlined>
          Settings
          <CIcon path={mdiChevronDown} />
        </CButton>

        <CMenuLabel>Account</CMenuLabel>

        <CMenuItem value="profile">Profile</CMenuItem>

        <CMenuItem value="notifications">Notifications</CMenuItem>

        <CDivider />

        <CMenuLabel>Workspace</CMenuLabel>

        <CMenuItem value="members">Members</CMenuItem>

        <CMenuItem value="billing">Billing</CMenuItem>
      </CMenu>

      <p>Selected: {selected ?? '—'}</p>
    </div>
  );
};
