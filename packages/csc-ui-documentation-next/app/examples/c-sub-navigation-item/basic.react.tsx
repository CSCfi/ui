// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import {
  CIcon,
  CSideNavigation,
  CSideNavigationItem,
  CSubNavigationItem,
} from '@cscfi/csc-ui-next-react';
import { mdiFolderOutline } from '@mdi/js';

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

          <CSubNavigationItem href="https://csc.fi" target="_blank">
            Service description
          </CSubNavigationItem>
        </CSideNavigationItem>
      </CSideNavigation>
    </div>
  );
};
