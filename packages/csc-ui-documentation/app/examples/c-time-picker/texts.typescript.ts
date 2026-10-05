import type { CTimePickerRange, CTimePickerTexts } from '@cscfi/csc-ui';

const texts: CTimePickerTexts = {
  am: 'ap.',
  chooseTime: 'Valitse aika',
  clearSelection: 'Tyhjennä',
  closePanel: 'Sulje',
  done: 'Valmis',
  end: 'Loppuaika',
  hours: 'Tunnit',
  minutes: 'Minuutit',
  now: 'Nyt',
  openClock: 'Avaa kellonajan valinta',
  period: 'ap./ip.',
  pm: 'ip.',
  start: 'Alkuaika',
};

// Objects have no attribute form: set them as DOM properties.
const picker = document.querySelector('c-time-picker')!;
picker.texts = texts;

picker.addEventListener('change', (event) => {
  const shift = event.detail as CTimePickerRange | null;

  document.querySelector('p')!.textContent = shift
    ? `Value: ${shift.start} – ${shift.end}`
    : 'Value: null';
});
