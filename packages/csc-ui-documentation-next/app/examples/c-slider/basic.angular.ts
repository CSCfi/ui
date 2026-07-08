// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-slider
        [value]="volume()"
        label="Volume"
        (changeValue)="volume.set($any($event).detail)"
      ></c-slider>

      <span>Value: {{ volume() }} %</span>
    </div>
  `,
})
export class BasicExampleComponent {
  volume = signal(40);
}
