import type { CFileUploadEntry } from '@cscfi/csc-ui';

// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-file-upload
        [value]="files()"
        hint="Any file, any size"
        label="Attachments"
        multiple
        (change)="files.set($any($event).detail)"
      ></c-file-upload>

      <p>Files: {{ names() }}</p>
    </div>
  `,
})
export class BasicExampleComponent {
  files = signal<CFileUploadEntry[]>([]);

  names = () =>
    this.files()
      .map((file) => file.name)
      .join(', ') || 'none';
}
