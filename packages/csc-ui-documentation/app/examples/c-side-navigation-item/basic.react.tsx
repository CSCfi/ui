import {
  CIcon,
  CSideNavigation,
  CSideNavigationItem,
  CSubNavigationItem,
} from '@cscfi/csc-ui-react';
import {
  mdiFolderOutline,
  mdiOpenInNew,
  mdiViewDashboardOutline,
} from '@mdi/js';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [current, setCurrent] = useState('dashboard');

  return (
    <div>
      <CSideNavigation>
        <CSideNavigationItem
          current={current === 'dashboard'}
          onSelect={() => setCurrent('dashboard')}
        >
          <CIcon path={mdiViewDashboardOutline} />
          Dashboard
        </CSideNavigationItem>

        <CSideNavigationItem expanded>
          <CIcon path={mdiFolderOutline} />
          Projects
          <CSubNavigationItem
            current={current === 'active'}
            onSelect={() => setCurrent('active')}
          >
            Active projects
          </CSubNavigationItem>
          <CSubNavigationItem
            current={current === 'archived'}
            onSelect={() => setCurrent('archived')}
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
