import type { CFileUploadEntry, CFileUploadRejection } from '@cscfi/csc-ui';

import { CFileUpload } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

const describe = (rejections: CFileUploadRejection[]): string =>
  rejections.map(({ file, reason }) => `${file.name} (${reason})`).join(', ');

export const Accept = () => {
  const [files, setFiles] = useState<CFileUploadEntry[]>([]);

  // The latest add's refusals, cleared by the next change to the list — the
  // `reject` event follows the `change` of the same add.
  const [refused, setRefused] = useState('');

  return (
    <div>
      <CFileUpload
        accept=".pdf,image/*"
        hint="PDF or images, up to 10 MB each, at most 3"
        label="Receipts"
        maxFiles={3}
        maxSize={10_000_000}
        multiple
        onChange={(event) => {
          setFiles(event.detail as CFileUploadEntry[]);
          setRefused('');
        }}
        onReject={(event) =>
          setRefused(describe(event.detail as CFileUploadRejection[]))
        }
        value={files}
      />

      <p>Refused: {refused || 'none'}</p>
    </div>
  );
};
