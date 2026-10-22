// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  styles: [
    `
      /* The radios are ordinary light DOM: wrap them in your own layout markup
         and style it with your own CSS. Keep the label text inside the
         <c-radio> so the whole row stays click-associated. */
      .plan-option {
        border: 1px solid var(--c-border);
        border-radius: 0.5rem;
        padding: 0 0.75rem;
      }
    `,
  ],
  template: `
    <div>
      <c-radio-group
        [value]="plan()"
        hint="You can change the plan later"
        label="Subscription plan"
        (changeValue)="plan.set($any($event).detail)"
      >
        <div class="plan-option">
          <c-radio value="free">Free</c-radio>
        </div>
        <div class="plan-option">
          <c-radio value="pro">Pro</c-radio>
        </div>
        <div class="plan-option">
          <c-radio value="enterprise">Enterprise</c-radio>
        </div>
      </c-radio-group>
    </div>
  `,
})
export class CustomLayoutExampleComponent {
  plan = signal('free');
}
