// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import {
  mdiFolderOutline,
  mdiOpenInNew,
  mdiViewDashboardOutline,
} from '@mdi/js';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-side-navigation>
        <c-side-navigation-item
          [current]="current() === 'dashboard'"
          (select)="current.set('dashboard')"
        >
          <c-icon [path]="mdiViewDashboardOutline"></c-icon>
          Dashboard
        </c-side-navigation-item>

        <c-side-navigation-item expanded>
          <c-icon [path]="mdiFolderOutline"></c-icon>
          Projects

          <c-sub-navigation-item
            [current]="current() === 'active'"
            (select)="current.set('active')"
          >
            Active projects
          </c-sub-navigation-item>

          <c-sub-navigation-item
            [current]="current() === 'archived'"
            (select)="current.set('archived')"
          >
            Archived projects
          </c-sub-navigation-item>
        </c-side-navigation-item>

        <c-side-navigation-item href="https://csc.fi" target="_blank">
          <c-icon [path]="mdiOpenInNew"></c-icon>
          Service description
        </c-side-navigation-item>
      </c-side-navigation>
    </div>
  `,
})
export class BasicExampleComponent {
  current = signal('dashboard');

  mdiFolderOutline = mdiFolderOutline;
  mdiOpenInNew = mdiOpenInNew;
  mdiViewDashboardOutline = mdiViewDashboardOutline;
}
