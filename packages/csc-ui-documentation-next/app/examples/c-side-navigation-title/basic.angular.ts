// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  mdiDatabaseOutline,
  mdiHelpCircleOutline,
  mdiServerNetwork,
} from '@mdi/js';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-side-navigation>
        <c-side-navigation-title>Services</c-side-navigation-title>

        <c-side-navigation-item>
          <c-icon [path]="mdiDatabaseOutline"></c-icon>
          Data storage
        </c-side-navigation-item>

        <c-side-navigation-item>
          <c-icon [path]="mdiServerNetwork"></c-icon>
          Computing
        </c-side-navigation-item>

        <c-side-navigation-title>Support</c-side-navigation-title>

        <c-side-navigation-item>
          <c-icon [path]="mdiHelpCircleOutline"></c-icon>
          User guides
        </c-side-navigation-item>
      </c-side-navigation>
    </div>
  `,
})
export class BasicExampleComponent {
  mdiDatabaseOutline = mdiDatabaseOutline;
  mdiServerNetwork = mdiServerNetwork;
  mdiHelpCircleOutline = mdiHelpCircleOutline;
}
