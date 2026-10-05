// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { mdiHome } from '@mdi/js';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <c-breadcrumb>
      <c-breadcrumb-item aria-label="Home" href="https://csc.fi">
        <c-icon slot="icon" [path]="mdiHome" [size]="20"></c-icon>
      </c-breadcrumb-item>
      <c-breadcrumb-item href="https://csc.fi/en/services">
        Services
      </c-breadcrumb-item>
      <c-breadcrumb-item>Supercomputers</c-breadcrumb-item>
    </c-breadcrumb>
  `,
})
export class BasicExampleComponent {
  mdiHome = mdiHome;
}
