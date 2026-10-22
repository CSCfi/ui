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
  mdiRadioboxMarked,
  mdiThemeLightDark,
  mdiWeatherNight,
  mdiWeatherSunny,
} from '@mdi/js';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const ActiveItems = () => {
  const [theme, setTheme] = useState('dark');

  const [sortBy, setSortBy] = useState('name');

  return (
    <div className="example-row">
      <CMenu onSelect={(event) => setTheme(event.detail.value)}>
        <CButton slot="trigger" text>
          <CIcon path={mdiThemeLightDark} />
          Theme: {theme}
          <CIcon path={mdiChevronDown} />
        </CButton>

        <CMenuLabel>Theme</CMenuLabel>

        <CMenuItem
          active={theme === 'dark'}
          icon={mdiWeatherNight}
          value="dark"
        >
          Dark
        </CMenuItem>
        <CMenuItem
          active={theme === 'light'}
          icon={mdiWeatherSunny}
          value="light"
        >
          Light
        </CMenuItem>
        <CMenuItem active={theme === 'system'} icon={mdiMonitor} value="system">
          System
        </CMenuItem>
      </CMenu>

      <CMenu onSelect={(event) => setSortBy(event.detail.value)}>
        <CButton slot="trigger" text>
          Sort by: {sortBy}
          <CIcon path={mdiChevronDown} />
        </CButton>

        {['name', 'size', 'date'].map((key) => (
          <CMenuItem
            active={sortBy === key}
            activeIcon={mdiRadioboxMarked}
            key={key}
            value={key}
          >
            {key}
          </CMenuItem>
        ))}
      </CMenu>
    </div>
  );
};
