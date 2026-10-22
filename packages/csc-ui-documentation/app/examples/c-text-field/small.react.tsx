import { CButton, CTextField } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Small = () => {
  const [query, setQuery] = useState('');

  return (
    <div style={{ alignItems: 'flex-start', display: 'flex', gap: 16 }}>
      <CTextField
        label="Search"
        onChangeValue={(event) => setQuery(event.detail as string)}
        size="small"
        value={query}
      />

      <CButton size="small">Search</CButton>
    </div>
  );
};
