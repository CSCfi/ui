import { CTextField } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Textarea = () => {
  const [description, setDescription] = useState('');

  return (
    <div>
      <CTextField
        hint="A rows value above 1 renders a textarea"
        label="Description"
        onChangeValue={(event) => setDescription(event.detail as string)}
        rows={4}
        value={description}
      />
    </div>
  );
};
