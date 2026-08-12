import { mdiMemory, mdiRocket, mdiServer } from '@mdi/js';

const icons = [mdiServer, mdiMemory, mdiRocket];

document.querySelectorAll('c-icon').forEach((icon, index) => {
  icon.path = icons[index]!;
});

const status = document.querySelector('p')!;

document.querySelector('c-swiper')!.addEventListener('changeValue', (event) => {
  status.textContent = `Selected flavor: ${event.detail}`;
});
