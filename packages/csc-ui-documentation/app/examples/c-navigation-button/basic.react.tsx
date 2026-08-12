// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CNavigationButton } from '@cscfi/csc-ui-react';

export const Basic = () => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <div className="example-row">
      <CNavigationButton onClick={() => setMenuVisible(!menuVisible)} />

      <p>Menu {menuVisible ? 'open' : 'closed'}</p>
    </div>
  );
};
