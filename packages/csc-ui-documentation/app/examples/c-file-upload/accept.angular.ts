import type { CFileUploadEntry, CFileUploadRejection } from '@cscfi/csc-ui';

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
        accept=".pdf,image/*"
        hint="PDF or images, up to 10 MB each, at most 3"
        label="Receipts"
        max-files="3"
        max-size="10000000"
        multiple
        (change)="files.set($any($event).detail); refused.set('')"
        (reject)="refused.set(describe($any($event).detail))"
      ></c-file-upload>

      <p>Refused: {{ refused() || 'none' }}</p>
    </div>
  `,
})
export class AcceptExampleComponent {
  files = signal<CFileUploadEntry[]>([]);

  // The latest add's refusals, cleared by the next change to the list — the
  // `reject` event follows the `change` of the same add.
  refused = signal('');

  describe = (rejections: CFileUploadRejection[]): string =>
    rejections.map(({ file, reason }) => `${file.name} (${reason})`).join(', ');
}
