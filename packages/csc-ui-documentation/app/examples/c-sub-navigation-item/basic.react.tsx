import {
  CIcon,
  CSideNavigation,
  CSideNavigationItem,
  CSubNavigationItem,
} from '@cscfi/csc-ui-react';
import { mdiFolderOutline } from '@mdi/js';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [current, setCurrent] = useState('active');

  return (
    <div>
      <CSideNavigation>
        <CSideNavigationItem active>
          <CIcon path={mdiFolderOutline} />
          Projects
          <CSubNavigationItem
            active={current === 'active'}
            onSelect={() => setCurrent('active')}
          >
            Active projects
          </CSubNavigationItem>
          <CSubNavigationItem
            active={current === 'archived'}
            onSelect={() => setCurrent('archived')}
          >
            Archived projects
          </CSubNavigationItem>
          <CSubNavigationItem href="https://csc.fi" target="_blank">
            Service description
          </CSubNavigationItem>
        </CSideNavigationItem>
      </CSideNavigation>
    </div>
  );
};
