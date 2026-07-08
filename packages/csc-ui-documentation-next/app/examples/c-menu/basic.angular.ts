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
          Device
          <c-icon [path]="mdiChevronDown" />
        </c-button>

        <c-menu-label>Type</c-menu-label>

        <c-menu-item value="phone">Phone</c-menu-item>

        <c-menu-item value="tablet">Tablet</c-menu-item>

        <c-menu-item value="desktop">Desktop</c-menu-item>

        <c-divider />

        <c-menu-item value="forget" danger>Forget this device</c-menu-item>
      </c-menu>

      <span>Selected: {{ selected() ?? '—' }}</span>
    </div>
  `,
})
export class BasicExampleComponent {
  mdiChevronDown = mdiChevronDown;

  selected = signal<null | string>(null);
}
