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
        format="rgb"
        hint="Drag the alpha slider for transparency"
        label="Overlay colour"
        alpha
        (change)="color.set($any($event).detail)"
      ></c-color-picker>

      <p>Value: {{ color() ?? 'null' }}</p>
    </div>
  `,
})
export class AlphaExampleComponent {
  color = signal<null | string>('rgb(31 111 235 / 0.5)');
}
