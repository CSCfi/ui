import type { CDatePickerRange, CDatePickerTexts } from '@cscfi/csc-ui';

// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

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

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-date-picker
        [value]="period()"
        [texts]="texts"
        hint="Kirjoita päivämäärät tai valitse kalenterista"
        label="Lomajakso"
        range
        show-week-numbers
        (change)="period.set($any($event).detail)"
      ></c-date-picker>

      <p>
        Value: {{ period() ? period()!.start + ' – ' + period()!.end : 'null' }}
      </p>
    </div>
  `,
})
export class TextsExampleComponent {
  period = signal<CDatePickerRange | null>(null);
  texts = texts;
}
