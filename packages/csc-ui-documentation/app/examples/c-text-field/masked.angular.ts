// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-text-field
        [value]="phone()"
        hint="5–12 digits after the country code"
        label="Phone"
        mask="+358 #####[#######]"
        type="tel"
        (changeValue)="phone.set($any($event).detail)"
      ></c-text-field>

      <p>Value: {{ phone() }}</p>
    </div>
  `,
})
export class MaskedExampleComponent {
  phone = signal('');
}
