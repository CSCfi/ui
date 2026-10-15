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
        format="oklch"
        hint="The value is always written as oklch()"
        label="Brand colour"
        (change)="color.set($any($event).detail)"
      ></c-color-picker>

      <p>Value: {{ color() ?? 'null' }}</p>
    </div>
  `,
})
export class NotationExampleComponent {
  color = signal<null | string>('oklch(0.5686 0.202 259.7)');
}
