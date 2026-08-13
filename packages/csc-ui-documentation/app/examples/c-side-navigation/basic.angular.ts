// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import {
  mdiFolderOutline,
  mdiOpenInNew,
  mdiViewDashboardOutline,
} from '@mdi/js';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-side-navigation>
        <c-side-navigation-title>My project</c-side-navigation-title>

        <c-side-navigation-item
          [active]="current() === 'dashboard'"
          (itemChange)="current.set('dashboard')"
        >
          <c-icon [path]="mdiViewDashboardOutline"></c-icon>
          Dashboard
        </c-side-navigation-item>

        <c-side-navigation-item active>
          <c-icon [path]="mdiFolderOutline"></c-icon>
          Projects

          <c-sub-navigation-item
            [active]="current() === 'active'"
            (click)="current.set('active')"
            (keyup.enter)="current.set('active')"
          >
            Active projects
          </c-sub-navigation-item>

          <c-sub-navigation-item
            [active]="current() === 'archived'"
            (click)="current.set('archived')"
            (keyup.enter)="current.set('archived')"
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
  current = signal('active');

  mdiViewDashboardOutline = mdiViewDashboardOutline;
  mdiFolderOutline = mdiFolderOutline;
  mdiOpenInNew = mdiOpenInNew;
}
