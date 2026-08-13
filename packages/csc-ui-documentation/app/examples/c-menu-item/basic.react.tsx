// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { mdiAccount, mdiChevronDown } from '@mdi/js';
import {
  CButton,
  CDivider,
  CIcon,
  CMenu,
  CMenuItem,
} from '@cscfi/csc-ui-react';

export const Basic = () => {
  const [selected, setSelected] = useState<null | string>(null);

  return (
    <div className="example-row">
      <CMenu onSelect={(event) => setSelected(event.detail.value as string)}>
        <CButton slot="trigger" text>
          <CIcon path={mdiAccount} />
          Account
          <CIcon path={mdiChevronDown} />
        </CButton>

        <CMenuItem value="profile">View profile</CMenuItem>

        <CMenuItem value="billing" disabled>
          Billing (unavailable)
        </CMenuItem>

        <CMenuItem value="invite">Invite teammate</CMenuItem>

        <CDivider />

        <CMenuItem value="delete" danger>
          Delete account
        </CMenuItem>
      </CMenu>

      <p>Selected: {selected ?? '—'}</p>
    </div>
  );
};
