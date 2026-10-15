import type { CFileUploadEntry } from '@cscfi/csc-ui';

// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  styles: `
    .row {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    }
  `,
  template: `
    <div class="row">
      <c-text-field
        [value]="name()"
        label="Name"
        label-on-top
        (change)="name.set($any($event).detail)"
      ></c-text-field>

      <c-file-upload
        [value]="cv()"
        accept=".pdf"
        compact
        hint="A PDF"
        label="CV"
        (change)="cv.set($any($event).detail)"
      ></c-file-upload>
    </div>
  `,
})
export class CompactExampleComponent {
  cv = signal<CFileUploadEntry[]>([]);

  name = signal('');
}
