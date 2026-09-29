// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
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
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
  picker = viewChild.required<ElementRef<HTMLElement>>('picker');
  date = signal<string | null>(null);
  booked = signal<string[]>([]);

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
