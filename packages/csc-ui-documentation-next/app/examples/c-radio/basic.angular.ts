// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-radio-group
        [value]="plan()"
        hint="You can change the plan later"
        label="Subscription plan"
        (changeValue)="plan.set($any($event).detail)"
      >
        <c-radio value="free">Free</c-radio>
        <c-radio value="pro">Pro</c-radio>
        <c-radio value="enterprise" disabled>Enterprise</c-radio>
      </c-radio-group>
    </div>
  `,
})
export class BasicExampleComponent {
  plan = signal('free');
}
