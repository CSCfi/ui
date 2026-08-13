// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { mdiAccount, mdiBell, mdiCog } from '@mdi/js';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-list bordered>
        @for (item of items; track item.label) {
          <c-list-item
            ripple
            [active]="selected() === item.label"
            (click)="selected.set(item.label)"
          >
            <c-icon slot="pre" [path]="item.icon"></c-icon>
            <c-list-item-title>{{ item.label }}</c-list-item-title>
          </c-list-item>
        }
      </c-list>
    </div>
  `,
})
export class BasicExampleComponent {
  items = [
    { icon: mdiAccount, label: 'Profile' },
    { icon: mdiBell, label: 'Notifications' },
    { icon: mdiCog, label: 'Settings' },
  ];

  selected = signal('Profile');
}
