// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-checkbox
        [checked]="subscribed()"
        hint="You can unsubscribe at any time"
        (changeValue)="subscribed.set($any($event).detail)"
      >
        Subscribe to the newsletter
      </c-checkbox>

      <span>Value: {{ subscribed() }}</span>
    </div>
  `,
})
export class BasicExampleComponent {
  subscribed = signal(false);
}
