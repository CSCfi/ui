import type { CColorPickerSwatch, CColorPickerTexts } from '@cscfi/csc-ui';

import { CColorPicker } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

const texts: CColorPickerTexts = {
  alpha: 'Läpinäkyvyys',
  blue: 'Sininen',
  brightness: 'Kirkkaus',
  chooseColor: 'Valitse väri',
  chroma: 'Kroma',
  clearSelection: 'Tyhjennä',
  closePanel: 'Sulje',
  done: 'Valmis',
  green: 'Vihreä',
  hex: 'Heksa',
  hue: 'Sävy',
  lightness: 'Valoisuus',
  notation: 'Merkintätapa',
  openPicker: 'Avaa värivalitsin',
  red: 'Punainen',
  restoreOriginal: 'Palauta alkuperäinen väri',
  saturation: 'Kylläisyys',
  swatches: 'Värimallit',
  toggleSwatches: 'Näytä värimallit',
};

const swatches: CColorPickerSwatch[] = [
  { name: 'Meri', value: '#1f6feb' },
  { name: 'Koralli', value: '#e5534b' },
  { name: 'Sammal', value: '#57ab5a' },
];

export const Texts = () => {
  const [color, setColor] = useState<null | string>('#1f6feb');

  return (
    <div>
      <CColorPicker
        alpha
        hint="Kirjoita väri tai valitse se"
        label="Väri"
        onChange={(event) => setColor(event.detail as null | string)}
        swatches={swatches}
        texts={texts}
        value={color}
      />

      <p>Value: {color ?? 'null'}</p>
    </div>
  );
};
