// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CTextField } from '@cscfi/csc-ui-react';

export const Basic = () => {
  const [name, setName] = useState('');

  return (
    <div>
      <CTextField
        value={name}
        hint="Shown on your public profile"
        label="Display name"
        onChangeValue={(event) => setName(event.detail as string)}
      />

      <p>Value: {name}</p>
    </div>
  );
};
