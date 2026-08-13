// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { mdiFolderOutline } from '@mdi/js';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-side-navigation>
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

          <c-sub-navigation-item href="https://csc.fi" target="_blank">
            Service description
          </c-sub-navigation-item>
        </c-side-navigation-item>
      </c-side-navigation>
    </div>
  `,
})
export class BasicExampleComponent {
  mdiFolderOutline = mdiFolderOutline;

  current = signal('active');
}
