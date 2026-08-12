// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-slider
        [value]="cores()"
        label="CPU cores"
        labels
        max="8"
        min="0"
        segments="8"
        step="1"
        ticks
        unit=""
        (changeValue)="cores.set($any($event).detail)"
      ></c-slider>
    </div>
  `,
})
export class TicksExampleComponent {
  cores = signal(2);
}
