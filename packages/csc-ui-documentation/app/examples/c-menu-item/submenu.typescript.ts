import { mdiChevronDown, mdiFileDocument, mdiFilePdfBox } from '@mdi/js';

const icons = [mdiChevronDown, mdiFilePdfBox, mdiFileDocument];

document.querySelectorAll('c-icon').forEach((icon, index) => {
  icon.path = icons[index]!;
});

const status = document.querySelector('p')!;

document.querySelector('c-menu')!.addEventListener('select', (event) => {
  status.textContent = `Selected: ${event.detail.value}`;
});
