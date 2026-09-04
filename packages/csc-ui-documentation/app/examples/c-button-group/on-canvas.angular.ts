// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-button-group
        label="Billing period"
        [value]="period()"
        (change)="period.set($any($event).detail)"
      >
        <c-button value="monthly">Monthly</c-button>
        <c-button value="yearly">Yearly</c-button>
      </c-button-group>
    </div>
  `,
})
export class OnCanvasExampleComponent {
  period = signal<string | null>('monthly');
}
