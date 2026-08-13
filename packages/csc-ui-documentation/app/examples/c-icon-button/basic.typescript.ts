import {
  mdiBellOutline,
  mdiDelete,
  mdiDotsVertical,
  mdiHeart,
  mdiPencil,
  mdiPlus,
} from '@mdi/js';

const icons = [
  mdiPlus,
  mdiPencil,
  mdiHeart,
  mdiDotsVertical,
  mdiDelete,
  mdiBellOutline,
  mdiPlus,
];

document.querySelectorAll('c-icon').forEach((icon, index) => {
  icon.path = icons[index]!;
});
