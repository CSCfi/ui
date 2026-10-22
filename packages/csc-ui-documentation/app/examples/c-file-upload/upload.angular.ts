import type { CFileUploadEntry, CFileUploadFunction } from '@cscfi/csc-ui';

// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

// Stands in for a real request: reports progress for two seconds, then
// resolves — or refuses a file whose name contains "fail".
const upload: CFileUploadFunction = (file, { onProgress, signal }) =>
  new Promise((resolve, reject) => {
    let sent = 0;

    const timer = setInterval(() => {
      sent = Math.min(1, sent + 0.1);
      onProgress(sent);

      if (sent < 1) return;
      clearInterval(timer);

      if (file.name.includes('fail')) {
        reject(new Error('The server refused the file'));
      } else {
        resolve({ id: `file-${Date.now()}` });
      }
    }, 200);

    signal.addEventListener('abort', () => clearInterval(timer));
  });

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-file-upload
        [upload]="upload"
        [value]="files()"
        hint="A file named “fail…” is refused"
        label="Datasets"
        multiple
        (change)="files.set($any($event).detail)"
      ></c-file-upload>

      <p>Uploaded: {{ done() }} of {{ files().length }}</p>
    </div>
  `,
})
export class UploadExampleComponent {
  files = signal<CFileUploadEntry[]>([]);

  upload = upload;

  done = () => this.files().filter((file) => file.status === 'done').length;
}
