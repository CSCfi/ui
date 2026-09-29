// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-number-field
        [value]="price()"
        [decimals]="2"
        [min]="0"
        fixed-decimals
        hint="Up to two decimals"
        label="Price"
        (change)="price.set($any($event).detail)"
      >
        <span slot="post">€</span>
      </c-number-field>

      <p>Value: {{ price() ?? 'null' }}</p>
    </div>
  `,
})
export class DecimalsExampleComponent {
  price = signal<number | null>(1234.5);
}
