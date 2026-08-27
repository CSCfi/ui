// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CButton, CTextField } from '@cscfi/csc-ui-react';

export const Small = () => {
  const [query, setQuery] = useState('');

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
      <CTextField
        value={query}
        label="Search"
        size="small"
        onChangeValue={(event) => setQuery(event.detail as string)}
      />

      <CButton size="small">Search</CButton>
    </div>
  );
};
