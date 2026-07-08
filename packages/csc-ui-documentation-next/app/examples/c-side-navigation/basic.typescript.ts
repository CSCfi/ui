// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  mdiFolderOutline,
  mdiOpenInNew,
  mdiViewDashboardOutline,
} from '@mdi/js';

const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const navigation = document.createElement('c-side-navigation');

const title = document.createElement('c-side-navigation-title');
title.textContent = 'My project';

const dashboardIcon = document.createElement('c-icon');
dashboardIcon.path = mdiViewDashboardOutline;

const dashboardItem = document.createElement('c-side-navigation-item');
dashboardItem.append(dashboardIcon, 'Dashboard');

const projectsIcon = document.createElement('c-icon');
projectsIcon.path = mdiFolderOutline;

const projectsItem = document.createElement('c-side-navigation-item');
projectsItem.active = true;

const activeProjects = document.createElement('c-sub-navigation-item');
activeProjects.textContent = 'Active projects';

const archivedProjects = document.createElement('c-sub-navigation-item');
archivedProjects.textContent = 'Archived projects';

projectsItem.append(projectsIcon, 'Projects', activeProjects, archivedProjects);

const serviceIcon = document.createElement('c-icon');
serviceIcon.path = mdiOpenInNew;

const serviceItem = document.createElement('c-side-navigation-item');
serviceItem.href = 'https://csc.fi';
serviceItem.target = '_blank';
serviceItem.append(serviceIcon, 'Service description');

const setCurrent = (value: string) => {
  dashboardItem.active = value === 'dashboard';
  activeProjects.active = value === 'active';
  archivedProjects.active = value === 'archived';
};

dashboardItem.addEventListener('itemChange', () => setCurrent('dashboard'));

activeProjects.addEventListener('click', () => setCurrent('active'));
activeProjects.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') setCurrent('active');
});

archivedProjects.addEventListener('click', () => setCurrent('archived'));
archivedProjects.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') setCurrent('archived');
});

setCurrent('active');

navigation.append(title, dashboardItem, projectsItem, serviceItem);
wrapper.append(navigation);
document.body.append(wrapper);
