// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewEncapsulation,
} from '@angular/core';
import { mdiBellOutline, mdiEmailOutline } from '@mdi/js';

@Component({
  // The styles target ::part(), so they must apply globally.
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  styles: [
    `
      c-badge.success-badge::part(root) {
        background-color: var(--c-success-500);
      }
    `,
  ],
  template: `
    <div class="example-row">
      <span style="position: relative">
        <c-icon [path]="mdiBellOutline" size="32"></c-icon>
        <c-badge>3</c-badge>
      </span>

      <c-icon-button outlined>
        <c-icon [path]="mdiEmailOutline"></c-icon>
        <c-badge class="success-badge">1</c-badge>
      </c-icon-button>

      <c-button>
        Default
        <c-badge>2</c-badge>
      </c-button>
    </div>
  `,
})
export class BasicExampleComponent {
  mdiBellOutline = mdiBellOutline;
  mdiEmailOutline = mdiEmailOutline;
}
