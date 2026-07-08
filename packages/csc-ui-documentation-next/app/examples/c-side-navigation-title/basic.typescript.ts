// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  mdiDatabaseOutline,
  mdiHelpCircleOutline,
  mdiServerNetwork,
} from '@mdi/js';

const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const navigation = document.createElement('c-side-navigation');

const servicesTitle = document.createElement('c-side-navigation-title');
servicesTitle.textContent = 'Services';

const storageIcon = document.createElement('c-icon');
storageIcon.path = mdiDatabaseOutline;

const storageItem = document.createElement('c-side-navigation-item');
storageItem.append(storageIcon, 'Data storage');

const computingIcon = document.createElement('c-icon');
computingIcon.path = mdiServerNetwork;

const computingItem = document.createElement('c-side-navigation-item');
computingItem.append(computingIcon, 'Computing');

const supportTitle = document.createElement('c-side-navigation-title');
supportTitle.textContent = 'Support';

const guidesIcon = document.createElement('c-icon');
guidesIcon.path = mdiHelpCircleOutline;

const guidesItem = document.createElement('c-side-navigation-item');
guidesItem.append(guidesIcon, 'User guides');

navigation.append(
  servicesTitle,
  storageItem,
  computingItem,
  supportTitle,
  guidesItem,
);

wrapper.append(navigation);
document.body.append(wrapper);
