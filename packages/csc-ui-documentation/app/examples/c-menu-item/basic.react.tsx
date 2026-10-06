import {
  CButton,
  CDivider,
  CIcon,
  CMenu,
  CMenuItem,
} from '@cscfi/csc-ui-react';
import { mdiAccount, mdiChevronDown } from '@mdi/js';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

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

        <CMenuItem disabled value="billing">
          Billing (unavailable)
        </CMenuItem>

        <CMenuItem value="invite">Invite teammate</CMenuItem>

        <CDivider />

        <CMenuItem danger value="delete">
          Delete account
        </CMenuItem>
      </CMenu>

      <p>Selected: {selected ?? '—'}</p>
    </div>
  );
};
