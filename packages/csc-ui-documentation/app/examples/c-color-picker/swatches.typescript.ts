import type { CColorPickerSwatch } from '@cscfi/csc-ui';

const swatches: CColorPickerSwatch[] = [
  { name: 'Ocean', value: '#1f6feb' },
  { name: 'Coral', value: '#e5534b' },
  { name: 'Moss', value: '#57ab5a' },
  { name: 'Sand', value: '#c69026' },
  { name: 'Plum', value: '#986ee2' },
  { name: 'Slate', value: '#768390' },
];

// Arrays have no attribute form: set them as DOM properties.
const picker = document.querySelector('c-color-picker')!;
picker.swatches = swatches;

picker.addEventListener('change', (event) => {
  document.querySelector('p')!.textContent = `Value: ${event.detail ?? 'null'}`;
});
