import type { CFileUploadEntry } from '@cscfi/csc-ui';

import { CFileUpload } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [files, setFiles] = useState<CFileUploadEntry[]>([]);

  return (
    <div>
      <CFileUpload
        hint="Any file, any size"
        label="Attachments"
        multiple
        onChange={(event) => setFiles(event.detail as CFileUploadEntry[])}
        value={files}
      />

      <p>Files: {files.map((file) => file.name).join(', ') || 'none'}</p>
    </div>
  );
};
