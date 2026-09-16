// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-grid">
      <c-switch
        [disabled]="pending()"
        [loading]="pending()"
        [value]="enabled()"
        (changeValue)="onToggle($any($event).detail)"
      >
        Sync to cloud
      </c-switch>

      <p>{{ pending() ? 'Saving…' : 'Value: ' + enabled() }}</p>
    </div>
  `,
})
export class LoadingExampleComponent {
  enabled = signal(false);
  pending = signal(false);

  // Simulated round trip: `loading` shows the spinner in place of the handle
  // and `disabled` refuses further input until the server has answered.
  // `loading` alone does not block clicks.
  onToggle(next: boolean) {
    this.pending.set(true);

    window.setTimeout(() => {
      this.enabled.set(next);
      this.pending.set(false);
    }, 1500);
  }
}
