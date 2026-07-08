// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CAutocomplete, COption, COptionValue } from '@cscfi/csc-ui-next-react';

export const Basic = () => {
  const [language, setLanguage] = useState<string | null>(null);

  return (
    <div>
      <CAutocomplete
        value={language}
        clearable
        hint="Type to filter the options"
        label="Programming language"
        placeholder="Start typing to search"
        onChangeValue={(event) => setLanguage(event.detail as string | null)}
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
      </CAutocomplete>

      <span>Value: {language ?? 'null'}</span>
    </div>
  );
};
