import { CIcon, CList, CListItem, CListItemTitle } from '@cscfi/csc-ui-react';
import { mdiAccount, mdiBell, mdiCog } from '@mdi/js';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

const items = [
  { icon: mdiAccount, label: 'Profile' },
  { icon: mdiBell, label: 'Notifications' },
  { icon: mdiCog, label: 'Settings' },
];

export const Basic = () => {
  const [selected, setSelected] = useState('Profile');

  return (
    <div>
      <CList bordered>
        {items.map((item) => (
          <CListItem
            active={selected === item.label}
            key={item.label}
            onClick={() => setSelected(item.label)}
            ripple
          >
            <CIcon path={item.icon} slot="pre" />
            <CListItemTitle>{item.label}</CListItemTitle>
          </CListItem>
        ))}
      </CList>
    </div>
  );
};
