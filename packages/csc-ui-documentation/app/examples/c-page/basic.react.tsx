// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CPage } from '@cscfi/csc-ui-react';

export const Basic = () => (
  // Demo-only sizing: c-page normally fills the viewport below the toolbar.
  <CPage style={{ height: '240px' }}>
    <h2>Reports</h2>
    <p>The default slot is wrapped in a centered max-width container.</p>

    <div slot="footer">Footer content</div>
  </CPage>
);
