// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CTimePicker } from '@cscfi/csc-ui-react';
import type { CTimePickerRange, CTimePickerTexts } from '@cscfi/csc-ui';

const texts: CTimePickerTexts = {
  chooseTime: 'Valitse aika',
  clearSelection: 'Tyhjennä',
  closePanel: 'Sulje',
  end: 'Loppuaika',
  hours: 'Tunnit',
  minutes: 'Minuutit',
  openClock: 'Avaa kellonajan valinta',
  start: 'Alkuaika',
};

export const Texts = () => {
  const [shift, setShift] = useState<CTimePickerRange | null>(null);

  return (
    <div>
      <CTimePicker
        value={shift}
        texts={texts}
        format="H.mm"
        hint="Kirjoita ajat tai valitse listoista"
        label="Työvuoro"
        range
        onChange={(event) => setShift(event.detail as CTimePickerRange | null)}
      />

      <p>Value: {shift ? `${shift.start} – ${shift.end}` : 'null'}</p>
    </div>
  );
};
