// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-number-field
        [value]="count()"
        hint="A whole number"
        label="Population"
        (change)="count.set($any($event).detail)"
      ></c-number-field>

      <p>Value: {{ count() ?? 'null' }}</p>
    </div>
  `,
})
export class BasicExampleComponent {
  count = signal<null | number>(null);
}
