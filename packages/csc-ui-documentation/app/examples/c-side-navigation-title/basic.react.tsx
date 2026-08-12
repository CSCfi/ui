// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  mdiDatabaseOutline,
  mdiHelpCircleOutline,
  mdiServerNetwork,
} from '@mdi/js';
import {
  CIcon,
  CSideNavigation,
  CSideNavigationItem,
  CSideNavigationTitle,
} from '@cscfi/csc-ui-react';

export const Basic = () => {
  return (
    <div>
      <CSideNavigation>
        <CSideNavigationTitle>Services</CSideNavigationTitle>

        <CSideNavigationItem>
          <CIcon path={mdiDatabaseOutline} />
          Data storage
        </CSideNavigationItem>

        <CSideNavigationItem>
          <CIcon path={mdiServerNetwork} />
          Computing
        </CSideNavigationItem>

        <CSideNavigationTitle>Support</CSideNavigationTitle>

        <CSideNavigationItem>
          <CIcon path={mdiHelpCircleOutline} />
          User guides
        </CSideNavigationItem>
      </CSideNavigation>
    </div>
  );
};
