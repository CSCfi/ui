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
        hint="Now under the columns commits the current minute"
        label="Arrival"
        [minuteStep]="15"
        show-now
        (change)="time.set($any($event).detail)"
      ></c-time-picker>

      <p>Value: {{ time() ?? 'null' }}</p>
    </div>
  `,
})
export class NowExampleComponent {
  time = signal<null | string>('08:00');
}
