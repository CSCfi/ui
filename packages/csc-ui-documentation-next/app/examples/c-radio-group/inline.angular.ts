// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-radio-group
        [value]="frequency()"
        hide-details
        inline
        label="Email frequency"
        (changeValue)="frequency.set($any($event).detail)"
      >
        <c-radio value="daily">Daily</c-radio>
        <c-radio value="weekly">Weekly</c-radio>
        <c-radio value="never">Never</c-radio>
      </c-radio-group>
    </div>
  `,
})
export class InlineExampleComponent {
  frequency = signal('weekly');
}
