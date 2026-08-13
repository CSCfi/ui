import {
  mdiChevronDown,
  mdiFileDocument,
  mdiFileJpgBox,
  mdiFilePdfBox,
  mdiFilePngBox,
} from '@mdi/js';

const icons = [
  mdiChevronDown,
  mdiFilePdfBox,
  mdiFileDocument,
  mdiFilePngBox,
  mdiFileJpgBox,
];

document.querySelectorAll('c-icon').forEach((icon, index) => {
  icon.path = icons[index]!;
});

const status = document.querySelector('p')!;

document.querySelector('c-menu')!.addEventListener('select', (event) => {
  status.textContent = `Selected: ${event.detail.value}`;
});
