// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import {
  CButton,
  CTabButtons,
  CTabItem,
  CTabItems,
  CTabs,
} from '@cscfi/csc-ui-next-react';

export const Basic = () => {
  const [tab, setTab] = useState('overview');

  return (
    <CTabs
      value={tab}
      onChangeValue={(event) => setTab(event.detail as string)}
    >
      <CTabButtons>
        <CButton value="overview">Overview</CButton>
        <CButton value="members">Members</CButton>
        <CButton value="settings">Settings</CButton>
      </CTabButtons>

      <CTabItems slot="items">
        <CTabItem value="overview">
          <p>Overview of the project and its recent activity.</p>
        </CTabItem>
        <CTabItem value="members">
          <p>People with access to this project.</p>
        </CTabItem>
        <CTabItem value="settings">
          <p>Project name, description and visibility.</p>
        </CTabItem>
      </CTabItems>
    </CTabs>
  );
};
