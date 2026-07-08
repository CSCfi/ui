// @ts-nocheck — documentation code sample; shown as text, never compiled here
import type { CDataTableColumn } from '@cscfi/csc-ui-next';

const styles = document.createElement('style');
styles.textContent = `
.resizable {
  max-width: 100%;
  min-width: 320px;
  overflow: auto;
  resize: horizontal;
  width: 560px;
}
`;
document.head.append(styles);

const columns: CDataTableColumn[] = [
  { header: 'Project', key: 'name', pinned: 'left' },
  { header: 'Owner', key: 'owner' },
  { header: 'Facility', key: 'facility' },
  { header: 'Quota', key: 'quota' },
  { header: 'Created', key: 'created' },
];

const data = [
  {
    created: '2026-01-14',
    facility: 'Puhti',
    name: 'Aurora',
    owner: 'aino.virtanen@example.fi',
    quota: '20 TB',
  },
  {
    created: '2026-02-02',
    facility: 'Mahti',
    name: 'Borealis',
    owner: 'eero.korhonen@example.fi',
    quota: '5 TB',
  },
  {
    created: '2026-02-19',
    facility: 'LUMI',
    name: 'Cirrus',
    owner: 'sofia.laine@example.fi',
    quota: '80 TB',
  },
];

// Drag the handle in the wrapper's bottom-right corner: with `autohide`,
// columns that stop fitting move into the expansion row (rightmost first).
// The pinned column never hides. Without `autohide` the table would scroll
// horizontally instead.
const resizable = document.createElement('div');
resizable.className = 'resizable';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const table = document.createElement('c-data-table');
table.columns = columns;
table.data = data;
table.setAttribute('autohide', '');

resizable.append(table);
document.body.append(resizable);
