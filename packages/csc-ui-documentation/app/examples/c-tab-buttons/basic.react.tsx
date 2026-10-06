import {
  CButton,
  CTabButtons,
  CTabItem,
  CTabItems,
  CTabs,
} from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [tab, setTab] = useState('overview');

  return (
    <CTabs
      onChangeValue={(event) => setTab(event.detail as string)}
      value={tab}
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
