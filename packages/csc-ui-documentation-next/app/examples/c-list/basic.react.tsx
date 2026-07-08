// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import {
  CIcon,
  CList,
  CListItem,
  CListItemTitle,
} from '@cscfi/csc-ui-next-react';
import { mdiAccount, mdiBell, mdiCog } from '@mdi/js';

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
            key={item.label}
            ripple
            active={selected === item.label}
            onClick={() => setSelected(item.label)}
          >
            <CIcon slot="pre" path={item.icon} />
            <CListItemTitle>{item.label}</CListItemTitle>
          </CListItem>
        ))}
      </CList>
    </div>
  );
};
