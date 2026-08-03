// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { mdiAccount, mdiChevronDown } from '@mdi/js';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-menu (select)="selected.set($any($event).detail.value)">
        <c-button slot="trigger" text>
          <c-icon [path]="mdiAccount" />
          Account
          <c-icon [path]="mdiChevronDown" />
        </c-button>

        <c-menu-item value="profile">View profile</c-menu-item>

        <c-menu-item value="billing" disabled>
          Billing (unavailable)
        </c-menu-item>

        <c-menu-item value="invite">Invite teammate</c-menu-item>

        <c-divider />

        <c-menu-item value="delete" danger>Delete account</c-menu-item>
      </c-menu>

      <p>Selected: {{ selected() ?? '—' }}</p>
    </div>
  `,
})
export class BasicExampleComponent {
  mdiAccount = mdiAccount;
  mdiChevronDown = mdiChevronDown;

  selected = signal<null | string>(null);
}
