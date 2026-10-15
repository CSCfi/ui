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

export const Upload = () => {
  const [files, setFiles] = useState<CFileUploadEntry[]>([]);

  const done = files.filter((file) => file.status === 'done').length;

  return (
    <div>
      <CFileUpload
        hint="A file named “fail…” is refused"
        label="Datasets"
        multiple
        onChange={(event) => setFiles(event.detail as CFileUploadEntry[])}
        upload={upload}
        value={files}
      />

      <p>
        Uploaded: {done} of {files.length}
      </p>
    </div>
  );
};
