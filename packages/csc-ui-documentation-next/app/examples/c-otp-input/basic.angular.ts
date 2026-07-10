// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-otp-input
        label="OTP"
        hint="Enter the 6-digit code we sent you"
        (changeValue)="code.set($any($event).detail)"
      ></c-otp-input>

      <span>Code: {{ code() ?? 'incomplete' }}</span>
    </div>
  `,
})
export class BasicExampleComponent {
  code = signal<string | null>(null);
}
