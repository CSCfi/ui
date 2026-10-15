import type { ElementRef } from '@angular/core';
import type {
  CFileUploadElement,
  CFileUploadEntry,
  CFileUploadFunction,
} from '@cscfi/csc-ui';

// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  signal,
  viewChild,
} from '@angular/core';

// Stands in for a real request: reports progress for two seconds, then
// resolves — or refuses a file whose name contains "fail".
const send: CFileUploadFunction = (file, { onProgress, signal }) =>
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
  styles: `
    .stack {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  `,
  template: `
    <div class="stack">
      <c-file-upload
        #field
        [upload]="send"
        [value]="files()"
        hint="Files wait until you press Upload"
        label="Attachments"
        manual
        multiple
        (change)="files.set($any($event).detail)"
      ></c-file-upload>

      <c-button [disabled]="!waiting()" (click)="start()">Upload</c-button>
    </div>
  `,
})
export class ManualStartExampleComponent {
  field = viewChild<ElementRef<CFileUploadElement>>('field');

  files = signal<CFileUploadEntry[]>([]);

  send = send;

  // A `manual` field holds added files as `local` until `startUploads()`.
  start() {
    this.field()?.nativeElement.startUploads();
  }

  waiting = () => this.files().some((file) => file.status === 'local');
}
