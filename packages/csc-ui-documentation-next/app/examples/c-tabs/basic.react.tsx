// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CTab, CTabItem, CTabItems, CTabs } from '@cscfi/csc-ui-next-react';

export const Basic = () => {
  const [tab, setTab] = useState<'summary' | 'members' | 'settings'>('summary');

  return (
    <div>
      <CTabs
        value={tab}
        onChangeValue={(event) =>
          setTab(event.detail as 'summary' | 'members' | 'settings')
        }
      >
        <CTab value="summary">Summary</CTab>
        <CTab value="members">Members</CTab>
        <CTab value="settings">Settings</CTab>

        <CTabItems slot="items">
          <CTabItem value="summary">
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
    </div>
  );
};
