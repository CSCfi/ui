// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiChevronDown, mdiFileDocument, mdiFilePdfBox } from '@mdi/js';

const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const menu = document.createElement('c-menu');

const trigger = document.createElement('c-button');
trigger.slot = 'trigger';
trigger.ghost = true;

const chevronIcon = document.createElement('c-icon');
chevronIcon.path = mdiChevronDown;

trigger.append('Export', chevronIcon);

const documentsItem = document.createElement('c-menu-item');
documentsItem.value = 'documents';

const pdfItem = document.createElement('c-menu-item');
pdfItem.slot = 'submenu';
pdfItem.value = 'pdf';

const pdfIcon = document.createElement('c-icon');
pdfIcon.path = mdiFilePdfBox;

pdfItem.append(pdfIcon, 'PDF');

const docxItem = document.createElement('c-menu-item');
docxItem.slot = 'submenu';
docxItem.value = 'docx';

const docxIcon = document.createElement('c-icon');
docxIcon.path = mdiFileDocument;

docxItem.append(docxIcon, 'Word document');

documentsItem.append('Documents', pdfItem, docxItem);

const settingsItem = document.createElement('c-menu-item');
settingsItem.value = 'settings';
settingsItem.textContent = 'Export settings…';

menu.append(trigger, documentsItem, settingsItem);

const status = document.createElement('span');
status.textContent = 'Selected: —';

menu.addEventListener('select', (event) => {
  status.textContent = `Selected: ${event.detail.value}`;
});

row.append(menu, status);
document.body.append(row);
