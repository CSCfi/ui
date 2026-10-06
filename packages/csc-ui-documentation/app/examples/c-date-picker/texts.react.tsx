import type { CDatePickerRange, CDatePickerTexts } from '@cscfi/csc-ui';

import { CDatePicker } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

const months = [
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
];

const weekdays = [
  'sunnuntai',
  'maanantai',
  'tiistai',
  'keskiviikko',
  'torstai',
  'perjantai',
  'lauantai',
];

const texts: CDatePickerTexts = {
  chooseDate: 'Valitse päivä',
  clearSelection: 'Tyhjennä',
  closePanel: 'Sulje',
  // A day's name, its month in the partitive: keskiviikko 14. helmikuuta 2001.
  date: (iso) => {
    const [y, m, d] = iso.split('-').map(Number);

    const weekday = weekdays[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];

    return `${weekday} ${d}. ${months[m - 1]}ta ${y}`;
  },
  done: 'Valmis',
  end: 'Loppupäivä',
  endMonth: 'Loppukuukausi',
  endYear: 'Loppuvuosi',
  month: 'Kuukausi',
  months,
  monthsShort: [
    'tammi',
    'helmi',
    'maalis',
    'huhti',
    'touko',
    'kesä',
    'heinä',
    'elo',
    'syys',
    'loka',
    'marras',
    'joulu',
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
  startMonth: 'Alkukuukausi',
  startYear: 'Alkuvuosi',
  thisMonth: 'Tämä kuukausi',
  today: 'Tänään',
  unavailable: 'ei valittavissa',
  weekdays,
  weekdaysShort: ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'],
  weekNumber: 'Viikko',
  year: 'Vuosi',
};

export const Texts = () => {
  const [period, setPeriod] = useState<CDatePickerRange | null>(null);

  return (
    <div>
      <CDatePicker
        hint="Kirjoita päivämäärät tai valitse kalenterista"
        label="Lomajakso"
        onChange={(event) => setPeriod(event.detail as CDatePickerRange | null)}
        range
        showWeekNumbers
        texts={texts}
        value={period}
      />

      <p>Value: {period ? `${period.start} – ${period.end}` : 'null'}</p>
    </div>
  );
};
