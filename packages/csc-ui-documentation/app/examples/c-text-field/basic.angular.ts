// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-text-field
        [value]="name()"
        hint="Shown on your public profile"
        label="Display name"
        (input)="name.set($any($event.target).value)"
      ></c-text-field>

      <p>Value: {{ name() }}</p>
    </div>
  `,
})
export class BasicExampleComponent {
  name = signal('');
}
