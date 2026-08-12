// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CCheckbox } from '@cscfi/csc-ui-react';

export const Basic = () => {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className="example-row">
      <CCheckbox
        checked={subscribed}
        hint="You can unsubscribe at any time"
        onChangeValue={(event) => setSubscribed(event.detail as boolean)}
      >
        Subscribe to the newsletter
      </CCheckbox>

      <p>Value: {String(subscribed)}</p>
    </div>
  );
};
