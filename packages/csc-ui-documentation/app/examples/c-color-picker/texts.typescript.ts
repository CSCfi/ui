import type { CColorPickerSwatch, CColorPickerTexts } from '@cscfi/csc-ui';

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

// Objects and arrays have no attribute form: set them as DOM properties.
const picker = document.querySelector('c-color-picker')!;
picker.texts = texts;
picker.swatches = swatches;

picker.addEventListener('change', (event) => {
  document.querySelector('p')!.textContent = `Value: ${event.detail ?? 'null'}`;
});
