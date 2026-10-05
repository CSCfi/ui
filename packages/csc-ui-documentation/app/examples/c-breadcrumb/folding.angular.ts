// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { mdiHome } from '@mdi/js';

// Drag the corner to narrow the box: the middle crumbs fold behind "…",
// then the current crumb's label shortens.
@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: `
    .box {
      resize: horizontal;
      overflow: hidden;
      width: 420px;
      min-width: 160px;
      max-width: 100%;
      padding: 8px;
      border: 1px dashed currentColor;
    }
  `,
  template: `
    <div class="box">
      <c-breadcrumb>
        <c-breadcrumb-item aria-label="Home" href="https://csc.fi">
          <c-icon slot="icon" [path]="mdiHome" [size]="20"></c-icon>
        </c-breadcrumb-item>
        <c-breadcrumb-item href="https://csc.fi/en/services">
          Services
        </c-breadcrumb-item>
        <c-breadcrumb-item href="https://csc.fi/en/services/computing">
          Computing
        </c-breadcrumb-item>
        <c-breadcrumb-item href="https://csc.fi/en/services/computing/lumi">
          LUMI supercomputer
        </c-breadcrumb-item>
        <c-breadcrumb-item>Applying for computing resources</c-breadcrumb-item>
      </c-breadcrumb>
    </div>
  `,
})
export class FoldingExampleComponent {
  mdiHome = mdiHome;
}
