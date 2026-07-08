// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-tab-buttons
        [value]="view()"
        mandatory
        (changeValue)="view.set($any($event).detail)"
      >
        <c-tab-button value="day">Day</c-tab-button>
        <c-tab-button value="week">Week</c-tab-button>
        <c-tab-button value="month">Month</c-tab-button>
      </c-tab-buttons>

      <span>Selected: {{ view() }}</span>
    </div>
  `,
})
export class BasicExampleComponent {
  view = signal('week');
}
