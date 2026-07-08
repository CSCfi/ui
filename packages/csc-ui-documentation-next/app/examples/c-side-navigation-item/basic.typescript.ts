// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  mdiFolderOutline,
  mdiOpenInNew,
  mdiViewDashboardOutline,
} from '@mdi/js';

let current = 'dashboard';

const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const navigation = document.createElement('c-side-navigation');

const dashboardItem = document.createElement('c-side-navigation-item');
const dashboardIcon = document.createElement('c-icon');
dashboardIcon.path = mdiViewDashboardOutline;
dashboardItem.append(dashboardIcon, 'Dashboard');
dashboardItem.addEventListener('itemChange', () => setCurrent('dashboard'));

const projectsItem = document.createElement('c-side-navigation-item');
projectsItem.setAttribute('active', '');
const projectsIcon = document.createElement('c-icon');
projectsIcon.path = mdiFolderOutline;

const activeProjects = document.createElement('c-sub-navigation-item');
activeProjects.textContent = 'Active projects';
activeProjects.addEventListener('click', () => setCurrent('active'));
activeProjects.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') setCurrent('active');
});

const archivedProjects = document.createElement('c-sub-navigation-item');
archivedProjects.textContent = 'Archived projects';
archivedProjects.addEventListener('click', () => setCurrent('archived'));
archivedProjects.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') setCurrent('archived');
});

projectsItem.append(projectsIcon, 'Projects', activeProjects, archivedProjects);

const serviceItem = document.createElement('c-side-navigation-item');
serviceItem.setAttribute('href', 'https://csc.fi');
serviceItem.setAttribute('target', '_blank');
const serviceIcon = document.createElement('c-icon');
serviceIcon.path = mdiOpenInNew;
serviceItem.append(serviceIcon, 'Service description');

function setCurrent(value: string) {
  current = value;
  dashboardItem.active = current === 'dashboard';
  activeProjects.active = current === 'active';
  archivedProjects.active = current === 'archived';
}

setCurrent(current);

navigation.append(dashboardItem, projectsItem, serviceItem);
wrapper.append(navigation);
document.body.append(wrapper);
