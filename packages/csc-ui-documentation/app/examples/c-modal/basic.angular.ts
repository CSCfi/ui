// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-button (click)="open.set(true)">Open modal</c-button>

      <c-modal [value]="open()" dismissable (changeValue)="open.set(false)">
        <c-card>
          <c-card-title>Delete project</c-card-title>

          <c-card-content>
            <p>This action cannot be undone.</p>
          </c-card-content>

          <c-card-actions justify="end">
            <c-button text (click)="open.set(false)">Cancel</c-button>
            <c-button danger (click)="open.set(false)">Delete</c-button>
          </c-card-actions>
        </c-card>
      </c-modal>
    </div>
  `,
})
export class BasicExampleComponent {
  open = signal(false);
}
