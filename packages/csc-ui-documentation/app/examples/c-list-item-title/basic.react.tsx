// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CList, CListItem, CListItemTitle } from '@cscfi/csc-ui-react';

export const Basic = () => (
  <div>
    <CList>
      <CListItem>
        <CListItemTitle>Profile</CListItemTitle>
      </CListItem>

      <CListItem active>
        <CListItemTitle>Notifications</CListItemTitle>
      </CListItem>

      <CListItem>
        <CListItemTitle>Settings</CListItemTitle>
      </CListItem>
    </CList>
  </div>
);
