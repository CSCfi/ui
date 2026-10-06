// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-slider
        [value]="volume()"
        label="Volume"
        (changeValue)="volume.set($any($event).detail)"
      ></c-slider>

      <p>Value: {{ volume() }} %</p>
    </div>
  `,
})
export class BasicExampleComponent {
  volume = signal(40);
}
