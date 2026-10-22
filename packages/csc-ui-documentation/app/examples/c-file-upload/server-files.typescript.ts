import type { CFileUploadEntry, CFileUploadFunction } from '@cscfi/csc-ui';

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

// Files uploaded earlier: no `file`, status `done`, the server's own id.
const serverFiles: CFileUploadEntry[] = [
  {
    id: 'f_12',
    name: 'project-plan.pdf',
    size: 482_113,
    status: 'done',
    type: 'application/pdf',
  },
  {
    id: 'f_13',
    name: 'budget.csv',
    size: 92_400,
    status: 'done',
    type: 'text/csv',
  },
];

// Lists and functions have no attribute form: set them as DOM properties.
const field = document.querySelector('c-file-upload')!;
field.value = serverFiles;
field.upload = upload;

field.addEventListener('change', (event) => {
  const names = event.detail.map((file) => file.name).join(', ');

  document.querySelector('p')!.textContent = `Documents: ${names || 'none'}`;
});
