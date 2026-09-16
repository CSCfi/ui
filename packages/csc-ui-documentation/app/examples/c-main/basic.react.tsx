// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  CAlert,
  CCscLogo,
  CMain,
  CPage,
  CSideNavigation,
  CSideNavigationItem,
  CSideNavigationTitle,
  CToolbar,
} from '@cscfi/csc-ui-react';

const styles = `
/* Demo-only sizing: c-main normally fills the whole viewport and the document scrolls. */
.demo-shell::part(root) {
  height: 320px;
  min-height: 0;
  overflow-y: auto;
}
`;

export const Basic = () => (
  <>
    <style>{styles}</style>

    <CMain className="demo-shell">
      <CAlert slot="banner" type="info">
        Scheduled maintenance on Saturday 06:00–08:00 EEST.
      </CAlert>

      <CToolbar>
        <CCscLogo />
        <span>My Service</span>
      </CToolbar>

      <CSideNavigation>
        <CSideNavigationTitle>My project</CSideNavigationTitle>
        <CSideNavigationItem active>Dashboard</CSideNavigationItem>
        <CSideNavigationItem>Members</CSideNavigationItem>
        <CSideNavigationItem>Billing</CSideNavigationItem>
      </CSideNavigation>

      <CPage>
        <h2>Dashboard</h2>
        <p>
          The banner leaves first. Then the toolbar pins to the top edge and the
          side navigation pins beneath it, while the page keeps scrolling
          underneath.
        </p>
        <p>
          In an application the shell fills the whole viewport and the document
          itself scrolls; here the shell is boxed to 320px so the behaviour is
          visible.
        </p>
        <p>
          Long menus get their own scrollbar inside the pinned side navigation,
          and the footer slot of the page stays at the bottom of a short page.
        </p>
        <p>
          Nothing here is demo-specific apart from the shell height: the layout
          components are slotted as direct children and c-main places them.
        </p>
        <p>Scroll back up to bring the banner back.</p>
      </CPage>
    </CMain>
  </>
);
