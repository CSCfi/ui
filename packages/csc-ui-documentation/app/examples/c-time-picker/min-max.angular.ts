// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-time-picker
        [value]="time()"
        hint="Between 8.00 and 16.00"
        label="Pickup time"
        max="16:00"
        min="08:00"
        (change)="time.set($any($event).detail)"
      ></c-time-picker>

      <p>Value: {{ time() ?? 'null' }}</p>
    </div>
  `,
})
export class MinMaxExampleComponent {
  time = signal<null | string>(null);
}
