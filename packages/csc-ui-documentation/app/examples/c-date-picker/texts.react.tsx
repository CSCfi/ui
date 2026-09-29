// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CDatePicker } from '@cscfi/csc-ui-react';
import type { CDatePickerRange, CDatePickerTexts } from '@cscfi/csc-ui';

const texts: CDatePickerTexts = {
  chooseDate: 'Valitse päivä',
  clearSelection: 'Tyhjennä',
  closePanel: 'Sulje',
  end: 'Loppupäivä',
  months: [
    'tammikuu',
    'helmikuu',
    'maaliskuu',
    'huhtikuu',
    'toukokuu',
    'kesäkuu',
    'heinäkuu',
    'elokuu',
    'syyskuu',
    'lokakuu',
    'marraskuu',
    'joulukuu',
  ],
  nextMonth: 'Seuraava kuukausi',
  nextYear: 'Seuraava vuosi',
  openCalendar: 'Avaa kalenteri',
  pendingStart: (date) => `Alkupäivä ${date} valittu. Valitse loppupäivä.`,
  previousMonth: 'Edellinen kuukausi',
  previousYear: 'Edellinen vuosi',
  selectMonth: 'Valitse kuukausi',
  selectYear: 'Valitse vuosi',
  start: 'Alkupäivä',
  unavailable: 'ei valittavissa',
  weekNumber: 'Viikko',
  weekdaysShort: ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'],
};

export const Texts = () => {
  const [period, setPeriod] = useState<CDatePickerRange | null>(null);

  return (
    <div>
      <CDatePicker
        value={period}
        texts={texts}
        hint="Kirjoita päivämäärät tai valitse kalenterista"
        label="Lomajakso"
        range
        showWeekNumbers
        onChange={(event) => setPeriod(event.detail as CDatePickerRange | null)}
      />

      <p>Value: {period ? `${period.start} – ${period.end}` : 'null'}</p>
    </div>
  );
};
