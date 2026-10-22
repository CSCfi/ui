// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-otp-input
        label="OTP"
        hint="Enter the 6-digit code we sent you"
        (changeValue)="code.set($any($event).detail)"
      ></c-otp-input>

      <p>Code: {{ code() ?? 'incomplete' }}</p>
    </div>
  `,
})
export class BasicExampleComponent {
  code = signal<null | string>(null);
}
