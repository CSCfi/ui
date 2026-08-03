// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-grid">
      <c-switch
        [value]="enabled()"
        (changeValue)="enabled.set($any($event).detail)"
      >
        Notifications
      </c-switch>

      <p>Value: {{ enabled() }}</p>
    </div>
  `,
})
export class BasicExampleComponent {
  enabled = signal(false);
}
