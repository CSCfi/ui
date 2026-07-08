// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { mdiAccount, mdiBellOutline, mdiCheckCircle } from '@mdi/js';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-icon [path]="mdiAccount"></c-icon>
      <c-icon [path]="mdiBellOutline" size="36"></c-icon>
      <c-icon [path]="mdiCheckCircle" size="36" color="var(--c-success)"></c-icon>
    </div>
  `,
})
export class BasicExampleComponent {
  mdiAccount = mdiAccount;
  mdiBellOutline = mdiBellOutline;
  mdiCheckCircle = mdiCheckCircle;
}
