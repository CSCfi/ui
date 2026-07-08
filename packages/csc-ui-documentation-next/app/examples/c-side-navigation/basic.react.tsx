// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import {
  CIcon,
  CSideNavigation,
  CSideNavigationItem,
  CSideNavigationTitle,
  CSubNavigationItem,
} from '@cscfi/csc-ui-next-react';
import {
  mdiFolderOutline,
  mdiOpenInNew,
  mdiViewDashboardOutline,
} from '@mdi/js';

export const Basic = () => {
  const [current, setCurrent] = useState('active');

  return (
    <div>
      <CSideNavigation>
        <CSideNavigationTitle>My project</CSideNavigationTitle>

        <CSideNavigationItem
          active={current === 'dashboard'}
          onItemChange={() => setCurrent('dashboard')}
        >
          <CIcon path={mdiViewDashboardOutline} />
          Dashboard
        </CSideNavigationItem>

        <CSideNavigationItem active>
          <CIcon path={mdiFolderOutline} />
          Projects
          <CSubNavigationItem
            active={current === 'active'}
            onClick={() => setCurrent('active')}
            onKeyUp={(event) => event.key === 'Enter' && setCurrent('active')}
          >
            Active projects
          </CSubNavigationItem>
          <CSubNavigationItem
            active={current === 'archived'}
            onClick={() => setCurrent('archived')}
            onKeyUp={(event) => event.key === 'Enter' && setCurrent('archived')}
          >
            Archived projects
          </CSubNavigationItem>
        </CSideNavigationItem>

        <CSideNavigationItem href="https://csc.fi" target="_blank">
          <CIcon path={mdiOpenInNew} />
          Service description
        </CSideNavigationItem>
      </CSideNavigation>
    </div>
  );
};
