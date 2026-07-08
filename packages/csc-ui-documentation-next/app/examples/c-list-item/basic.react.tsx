// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiAccount, mdiBell, mdiChevronRight, mdiCog } from '@mdi/js';
import { CIcon, CList, CListItem, CListItemTitle } from '@cscfi/csc-ui-next-react';

export const Basic = () => {
  return (
    <div>
      <CList>
        <CListItem hoverable>
          <CIcon slot="pre" path={mdiAccount} />
          <CListItemTitle>Profile</CListItemTitle>
        </CListItem>

        <CListItem active>
          <CIcon slot="pre" path={mdiBell} />
          <CListItemTitle>Notifications</CListItemTitle>
          <CIcon slot="post" path={mdiChevronRight} />
        </CListItem>

        <CListItem disabled>
          <CIcon slot="pre" path={mdiCog} />
          <CListItemTitle>Settings</CListItemTitle>
        </CListItem>
      </CList>
    </div>
  );
};
