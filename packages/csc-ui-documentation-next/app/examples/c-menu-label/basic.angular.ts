// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { mdiChevronDown } from '@mdi/js';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-menu (select)="selected.set($any($event).detail.value)">
        <c-button slot="trigger" outlined>
          Settings
          <c-icon [path]="mdiChevronDown" />
        </c-button>

        <c-menu-label>Account</c-menu-label>

        <c-menu-item value="profile">Profile</c-menu-item>

        <c-menu-item value="notifications">Notifications</c-menu-item>

        <c-divider />

        <c-menu-label>Workspace</c-menu-label>

        <c-menu-item value="members">Members</c-menu-item>

        <c-menu-item value="billing">Billing</c-menu-item>
      </c-menu>

      <p>Selected: {{ selected() ?? '—' }}</p>
    </div>
  `,
})
export class BasicExampleComponent {
  mdiChevronDown = mdiChevronDown;

  selected = signal<null | string>(null);
}
