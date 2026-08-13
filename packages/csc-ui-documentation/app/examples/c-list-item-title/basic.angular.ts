// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-list>
        <c-list-item>
          <c-list-item-title>Profile</c-list-item-title>
        </c-list-item>

        <c-list-item active>
          <c-list-item-title>Notifications</c-list-item-title>
        </c-list-item>

        <c-list-item>
          <c-list-item-title>Settings</c-list-item-title>
        </c-list-item>
      </c-list>
    </div>
  `,
})
export class BasicExampleComponent {}
