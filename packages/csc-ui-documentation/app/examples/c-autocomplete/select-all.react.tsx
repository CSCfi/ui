// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CAutocomplete, COption, COptionValue } from '@cscfi/csc-ui-react';

const texts = {
  selectAll: (count: number) => `Select all ${count} matches`,
};

export const SelectAll = () => {
  const [languages, setLanguages] = useState<string[]>(['ts']);

  return (
    <div>
      <CAutocomplete
        value={languages}
        texts={texts}
        clearable
        hint="Type to narrow the list, then select all matches"
        label="Programming languages"
        maxTags={3}
        multiple
        placeholder="Start typing to search"
        selectAll
        onChangeValue={(event) => setLanguages(event.detail as string[])}
      >
        <COption value="js">
          <COptionValue>JavaScript</COptionValue>
        </COption>
        <COption value="ts">
          <COptionValue>TypeScript</COptionValue>
        </COption>
        <COption value="py">
          <COptionValue>Python</COptionValue>
        </COption>
        <COption value="rs">
          <COptionValue>Rust</COptionValue>
        </COption>
        <COption value="go">
          <COptionValue>Go</COptionValue>
        </COption>
        <COption value="rb">
          <COptionValue>Ruby</COptionValue>
        </COption>
        <COption value="cobol" disabled>
          <COptionValue>COBOL</COptionValue>
        </COption>
      </CAutocomplete>

      <p>Value: {languages.length ? languages.join(', ') : '[]'}</p>
    </div>
  );
};
