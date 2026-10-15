import { CColorPicker } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [color, setColor] = useState<null | string>('#1f6feb');

  return (
    <div>
      <CColorPicker
        clearable
        hint="Type any CSS colour or open the picker"
        label="Colour"
        onChange={(event) => setColor(event.detail as null | string)}
        value={color}
      />

      <p>Value: {color ?? 'null'}</p>
    </div>
  );
};
