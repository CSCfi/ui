import type { CColorPickerSwatch } from '@cscfi/csc-ui';

import { CColorPicker } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

const swatches: CColorPickerSwatch[] = [
  { name: 'Ocean', value: '#1f6feb' },
  { name: 'Coral', value: '#e5534b' },
  { name: 'Moss', value: '#57ab5a' },
  { name: 'Sand', value: '#c69026' },
  { name: 'Plum', value: '#986ee2' },
  { name: 'Slate', value: '#768390' },
];

export const Swatches = () => {
  const [color, setColor] = useState<null | string>(null);

  return (
    <div>
      <CColorPicker
        hint="Pick a suggestion or any other colour"
        label="Label colour"
        onChange={(event) => setColor(event.detail as null | string)}
        swatches={swatches}
        value={color}
      />

      <p>Value: {color ?? 'null'}</p>
    </div>
  );
};
