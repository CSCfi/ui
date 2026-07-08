// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CInput } from '@cscfi/csc-ui-next-react';

export const Basic = () => {
  const [query, setQuery] = useState('');

  return (
    <div>
      <CInput
        filled={query.length > 0}
        hint="c-input is the field shell — you provide the native input"
        inputId="example-search"
        label="Search"
      >
        <input
          id="example-search"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </CInput>
    </div>
  );
};
