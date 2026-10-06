import {
  CButton,
  CCard,
  CCardActions,
  CCardContent,
  CCardTitle,
  CModal,
} from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="example-row">
      <CButton onClick={() => setOpen(true)}>Open modal</CButton>

      <CModal dismissable onChangeValue={() => setOpen(false)} value={open}>
        <CCard>
          <CCardTitle>Delete project</CCardTitle>

          <CCardContent>
            <p>This action cannot be undone.</p>
          </CCardContent>

          <CCardActions justify="end">
            <CButton onClick={() => setOpen(false)} text>
              Cancel
            </CButton>
            <CButton danger onClick={() => setOpen(false)}>
              Delete
            </CButton>
          </CCardActions>
        </CCard>
      </CModal>
    </div>
  );
};
