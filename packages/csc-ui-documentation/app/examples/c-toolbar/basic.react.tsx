// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CButton, CCscLogo, CToolbar } from '@cscfi/csc-ui-react';

export const Basic = () => (
  <div>
    {/* static keeps the toolbar in the page flow; by default it is pinned to the top of its scroll container */}
    <CToolbar static>
      <CCscLogo />
      <span>My Service</span>
      <CButton style={{ marginInlineStart: 'auto' }} text>
        Log out
      </CButton>
    </CToolbar>
  </div>
);
