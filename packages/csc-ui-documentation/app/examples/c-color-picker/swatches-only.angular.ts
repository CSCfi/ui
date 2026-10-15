import type { CColorPickerSwatch } from '@cscfi/csc-ui';

// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

const swatches: CColorPickerSwatch[] = [
  { name: 'Ocean', value: '#1f6feb' },
  { name: 'Coral', value: '#e5534b' },
  { name: 'Moss', value: '#57ab5a' },
  { name: 'Sand', value: '#c69026' },
  { name: 'Plum', value: '#986ee2' },
  { name: 'Slate', value: '#768390' },
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
        hint="One of the project colours"
        label="Project colour"
        swatches-only
        (change)="color.set($any($event).detail)"
      ></c-color-picker>

      <p>Value: {{ color() ?? 'null' }}</p>
    </div>
  `,
})
export class SwatchesOnlyExampleComponent {
  color = signal<null | string>('#57ab5a');
  swatches = swatches;
}
