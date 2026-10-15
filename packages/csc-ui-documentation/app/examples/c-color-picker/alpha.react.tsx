import { CColorPicker } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Alpha = () => {
  const [color, setColor] = useState<null | string>('rgb(31 111 235 / 0.5)');

  return (
    <div>
      <CColorPicker
        alpha
        format="rgb"
        hint="Drag the alpha slider for transparency"
        label="Overlay colour"
        onChange={(event) => setColor(event.detail as null | string)}
        value={color}
      />

      <p>Value: {color ?? 'null'}</p>
    </div>
  );
};
