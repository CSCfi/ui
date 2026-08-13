// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CTab, CTabItem, CTabItems, CTabs } from '@cscfi/csc-ui-react';

export const Vertical = () => (
  <div>
    <CTabs vertical value="profile">
      <CTab value="profile">Profile</CTab>
      <CTab value="security">Security</CTab>
      <CTab value="tokens">API tokens</CTab>

      <CTabItems slot="items">
        <CTabItem value="profile">
          <p>Your name, email and avatar.</p>
        </CTabItem>
        <CTabItem value="security">
          <p>Password and two-factor authentication.</p>
        </CTabItem>
        <CTabItem value="tokens">
          <p>Personal access tokens for the API.</p>
        </CTabItem>
      </CTabItems>
    </CTabs>
  </div>
);
