// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-time-picker
        [value]="time()"
        hint="Slots every 15 minutes; any typed time is kept"
        label="Appointment"
        [minuteStep]="15"
        (change)="time.set($any($event).detail)"
      ></c-time-picker>

      <p>Value: {{ time() ?? 'null' }}</p>
    </div>
  `,
})
export class MinuteStepExampleComponent {
  time = signal<string | null>(null);
}
