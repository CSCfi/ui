import type { CIconElement, CMenuItemElement } from '@cscfi/csc-ui';

import {
  mdiChevronDown,
  mdiMonitor,
  mdiThemeLightDark,
  mdiWeatherNight,
  mdiWeatherSunny,
} from '@mdi/js';

document.querySelector<CIconElement>('#theme-trigger-icon')!.path =
  mdiThemeLightDark;

document.querySelector<CIconElement>('c-icon.chevron')!.path = mdiChevronDown;

// Leading icons for the theme items.
const themeIcons: Record<string, string> = {
  dark: mdiWeatherNight,
  light: mdiWeatherSunny,
  system: mdiMonitor,
};

const themeItems = document.querySelectorAll<CMenuItemElement>(
  '#theme-menu c-menu-item',
);

themeItems.forEach((item) => {
  item.querySelector<CIconElement>('c-icon')!.path = themeIcons[item.value!]!;
});

document.querySelector('#theme-menu')!.addEventListener('select', (event) => {
  const { value } = (event as CustomEvent<{ value: string }>).detail;

  document.querySelector('#theme-value')!.textContent = value;
  themeItems.forEach((item) => (item.checked = item.value === value));
});
