import { CTextField } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [name, setName] = useState('');

  return (
    <div>
      <CTextField
        hint="Shown on your public profile"
        label="Display name"
        onChangeValue={(event) => setName(event.detail as string)}
        value={name}
      />

      <p>Value: {name}</p>
    </div>
  );
};
