// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { mdiChevronDown, mdiFileDocument, mdiFilePdfBox } from '@mdi/js';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-menu (select)="selected.set($any($event).detail.value)">
        <c-button slot="trigger" ghost>
          Export
          <c-icon [path]="mdiChevronDown" />
        </c-button>

        <c-menu-item value="documents">
          Documents

          <c-menu-item slot="submenu" value="pdf">
            <c-icon [path]="mdiFilePdfBox" />
            PDF
          </c-menu-item>

          <c-menu-item slot="submenu" value="docx">
            <c-icon [path]="mdiFileDocument" />
            Word document
          </c-menu-item>
        </c-menu-item>

        <c-menu-item value="settings">Export settings…</c-menu-item>
      </c-menu>

      <p>Selected: {{ selected() ?? '—' }}</p>
    </div>
  `,
})
export class SubmenuExampleComponent {
  mdiChevronDown = mdiChevronDown;
  mdiFileDocument = mdiFileDocument;
  mdiFilePdfBox = mdiFilePdfBox;

  selected = signal<null | string>(null);
}
