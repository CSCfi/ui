// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-text-field
        [value]="phone()"
        hint="5–12 digits after the country code"
        label="Phone"
        mask="+358 #####[#######]"
        type="tel"
        (input)="phone.set($any($event.target).value)"
      ></c-text-field>

      <p>Value: {{ phone() }}</p>
    </div>
  `,
})
export class MaskedExampleComponent {
  phone = signal('');
}
