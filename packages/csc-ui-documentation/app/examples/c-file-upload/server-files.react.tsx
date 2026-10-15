import type { CFileUploadEntry, CFileUploadFunction } from '@cscfi/csc-ui';

import { CFileUpload } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

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

export const ServerFiles = () => {
  const [files, setFiles] = useState<CFileUploadEntry[]>(serverFiles);

  return (
    <div>
      <CFileUpload
        hint="Earlier uploads are listed; new files upload at once"
        label="Project documents"
        multiple
        onChange={(event) => setFiles(event.detail as CFileUploadEntry[])}
        upload={upload}
        value={files}
      />

      <p>Documents: {files.map((file) => file.name).join(', ') || 'none'}</p>
    </div>
  );
};
