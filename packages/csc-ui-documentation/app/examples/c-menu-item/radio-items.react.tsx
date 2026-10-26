import {
  CButton,
  CIcon,
  CMenu,
  CMenuItem,
  CMenuLabel,
} from '@cscfi/csc-ui-react';
import {
  mdiChevronDown,
  mdiMonitor,
  mdiThemeLightDark,
  mdiWeatherNight,
  mdiWeatherSunny,
} from '@mdi/js';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

const themes = [
  { icon: mdiWeatherNight, label: 'Dark', value: 'dark' },
  { icon: mdiWeatherSunny, label: 'Light', value: 'light' },
  { icon: mdiMonitor, label: 'System', value: 'system' },
];

export const RadioItems = () => {
  const [theme, setTheme] = useState('dark');

  return (
    <div className="example-row">
      <CMenu onSelect={(event) => setTheme(event.detail.value)}>
        <CButton slot="trigger" text>
          <CIcon path={mdiThemeLightDark} />
          Theme: {theme}
          <CIcon path={mdiChevronDown} />
        </CButton>

        <CMenuLabel>Theme</CMenuLabel>

        {themes.map((option) => (
          <CMenuItem
            checked={theme === option.value}
            key={option.value}
            type="radio"
            value={option.value}
          >
            <CIcon path={option.icon} slot="icon" />
            {option.label}
          </CMenuItem>
        ))}
      </CMenu>
    </div>
  );
};
