// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-steps [value]="step()">
        <c-step>Choose resources</c-step>
        <c-step>Billing details</c-step>
        <c-step>Review</c-step>
        <c-step>Confirmation</c-step>
      </c-steps>

      <div class="example-row">
        <c-button outlined [disabled]="step() === 1" (click)="step.set(step() - 1)">
          Previous
        </c-button>
        <c-button [disabled]="step() === 5" (click)="step.set(step() + 1)">
          Next
        </c-button>
      </div>
    </div>
  `,
})
export class BasicExampleComponent {
  step = signal(1);
}
