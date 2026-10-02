// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-date-picker
        [value]="date()"
        hint="Today under the calendar sets the field back to today"
        label="Due date"
        show-today
        (change)="date.set($any($event).detail)"
      ></c-date-picker>

      <p>Value: {{ date() ?? 'null' }}</p>
    </div>
  `,
})
export class TodayExampleComponent {
  date = signal<string | null>('2025-03-14');
}
