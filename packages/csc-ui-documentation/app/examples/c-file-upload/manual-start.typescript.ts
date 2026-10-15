import type { CFileUploadFunction } from '@cscfi/csc-ui';

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

const field = document.querySelector('c-file-upload')!;

field.upload = send;

const button = document.querySelector('c-button')!;

field.addEventListener('change', (event) => {
  button.disabled = !event.detail.some((file) => file.status === 'local');
});

// A `manual` field holds added files as `local` until `startUploads()`.
button.addEventListener('click', () => {
  field.startUploads();
});
