// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
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

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
  texts = texts;
  period = signal<CDatePickerRange | null>(null);
}
