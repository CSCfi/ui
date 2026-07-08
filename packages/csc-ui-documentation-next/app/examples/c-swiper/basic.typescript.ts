// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiMemory, mdiRocket, mdiServer } from '@mdi/js';

const container = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const swiper = document.createElement('c-swiper');
swiper.value = 'standard';

const tabs = [
  { value: 'standard', label: 'Standard', icon: mdiServer, specs: '4 cores, 8 GB RAM' },
  { value: 'performance', label: 'Performance', icon: mdiMemory, specs: '8 cores, 32 GB RAM' },
  { value: 'gpu', label: 'GPU', icon: mdiRocket, specs: '1 GPU, 112 GB RAM' },
];

for (const { value, label, icon, specs } of tabs) {
  const tab = document.createElement('c-swiper-tab');
  tab.value = value;
  tab.label = label;

  const tabIcon = document.createElement('c-icon');
  tabIcon.slot = 'icon';
  tabIcon.path = icon;

  tab.append(tabIcon, specs);
  swiper.append(tab);
}

const status = document.createElement('p');
status.textContent = 'Selected flavor: standard';

swiper.addEventListener('changeValue', (event) => {
  status.textContent = `Selected flavor: ${event.detail}`;
});

container.append(swiper, status);
document.body.append(container);
