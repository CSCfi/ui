import {
  mdiChevronDown,
  mdiMonitor,
  mdiRadioboxMarked,
  mdiThemeLightDark,
  mdiWeatherNight,
  mdiWeatherSunny,
} from '@mdi/js';
import type { CMenuItem } from '@cscfi/csc-ui';

document.querySelector('#theme-trigger-icon')!.path = mdiThemeLightDark;

document.querySelectorAll('c-icon.chevron').forEach((icon) => {
  icon.path = mdiChevronDown;
});

// Leading icons for the theme items.
const themeIcons: Record<string, string> = {
  dark: mdiWeatherNight,
  light: mdiWeatherSunny,
  system: mdiMonitor,
};

const themeItems = document.querySelectorAll<CMenuItem>(
  '#theme-menu c-menu-item',
);

themeItems.forEach((item) => {
  item.icon = themeIcons[item.value!]!;
  item.active = item.value === 'dark';
});

document.querySelector('#theme-menu')!.addEventListener('select', (event) => {
  const { value } = (event as CustomEvent<{ value: string }>).detail;

  document.querySelector('#theme-value')!.textContent = value;
  themeItems.forEach((item) => (item.active = item.value === value));
});

// Sort menu: override the default check indicator per item.
const sortItems = document.querySelectorAll<CMenuItem>('#sort-menu c-menu-item');

sortItems.forEach((item) => {
  item.activeIcon = mdiRadioboxMarked;
  item.active = item.value === 'name';
});

document.querySelector('#sort-menu')!.addEventListener('select', (event) => {
  const { value } = (event as CustomEvent<{ value: string }>).detail;

  document.querySelector('#sort-value')!.textContent = value;
  sortItems.forEach((item) => (item.active = item.value === value));
});
