import { CAutocomplete, COption, COptionValue } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [language, setLanguage] = useState<null | string>(null);

  return (
    <div>
      <CAutocomplete
        clearable
        hint="Type to filter the options"
        label="Programming language"
        onChangeValue={(event) => setLanguage(event.detail as null | string)}
        placeholder="Start typing to search"
        value={language}
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

      <p>Value: {language ?? 'null'}</p>
    </div>
  );
};
