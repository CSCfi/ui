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

dashboardItem!.addEventListener('select', () => setCurrent('dashboard'));

activeProjects!.addEventListener('select', () => setCurrent('active'));

archivedProjects!.addEventListener('select', () => setCurrent('archived'));
