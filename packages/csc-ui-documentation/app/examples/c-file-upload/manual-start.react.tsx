import type {
  CFileUploadElement,
  CFileUploadEntry,
  CFileUploadFunction,
} from '@cscfi/csc-ui';

import { CButton, CFileUpload } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useRef, useState } from 'react';

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

export const ManualStart = () => {
  const field = useRef<CFileUploadElement>(null);

  const [files, setFiles] = useState<CFileUploadEntry[]>([]);

  // A `manual` field holds added files as `local` until `startUploads()`.
  const waiting = files.some((file) => file.status === 'local');

  return (
    <div
      style={{
        alignItems: 'flex-start',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <CFileUpload
        hint="Files wait until you press Upload"
        label="Attachments"
        manual
        multiple
        onChange={(event) => setFiles(event.detail as CFileUploadEntry[])}
        ref={field}
        upload={send}
        value={files}
      />

      <CButton
        disabled={!waiting}
        onClick={() => field.current?.startUploads()}
      >
        Upload
      </CButton>
    </div>
  );
};
