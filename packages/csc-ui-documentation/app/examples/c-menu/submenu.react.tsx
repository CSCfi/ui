import {
  CButton,
  CDivider,
  CIcon,
  CMenu,
  CMenuItem,
} from '@cscfi/csc-ui-react';
import {
  mdiChevronDown,
  mdiFileDocument,
  mdiFileJpgBox,
  mdiFilePdfBox,
  mdiFilePngBox,
} from '@mdi/js';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Submenu = () => {
  const [selected, setSelected] = useState<null | string>(null);

  return (
    <div className="example-row">
      <CMenu onSelect={(event) => setSelected(event.detail.value as string)}>
        <CButton ghost slot="trigger">
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

        <CMenuItem value="images">
          Images
          <CMenuItem slot="submenu" value="png">
            <CIcon path={mdiFilePngBox} />
            PNG
          </CMenuItem>
          <CMenuItem slot="submenu" value="jpg">
            <CIcon path={mdiFileJpgBox} />
            JPEG
          </CMenuItem>
        </CMenuItem>

        <CDivider />

        <CMenuItem value="settings">Export settings…</CMenuItem>
      </CMenu>

      <p>Selected: {selected ?? '—'}</p>
    </div>
  );
};
