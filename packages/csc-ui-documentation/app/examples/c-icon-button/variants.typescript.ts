import {
  mdiAlertOutline,
  mdiCheck,
  mdiDelete,
  mdiInformationOutline,
  mdiPlus,
  mdiStarOutline,
} from '@mdi/js';

// One row per appearance, one icon per variant.
const row = [
  mdiPlus,
  mdiStarOutline,
  mdiCheck,
  mdiInformationOutline,
  mdiAlertOutline,
  mdiDelete,
];

const icons = [...row, ...row, ...row, ...row];

document.querySelectorAll('c-icon').forEach((icon, index) => {
  icon.path = icons[index]!;
});
