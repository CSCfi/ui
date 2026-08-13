// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-text-field
        [value]="name()"
        hint="Shown on your public profile"
        label="Display name"
        (changeValue)="name.set($any($event).detail)"
      ></c-text-field>

      <p>Value: {{ name() }}</p>
    </div>
  `,
})
export class BasicExampleComponent {
  name = signal('');
}
