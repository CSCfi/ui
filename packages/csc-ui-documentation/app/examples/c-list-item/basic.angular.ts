// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { mdiAccount, mdiBell, mdiChevronRight, mdiCog } from '@mdi/js';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-list>
        <c-list-item hoverable>
          <c-icon slot="pre" [path]="mdiAccount"></c-icon>
          <c-list-item-title>Profile</c-list-item-title>
        </c-list-item>

        <c-list-item active>
          <c-icon slot="pre" [path]="mdiBell"></c-icon>
          <c-list-item-title>Notifications</c-list-item-title>
          <c-icon slot="post" [path]="mdiChevronRight"></c-icon>
        </c-list-item>

        <c-list-item disabled>
          <c-icon slot="pre" [path]="mdiCog"></c-icon>
          <c-list-item-title>Settings</c-list-item-title>
        </c-list-item>
      </c-list>
    </div>
  `,
})
export class BasicExampleComponent {
  mdiAccount = mdiAccount;
  mdiBell = mdiBell;
  mdiChevronRight = mdiChevronRight;
  mdiCog = mdiCog;
}
