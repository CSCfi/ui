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

// Objects and functions have no attribute form: set them as DOM properties.
const picker = document.querySelector('c-date-picker')!;
picker.texts = texts;

picker.addEventListener('change', (event) => {
  const period = event.detail as CDatePickerRange | null;

  document.querySelector('p')!.textContent = period
    ? `Value: ${period.start} – ${period.end}`
    : 'Value: null';
});
