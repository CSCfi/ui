// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiMemory, mdiRocket, mdiServer } from '@mdi/js';

const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const swiper = document.createElement('c-swiper');
swiper.setAttribute('value', 'standard');

const standardTab = document.createElement('c-swiper-tab');
standardTab.setAttribute('value', 'standard');
standardTab.setAttribute('label', 'Standard');

const standardIcon = document.createElement('c-icon');
standardIcon.slot = 'icon';
standardIcon.path = mdiServer;

standardTab.append(standardIcon, '4 cores, 8 GB RAM');

const performanceTab = document.createElement('c-swiper-tab');
performanceTab.setAttribute('value', 'performance');
performanceTab.setAttribute('label', 'Performance');

const performanceIcon = document.createElement('c-icon');
performanceIcon.slot = 'icon';
performanceIcon.path = mdiMemory;

performanceTab.append(performanceIcon, '8 cores, 32 GB RAM');

const gpuTab = document.createElement('c-swiper-tab');
gpuTab.setAttribute('value', 'gpu');
gpuTab.setAttribute('label', 'GPU');
gpuTab.setAttribute('disabled', '');

const gpuIcon = document.createElement('c-icon');
gpuIcon.slot = 'icon';
gpuIcon.path = mdiRocket;

gpuTab.append(gpuIcon, '1 GPU, 112 GB RAM');

swiper.append(standardTab, performanceTab, gpuTab);
wrapper.append(swiper);
document.body.append(wrapper);
