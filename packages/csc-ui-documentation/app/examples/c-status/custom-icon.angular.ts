// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { mdiArchive } from '@mdi/js';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div class="example-row">
      <c-status marker="dot" type="info">
        <c-icon slot="icon" [path]="mdiArchive"></c-icon>
        Archived
      </c-status>
      <c-status appearance="outlined" marker="icon">
        <c-icon slot="icon" [path]="mdiArchive"></c-icon>
        Archived
      </c-status>
    </div>
  `,
})
export class CustomIconExampleComponent {
  mdiArchive = mdiArchive;
}
