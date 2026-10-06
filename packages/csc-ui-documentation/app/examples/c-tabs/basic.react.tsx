import { CBadge, CTab, CTabItem, CTabItems, CTabs } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [tab, setTab] = useState<'members' | 'settings' | 'summary'>('summary');

  return (
    <div>
      <CTabs
        onChangeValue={(event) =>
          setTab(event.detail as 'members' | 'settings' | 'summary')
        }
        value={tab}
      >
        <CTab value="summary">Summary</CTab>
        <CTab value="members">
          Members
          <CBadge>2</CBadge>
        </CTab>
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
