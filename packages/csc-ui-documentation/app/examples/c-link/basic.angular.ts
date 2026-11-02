// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  // The styles target ::part(), so they must apply globally.
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  styles: [
    `
      /* Restyle the link through its part (ADR-0006). */
      c-link.normal-weight::part(root) {
        font-weight: 400;
      }
    `,
  ],
  template: `
    <div class="example-row">
      <c-link href="https://csc.fi">Default link</c-link>

      <c-link href="https://csc.fi" underline>Underlined link</c-link>

      <c-link href="https://csc.fi" target="_blank">Opens in a new tab</c-link>

      <c-link class="normal-weight" href="https://csc.fi">Normal weight</c-link>
    </div>
  `,
})
export class BasicExampleComponent {}
