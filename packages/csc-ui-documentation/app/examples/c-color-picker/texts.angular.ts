import type { CColorPickerSwatch, CColorPickerTexts } from '@cscfi/csc-ui';

// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

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

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-color-picker
        [value]="color()"
        [swatches]="swatches"
        [texts]="texts"
        hint="Kirjoita väri tai valitse se"
        label="Väri"
        alpha
        (change)="color.set($any($event).detail)"
      ></c-color-picker>

      <p>Value: {{ color() ?? 'null' }}</p>
    </div>
  `,
})
export class TextsExampleComponent {
  color = signal<null | string>('#1f6feb');
  swatches = swatches;
  texts = texts;
}
