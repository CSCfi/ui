// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CButton, CCscLogo, CToolbar } from '@cscfi/csc-ui-react';

export const Basic = () => (
  <div>
    {/* The relative class keeps the toolbar in flow; by default it is fixed to the top of the viewport */}
    <CToolbar className="relative">
      <CCscLogo />
      <span>My Service</span>
      <CButton style={{ marginInlineStart: 'auto' }} text>
        Log out
      </CButton>
    </CToolbar>
  </div>
);
