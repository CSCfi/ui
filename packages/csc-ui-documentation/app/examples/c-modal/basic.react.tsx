// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import {
  CButton,
  CCard,
  CCardActions,
  CCardContent,
  CCardTitle,
  CModal,
} from '@cscfi/csc-ui-react';

export const Basic = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="example-row">
      <CButton onClick={() => setOpen(true)}>Open modal</CButton>

      <CModal value={open} dismissable onChangeValue={() => setOpen(false)}>
        <CCard>
          <CCardTitle>Delete project</CCardTitle>

          <CCardContent>
            <p>This action cannot be undone.</p>
          </CCardContent>

          <CCardActions justify="end">
            <CButton text onClick={() => setOpen(false)}>
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
