// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
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
        <c-radio value="enterprise">Enterprise</c-radio>
      </c-radio-group>
    </div>
  `,
})
export class BasicExampleComponent {
  plan = signal('free');
}
