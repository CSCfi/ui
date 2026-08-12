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

const setCurrent = (value: string) => {
  dashboardItem!.active = value === 'dashboard';
  activeProjects!.active = value === 'active';
  archivedProjects!.active = value === 'archived';
};

dashboardItem!.addEventListener('itemChange', () => setCurrent('dashboard'));

activeProjects!.addEventListener('click', () => setCurrent('active'));
activeProjects!.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') setCurrent('active');
});

archivedProjects!.addEventListener('click', () => setCurrent('archived'));
archivedProjects!.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') setCurrent('archived');
});
