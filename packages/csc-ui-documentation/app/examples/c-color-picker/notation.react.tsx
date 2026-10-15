import { CColorPicker } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Notation = () => {
  const [color, setColor] = useState<null | string>(
    'oklch(0.5686 0.202 259.7)',
  );

  return (
    <div>
      <CColorPicker
        format="oklch"
        hint="The value is always written as oklch()"
        label="Brand colour"
        onChange={(event) => setColor(event.detail as null | string)}
        value={color}
      />

      <p>Value: {color ?? 'null'}</p>
    </div>
  );
};
