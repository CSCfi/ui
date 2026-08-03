import { mdiFolderOutline } from '@mdi/js';

document.querySelector('c-icon')!.path = mdiFolderOutline;

const [activeProjects, archivedProjects] = document.querySelectorAll(
  'c-sub-navigation-item',
);

const selectable = [activeProjects!, archivedProjects!];

selectable.forEach((item) => {
  const select = () => {
    selectable.forEach((other) => (other.active = other === item));
  };

  item.addEventListener('click', select);

  item.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') select();
  });
});
