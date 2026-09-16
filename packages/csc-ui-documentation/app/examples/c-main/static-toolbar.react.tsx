// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
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

export const StaticToolbar = () => (
  <>
    <style>{styles}</style>

    <CMain className="demo-shell">
      <CToolbar static>
        <CCscLogo />
        <span>My Service</span>
      </CToolbar>

      <CSideNavigation>
        <CSideNavigationTitle>My project</CSideNavigationTitle>
        <CSideNavigationItem active>Dashboard</CSideNavigationItem>
        <CSideNavigationItem>Members</CSideNavigationItem>
      </CSideNavigation>

      <CPage>
        <h2>Dashboard</h2>
        <p>
          With static the toolbar is ordinary content: it scrolls away with the
          page instead of pinning to the top edge.
        </p>
        <p>
          c-main follows the toolbar. Once the bar has left, the side navigation
          pins to the top edge instead of one toolbar height down.
        </p>
        <p>
          In an application the shell fills the whole viewport and the document
          itself scrolls; here the shell is boxed to 320px so the behaviour is
          visible.
        </p>
        <p>Scroll back up to bring the toolbar back.</p>
      </CPage>
    </CMain>
  </>
);
