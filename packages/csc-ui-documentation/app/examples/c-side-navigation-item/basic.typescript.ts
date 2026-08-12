import {
  mdiFolderOutline,
  mdiOpenInNew,
  mdiViewDashboardOutline,
} from '@mdi/js';

const icons = [mdiViewDashboardOutline, mdiFolderOutline, mdiOpenInNew];

document.querySelectorAll('c-icon').forEach((icon, index) => {
  icon.path = icons[index]!;
});

const [dashboardItem] = document.querySelectorAll('c-side-navigation-item');

const [activeProjects, archivedProjects] = document.querySelectorAll(
  'c-sub-navigation-item',
);

function setCurrent(current: string) {
  dashboardItem!.active = current === 'dashboard';
  activeProjects!.active = current === 'active';
  archivedProjects!.active = current === 'archived';
}

dashboardItem!.addEventListener('itemChange', () => setCurrent('dashboard'));

activeProjects!.addEventListener('click', () => setCurrent('active'));
activeProjects!.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') setCurrent('active');
});

archivedProjects!.addEventListener('click', () => setCurrent('archived'));
archivedProjects!.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') setCurrent('archived');
});
