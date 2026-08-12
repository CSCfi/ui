// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-button-group [value]="view()" (change)="view.set($any($event).detail)">
        <c-button value="day">Day</c-button>
        <c-button value="week">Week</c-button>
        <c-button value="month">Month</c-button>
      </c-button-group>

      <p>Selected: {{ view() ?? 'none' }}</p>
    </div>
  `,
})
export class BasicExampleComponent {
  view = signal<string | null>('week');
}
