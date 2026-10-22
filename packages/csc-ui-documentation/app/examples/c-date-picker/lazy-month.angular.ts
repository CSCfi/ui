// @ts-nocheck — documentation code sample; shown as text, never compiled here
import type { ElementRef } from '@angular/core';

import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  signal,
  viewChild,
} from '@angular/core';

// A simulated booking API: the fully booked days of one month.
const fetchBooked = (month: string): Promise<string[]> =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve(
          ['03', '04', '11', '17', '18', '25'].map((d) => `${month}-${d}`),
        ),
      300,
    ),
  );

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-date-picker
        #picker
        [value]="date()"
        [disabledDates]="booked()"
        hint="Booked days load as you browse"
        label="Booking"
        (change)="date.set($any($event).detail)"
      ></c-date-picker>

      <p>Value: {{ date() ?? 'null' }}</p>
    </div>
  `,
})
export class LazyMonthExampleComponent {
  booked = signal<string[]>([]);
  date = signal<null | string>(null);
  picker = viewChild.required<ElementRef<HTMLElement>>('picker');

  // Colon-named events ("change:month") cannot be bound in an Angular
  // template, so listen on the element directly.
  ngAfterViewInit() {
    this.picker().nativeElement.addEventListener(
      'change:month',
      async (event) => {
        this.booked.set(
          await fetchBooked((event as CustomEvent<string>).detail),
        );
      },
    );
  }
}
