import {
  mdiDatabaseOutline,
  mdiHelpCircleOutline,
  mdiServerNetwork,
} from '@mdi/js';

const icons = [mdiDatabaseOutline, mdiServerNetwork, mdiHelpCircleOutline];

document.querySelectorAll('c-icon').forEach((icon, index) => {
  icon.path = icons[index]!;
});
