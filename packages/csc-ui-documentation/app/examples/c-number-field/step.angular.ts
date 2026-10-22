// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-number-field
        [value]="volume()"
        [max]="100"
        [min]="0"
        [step]="5"
        hint="0 to 100, in steps of 5"
        label="Volume"
        (change)="volume.set($any($event).detail)"
      >
        <span slot="post">%</span>
      </c-number-field>

      <p>Value: {{ volume() ?? 'null' }}</p>
    </div>
  `,
})
export class StepExampleComponent {
  volume = signal<null | number>(50);
}
