// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CTextField } from '@cscfi/csc-ui-react';

export const Textarea = () => {
  const [description, setDescription] = useState('');

  return (
    <div>
      <CTextField
        value={description}
        hint="A rows value above 1 renders a textarea"
        label="Description"
        rows={4}
        onChangeValue={(event) => setDescription(event.detail as string)}
      />
    </div>
  );
};
