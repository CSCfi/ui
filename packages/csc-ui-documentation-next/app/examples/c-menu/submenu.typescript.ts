// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  mdiChevronDown,
  mdiFileDocument,
  mdiFileJpgBox,
  mdiFilePdfBox,
  mdiFilePngBox,
} from '@mdi/js';

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

const imagesItem = document.createElement('c-menu-item');
imagesItem.value = 'images';

const pngItem = document.createElement('c-menu-item');
pngItem.slot = 'submenu';
pngItem.value = 'png';

const pngIcon = document.createElement('c-icon');
pngIcon.path = mdiFilePngBox;

pngItem.append(pngIcon, 'PNG');

const jpgItem = document.createElement('c-menu-item');
jpgItem.slot = 'submenu';
jpgItem.value = 'jpg';

const jpgIcon = document.createElement('c-icon');
jpgIcon.path = mdiFileJpgBox;

jpgItem.append(jpgIcon, 'JPEG');

imagesItem.append('Images', pngItem, jpgItem);

const divider = document.createElement('c-divider');

const settingsItem = document.createElement('c-menu-item');
settingsItem.value = 'settings';
settingsItem.textContent = 'Export settings…';

menu.append(trigger, documentsItem, imagesItem, divider, settingsItem);

const status = document.createElement('span');
status.textContent = 'Selected: —';

menu.addEventListener('select', (event) => {
  status.textContent = `Selected: ${event.detail.value}`;
});

row.append(menu, status);
document.body.append(row);
