// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { mdiDownload, mdiTrashCanOutline } from '@mdi/js';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-tooltip text="Download the report as PDF">
        <c-icon-button slot="trigger" aria-label="Download" ghost>
          <c-icon [path]="mdiDownload" />
        </c-icon-button>
      </c-tooltip>

      <c-tooltip text="Remove the report permanently" position="bottom">
        <c-icon-button slot="trigger" aria-label="Remove" ghost>
          <c-icon [path]="mdiTrashCanOutline" />
        </c-icon-button>
      </c-tooltip>
    </div>
  `,
})
export class BasicExampleComponent {
  mdiDownload = mdiDownload;

  mdiTrashCanOutline = mdiTrashCanOutline;
}
