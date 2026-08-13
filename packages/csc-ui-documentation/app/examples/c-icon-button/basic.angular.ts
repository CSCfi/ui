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
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-icon-button>
        <c-icon [path]="mdiPlus"></c-icon>
      </c-icon-button>

      <c-icon-button outlined>
        <c-icon [path]="mdiPencil"></c-icon>
      </c-icon-button>

      <c-icon-button ghost>
        <c-icon [path]="mdiHeart"></c-icon>
      </c-icon-button>

      <c-icon-button text>
        <c-icon [path]="mdiDotsVertical"></c-icon>
      </c-icon-button>

      <c-icon-button danger>
        <c-icon [path]="mdiDelete"></c-icon>
      </c-icon-button>

      <c-icon-button badge="3">
        <c-icon [path]="mdiBellOutline"></c-icon>
      </c-icon-button>

      <c-icon-button disabled>
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
