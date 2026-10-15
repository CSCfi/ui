import type { CFileUploadFunction } from '@cscfi/csc-ui';

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

// A function has no attribute form: set it as a DOM property.
const field = document.querySelector('c-file-upload')!;
field.upload = upload;

field.addEventListener('change', (event) => {
  const done = event.detail.filter((file) => file.status === 'done').length;

  document.querySelector('p')!.textContent =
    `Uploaded: ${done} of ${event.detail.length}`;
});
