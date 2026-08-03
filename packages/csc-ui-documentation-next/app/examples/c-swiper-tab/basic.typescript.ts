import { mdiMemory, mdiRocket, mdiServer } from '@mdi/js';

const icons = [mdiServer, mdiMemory, mdiRocket];

document.querySelectorAll('c-icon').forEach((icon, index) => {
  icon.path = icons[index]!;
});
