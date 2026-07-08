// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiFolderOutline } from '@mdi/js';

const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const navigation = document.createElement('c-side-navigation');

const projects = document.createElement('c-side-navigation-item');
projects.setAttribute('active', '');

const icon = document.createElement('c-icon');
icon.path = mdiFolderOutline;

const activeProjects = document.createElement('c-sub-navigation-item');
activeProjects.textContent = 'Active projects';

const archivedProjects = document.createElement('c-sub-navigation-item');
archivedProjects.textContent = 'Archived projects';

const serviceDescription = document.createElement('c-sub-navigation-item');
serviceDescription.setAttribute('href', 'https://csc.fi');
serviceDescription.setAttribute('target', '_blank');
serviceDescription.textContent = 'Service description';

let current = 'active';

const select = (value: string) => {
  current = value;
  activeProjects.active = current === 'active';
  archivedProjects.active = current === 'archived';
};

activeProjects.addEventListener('click', () => select('active'));
activeProjects.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') select('active');
});

archivedProjects.addEventListener('click', () => select('archived'));
archivedProjects.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') select('archived');
});

select('active');

projects.append(
  icon,
  'Projects',
  activeProjects,
  archivedProjects,
  serviceDescription,
);
navigation.append(projects);
wrapper.append(navigation);
document.body.append(wrapper);
