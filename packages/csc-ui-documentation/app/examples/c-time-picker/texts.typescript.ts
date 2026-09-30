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

// Objects have no attribute form: set them as DOM properties.
const picker = document.querySelector('c-time-picker')!;
picker.texts = texts;

picker.addEventListener('change', (event) => {
  const shift = event.detail as CTimePickerRange | null;

  document.querySelector('p')!.textContent = shift
    ? `Value: ${shift.start} – ${shift.end}`
    : 'Value: null';
});
