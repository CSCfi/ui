import { CIcon, CList, CListItem, CListItemTitle } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiAccount, mdiBell, mdiChevronRight, mdiCog } from '@mdi/js';

export const Basic = () => {
  return (
    <div>
      <CList>
        <CListItem hoverable>
          <CIcon path={mdiAccount} slot="pre" />
          <CListItemTitle>Profile</CListItemTitle>
        </CListItem>

        <CListItem active>
          <CIcon path={mdiBell} slot="pre" />
          <CListItemTitle>Notifications</CListItemTitle>
          <CIcon path={mdiChevronRight} slot="post" />
        </CListItem>

        <CListItem disabled>
          <CIcon path={mdiCog} slot="pre" />
          <CListItemTitle>Settings</CListItemTitle>
        </CListItem>
      </CList>
    </div>
  );
};
