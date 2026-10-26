// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  mdiBellOutline,
  mdiDelete,
  mdiDotsVertical,
  mdiHeart,
  mdiPencil,
  mdiPlus,
} from '@mdi/js';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div class="example-row">
      <c-icon-button aria-label="Add">
        <c-icon [path]="mdiPlus"></c-icon>
      </c-icon-button>

      <c-icon-button aria-label="Edit" outlined>
        <c-icon [path]="mdiPencil"></c-icon>
      </c-icon-button>

      <c-icon-button aria-label="Like" ghost>
        <c-icon [path]="mdiHeart"></c-icon>
      </c-icon-button>

      <c-icon-button aria-label="More actions" text>
        <c-icon [path]="mdiDotsVertical"></c-icon>
      </c-icon-button>

      <c-icon-button aria-label="Delete" danger>
        <c-icon [path]="mdiDelete"></c-icon>
      </c-icon-button>

      <c-icon-button aria-label="3 notifications" badge="3">
        <c-icon [path]="mdiBellOutline"></c-icon>
      </c-icon-button>

      <c-icon-button aria-label="Add" disabled>
        <c-icon [path]="mdiPlus"></c-icon>
      </c-icon-button>
    </div>
  `,
})
export class BasicExampleComponent {
  mdiBellOutline = mdiBellOutline;
  mdiDelete = mdiDelete;
  mdiDotsVertical = mdiDotsVertical;
  mdiHeart = mdiHeart;
  mdiPencil = mdiPencil;
  mdiPlus = mdiPlus;
}
