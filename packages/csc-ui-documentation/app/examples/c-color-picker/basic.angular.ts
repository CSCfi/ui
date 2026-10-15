// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-color-picker
        [value]="color()"
        hint="Type any CSS colour or open the picker"
        label="Colour"
        clearable
        (change)="color.set($any($event).detail)"
      ></c-color-picker>

      <p>Value: {{ color() ?? 'null' }}</p>
    </div>
  `,
})
export class BasicExampleComponent {
  color = signal<null | string>('#1f6feb');
}
