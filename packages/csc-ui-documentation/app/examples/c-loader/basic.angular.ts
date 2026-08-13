// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div style="display: grid; gap: 12px; justify-items: start">
      <c-button (click)="loading.set(!loading())">Toggle loader</c-button>

      <!-- The loader fills the nearest position: relative ancestor -->
      <div style="position: relative; height: 160px; width: 100%">
        <c-loader [visible]="loading()" contentdelay="1">
          Loading resources
        </c-loader>
      </div>
    </div>
  `,
})
export class BasicExampleComponent {
  loading = signal(true);
}
