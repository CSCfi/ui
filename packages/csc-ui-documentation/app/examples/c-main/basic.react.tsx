// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CCscLogo, CMain, CPage, CToolbar } from '@cscfi/csc-ui-react';

const styles = `
/* Demo-only sizing: c-main normally fills the whole viewport. */
.demo-shell::part(root) {
  height: 320px;
}

.demo-shell c-page {
  height: auto;
}
`;

export const Basic = () => (
  <>
    <style>{styles}</style>

    <CMain className="demo-shell">
      <CToolbar className="relative">
        <CCscLogo />
        <span>My Service</span>
      </CToolbar>

      <CPage>
        <h2>Dashboard</h2>
        <p>Page content goes here.</p>
      </CPage>
    </CMain>
  </>
);
