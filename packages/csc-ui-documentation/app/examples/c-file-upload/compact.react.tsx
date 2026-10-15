import type { CFileUploadEntry } from '@cscfi/csc-ui';

import { CFileUpload, CTextField } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Compact = () => {
  const [name, setName] = useState('');

  const [cv, setCv] = useState<CFileUploadEntry[]>([]);

  return (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      }}
    >
      <CTextField
        label="Name"
        labelOnTop
        onChange={(event) => setName(event.detail as string)}
        value={name}
      />

      <CFileUpload
        accept=".pdf"
        compact
        hint="A PDF"
        label="CV"
        onChange={(event) => setCv(event.detail as CFileUploadEntry[])}
        value={cv}
      />
    </div>
  );
};
