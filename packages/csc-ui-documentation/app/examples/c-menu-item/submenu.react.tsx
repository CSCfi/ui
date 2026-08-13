// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { mdiChevronDown, mdiFileDocument, mdiFilePdfBox } from '@mdi/js';
import { CButton, CIcon, CMenu, CMenuItem } from '@cscfi/csc-ui-react';

export const Submenu = () => {
  const [selected, setSelected] = useState<null | string>(null);

  return (
    <div className="example-row">
      <CMenu onSelect={(event) => setSelected(event.detail.value as string)}>
        <CButton slot="trigger" ghost>
          Export
          <CIcon path={mdiChevronDown} />
        </CButton>

        <CMenuItem value="documents">
          Documents
          <CMenuItem slot="submenu" value="pdf">
            <CIcon path={mdiFilePdfBox} />
            PDF
          </CMenuItem>
          <CMenuItem slot="submenu" value="docx">
            <CIcon path={mdiFileDocument} />
            Word document
          </CMenuItem>
        </CMenuItem>

        <CMenuItem value="settings">Export settings…</CMenuItem>
      </CMenu>

      <p>Selected: {selected ?? '—'}</p>
    </div>
  );
};
